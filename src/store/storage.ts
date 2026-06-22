// Data layer for Claude Cabo.
//
// Two modes, chosen automatically:
//   • Cloud mode  (Supabase keys present): players/results live in a shared,
//     private GROUP in Postgres. A device joins a group with a code + password;
//     Row-Level Security keeps each group's data to its members. Reads are
//     served from an in-memory cache that's hydrated once and kept live via
//     Realtime, so the screens can keep calling these getters synchronously.
//   • Local mode  (no keys): the original single-device localStorage store.
//
// The exported CRUD API is identical in both modes, so screens don't care which
// one is active.

import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GameResult, Player } from '../types';
import { ensureAnonSession, supabase, supabaseConfigured } from '../lib/supabase';

const LOCAL_KEY = 'claude-cabo:v1'; // local-mode DB
const GROUP_KEY = 'claude-cabo:group'; // remembered group (cloud mode)
const ME_PREFIX = 'claude-cabo:me:'; // this device's player, per group

interface DB {
  players: Player[];
  results: GameResult[];
}
const empty: DB = { players: [], results: [] };

export interface GroupInfo {
  id: string;
  code: string;
  name: string;
}

const cloud = supabaseConfigured;

// ---------------------------------------------------------------- state ---
let cache: DB = { ...empty };
let group: GroupInfo | null = null;
let myPlayerId: string | null = null; // which player is "me" on this device
let ready = !cloud; // local mode is ready immediately; cloud waits for init
let channel: RealtimeChannel | null = null;

const listeners = new Set<() => void>();

// Cached snapshots so useSyncExternalStore gets stable references between
// renders (recomputed only after notify()).
let playersSnapshot: Player[] | null = null;
let resultsSnapshot: GameResult[] | null = null;

function notify() {
  playersSnapshot = null;
  resultsSnapshot = null;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ----------------------------------------------------------- selectors ---
export function getPlayers(): Player[] {
  if (playersSnapshot === null) {
    playersSnapshot = [...cache.players].sort((a, b) => a.createdAt - b.createdAt);
  }
  return playersSnapshot;
}

export function getResults(): GameResult[] {
  if (resultsSnapshot === null) resultsSnapshot = [...cache.results];
  return resultsSnapshot;
}

export function getPlayer(id: string): Player | undefined {
  return cache.players.find((p) => p.id === id);
}

export function getResultsForPlayer(playerId: string): GameResult[] {
  return cache.results
    .filter((r) => r.playerId === playerId)
    .sort((a, b) => b.playedAt - a.playedAt);
}

export function getGroup(): GroupInfo | null {
  return group;
}

export function getMyPlayerId(): string | null {
  return myPlayerId;
}

/** Mark a player as "me" on this device for the current group. */
export function setMyPlayer(id: string) {
  myPlayerId = id;
  if (group) localStorage.setItem(ME_PREFIX + group.id, id);
  notify();
}

export function isReady(): boolean {
  return ready;
}

export function isCloud(): boolean {
  return cloud;
}

// --------------------------------------------------------------- writes ---
// Each write updates the cache optimistically (instant UI) and persists to the
// backing store. In cloud mode Realtime will reconcile across devices.

export function addPlayer(player: Player) {
  cache = { ...cache, players: [...cache.players, player] };
  notify();
  if (cloud && group) {
    void supabase!
      .from('players')
      .insert({
        id: player.id,
        group_id: group.id,
        name: player.name,
        gender: player.gender,
        color: player.color,
        photo: player.photo ?? null,
        created_at: new Date(player.createdAt).toISOString(),
      })
      .then(logError);
  } else {
    saveLocal();
  }
}

export function updatePlayer(id: string, patch: Partial<Player>) {
  cache = {
    ...cache,
    players: cache.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
  notify();
  if (cloud && group) {
    const dbPatch: Record<string, unknown> = {};
    if ('name' in patch) dbPatch.name = patch.name;
    if ('gender' in patch) dbPatch.gender = patch.gender;
    if ('color' in patch) dbPatch.color = patch.color;
    if ('photo' in patch) dbPatch.photo = patch.photo ?? null;
    void supabase!.from('players').update(dbPatch).eq('id', id).then(logError);
  } else {
    saveLocal();
  }
}

export function deletePlayer(id: string) {
  cache = {
    players: cache.players.filter((p) => p.id !== id),
    results: cache.results.filter((r) => r.playerId !== id),
  };
  notify();
  if (cloud && group) {
    // results cascade via the players FK
    void supabase!.from('players').delete().eq('id', id).then(logError);
  } else {
    saveLocal();
  }
}

export function addResult(result: GameResult) {
  cache = { ...cache, results: [...cache.results, result] };
  notify();
  if (cloud && group) {
    void supabase!
      .from('results')
      .insert({
        id: result.id,
        group_id: group.id,
        game_id: result.gameId,
        player_id: result.playerId,
        played_at: new Date(result.playedAt).toISOString(),
        data: result.data,
      })
      .then(logError);
  } else {
    saveLocal();
  }
}

export function resetAll() {
  cache = { ...empty };
  notify();
  if (!cloud) saveLocal();
}

// ------------------------------------------------------- group session ---
export async function createGroup(name: string, password: string): Promise<GroupInfo> {
  if (!supabase) throw new Error('Cloud play is not configured.');
  await ensureAnonSession();
  const { data, error } = await supabase.rpc('create_group', {
    p_name: name,
    p_password: password,
  });
  if (error) throw new Error(error.message);
  const g = rowToGroup(data);
  await enterGroup(g);
  return g;
}

export async function joinGroup(code: string, password: string): Promise<GroupInfo> {
  if (!supabase) throw new Error('Cloud play is not configured.');
  await ensureAnonSession();
  const { data, error } = await supabase.rpc('join_group', {
    p_code: code,
    p_password: password,
  });
  if (error) throw new Error(error.message);
  const g = rowToGroup(data);
  await enterGroup(g);
  return g;
}

/** Forget the group on this device (membership in the DB is kept). */
export function leaveGroup() {
  localStorage.removeItem(GROUP_KEY);
  channel?.unsubscribe();
  channel = null;
  group = null;
  myPlayerId = null;
  cache = { ...empty };
  notify();
}

/** Called once at startup to restore local data or a remembered group. */
export async function initStore(): Promise<void> {
  if (!cloud) {
    loadLocal();
    ready = true;
    notify();
    return;
  }
  try {
    await ensureAnonSession();
    const saved = localStorage.getItem(GROUP_KEY);
    if (saved) await enterGroup(JSON.parse(saved) as GroupInfo);
  } catch (e) {
    logError({ error: e });
  } finally {
    ready = true;
    notify();
  }
}

async function enterGroup(g: GroupInfo) {
  group = g;
  myPlayerId = localStorage.getItem(ME_PREFIX + g.id);
  localStorage.setItem(GROUP_KEY, JSON.stringify(g));
  await hydrate();
  subscribeRealtime();
  ready = true;
  notify();
}

async function hydrate() {
  if (!supabase || !group) return;
  const [players, results] = await Promise.all([
    supabase.from('players').select('*').eq('group_id', group.id),
    supabase.from('results').select('*').eq('group_id', group.id),
  ]);
  if (players.error) logError(players);
  if (results.error) logError(results);
  cache = {
    players: (players.data ?? []).map(rowToPlayer),
    results: (results.data ?? []).map(rowToResult),
  };
  notify();
}

function subscribeRealtime() {
  if (!supabase || !group) return;
  channel?.unsubscribe();
  const gid = group.id;
  // Small dataset → just re-hydrate on any change for simplicity/correctness.
  channel = supabase
    .channel(`group-${gid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `group_id=eq.${gid}` },
      () => void hydrate(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'results', filter: `group_id=eq.${gid}` },
      () => void hydrate(),
    )
    .subscribe();
}

// ------------------------------------------------------------- mappers ---
function rowToGroup(data: unknown): GroupInfo {
  const r = (Array.isArray(data) ? data[0] : data) as {
    id: string;
    code: string;
    name: string;
  };
  return { id: r.id, code: r.code, name: r.name };
}

function rowToPlayer(r: any): Player {
  return {
    id: r.id,
    name: r.name,
    gender: r.gender,
    color: r.color,
    photo: r.photo ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

function rowToResult(r: any): GameResult {
  return {
    id: r.id,
    gameId: r.game_id,
    playerId: r.player_id,
    playedAt: new Date(r.played_at).getTime(),
    data: r.data,
  } as GameResult;
}

// --------------------------------------------------------- local mode ---
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<DB>) : {};
    cache = { players: parsed.players ?? [], results: parsed.results ?? [] };
  } catch {
    cache = { ...empty };
  }
}

function saveLocal() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(cache));
}

function logError(res: { error: unknown }) {
  if (res.error) {
    const msg = res.error instanceof Error ? res.error.message : String(res.error);
    console.error('[cabo] store error:', msg);
  }
}
