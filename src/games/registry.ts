// The club's game registry. Add future games here and they appear on the
// home screen automatically. Each game owns its own route under /play/:gameId.

import type { GameId } from '../types';

export interface GameMeta {
  id: GameId;
  title: string;
  tagline: string;
  emoji: string;
  /** Tailwind gradient classes for the game's tile. */
  gradient: string;
  available: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: 'hot-or-not',
    title: 'Hot or Not',
    tagline: 'Swipe 10 comedians. Reveal at dinner.',
    emoji: '🔥',
    gradient: 'from-hot via-sun to-sun',
    available: true,
  },
];

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
