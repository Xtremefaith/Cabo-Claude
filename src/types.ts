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

export type GameId = 'hot-or-not';

/** A single player's completed run of a game. */
export interface GameResult {
  id: string;
  gameId: GameId;
  playerId: string;
  playedAt: number;
  /** Game-specific payload. */
  data: HotOrNotResultData;
}

export interface HotOrNotChoice {
  candidateId: string;
  candidateName: string;
  /** true = swiped right (HOT), false = swiped left (NOT). */
  hot: boolean;
}

export interface HotOrNotResultData {
  choices: HotOrNotChoice[];
}
