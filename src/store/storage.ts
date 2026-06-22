// Tiny typed localStorage helper with a single namespaced root object,
// plus a pub/sub so React screens re-render when data changes.

import type { GameResult, Player } from '../types';

const KEY = 'claude-cabo:v1';

interface DB {
  players: Player[];
  results: GameResult[];
}

const empty: DB = { players: [], results: [] };

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      players: parsed.players ?? [],
      results: parsed.results ?? [],
    };
  } catch {
    return { ...empty };
  }
}

const listeners = new Set<() => void>();

// Cached snapshots for useSyncExternalStore. Its getSnapshot must return a
// STABLE reference between calls or React loops forever ("Maximum update depth
// exceeded") — and read() JSON-parses a fresh array every call. So we compute
// the snapshot once and reuse it until the next write() invalidates the cache.
let playersSnapshot: Player[] | null = null;
let resultsSnapshot: GameResult[] | null = null;

function write(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  playersSnapshot = null;
  resultsSnapshot = null;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getPlayers(): Player[] {
  if (playersSnapshot === null) {
    playersSnapshot = read().players.sort((a, b) => a.createdAt - b.createdAt);
  }
  return playersSnapshot;
}

export function getPlayer(id: string): Player | undefined {
  return read().players.find((p) => p.id === id);
}

export function addPlayer(player: Player) {
  const db = read();
  db.players.push(player);
  write(db);
}

export function updatePlayer(id: string, patch: Partial<Player>) {
  const db = read();
  db.players = db.players.map((p) => (p.id === id ? { ...p, ...patch } : p));
  write(db);
}

export function deletePlayer(id: string) {
  const db = read();
  db.players = db.players.filter((p) => p.id !== id);
  db.results = db.results.filter((r) => r.playerId !== id);
  write(db);
}

export function getResults(): GameResult[] {
  if (resultsSnapshot === null) {
    resultsSnapshot = read().results;
  }
  return resultsSnapshot;
}

export function getResultsForPlayer(playerId: string): GameResult[] {
  return read()
    .results.filter((r) => r.playerId === playerId)
    .sort((a, b) => b.playedAt - a.playedAt);
}

export function addResult(result: GameResult) {
  const db = read();
  db.results.push(result);
  write(db);
}

export function resetAll() {
  write({ ...empty, players: [], results: [] });
}
