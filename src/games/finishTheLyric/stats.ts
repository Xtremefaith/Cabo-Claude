// Aggregates Finish the Lyric rounds into a group leaderboard, plus a helper to
// review your most recent round. Mirrors guessWhoSaidIt/stats.ts.

import type { FinishLyricAnswer, GameResult } from '../../types';

type FinishLyricResult = Extract<GameResult, { gameId: 'finish-the-lyric' }>;

function finishLyricResults(results: GameResult[]): FinishLyricResult[] {
  return results.filter((r): r is FinishLyricResult => r.gameId === 'finish-the-lyric');
}

export interface FinishLyricStanding {
  playerId: string;
  correct: number;
  total: number;
  /** Rounded percentage 0–100, for the accuracy badge. */
  accuracy: number;
}

/**
 * Group leaderboard. Decks never repeat a prompt for the same player, so we can
 * safely sum each player's correct/total across all their rounds. Sorted by
 * most correct, then accuracy, then most answered.
 */
export function buildFinishLyricLeaderboard(results: GameResult[]): FinishLyricStanding[] {
  const byPlayer = new Map<string, { correct: number; total: number }>();
  for (const g of finishLyricResults(results)) {
    const tally = byPlayer.get(g.playerId) ?? { correct: 0, total: 0 };
    for (const a of g.data.answers) {
      tally.total += 1;
      if (a.correct) tally.correct += 1;
    }
    byPlayer.set(g.playerId, tally);
  }

  const rows: FinishLyricStanding[] = [...byPlayer.entries()].map(([playerId, t]) => ({
    playerId,
    correct: t.correct,
    total: t.total,
    accuracy: t.total ? Math.round((t.correct / t.total) * 100) : 0,
  }));

  rows.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy || b.total - a.total);
  return rows;
}

/** This player's most recent round, for the post-game review. */
export function myLatestLyricRound(results: GameResult[], myPlayerId: string): FinishLyricAnswer[] {
  const mine = finishLyricResults(results)
    .filter((g) => g.playerId === myPlayerId)
    .sort((a, b) => b.playedAt - a.playedAt);
  return mine[0]?.data.answers ?? [];
}
