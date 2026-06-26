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

/** One frozen dilemma in a live Would You Rather deck (binary A/B, no score). */
export interface WouldYouRatherCard {
  promptId: string;
  optionA: string;
  optionB: string;
}

/**
 * One frozen candidate in a live Heaven or Hell deck. Players swipe each one to
 * 'heaven' or 'hell' (binary, no score — like Would You Rather). A candidate is
 * either a famous face (resolve a headshot from `wikiTitle`) or a crew member
 * mixed in for fun (`playerId` → render their avatar). `promptId` is the celeb
 * id, or `player:<playerId>` for a crew member.
 */
export interface HeavenOrHellCard {
  promptId: string;
  name: string;
  blurb: string;
  wikiTitle?: string;
  playerId?: string;
}

/**
 * One frozen prompt in a live Mind Meld deck. Players type a short free-text
 * answer; the reveal clusters identical (normalized) answers and the crew banks
 * a single shared score for how much they melded (collaborative — no per-player
 * score). `promptId` is the prompt's id from data/mindMeldPrompts.ts.
 */
export interface MindMeldCard {
  promptId: string;
  text: string;
}

/**
 * One frozen question in a live Trivia deck. Players tap an option; scoring is
 * the default speed-scaled rule (correct if `answer` matches), same as Famous
 * Lines. `options` is answer + decoys, pre-shuffled once at room creation.
 */
export interface TriviaCard {
  promptId: string;
  category: string;
  question: string;
  answer: string;
  options: string[];
}

/**
 * One frozen topic in a live Cancún vs Cabo deck. The two contestants are
 * room-level (SessionConfig.sideA / sideB), so a card only carries its category.
 */
export interface CancunVsCaboCard {
  topicId: string;
  label: string;
  emoji: string;
}

export interface SessionConfig {
  /** Seconds each question stays open before it can be revealed. */
  questionSeconds?: number;
  deckSize?: number;
  /** Cancún vs Cabo: the two contestants being compared (option 'a' / 'b'). */
  sideA?: string;
  sideB?: string;
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
