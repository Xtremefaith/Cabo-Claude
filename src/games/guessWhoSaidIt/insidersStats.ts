// Aggregates Insiders (variant A) data. Quotes and guesses both live in the
// shared `results` stream as 'guess-who-said-it' rows, tagged by `mode`:
//   • 'insiders-quote' — a quote the group authored (result id = quote id,
//     playerId = who added it, data.saidByPlayerId = who actually said it).
//   • 'insiders-guess' — a player's batch of guesses about who said which quote.

import type { GameResult } from '../../types';

type GuessWhoResult = Extract<GameResult, { gameId: 'guess-who-said-it' }>;

function guessWhoResults(results: GameResult[]): GuessWhoResult[] {
  return results.filter((r): r is GuessWhoResult => r.gameId === 'guess-who-said-it');
}

export interface InsiderQuote {
  id: string;
  authorId: string;
  saidById: string;
  text: string;
  createdAt: number;
}

/** Every authored quote, oldest first. */
export function insiderQuotes(results: GameResult[]): InsiderQuote[] {
  const out: InsiderQuote[] = [];
  for (const r of guessWhoResults(results)) {
    if (r.data.mode !== 'insiders-quote') continue;
    out.push({
      id: r.id,
      authorId: r.playerId,
      saidById: r.data.saidByPlayerId,
      text: r.data.text,
      createdAt: r.playedAt,
    });
  }
  return out.sort((a, b) => a.createdAt - b.createdAt);
}

/** This guesser's latest guess per quote: quoteId -> guessedPlayerId. */
export function myInsiderGuesses(results: GameResult[], myPlayerId: string): Map<string, string> {
  const mine = guessWhoResults(results)
    .filter((r) => r.playerId === myPlayerId)
    .sort((a, b) => a.playedAt - b.playedAt); // older first so newer overwrites
  const map = new Map<string, string>();
  for (const r of mine) {
    if (r.data.mode !== 'insiders-guess') continue;
    for (const g of r.data.guesses) map.set(g.quoteId, g.guessPlayerId);
  }
  return map;
}

export interface InsiderStanding {
  playerId: string;
  correct: number;
  total: number;
  accuracy: number;
}

/**
 * Leaderboard of the best guessers. Each (guesser, quote) pair counts once
 * (latest guess wins), correctness recomputed against the quote's true answer
 * so it stays accurate even if a guess predates a re-read.
 */
export function buildInsiderLeaderboard(results: GameResult[]): InsiderStanding[] {
  const truth = new Map(insiderQuotes(results).map((q) => [q.id, q.saidById]));

  // guesser -> quoteId -> guessedPlayerId (latest wins)
  const byGuesser = new Map<string, Map<string, string>>();
  const games = guessWhoResults(results).sort((a, b) => a.playedAt - b.playedAt);
  for (const r of games) {
    if (r.data.mode !== 'insiders-guess') continue;
    const m = byGuesser.get(r.playerId) ?? new Map<string, string>();
    for (const g of r.data.guesses) m.set(g.quoteId, g.guessPlayerId);
    byGuesser.set(r.playerId, m);
  }

  const rows: InsiderStanding[] = [];
  for (const [playerId, picks] of byGuesser) {
    let correct = 0;
    let total = 0;
    for (const [quoteId, guessId] of picks) {
      if (!truth.has(quoteId)) continue; // quote was removed
      total += 1;
      if (truth.get(quoteId) === guessId) correct += 1;
    }
    if (total > 0) {
      rows.push({ playerId, correct, total, accuracy: Math.round((correct / total) * 100) });
    }
  }
  rows.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy || b.total - a.total);
  return rows;
}

export interface InsiderReveal {
  quote: InsiderQuote;
  /** Each guesser's latest pick for this quote. */
  ballots: { guesserId: string; guessId: string; correct: boolean }[];
  correctCount: number;
  totalGuesses: number;
}

/** Per-quote reveal: who said it and how everyone guessed. Hardest first. */
export function buildInsiderReveal(results: GameResult[]): InsiderReveal[] {
  const quotes = insiderQuotes(results);

  // quoteId -> guesserId -> guessedPlayerId (latest wins)
  const byQuote = new Map<string, Map<string, string>>();
  const games = guessWhoResults(results).sort((a, b) => a.playedAt - b.playedAt);
  for (const r of games) {
    if (r.data.mode !== 'insiders-guess') continue;
    for (const g of r.data.guesses) {
      const m = byQuote.get(g.quoteId) ?? new Map<string, string>();
      m.set(r.playerId, g.guessPlayerId);
      byQuote.set(g.quoteId, m);
    }
  }

  const reveals = quotes.map((quote) => {
    const picks = byQuote.get(quote.id) ?? new Map<string, string>();
    const ballots = [...picks.entries()].map(([guesserId, guessId]) => ({
      guesserId,
      guessId,
      correct: guessId === quote.saidById,
    }));
    return {
      quote,
      ballots,
      correctCount: ballots.filter((b) => b.correct).length,
      totalGuesses: ballots.length,
    };
  });

  // Hardest to guess first (lowest correct rate among those with guesses),
  // then newest, so freshly added quotes surface near the top too.
  reveals.sort((a, b) => {
    const ra = a.totalGuesses ? a.correctCount / a.totalGuesses : 1;
    const rb = b.totalGuesses ? b.correctCount / b.totalGuesses : 1;
    return ra - rb || b.quote.createdAt - a.quote.createdAt;
  });
  return reveals;
}
