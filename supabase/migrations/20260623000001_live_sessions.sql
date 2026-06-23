-- Claude Cabo — live (synchronous, Kahoot-style) game sessions.
--
-- A live session is a shared ROOM that every member of a group observes via
-- Realtime while the HOST advances it through a phase machine:
--   lobby -> question -> reveal -> (loop back to question) -> final
--
-- This sits ALONGSIDE the async players/results model and touches none of it.
-- Access is by group membership (same model as players/results). Host control is
-- a client-side convention — `players` aren't tied to auth.uid(), so any member
-- can technically write; that matches the existing trusted-private-group model.

-- ------------------------------------------------------------------ tables ---

create table if not exists public.game_sessions (
  id                  uuid primary key default gen_random_uuid(),
  group_id            uuid not null references public.groups(id) on delete cascade,
  game_id             text not null,
  host_player_id      uuid references public.players(id) on delete set null,
  -- false = host is just driving the room (a "screen"), not on the leaderboard.
  host_plays          boolean not null default true,
  phase               text not null default 'lobby'
                        check (phase in ('lobby','question','reveal','final')),
  -- which question is live; -1 while in the lobby.
  current_index       int not null default -1,
  -- frozen, ordered questions so every device sees identical cards/order:
  --   [{ promptId, quote, answer, options[], hint? }]
  deck                jsonb not null default '[]'::jsonb,
  -- when the current question went live (drives the timer + speed scoring).
  question_started_at timestamptz,
  config              jsonb not null default '{}'::jsonb,   -- { questionSeconds, deckSize }
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Lobby roster — who's in the room (host included only when host_plays).
create table if not exists public.session_players (
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- One answer per player per question.
create table if not exists public.session_answers (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.game_sessions(id) on delete cascade,
  question_index int  not null,
  player_id      uuid not null references public.players(id) on delete cascade,
  answer         jsonb not null,           -- the picked option (jsonb = generic for future games)
  correct        boolean,                  -- null for opinion games; set for trivia
  points         int  not null default 0,  -- speed-scaled score for this answer
  answered_at    timestamptz not null default now(),
  unique (session_id, question_index, player_id)
);

create index if not exists game_sessions_group_idx   on public.game_sessions(group_id);
create index if not exists session_players_session_idx on public.session_players(session_id);
create index if not exists session_answers_session_idx on public.session_answers(session_id);

-- --------------------------------------------------------------------- RLS ---
-- Members of the owning group can read/write the room and its children. Child
-- tables join back to game_sessions.group_id. Uses private.is_group_member
-- (moved to the `private` schema in 20260622000002_harden_security.sql).

alter table public.game_sessions   enable row level security;
alter table public.session_players enable row level security;
alter table public.session_answers enable row level security;

drop policy if exists "members rw sessions" on public.game_sessions;
create policy "members rw sessions" on public.game_sessions
  for all using (private.is_group_member(group_id))
  with check (private.is_group_member(group_id));

drop policy if exists "members rw session_players" on public.session_players;
create policy "members rw session_players" on public.session_players
  for all using (
    private.is_group_member(
      (select s.group_id from public.game_sessions s where s.id = session_id)
    )
  )
  with check (
    private.is_group_member(
      (select s.group_id from public.game_sessions s where s.id = session_id)
    )
  );

drop policy if exists "members rw session_answers" on public.session_answers;
create policy "members rw session_answers" on public.session_answers
  for all using (
    private.is_group_member(
      (select s.group_id from public.game_sessions s where s.id = session_id)
    )
  )
  with check (
    private.is_group_member(
      (select s.group_id from public.game_sessions s where s.id = session_id)
    )
  );

-- Keep updated_at fresh on every session mutation.
create or replace function public.touch_game_session()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_game_session on public.game_sessions;
create trigger trg_touch_game_session before update on public.game_sessions
  for each row execute function public.touch_game_session();

-- Live updates across phones.
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.session_players;
alter publication supabase_realtime add table public.session_answers;
