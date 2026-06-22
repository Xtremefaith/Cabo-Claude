-- Claude Cabo — private groups (shared code + password) with anonymous device auth.
--
-- Privacy model:
--   * Each group has a human-shareable `code` and a password.
--   * The password HASH lives in a separate `group_secrets` table that has NO
--     client-facing RLS policy, so it can only ever be read/written by the
--     SECURITY DEFINER functions below — clients can never read it.
--   * Every device signs in anonymously (auth.uid()) and, after proving the
--     password via join_group(), gets a row in `group_members`.
--   * Row-Level Security then restricts ALL group data to confirmed members.
--     Privacy is enforced by the database, not by hideable client code.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ tables ---

create table if not exists public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text not null unique,
  created_at timestamptz not null default now()
);

-- Password hash, deliberately separated from `groups` (see header).
create table if not exists public.group_secrets (
  group_id      uuid primary key references public.groups(id) on delete cascade,
  password_hash text not null
);

create table if not exists public.group_members (
  group_id     uuid not null references public.groups(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  name       text not null,
  gender     text not null check (gender in ('male','female')),
  color      text not null,
  photo      text,
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  game_id    text not null,
  player_id  uuid references public.players(id) on delete cascade,
  played_at  timestamptz not null default now(),
  data       jsonb not null default '{}'::jsonb
);

create index if not exists players_group_idx on public.players(group_id);
create index if not exists results_group_idx on public.results(group_id);

-- ------------------------------------------------------ membership helper ---
-- SECURITY DEFINER so it can read group_members without tripping that table's
-- own RLS (which would otherwise recurse when used inside policies).
create or replace function public.is_group_member(g uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = g and m.user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------------------- RLS ---
alter table public.groups        enable row level security;
alter table public.group_secrets enable row level security;
alter table public.group_members enable row level security;
alter table public.players       enable row level security;
alter table public.results       enable row level security;

-- groups: members may read their group; all writes go through the RPCs.
drop policy if exists "members read group" on public.groups;
create policy "members read group" on public.groups
  for select using (public.is_group_member(id));

-- group_secrets: intentionally NO policies -> unreachable by clients.

-- group_members: members can see co-members; a device may remove itself.
drop policy if exists "members read members" on public.group_members;
create policy "members read members" on public.group_members
  for select using (public.is_group_member(group_id));
drop policy if exists "leave group" on public.group_members;
create policy "leave group" on public.group_members
  for delete using (user_id = auth.uid());

-- players + results: full read/write scoped to the caller's groups.
drop policy if exists "members rw players" on public.players;
create policy "members rw players" on public.players
  for all using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

drop policy if exists "members rw results" on public.results;
create policy "members rw results" on public.results
  for all using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

-- ------------------------------------------------------------------ RPCs ---

-- Random 6-char code from an unambiguous alphabet (no 0/O/1/I/L).
create or replace function public.gen_group_code()
returns text
language sql
volatile
as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (floor(random() * 31) + 1)::int, 1),
    ''
  )
  from generate_series(1, 6);
$$;

-- Create a new group, set its password, and join the caller. Returns the group
-- (never the hash). The caller must be signed in (anonymous auth is fine).
create or replace function public.create_group(p_name text, p_password text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
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

-- Verify code + password server-side, then add the caller as a member.
-- Same error for bad code and bad password, so group existence isn't leaked.
create or replace function public.join_group(p_code text, p_password text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
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

grant execute on function public.create_group(text, text) to anon, authenticated;
grant execute on function public.join_group(text, text)   to anon, authenticated;

-- Live updates across phones.
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.results;
