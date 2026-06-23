// Aggregates Guess Who Said It rounds into a group leaderboard, plus helpers
// for de-duping decks across replays and reviewing your latest round.

import type { GameResult, GuessWhoAnswer } from '../../types';

type GuessWhoResult = Extract<GameResult, { gameId: 'guess-who-said-it' }>;

function guessWhoResults(results: GameResult[]): GuessWhoResult[] {
  return results.filter((r): r is GuessWhoResult => r.gameId === 'guess-who-said-it');
}

export interface GuessWhoStanding {
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
export function buildGuessWhoLeaderboard(results: GameResult[]): GuessWhoStanding[] {
  const byPlayer = new Map<string, { correct: number; total: number }>();
  for (const g of guessWhoResults(results)) {
    if (g.data.mode !== 'classic') continue;
    const tally = byPlayer.get(g.playerId) ?? { correct: 0, total: 0 };
    for (const a of g.data.answers) {
      tally.total += 1;
      if (a.correct) tally.correct += 1;
    }
    byPlayer.set(g.playerId, tally);
  }

  const rows: GuessWhoStanding[] = [...byPlayer.entries()].map(([playerId, t]) => ({
    playerId,
    correct: t.correct,
    total: t.total,
    accuracy: t.total ? Math.round((t.correct / t.total) * 100) : 0,
  }));

  rows.sort(
    (a, b) => b.correct - a.correct || b.accuracy - a.accuracy || b.total - a.total,
  );
  return rows;
}

/** Prompt ids this player has already answered (so replays draw fresh quotes). */
export function myAnsweredQuotes(results: GameResult[], myPlayerId: string): Set<string> {
  const ids = new Set<string>();
  for (const g of guessWhoResults(results)) {
    if (g.playerId !== myPlayerId || g.data.mode !== 'classic') continue;
    for (const a of g.data.answers) ids.add(a.promptId);
  }
  return ids;
}

/** This player's most recent round, for the post-game review. */
export function myLatestRound(results: GameResult[], myPlayerId: string): GuessWhoAnswer[] {
  const mine = guessWhoResults(results)
    .filter((g) => g.playerId === myPlayerId && g.data.mode === 'classic')
    .sort((a, b) => b.playedAt - a.playedAt);
  const latest = mine[0];
  return latest && latest.data.mode === 'classic' ? latest.data.answers : [];
}
