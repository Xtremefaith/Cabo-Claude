// Aggregates Most Likely To votes across everyone in the group into a per-prompt
// reveal: who the group crowned for each prompt, and how each voter voted.

import type { GameResult } from '../../types';

export interface MostLikelyRow {
  promptId: string;
  promptText: string;
  /** Player id(s) with the most votes (more than one only on a tie). */
  winnerIds: string[];
  topCount: number;
  totalVotes: number;
  /** Each voter's latest pick for this prompt. */
  ballots: { voterId: string; targetId: string }[];
}

/**
 * Build the reveal table. For each prompt anyone voted on, we take each voter's
 * most recent vote (so replays overwrite), tally targets, and surface the
 * winner(s). Sorted by strongest consensus first.
 */
export function buildMostLikelyReveal(results: GameResult[]): MostLikelyRow[] {
  const games = results
    .filter((r): r is Extract<GameResult, { gameId: 'most-likely-to' }> => r.gameId === 'most-likely-to')
    .sort((a, b) => a.playedAt - b.playedAt); // older first so newer overwrites

  // promptId -> { text, voterId -> targetId }
  const byPrompt = new Map<string, { text: string; latest: Map<string, string> }>();

  for (const g of games) {
    for (const v of g.data.votes) {
      if (!byPrompt.has(v.promptId)) {
        byPrompt.set(v.promptId, { text: v.promptText, latest: new Map() });
      }
      byPrompt.get(v.promptId)!.latest.set(g.playerId, v.targetPlayerId);
    }
  }

  const rows: MostLikelyRow[] = [];
  for (const [promptId, { text, latest }] of byPrompt) {
    const counts = new Map<string, number>();
    const ballots: { voterId: string; targetId: string }[] = [];
    for (const [voterId, targetId] of latest) {
      counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
      ballots.push({ voterId, targetId });
    }
    const topCount = Math.max(...counts.values());
    const winnerIds = [...counts.entries()].filter(([, n]) => n === topCount).map(([id]) => id);
    rows.push({ promptId, promptText: text, winnerIds, topCount, totalVotes: ballots.length, ballots });
  }

  rows.sort((a, b) => b.topCount - a.topCount || b.totalVotes - a.totalVotes);
  return rows;
}
