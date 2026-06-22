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
    tagline: 'Swipe 10 comedians. Reveal at dinner.',
    emoji: '🔥',
    gradient: 'from-hot via-sun to-sun',
    logo: './games/hot-or-not.png',
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
  { title: 'Most Likely To', tagline: 'Vote who fits the bill', emoji: '🏆' },
  { title: 'Hot Takes', tagline: 'Defend your spiciest opinion', emoji: '🌶️' },
  { title: 'Would You Rather', tagline: 'Pick your poison', emoji: '🤔' },
  { title: 'Guess Who Said It', tagline: 'Match the quote to the player', emoji: '💬' },
];
