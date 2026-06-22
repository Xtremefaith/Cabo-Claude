# CLAUDE.md

Guidance for working in this repo. Claude Cabo is a React + TypeScript + Vite
single-page app — a club of social party games (first game: Hot or Not).

## Stack

- **React 18** + **TypeScript**, bundled with **Vite**.
- **React Router** (`HashRouter`) for navigation — routes live in `src/App.tsx`.
- **Tailwind CSS** for styling.
- **Supabase** for cloud group/sync mode (`src/lib/supabase.ts`, `src/store/storage.ts`).
- **framer-motion** for animation.

## Commands

```bash
yarn install
yarn dev         # local dev server (Vite) on http://localhost:5173, also on LAN
yarn build       # tsc -b && vite build → outputs to dist/
yarn preview      # preview the production build
yarn typecheck   # tsc -b --noEmit
```

Always run `yarn build` (which type-checks first) before pushing.

## Development lifecycle

> **We do not have a development / staging environment at this time.**

Because there is no separate dev or staging deploy, the current lifecycle is:

1. **Develop on a feature branch** (e.g. `claude/<feature>`), committing as you go.
2. **Verify locally** — `yarn build` must pass (it runs the type-check).
3. **Merge to `main`.** Merging to `main` is what ships: the hosting provider
   (Netlify / Vercel — see `netlify.toml` / `vercel.json`) auto-deploys `main`
   to **production**.
4. **Review happens in production.** Since there is no pre-prod environment,
   changes are reviewed on the live production deploy after the merge.

Implications:
- `main` is always the production branch — keep it deployable.
- Treat a merge to `main` as a production release, even for review purposes.
- Revisit this section once a dedicated dev/staging environment exists.

## Layout

- `src/screens/` — top-level screens (home, group gate, manage group, profile, reveal…).
- `src/games/` — per-game screens and logic (`hotOrNot/`, `mostLikelyTo/`), registered in `src/games/registry.ts`.
- `src/components/` — shared UI (`ui.tsx` has `Screen`, `Button`, `BackButton`, `Logo`).
- `src/store/` — app state (`useStore.ts`) and persistence (`storage.ts`, local + Supabase cloud).
- `src/data/` — static content (prompts, celebrities, spice levels).
