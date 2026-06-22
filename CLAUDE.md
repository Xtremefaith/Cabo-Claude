# CLAUDE.md

Guidance for working in this repo.

## Project

**Claude Cabo** — a private-group party-games web app (mobile-first).
Stack: React + TypeScript + Vite + Tailwind, with Supabase (Postgres + RLS +
Realtime + anonymous auth) for cross-device, per-group play. With no Supabase
keys the app falls back to single-device localStorage mode.

Key concepts:
- A **group** has a shareable 6-char `code` + a shared `password`. The password
  hash lives in `group_secrets` (no client RLS) and is only ever touched by
  `SECURITY DEFINER` RPCs — clients can never read it.
- Access is governed by **membership** (`group_members` + RLS via
  `private.is_group_member`), not by the password. The password only gates *new*
  joins, so rotating it does NOT revoke devices already in a group.

## Git lifecycle (decided)

- **Develop on a feature branch**, then **merge directly into `main`** and push.
- **We do NOT use pull requests at this time.** Don't open a PR unless explicitly
  asked.
- After merging, `main` is what deploys; a feature branch's UI won't appear on
  the deployed site / `main` until it's merged.

## Build & verify

- `yarn install` then `yarn build` (runs `tsc -b && vite build`) — use this to
  typecheck and confirm a change compiles before merging.

## Supabase

- Project: **Claude Cabo**, ref `ddlrfzhejracvpqxeaos`.
- Schema migrations live in `supabase/migrations/`. When adding one, also apply
  it to the live project so the DB and repo stay in sync.
- Keep password hashing in dedicated `SECURITY DEFINER` functions
  (`crypt(pw, gen_salt('bf'))`, `search_path = public, extensions`). Never expose
  `group_secrets` to clients.
