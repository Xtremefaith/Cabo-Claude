// Types for live (synchronous, Kahoot-style) game sessions. See
// supabase/migrations/20260623000001_live_sessions.sql for the backing tables.

export type LivePhase = 'lobby' | 'question' | 'reveal' | 'final';

/** One frozen question in a live deck (Guess Who Said It / Famous Lines). */
export interface LiveDeckCard {
  promptId: string;
  quote: string;
  /** The correct option. */
  answer: string;
  /** Answer + decoys, pre-shuffled once at room creation so order is stable. */
  options: string[];
  hint?: string;
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
  deck: LiveDeckCard[];
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
