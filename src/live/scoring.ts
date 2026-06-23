// Pure scoring + leaderboard helpers for live play. Kept side-effect free so
// they're trivial to reason about and reuse across the lobby/reveal/final views.

import type { SessionAnswer } from './types';

const MAX_POINTS = 1000;
const BASE_POINTS = 600; // a correct-but-slow answer still banks this much

/**
 * Speed-scaled points for a single answer. A correct answer earns BASE_POINTS
 * plus a speed bonus up to MAX_POINTS as the remaining time approaches full.
 * Wrong / timed-out answers earn nothing.
 */
export function pointsFor(correct: boolean, elapsedMs: number, limitMs: number): number {
  if (!correct) return 0;
  const frac = limitMs > 0 ? Math.max(0, Math.min(1, 1 - elapsedMs / limitMs)) : 0;
  return Math.round(BASE_POINTS + (MAX_POINTS - BASE_POINTS) * frac);
}

export interface LiveStanding {
  playerId: string;
  points: number;
  correct: number;
  answered: number;
}

/** Aggregate answers into a leaderboard, sorted by points then accuracy. */
export function liveLeaderboard(answers: SessionAnswer[]): LiveStanding[] {
  const byPlayer = new Map<string, LiveStanding>();
  for (const a of answers) {
    const s =
      byPlayer.get(a.playerId) ?? { playerId: a.playerId, points: 0, correct: 0, answered: 0 };
    s.points += a.points;
    s.answered += 1;
    if (a.correct) s.correct += 1;
    byPlayer.set(a.playerId, s);
  }
  return [...byPlayer.values()].sort((a, b) => b.points - a.points || b.correct - a.correct);
}
