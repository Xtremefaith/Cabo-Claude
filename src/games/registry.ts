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
  /**
   * When set, the tile is shown locked with this short label stamped across it
   * (e.g. "Too Dangerous") and isn't playable. Pair with `available: false`.
   */
  lockNote?: string;
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
    available: false,
    lockNote: 'Too Dangerous',
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
    tagline: 'Live dilemmas — pick a side, watch the crew split.',
    emoji: '🤔',
    gradient: 'from-hot via-purple-500 to-not',
    route: '/live/would-you-rather',
    logo: './games/would-you-rather.png',
    available: true,
  },
  {
    id: 'finish-the-lyric',
    title: 'Finish the Lyric',
    tagline: 'Live sing-along trivia — race to the next line.',
    emoji: '🎤',
    gradient: 'from-sky-500 via-indigo-500 to-purple-600',
    route: '/live/finish-the-lyric',
    logo: './games/finish-the-lyric.png',
    available: true,
  },
  {
    id: 'heaven-or-hell',
    title: 'Heaven or Hell',
    tagline: 'Live swipe-off — Heaven or Hell for each soul.',
    emoji: '⚖️',
    gradient: 'from-sky-400 via-purple-500 to-red-600',
    route: '/live/heaven-or-hell',
    logo: './games/heaven-or-hell.png',
    available: true,
  },
  {
    id: 'mind-meld',
    title: 'Mind Meld',
    tagline: 'Say the same thing — bank points together.',
    emoji: '🧠',
    gradient: 'from-sky-400 via-indigo-500 to-emerald-400',
    route: '/live/mind-meld',
    logo: './games/mind-meld.png',
    available: true,
  },
  {
    id: 'trivia',
    title: 'Trivia',
    tagline: 'Live general-knowledge quiz — fastest answer wins.',
    emoji: '❓',
    gradient: 'from-amber-400 via-orange-500 to-hot',
    route: '/live/trivia',
    logo: './games/trivia.png',
    available: true,
  },
  {
    id: 'cancun-vs-cabo',
    title: 'Cancún vs Cabo',
    tagline: 'Vote-together survey — crown next year’s trip.',
    emoji: '🏝️',
    gradient: 'from-hot via-amber-400 to-sky-400',
    route: '/live/cancun-vs-cabo',
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
