// Aggregates Would You Rather answers across everyone in the group into a
// per-prompt split: how many picked option A vs option B, and each voter's pick.
// Mirrors the Most Likely To reveal so both games behave the same way.

import type { GameResult } from '../../types';

export interface WouldYouRatherRow {
  promptId: string;
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
  totalVotes: number;
  /** Each voter's latest pick for this prompt. */
  ballots: { voterId: string; choice: 'a' | 'b' }[];
}

/**
 * Build the reveal table. For each prompt anyone answered, we take each voter's
 * most recent answer (so replays overwrite), tally A vs B, and surface the
 * split. Sorted by most-answered first.
 */
export function buildWouldYouRatherReveal(results: GameResult[]): WouldYouRatherRow[] {
  const games = results
    .filter((r): r is Extract<GameResult, { gameId: 'would-you-rather' }> => r.gameId === 'would-you-rather')
    .sort((a, b) => a.playedAt - b.playedAt); // older first so newer overwrites

  // promptId -> { optionA, optionB, voterId -> choice }
  const byPrompt = new Map<
    string,
    { optionA: string; optionB: string; latest: Map<string, 'a' | 'b'> }
  >();

  for (const g of games) {
    for (const c of g.data.choices) {
      if (!byPrompt.has(c.promptId)) {
        byPrompt.set(c.promptId, { optionA: c.optionA, optionB: c.optionB, latest: new Map() });
      }
      byPrompt.get(c.promptId)!.latest.set(g.playerId, c.choice);
    }
  }

  const rows: WouldYouRatherRow[] = [];
  for (const [promptId, { optionA, optionB, latest }] of byPrompt) {
    let countA = 0;
    let countB = 0;
    const ballots: { voterId: string; choice: 'a' | 'b' }[] = [];
    for (const [voterId, choice] of latest) {
      if (choice === 'a') countA++;
      else countB++;
      ballots.push({ voterId, choice });
    }
    rows.push({ promptId, optionA, optionB, countA, countB, totalVotes: ballots.length, ballots });
  }

  rows.sort((a, b) => b.totalVotes - a.totalVotes);
  return rows;
}

/** This voter's latest pick per prompt: promptId -> 'a' | 'b'. */
export function myWouldYouRatherChoices(
  results: GameResult[],
  myPlayerId: string,
): Map<string, 'a' | 'b'> {
  const mine = results
    .filter(
      (r): r is Extract<GameResult, { gameId: 'would-you-rather' }> =>
        r.gameId === 'would-you-rather' && r.playerId === myPlayerId,
    )
    .sort((a, b) => a.playedAt - b.playedAt); // older first so newer overwrites
  const map = new Map<string, 'a' | 'b'>();
  for (const g of mine) for (const c of g.data.choices) map.set(c.promptId, c.choice);
  return map;
}
