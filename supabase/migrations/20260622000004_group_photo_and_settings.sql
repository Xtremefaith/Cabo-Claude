-- Group profile + a settings bag for future toggles (e.g. spice level).
alter table public.groups add column if not exists photo text;
alter table public.groups add column if not exists settings jsonb not null default '{}'::jsonb;

-- Members can update their group's name/photo/settings (not its id or code).
create or replace function public.update_group(
  p_group_id uuid, p_name text, p_photo text, p_settings jsonb
) returns public.groups
language plpgsql security definer set search_path = public as $$
declare
  v_group public.groups;
begin
  if not private.is_group_member(p_group_id) then
    raise exception 'not a member';
  end if;
  update public.groups
     set name     = coalesce(nullif(trim(p_name), ''), name),
         photo    = coalesce(p_photo, photo),
         settings = coalesce(p_settings, settings)
   where id = p_group_id
   returning * into v_group;
  return v_group;
end;
$$;

grant execute on function public.update_group(uuid, text, text, jsonb) to anon, authenticated;
