// Aggregation helpers for Hot or Not results, used by player profiles and the
// dinner-reveal comparison screen.

import type { GameResult, HotOrNotChoice } from '../../types';

export interface HotOrNotPlayerStats {
  gamesPlayed: number;
  totalSwipes: number;
  totalHot: number;
  hotRate: number; // 0..1
  /** Names this player marked HOT across all their games (most recent first). */
  hotPicks: string[];
  notPicks: string[];
}

export function hotOrNotStats(results: GameResult[]): HotOrNotPlayerStats {
  const games = results.filter((r) => r.gameId === 'hot-or-not');
  const choices: HotOrNotChoice[] = games.flatMap((g) => g.data.choices);

  const totalHot = choices.filter((c) => c.hot).length;
  const hotPicks = dedupeNames(choices.filter((c) => c.hot).map((c) => c.candidateName));
  const notPicks = dedupeNames(choices.filter((c) => !c.hot).map((c) => c.candidateName));

  return {
    gamesPlayed: games.length,
    totalSwipes: choices.length,
    totalHot,
    hotRate: choices.length ? totalHot / choices.length : 0,
    hotPicks,
    notPicks,
  };
}

function dedupeNames(names: string[]): string[] {
  return Array.from(new Set(names));
}

/** A row in the reveal grid: one comedian, plus how each player voted. */
export interface RevealRow {
  candidateName: string;
  votes: { playerId: string; hot: boolean }[];
  hotCount: number;
  notCount: number;
}

/**
 * Build the dinner-reveal table: every comedian anyone swiped on, with each
 * player's most recent vote on that comedian.
 */
export function buildReveal(results: GameResult[]): RevealRow[] {
  const games = results
    .filter((r) => r.gameId === 'hot-or-not')
    .sort((a, b) => a.playedAt - b.playedAt); // older first so newer overwrites

  // candidateName -> playerId -> hot
  const grid = new Map<string, Map<string, boolean>>();
  for (const g of games) {
    for (const c of g.data.choices) {
      if (!grid.has(c.candidateName)) grid.set(c.candidateName, new Map());
      grid.get(c.candidateName)!.set(g.playerId, c.hot);
    }
  }

  const rows: RevealRow[] = [];
  for (const [candidateName, perPlayer] of grid) {
    const votes = Array.from(perPlayer, ([playerId, hot]) => ({ playerId, hot }));
    rows.push({
      candidateName,
      votes,
      hotCount: votes.filter((v) => v.hot).length,
      notCount: votes.filter((v) => !v.hot).length,
    });
  }

  // Most-agreed-hot first, then most votes.
  rows.sort((a, b) => b.hotCount - a.hotCount || b.votes.length - a.votes.length);
  return rows;
}
