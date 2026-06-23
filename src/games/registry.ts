// Claude Cabo's game registry. Add future games here and they appear on the
// home screen automatically. Each game owns its own route under /play/:gameId.

import type { GameId } from '../types';

export interface GameMeta {
  id: GameId;
  title: string;
  tagline: string;
  emoji: string;
  /** Tailwind gradient classes for the game's fallback tile. */
  gradient: string;
  /** Entry route when the tile is tapped. */
  route: string;
  /**
   * Optional logo art. Drop the file at the given path under `public/` and it
   * replaces the emoji tile automatically; otherwise the gradient tile shows.
   */
  logo?: string;
  available: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: 'hot-or-not',
    title: 'Hot or Not',
    tagline: 'Pick a category, swipe 10. Reveal at dinner.',
    emoji: '🔥',
    gradient: 'from-hot via-sun to-sun',
    route: '/play/hot-or-not',
    logo: './games/hot-or-not.png',
    available: true,
  },
  {
    id: 'most-likely-to',
    title: 'Most Likely To',
    tagline: 'Live vote-off — crown your crew, together.',
    emoji: '🏆',
    gradient: 'from-indigo-500 via-purple-500 to-hot',
    route: '/live/most-likely-to',
    logo: './games/most-likely-to.png',
    available: true,
  },
  {
    id: 'guess-who-said-it',
    title: 'Guess Who Said It',
    tagline: 'Live movie-quote trivia, or your crew’s own quotes.',
    emoji: '💬',
    gradient: 'from-emerald-500 via-teal-500 to-sky-500',
    route: '/play/guess-who-said-it',
    logo: './games/guess-who-said-it.png',
    available: true,
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    tagline: 'Two choices, endless chaos. Swipe your pick.',
    emoji: '🤔',
    gradient: 'from-hot via-purple-500 to-not',
    route: '/play/would-you-rather/run',
    logo: './games/would-you-rather.png',
    available: true,
  },
];

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Teaser tiles for games that aren't built yet — shown locked on the home screen. */
export interface ComingSoonGame {
  title: string;
  tagline: string;
  emoji: string;
}

export const COMING_SOON: ComingSoonGame[] = [
  { title: 'Hot Takes', tagline: 'Defend your spiciest opinion', emoji: '🌶️' },
];
