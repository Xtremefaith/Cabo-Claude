// Core shared types for the Claude Cabo club.

export type Gender = 'male' | 'female';

/** A roster category the player can pick from in Hot or Not. */
export type CategoryId = 'comedians' | 'actors' | 'musicians' | 'athletes';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  /** A fun avatar accent color, assigned on creation. */
  color: string;
  /** Optional self-photo as a downscaled data URL (used for the avatar). */
  photo?: string;
  createdAt: number;
}

/** A swipeable candidate (comedian, actor, musician, athlete, …). */
export interface Candidate {
  id: string;
  name: string;
  gender: Gender;
  /** Which roster category this candidate belongs to. */
  category: CategoryId;
  /** Wikipedia page title used to resolve a headshot at runtime. */
  wikiTitle: string;
  /** Short "known for" blurb shown on the card. */
  blurb: string;
}

export type GameId = 'hot-or-not' | 'most-likely-to' | 'guess-who-said-it';

/** A single player's completed run of a game. */
export interface HotOrNotChoice {
  candidateId: string;
  candidateName: string;
  /** true = swiped right (HOT), false = swiped left (NOT). */
  hot: boolean;
}

export interface HotOrNotResultData {
  choices: HotOrNotChoice[];
}

/** One Most Likely To vote: this voter picked `targetPlayerId` for a prompt. */
export interface MostLikelyVote {
  promptId: string;
  promptText: string;
  targetPlayerId: string;
}

export interface MostLikelyResultData {
  votes: MostLikelyVote[];
}

/** One answer in a Guess Who Said It round. */
export interface GuessWhoAnswer {
  promptId: string;
  /** The film the player picked. */
  pick: string;
  /** Whether `pick` matched the prompt's correct answer. */
  correct: boolean;
}

export interface GuessWhoResultData {
  /**
   * Which deck this round used. 'classic' = the preloaded Famous Lines deck
   * (variant B). Reserved for a future 'insiders' (group-authored) mode.
   */
  mode: 'classic';
  answers: GuessWhoAnswer[];
}

interface BaseResult {
  id: string;
  /** The player who produced this result (the voter / swiper). */
  playerId: string;
  playedAt: number;
}

export interface HotOrNotResult extends BaseResult {
  gameId: 'hot-or-not';
  data: HotOrNotResultData;
}

export interface MostLikelyResult extends BaseResult {
  gameId: 'most-likely-to';
  data: MostLikelyResultData;
}

export interface GuessWhoResult extends BaseResult {
  gameId: 'guess-who-said-it';
  data: GuessWhoResultData;
}

/** Discriminated union over `gameId` so each game's payload stays type-safe. */
export type GameResult = HotOrNotResult | MostLikelyResult | GuessWhoResult;
