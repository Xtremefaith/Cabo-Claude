-- pgcrypto (crypt/gen_salt) lives in the `extensions` schema on Supabase, so
-- the password functions must include it on their search_path. Without this
-- they fail with "function gen_salt(unknown) does not exist".

create or replace function public.create_group(p_name text, p_password text)
returns public.groups language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_code  text;
  v_group public.groups;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;
  if length(coalesce(p_password, '')) < 4 then
    raise exception 'password must be at least 4 characters';
  end if;
  loop
    v_code := public.gen_group_code();
    exit when not exists (select 1 from public.groups where code = v_code);
  end loop;
  insert into public.groups(name, code)
    values (coalesce(nullif(trim(p_name), ''), 'Our Cabo'), v_code)
    returning * into v_group;
  insert into public.group_secrets(group_id, password_hash)
    values (v_group.id, crypt(p_password, gen_salt('bf')));
  insert into public.group_members(group_id, user_id)
    values (v_group.id, auth.uid());
  return v_group;
end;
$$;

create or replace function public.join_group(p_code text, p_password text)
returns public.groups language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_group public.groups;
  v_hash  text;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;
  select * into v_group from public.groups where code = upper(trim(p_code));
  if v_group.id is null then
    raise exception 'invalid code or password';
  end if;
  select password_hash into v_hash from public.group_secrets where group_id = v_group.id;
  if v_hash is null or v_hash <> crypt(p_password, v_hash) then
    raise exception 'invalid code or password';
  end if;
  insert into public.group_members(group_id, user_id)
    values (v_group.id, auth.uid())
    on conflict do nothing;
  return v_group;
end;
$$;
