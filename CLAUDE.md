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

## Live (synchronous) play — Kahoot-style

Games are moving from self-paced/async to **synchronous, host-driven rooms** (the
async model felt un-social). A **live session** is a shared room all group members
observe via Realtime while the host advances a phase machine:
`lobby → question → reveal → final`.

- Backed by `game_sessions` / `session_players` / `session_answers`
  (migration `20260623000001_live_sessions.sql`; member-scoped RLS via
  `private.is_group_member`, same as players/results).
- Client engine lives in **`src/live/`** (kept separate from `store/storage.ts`,
  whose re-hydrate-everything model is too heavy for per-answer traffic):
  `liveStore.ts` (own Realtime channel + actions), `useLiveSession.ts`,
  `scoring.ts` (pure, speed-scaled points + leaderboard), shared `ui.tsx`
  (header/fallback/timer), and one screen per live game.
- **The engine is game-agnostic.** `session.deck` is `unknown[]` and each screen
  casts to its own card type (`LiveDeckCard` for trivia, `MostLikelyCard` for
  Most Likely To, `HeavenOrHellCard` for the swipe game — all in `live/types.ts`).
  `submitAnswer(answer, scoring?)` takes caller-supplied `{ correct, points }`;
  trivia omits it and falls back to the speed-scaled rule, opinion games pass
  `{ correct: null, points: 0 }`.
- **Scoring is hybrid**: speed-based points + leaderboard only where there's a
  correct answer (trivia). Opinion games (Most Likely To) are a pure tally — no
  score, just the crowned reveal. At a room's end each device persists its own run
  via the normal `addResult`, so the existing all-time stats / profiles keep working.
- **Host control is a UI convention**, not DB-enforced (`players` aren't tied to
  `auth.uid()` — matches the trusted-group model). A "take over as host" escape
  exists if the host drops. When hosting, the "are you playing too?" prompt sets
  `host_plays` (a non-playing host just drives and isn't a vote option / on the board).

**Live so far (sync-only):**
- **Guess Who Said It → Famous Lines** — `/live/guess-who-said-it`
  (`LiveGuessWhoScreen.tsx`): trivia, speed points + leaderboard.
- **Most Likely To** — `/live/most-likely-to` (`LiveMostLikelyScreen.tsx`): vote a
  crew member, no score, crowned reveal + "most crowned" superlative.
- **Would You Rather** — `/live/would-you-rather` (`LiveWouldYouRatherScreen.tsx`):
  binary A/B, no score, reveal is the group's split + "most divided" superlative.
- **Mind Meld** — `/live/mind-meld` (`LiveMindMeldScreen.tsx`): the first
  **collaborative** live game and the first with **free-text answers** (every game
  before it was tap/swipe). Each round the crew types a short answer to a prompt
  (`data/mindMeldPrompts.ts`, spice-filtered); the reveal clusters identical
  answers and the group banks a **single shared score** for how synced they are.
  Matching (`normalize`) folds case/punctuation/whitespace **and** formatting-only
  differences — spacing (`ice cream`=`icecream`) and regular plurals (`dog`=`dogs`)
  — but deliberately stops short of typo/fuzzy matching (over short answers it
  merges real distinct words; saying-it-the-same is the skill). A human host-merge
  at reveal was offered but not yet built (see thread). Scoring (`meldOf`) is
  collaborative — no per-player score, no leaderboard: round points = matched
  players / total ×100, with a 150-pt jackpot for a unanimous "TOTAL MELD". The
  final screen rates the crew's telepathy (One Mind → Total Strangers) from the
  average meld fraction. Submitted answers lock (first answer wins, like every
  other game). Logo path is wired (`./games/mind-meld.png`); the tile falls back
  to the gradient until that file is dropped in `public/games/`.
- **Heaven or Hell** — `/live/heaven-or-hell` (`LiveHeavenOrHellScreen.tsx`): swipe
  a candidate to Heaven (right) or Hell (left), no score, reveal is the group's
  split framed as the angel/demon on the candidate's shoulders + "most
  heaven/hell-bound" superlatives. Candidates come from `data/heavenOrHellCandidates.ts`
  — a **spice-rated** pool: the mainstream `celebrities.ts` roster seeds spice 1,
  and a curated `CONTROVERSIAL` list adds spice 3–5 (provocative celebs → divisive
  moguls/media → polarizing politicians, televangelists, internet provocateurs).
  The deck builder filters `spice <= group spice`, so higher spice surfaces edgier
  faces. Editorial line: public figures only, excluding people defined by violent/
  sexual crimes with real victims or mass-atrocity heads of state (not a debatable
  party question; trivializes victims). A few crew members are mixed in
  (`promptId` `player:<id>` → their avatar). Swipe interaction is its own
  `SwipeVerdictCard.tsx` (a generalized clone of Hot or Not's `SwipeCard`, since
  that game is locked and its card is Candidate-typed).

The Insiders mode is still async until ported. **Hot or Not is locked** — its home
tile carries a "Too Dangerous" stamp (`available: false` + `lockNote` in the
registry; rendered by `GameTile`) and isn't playable.

### Adding a new live game (the fast path)

Copy the closest existing screen and edit. Pick the closest model by mechanic:
trivia → `LiveGuessWhoScreen`; vote-a-person → `LiveMostLikelyScreen`; binary
opinion → `LiveWouldYouRatherScreen`; swipe → `LiveHeavenOrHellScreen`. All share
the same `StartView → LobbyView → QuestionView → RevealView → FinalView` skeleton,
`HostHandoff`, the auto-reveal `advancedRef` effect, and the persist-once-at-final
`addResult` block. The touch points to change are always the same:

1. `types.ts` — add the id to the `GameId` union + a `…Result`/`…ResultData` type,
   and add it to the `GameResult` union. **`ProfileScreen.tsx`'s history ternary
   is exhaustive over the union — add a branch there or the build breaks.**
2. `live/types.ts` — add the per-game `…Card` deck-card type.
3. `live/LiveXScreen.tsx` — the screen. Opinion games reuse `NO_SCORE`; reveal/
   final compute a tally from `answers`. Deck builder uses `pickFreshFirst(...)`
   over a `data/*.ts` prompt pool (or reuse `celebrities.ts`), filtered by group
   `spice` where relevant.
4. `games/registry.ts` — add the `GameMeta` entry (`available: true`,
   `route: '/live/<id>'`, `logo: './games/<id>.png'`).
5. `App.tsx` — add the `<Route path="/live/<id>" …>`.
6. Logo art goes in `public/games/<id>.png` (square, lowercase-hyphen name; the
   art carries its own title so the tile shows it instead of the gradient).
7. No new migration needed — the generic `game_sessions` schema fits any deck/
   answer shape (deck + answer are JSONB).

## Backlog (not yet built)

- **Rename the app → "Social Arcade"** (party brand shift; deferred by request).
- **Big-screen / "TV" host mode** — a passive host display (question + live
  scoreboard) while players answer on phones. The `host_plays` flag already
  distinguishes a non-playing host driver.
- **Guess Who Said It → Insiders**: still async; port to live (or decide its fate)
  when ready. Hot or Not is intentionally locked ("Too Dangerous"), not pending.
- **Heaven or Hell → public ("career") verdicts.** Show each candidate's tally
  across ALL groups during the reveal — the angel/demon shoulders flip to *public*
  Heaven/Hell %, with the crew's split moving below (the reveal layout in
  `LiveHeavenOrHellScreen.tsx` is already built to receive this — see its file
  header). Needs a cross-group aggregate that bypasses per-group RLS: a public,
  PII-free `candidate_id → {heaven, hell}` tally table written via a
  `SECURITY DEFINER` RPC at a room's end, and read via another RPC. **Only for
  famous candidates — never crew members** (mixing a player's verdicts into a
  global public tally would leak; see the User Anonymity doc). Famous candidates
  already have stable ids (`heavenOrHellCandidates.ts`); crew cards use
  `player:<id>` and must be filtered out before any public write.
  **Decision (per product):** all famous candidates feed the public tally
  regardless of spice — including the controversial spice 5 set (politicians,
  televangelists, provocateurs). ⚠️ This makes the public tally an *outward-facing,
  persistent, cross-group "is this named real person damned" scoreboard*. That's a
  real defamation/targeting surface that the private game is not — **re-confirm
  this scope when the public feature is actually built**, not just inherited from
  the private candidate list.
- **`Finish the Lyric` logo is already uploaded** at
  `public/games/AD33F533-4BD5-46D5-9D78-66A2D92F667F.png` ("CAN YOU FINISH THE
  LYRIC?") for a future game — rename to `finish-the-lyric.png` when that game is
  built. The game itself isn't started.

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
- **In the web/remote sandbox, `yarn install` often flakes** ("aborted" /
  connection resets) because `registry.yarnpkg.com` routes through the egress
  proxy. `npm install` uses a different HTTP stack and reliably succeeds; deps
  resolve fine for a build check. If you do, delete the `package-lock.json` it
  creates afterward — the repo stays yarn-based (don't commit it or a churned
  `yarn.lock`).

## Supabase

- Project: **Claude Cabo**, ref `ddlrfzhejracvpqxeaos`.
- Schema migrations live in `supabase/migrations/`. When adding one, also apply
  it to the live project so the DB and repo stay in sync.
- Keep password hashing in dedicated `SECURITY DEFINER` functions
  (`crypt(pw, gen_salt('bf'))`, `search_path = public, extensions`). Never expose
  `group_secrets` to clients.
