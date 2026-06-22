// Tiny typed localStorage helper with a single namespaced root object,
// plus a pub/sub so React screens re-render when data changes.

import type { GameResult, Player } from '../types';

const KEY = 'cabo-claude:v1';

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

function write(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getPlayers(): Player[] {
  return read().players.sort((a, b) => a.createdAt - b.createdAt);
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
  return read().results;
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
