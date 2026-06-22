# 🌴 Claude Cabo

> _Arcade of Social Games_ — a play on Club Cabo, hosted by one very good margarita-sipping goldendoodle. 🍸🐩

A collection of social party games for dinner-table chaos. First game up: **Hot or Not** 🔥

> **Artwork:** the app reads logo art from `public/` and shows it automatically (a neon wordmark / gradient tile stands in until each file lands):
> - App logo → `public/logo.png` (home screen)
> - Hot or Not logo → `public/games/hot-or-not.png` (game tile + "who's playing?" header)

## Hot or Not

1. **Begin** from the home screen.
2. **Enter your name** and **pick your gender** — you're saved as a player for every future game.
3. Swipe through **10 comedians** of the opposite sex: **right = Hot 🔥**, **left = Not 👎** (or tap the buttons).
4. **Game over** — see your Hot picks.

Then hit **The Reveal** to put everyone's picks side by side at the table, or open any **player's profile** from the home screen to see their stats across games.

### How it works

- **Players & stats** are saved in the browser (localStorage) on whatever device you play on — pass the phone around the table.
- **Headshots** are pulled live from Wikipedia the first time you play and cached after that, so nothing copyrighted is bundled in the app. If a photo can't load you'll see an initials avatar instead.
- The roster of comedians lives in [`src/data/comedians.ts`](src/data/comedians.ts) — add or swap names there.

## Run it

```bash
yarn install
yarn dev        # opens on http://localhost:5173 — also exposed on your LAN
```

For dinner: run `yarn dev`, then open the printed **Network** URL on your phone (same Wi‑Fi). Or build a static bundle to host anywhere:

```bash
yarn build      # outputs to dist/
yarn preview    # preview the production build
```

## Adding more games

Claude Cabo is built around a small game registry:

- Register a game in [`src/games/registry.ts`](src/games/registry.ts) — it appears on the home screen automatically.
- Players are shared across all games (`src/store/`), and results are stored per game (`GameResult.gameId`), so each game can compute its own stats and profile section.

## Stack

Vite · React · TypeScript · Tailwind CSS · Framer Motion (swipe gestures) · React Router · localStorage.
