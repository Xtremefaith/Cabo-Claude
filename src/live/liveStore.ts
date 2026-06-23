// Live-session data layer — a focused companion to store/storage.ts.
//
// It is kept SEPARATE from the main store on purpose: the main store re-hydrates
// players+results on any change, which is far too heavy for per-answer live
// traffic. Here we track exactly one room (the latest session for the current
// group + game) and its roster/answers, kept live over a dedicated Realtime
// channel. Reads are synchronous (useSyncExternalStore-friendly); writes update
// the backend and Realtime reconciles every device.
//
// Cloud-only: with no Supabase keys there is no cross-device state, so the live
// screens show a "needs the cloud" fallback instead of calling in here.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getGroup, getMyPlayerId } from '../store/storage';
import { uid } from '../lib/util';
import { pointsFor } from './scoring';
import type {
  LiveDeckCard,
  LivePhase,
  LiveSession,
  SessionAnswer,
  SessionConfig,
  SessionPlayer,
} from './types';

// ---------------------------------------------------------------- state ---
let session: LiveSession | null = null;
let roster: SessionPlayer[] = [];
let answers: SessionAnswer[] = [];
let channel: RealtimeChannel | null = null;
let activeGameId: string | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeLive(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ------------------------------------------------------------ selectors ---
// Each returns a reference that only changes on hydrate(), so they're stable
// between renders for useSyncExternalStore.
export function getLiveSession(): LiveSession | null {
  return session;
}
export function getRoster(): SessionPlayer[] {
  return roster;
}
export function getAnswers(): SessionAnswer[] {
  return answers;
}

// ----------------------------------------------------------- lifecycle ---
/** Connect to the live room for a game in the current group. Safe to re-call. */
export async function connectLive(gameId: string): Promise<void> {
  if (!supabase) return; // local mode: no cross-device sessions
  const group = getGroup();
  if (!group) return;
  activeGameId = gameId;
  await hydrateLive();
  subscribeRealtime(group.id);
}

/** Tear down the subscription and clear local state (on screen unmount). */
export function disconnectLive(): void {
  channel?.unsubscribe();
  channel = null;
  session = null;
  roster = [];
  answers = [];
  activeGameId = null;
  notify();
}

async function hydrateLive(): Promise<void> {
  if (!supabase) return;
  const group = getGroup();
  if (!group || !activeGameId) return;

  // The latest room for this group+game, regardless of phase, so a finished
  // game keeps showing its podium until someone starts a new one.
  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('group_id', group.id)
    .eq('game_id', activeGameId)
    .order('created_at', { ascending: false })
    .limit(1);

  const row = sessions?.[0];
  if (!row) {
    session = null;
    roster = [];
    answers = [];
    notify();
    return;
  }

  session = rowToSession(row);
  const [{ data: rp }, { data: ra }] = await Promise.all([
    supabase.from('session_players').select('*').eq('session_id', row.id),
    supabase.from('session_answers').select('*').eq('session_id', row.id),
  ]);
  roster = (rp ?? []).map(rowToSessionPlayer);
  answers = (ra ?? []).map(rowToSessionAnswer);
  notify();
}

function subscribeRealtime(gid: string) {
  if (!supabase) return;
  channel?.unsubscribe();
  // Small dataset → re-hydrate the whole room on any change (simple + correct).
  // RLS limits child-table events to sessions in the caller's groups.
  channel = supabase
    .channel(`live-${gid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'game_sessions', filter: `group_id=eq.${gid}` },
      () => void hydrateLive(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'session_players' },
      () => void hydrateLive(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'session_answers' },
      () => void hydrateLive(),
    )
    .subscribe();
}

// --------------------------------------------------------------- writes ---
/** Host: create a fresh room (lobby) and, if playing, join it. */
export async function hostCreateSession(
  deck: LiveDeckCard[],
  config: SessionConfig,
  hostPlays: boolean,
): Promise<void> {
  if (!supabase) return;
  const group = getGroup();
  const me = getMyPlayerId();
  if (!group || !activeGameId) return;

  const id = uid();
  const { error } = await supabase.from('game_sessions').insert({
    id,
    group_id: group.id,
    game_id: activeGameId,
    host_player_id: me,
    host_plays: hostPlays,
    phase: 'lobby',
    current_index: -1,
    deck,
    config,
  });
  if (error) return logError(error);

  if (hostPlays && me) {
    await supabase
      .from('session_players')
      .upsert({ session_id: id, player_id: me }, { onConflict: 'session_id,player_id', ignoreDuplicates: true });
  }
  await hydrateLive();
}

/** Add me to the current room's roster (idempotent). */
export async function joinSession(): Promise<void> {
  if (!supabase || !session) return;
  const me = getMyPlayerId();
  if (!me) return;
  await supabase
    .from('session_players')
    .upsert(
      { session_id: session.id, player_id: me },
      { onConflict: 'session_id,player_id', ignoreDuplicates: true },
    );
  await hydrateLive();
}

/** Host: open a question (sets the live index + start time for the timer). */
export async function startQuestion(index: number): Promise<void> {
  await patchSession({
    phase: 'question',
    current_index: index,
    question_started_at: new Date().toISOString(),
  });
}

export async function revealQuestion(): Promise<void> {
  await patchSession({ phase: 'reveal' });
}

export async function nextQuestion(): Promise<void> {
  if (!session) return;
  await startQuestion(session.currentIndex + 1);
}

export async function finishSession(): Promise<void> {
  await patchSession({ phase: 'final' });
}

/** Any member can claim the host role (escape hatch if the host drops). */
export async function becomeHost(): Promise<void> {
  const me = getMyPlayerId();
  if (!me) return;
  await patchSession({ host_player_id: me });
}

/** Submit my answer to the current question. First answer wins (locked client-side too). */
export async function submitAnswer(answer: string): Promise<void> {
  if (!supabase || !session || session.questionStartedAt === null) return;
  const me = getMyPlayerId();
  if (!me) return;
  const idx = session.currentIndex;
  const card = session.deck[idx];
  if (!card) return;

  const correct = answer === card.answer;
  const elapsed = Date.now() - session.questionStartedAt;
  const limit = (session.config.questionSeconds ?? 20) * 1000;
  const points = pointsFor(correct, elapsed, limit);

  const { error } = await supabase.from('session_answers').upsert(
    {
      id: uid(),
      session_id: session.id,
      question_index: idx,
      player_id: me,
      answer,
      correct,
      points,
      answered_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,question_index,player_id', ignoreDuplicates: true },
  );
  if (error) return logError(error);
  await hydrateLive();
}

async function patchSession(patch: Record<string, unknown>): Promise<void> {
  if (!supabase || !session) return;
  const { error } = await supabase.from('game_sessions').update(patch).eq('id', session.id);
  if (error) return logError(error);
  await hydrateLive();
}

// --------------------------------------------------------------- mappers ---
function rowToSession(r: any): LiveSession {
  return {
    id: r.id,
    groupId: r.group_id,
    gameId: r.game_id,
    hostPlayerId: r.host_player_id ?? null,
    hostPlays: r.host_plays,
    phase: r.phase as LivePhase,
    currentIndex: r.current_index,
    deck: (r.deck ?? []) as LiveDeckCard[],
    questionStartedAt: r.question_started_at ? new Date(r.question_started_at).getTime() : null,
    config: (r.config ?? {}) as SessionConfig,
  };
}

function rowToSessionPlayer(r: any): SessionPlayer {
  return { playerId: r.player_id, joinedAt: new Date(r.joined_at).getTime() };
}

function rowToSessionAnswer(r: any): SessionAnswer {
  return {
    id: r.id,
    questionIndex: r.question_index,
    playerId: r.player_id,
    answer: r.answer,
    correct: r.correct ?? null,
    points: r.points ?? 0,
    answeredAt: new Date(r.answered_at).getTime(),
  };
}

function logError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[cabo:live] store error:', msg);
}
