// Types for live (synchronous, Kahoot-style) game sessions. See
// supabase/migrations/20260623000001_live_sessions.sql for the backing tables.

export type LivePhase = 'lobby' | 'question' | 'reveal' | 'final';

/** One frozen question in a live trivia deck (Guess Who Said It / Famous Lines). */
export interface LiveDeckCard {
  promptId: string;
  quote: string;
  /** The correct option. */
  answer: string;
  /** Answer + decoys, pre-shuffled once at room creation so order is stable. */
  options: string[];
  hint?: string;
}

/** One frozen question in a live Most Likely To deck (options are the live roster). */
export interface MostLikelyCard {
  promptId: string;
  text: string;
}

export interface SessionConfig {
  /** Seconds each question stays open before it can be revealed. */
  questionSeconds?: number;
  deckSize?: number;
}

export interface LiveSession {
  id: string;
  groupId: string;
  gameId: string;
  hostPlayerId: string | null;
  /** false = host is only driving the room, not on the leaderboard. */
  hostPlays: boolean;
  phase: LivePhase;
  /** Which question is live; -1 in the lobby. */
  currentIndex: number;
  /**
   * Frozen, ordered questions so every device sees identical cards/order. The
   * card shape is per-game — each screen casts to its own card type
   * (LiveDeckCard for trivia, MostLikelyCard for Most Likely To, …).
   */
  deck: unknown[];
  /** Epoch ms when the current question went live (null outside 'question'). */
  questionStartedAt: number | null;
  config: SessionConfig;
}

export interface SessionPlayer {
  playerId: string;
  joinedAt: number;
}

export interface SessionAnswer {
  id: string;
  questionIndex: number;
  playerId: string;
  /** The picked option (string for the current MCQ games). */
  answer: string;
  correct: boolean | null;
  points: number;
  answeredAt: number;
}
