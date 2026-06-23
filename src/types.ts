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

export type GameId = 'hot-or-not' | 'most-likely-to' | 'guess-who-said-it' | 'would-you-rather';

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

/** Classic (variant B): a played round of the preloaded Famous Lines deck. */
export interface GuessWhoClassicData {
  mode: 'classic';
  answers: GuessWhoAnswer[];
}

/**
 * Insiders (variant A): a quote the group authored. The result's `id` is the
 * quote id and its `playerId` is whoever added it; `saidByPlayerId` is the
 * group member who actually said it — the thing everyone else guesses.
 */
export interface InsidersQuoteData {
  mode: 'insiders-quote';
  saidByPlayerId: string;
  text: string;
}

/** One guess about who said a particular Insiders quote. */
export interface InsidersGuess {
  quoteId: string;
  guessPlayerId: string;
  correct: boolean;
}

/** Insiders: one player's batch of guesses from a play session. */
export interface InsidersGuessData {
  mode: 'insiders-guess';
  guesses: InsidersGuess[];
}

/** Payload union for Guess Who Said It, discriminated on `mode`. */
export type GuessWhoResultData = GuessWhoClassicData | InsidersQuoteData | InsidersGuessData;

/**
 * One Would You Rather answer: this player picked `choice` ('a' or 'b') for a
 * prompt. The option texts are stored alongside so the reveal stays stable even
 * if the prompt deck changes later (same approach as MostLikelyVote).
 */
export interface WouldYouRatherChoice {
  promptId: string;
  optionA: string;
  optionB: string;
  choice: 'a' | 'b';
}

export interface WouldYouRatherResultData {
  choices: WouldYouRatherChoice[];
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

export interface WouldYouRatherResult extends BaseResult {
  gameId: 'would-you-rather';
  data: WouldYouRatherResultData;
}

/** Discriminated union over `gameId` so each game's payload stays type-safe. */
export type GameResult =
  | HotOrNotResult
  | MostLikelyResult
  | GuessWhoResult
  | WouldYouRatherResult;
