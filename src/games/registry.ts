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
