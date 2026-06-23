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

> **We do NOT have a development / staging environment at this time.** There is
> no pre-prod deploy, so merging to `main` is what ships to production, and
> review happens on the live production deploy after the merge.

Because of that, the current lifecycle is:

- **Develop on a feature branch**, verify locally with `yarn build`, then
  **merge directly into `main`** and push.
- **Merging to `main` is a production release.** The hosting provider
  (Netlify / Vercel — see `netlify.toml` / `vercel.json`) auto-deploys `main`,
  so keep `main` deployable at all times.
- **Review the change in production** after it merges — there's no other
  environment to preview it on. A feature branch's UI won't appear on the
  deployed site / `main` until it's merged.
- **We do NOT use pull requests at this time.** Don't open a PR unless
  explicitly asked.
- Revisit this section once a dedicated dev/staging environment exists.

## Thread lifecycle (`#done`)

Threads (sessions) are ephemeral — the container is reclaimed after the session
ends, so anything worth keeping must already be committed and pushed.

- **`#done` means: close this thread.** Before treating a thread as closed,
  verify there's nothing important that *requires this thread to stay open* —
  i.e. nothing that couldn't be picked up cleanly in a fresh thread.
- A thread is safe to close when:
  - all intended changes are **committed and pushed** (working tree clean), and
  - anything shipped is **merged to `main`** if it was meant to deploy, and
  - any follow-ups are **captured durably** (in `main`, in this file, or called
    out to the user) rather than living only in the thread's chat history.
- A new thread starts fresh with **no memory of prior chat** — only the repo
  state and this file carry over. So if something must survive, write it down
  here or commit it; don't rely on the conversation.
- When closing, give a short sign-off: confirm the branch/`main` state and flag
  any open follow-ups so they aren't lost.

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
