-- Harden: silence linter findings + best practice.
-- (Applied to the live project via the Supabase tooling; kept here for repro.)

-- Pin search_path on the code generator.
create or replace function public.gen_group_code()
returns text language sql volatile set search_path = '' as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (floor(random() * 31) + 1)::int, 1), ''
  ) from generate_series(1, 6);
$$;

-- Move the membership helper into a non-API schema so it isn't exposed via
-- PostgREST, while RLS policies can still call it.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_group_member(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = g and m.user_id = auth.uid()
  );
$$;
grant execute on function private.is_group_member(uuid) to anon, authenticated;

drop policy if exists "members read group" on public.groups;
create policy "members read group" on public.groups
  for select using (private.is_group_member(id));

drop policy if exists "members read members" on public.group_members;
create policy "members read members" on public.group_members
  for select using (private.is_group_member(group_id));

drop policy if exists "members rw players" on public.players;
create policy "members rw players" on public.players
  for all using (private.is_group_member(group_id))
  with check (private.is_group_member(group_id));

drop policy if exists "members rw results" on public.results;
create policy "members rw results" on public.results
  for all using (private.is_group_member(group_id))
  with check (private.is_group_member(group_id));

drop function if exists public.is_group_member(uuid);
