// Live (synchronous) Mind Meld — the collaborative "say the same thing" game.
// Same room/phase machine as the other live games (lobby → question → reveal →
// final), but it's a COOPERATIVE game with a single banked group score: each
// round the crew types a short answer to a prompt, and the more of you land on
// the same answer, the more the group banks together. There is no per-player
// score and no leaderboard — you win (or flop) as one crew.
//
// Scoring (see `meldOf`): each round, points = how much of the crew matched
// someone (matched players / total, ×100), with a 150-point jackpot for a TOTAL
// MELD where everyone said the same thing. Banked across the whole deck, then
// the final screen rates the crew's telepathy.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, getResults, isCloud } from '../store/storage';
import { MIND_MELD_PROMPTS } from '../data/mindMeldPrompts';
import { DEFAULT_SPICE } from '../data/spice';
import { pickFreshFirst, uid } from '../lib/util';
import type { MindMeldAnswer } from '../types';
import { useLiveSession, useSessionAnswers, useSessionRoster } from './useLiveSession';
import {
  becomeHost,
  connectLive,
  disconnectLive,
  finishSession,
  hostCreateSession,
  joinSession,
  nextQuestion,
  revealQuestion,
  startQuestion,
  submitAnswer,
} from './liveStore';
import { LiveFallback, LiveHeader, useNow } from './ui';
import type { LiveSession, MindMeldCard, SessionAnswer } from './types';

const GAME_ID = 'mind-meld';
const DECK_SIZE = 8;
const QUESTION_SECONDS = 30; // typing takes longer than a tap
const NO_SCORE = { correct: null, points: 0 } as const;
const JACKPOT = 150;

/** Prompt ids the whole group has already played (across every saved round). */
function seenMindMeldIds(): Set<string> {
  const seen = new Set<string>();
  for (const r of getResults()) {
    if (r.gameId === 'mind-meld') for (const a of r.data.answers) seen.add(a.promptId);
  }
  return seen;
}

/** Build a fresh deck at/under the group's spice, preferring unplayed prompts. */
function buildMindMeldDeck(maxSpice: number): MindMeldCard[] {
  const seen = seenMindMeldIds();
  const pool = MIND_MELD_PROMPTS.filter((p) => p.spice <= maxSpice);
  return pickFreshFirst(pool, DECK_SIZE, (p) => seen.has(p.id)).map((p) => ({
    promptId: p.id,
    text: p.text,
  }));
}

// --------------------------------------------------------------- scoring ---
/**
 * Normalize an answer into a match key. Beyond case/punctuation/whitespace we
 * also fold *formatting* differences that aren't really different answers:
 * spacing (`ice cream` = `icecream`) and regular plurals (`dog` = `dogs`). We
 * deliberately stop there — no typo/edit-distance or fuzzy matching, because over
 * short answers that merges genuinely different words (`cat`/`car`). Saying the
 * same thing, spelled the same way, is the actual skill of the game.
 */
function normalize(s: string): string {
  let key = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, '') // drop punctuation/emoji
    .replace(/\s+/g, ''); // fold spacing: "ice cream" → "icecream"
  // Regular-plural fold: trailing single "s" on a long-enough word ("dogs" →
  // "dog"), but not "ss" words ("boss") or short ones ("bus").
  if (key.length > 3 && key.endsWith('s') && !key.endsWith('ss')) key = key.slice(0, -1);
  return key;
}

interface Cluster {
  key: string;
  /** A representative raw answer (first one submitted) for display. */
  label: string;
  /** Player ids that gave this (normalized) answer. */
  members: string[];
}

/** Group a round's answers into clusters of identical (normalized) answers. */
function clusterAnswers(ans: SessionAnswer[]): Cluster[] {
  const map = new Map<string, Cluster>();
  for (const a of ans) {
    const key = normalize(a.answer);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.members.push(a.playerId);
    else map.set(key, { key, label: a.answer.trim(), members: [a.playerId] });
  }
  return [...map.values()].sort((x, y) => y.members.length - x.members.length);
}

interface Meld {
  clusters: Cluster[];
  total: number;
  /** Players who matched at least one other (in a cluster of size ≥ 2). */
  matched: number;
  /** Size of the biggest cluster. */
  top: number;
  /** Everyone gave the same answer. */
  unanimous: boolean;
  /** matched / total, 0–1. */
  fraction: number;
  /** Points the crew banks for this round. */
  points: number;
}

/** Collaborative score for one round — see file header. */
function meldOf(ans: SessionAnswer[]): Meld {
  const clusters = clusterAnswers(ans);
  const total = clusters.reduce((n, c) => n + c.members.length, 0);
  const matched = clusters
    .filter((c) => c.members.length >= 2)
    .reduce((n, c) => n + c.members.length, 0);
  const top = clusters[0]?.members.length ?? 0;
  const unanimous = total >= 2 && clusters.length === 1;
  const fraction = total ? matched / total : 0;
  const points = unanimous ? JACKPOT : Math.round(100 * fraction);
  return { clusters, total, matched, top, unanimous, fraction, points };
}

export function LiveMindMeldScreen() {
  const navigate = useNavigate();
  const session = useLiveSession();
  const roster = useSessionRoster();
  const answers = useSessionAnswers();
  const myPlayerId = useMyPlayerId();
  const me = getPlayer(myPlayerId ?? '');

  useEffect(() => {
    void connectLive(GAME_ID);
    return () => disconnectLive();
  }, []);

  if (!isCloud()) {
    return (
      <LiveFallback
        title="Live play needs the cloud"
        body="Mind Meld is a play-together game. Connect the group to Supabase to host a room from one phone and see how synced the crew really is."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <LiveFallback
        title="Set up your player first"
        body="Mind Meld is a group game — join your crew and create your player to play."
        onHome={() => navigate('/')}
      />
    );
  }

  const isHost = !!session && session.hostPlayerId === me.id;
  const quit = () => navigate('/');

  if (!session) return <StartView onStart={quit} />;

  switch (session.phase) {
    case 'lobby':
      return <LobbyView session={session} isHost={isHost} myId={me.id} onQuit={quit} />;
    case 'question':
      return (
        <QuestionView
          session={session}
          answers={answers}
          rosterCount={roster.length}
          isHost={isHost}
          myId={me.id}
          onQuit={quit}
        />
      );
    case 'reveal':
      return <RevealView session={session} answers={answers} isHost={isHost} myId={me.id} onQuit={quit} />;
    case 'final':
      return <FinalView session={session} answers={answers} myId={me.id} isHost={isHost} onQuit={quit} />;
  }
}

// ----------------------------------------------------------------- start ---
function StartView({ onStart }: { onStart: () => void }) {
  const group = useGroup();
  const [hostPlays, setHostPlays] = useState(true);

  const start = async () => {
    const deck = buildMindMeldDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(deck, { questionSeconds: QUESTION_SECONDS, deckSize: deck.length }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">🧠</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Mind Meld — Live</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            One prompt, everyone types an answer at once. You bank points for every
            crew member you match — say the same thing and win together.
          </p>
        </div>

        <button
          onClick={() => setHostPlays((v) => !v)}
          className="glass flex w-full max-w-xs items-center justify-between rounded-2xl px-4 py-3 text-left active:scale-[0.99]"
        >
          <span className="font-display text-sm font-extrabold">Are you playing too?</span>
          <span
            className={`font-display text-sm font-extrabold ${hostPlays ? 'text-emerald-300' : 'text-white/40'}`}
          >
            {hostPlays ? "Yes — I'm in" : 'No — just hosting'}
          </span>
        </button>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button onClick={start}>Start a live game ▶</Button>
          <Button variant="ghost" onClick={onStart}>
            Back to Cabo
          </Button>
        </div>
      </div>
    </Screen>
  );
}

// ----------------------------------------------------------------- lobby ---
function LobbyView({
  session,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const roster = useSessionRoster();
  const group = useGroup();
  const amIn = roster.some((r) => r.playerId === myId);
  const canStart = roster.length >= 2;

  useEffect(() => {
    if (!amIn && !(isHost && !session.hostPlays)) void joinSession();
  }, [amIn, isHost, session.hostPlays]);

  return (
    <Screen>
      <LiveHeader title="🧠 Lobby" onQuit={onQuit} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-5xl">🎉</div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Waiting for the crew</h1>
          {group && (
            <p className="mt-1 font-body text-sm text-white/50">
              Join code <span className="tracking-widest text-sun">{group.code}</span>
            </p>
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          {roster.length === 0 ? (
            <p className="glass rounded-2xl px-4 py-4 font-body text-white/55">No one's in yet…</p>
          ) : (
            roster.map((r) => <RosterRow key={r.playerId} playerId={r.playerId} myId={myId} />)
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3 pt-2">
          {isHost ? (
            <>
              <Button onClick={() => void startQuestion(0)} disabled={!canStart}>
                Start game ▶ ({roster.length} in)
              </Button>
              {!canStart && (
                <p className="font-body text-xs font-bold text-white/40">
                  Need at least 2 in the room to meld.
                </p>
              )}
            </>
          ) : (
            <p className="font-body text-sm font-bold text-white/50">Waiting for the host to start…</p>
          )}
          {!isHost && <HostHandoff />}
        </div>
      </div>
    </Screen>
  );
}

function RosterRow({ playerId, myId }: { playerId: string; myId: string }) {
  const p = getPlayer(playerId);
  if (!p) return null;
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
      <PlayerAvatar player={p} size={36} />
      <span className="font-display text-base font-extrabold">
        {p.name}
        {playerId === myId && <span className="ml-1 text-white/40">(you)</span>}
      </span>
    </div>
  );
}

// -------------------------------------------------------------- question ---
function QuestionView({
  session,
  answers,
  rosterCount,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  rosterCount: number;
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const now = useNow(session.phase === 'question');
  const idx = session.currentIndex;
  const card = (session.deck as MindMeldCard[])[idx];
  const [draft, setDraft] = useState('');

  const myAnswer = answers.find((a) => a.questionIndex === idx && a.playerId === myId);
  const answeredCount = useMemo(
    () => new Set(answers.filter((a) => a.questionIndex === idx).map((a) => a.playerId)).size,
    [answers, idx],
  );

  const limitMs = (session.config.questionSeconds ?? QUESTION_SECONDS) * 1000;
  const elapsed = session.questionStartedAt ? now - session.questionStartedAt : 0;
  const remaining = Math.max(0, Math.ceil((limitMs - elapsed) / 1000));
  const timeUp = elapsed >= limitMs;
  const everyoneIn = rosterCount > 0 && answeredCount >= rosterCount;

  const advancedRef = useRef(false);
  useEffect(() => {
    advancedRef.current = false;
    setDraft('');
  }, [idx]);
  useEffect(() => {
    if (isHost && (timeUp || everyoneIn) && !advancedRef.current) {
      advancedRef.current = true;
      void revealQuestion();
    }
  }, [isHost, timeUp, everyoneIn]);

  if (!card) return <LiveFallback title="…" body="Loading prompt." onHome={onQuit} />;

  const pct = Math.max(0, Math.min(100, (1 - elapsed / limitMs) * 100));
  const trimmed = draft.trim();
  const submit = () => {
    if (myAnswer || !trimmed) return;
    void submitAnswer(trimmed, NO_SCORE);
  };

  return (
    <Screen>
      <LiveHeader title={`🧠 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sun transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {remaining}s · {answeredCount} / {rosterCount} answered
      </p>

      <div className="flex flex-1 flex-col justify-center gap-6">
        <p className="text-center font-display text-3xl font-extrabold leading-tight">{card.text}</p>

        {myAnswer ? (
          <div className="rounded-3xl border-2 border-sun bg-sun/15 px-5 py-6 text-center">
            <p className="font-body text-xs font-extrabold uppercase tracking-widest text-sun">
              Locked in
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold leading-tight">{myAnswer.answer}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              maxLength={40}
              placeholder="Type your answer…"
              className="w-full rounded-2xl border-2 border-white/15 bg-white/5 px-5 py-4 text-center font-display text-xl font-extrabold text-white placeholder:text-white/30 focus:border-sun focus:outline-none"
            />
            <Button onClick={submit} disabled={!trimmed}>
              Lock it in 🔒
            </Button>
            <p className="text-center font-body text-xs font-bold text-white/40">
              Match the crew — keep it short.
            </p>
          </div>
        )}
      </div>

      {myAnswer && (
        <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
          Waiting for the crew…
        </p>
      )}
      {isHost && (
        <Button variant="ghost" className="mt-1" onClick={() => void revealQuestion()}>
          Reveal the meld now
        </Button>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- reveal ---
function RevealView({
  session,
  answers,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const idx = session.currentIndex;
  const card = (session.deck as MindMeldCard[])[idx];
  const isLast = idx + 1 >= session.deck.length;

  const meld = useMemo(() => meldOf(answers.filter((a) => a.questionIndex === idx)), [answers, idx]);
  // Running banked total through this round.
  const banked = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= idx; i++) sum += meldOf(answers.filter((a) => a.questionIndex === i)).points;
    return sum;
  }, [answers, idx]);

  if (!card) return <LiveFallback title="…" body="Loading." onHome={onQuit} />;

  return (
    <Screen>
      <LiveHeader title={`🧠 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <p className="pt-3 text-center font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
        {card.text}
      </p>

      <div
        className={`mt-3 rounded-3xl p-4 text-center ${
          meld.unanimous ? 'bg-emerald-400/20' : 'bg-sky-400/10'
        }`}
      >
        {meld.unanimous ? (
          <p className="font-display text-2xl font-extrabold text-emerald-300">🧠 TOTAL MELD!</p>
        ) : (
          <p className="font-display text-lg font-extrabold text-white/80">
            {meld.matched > 0 ? `${meld.matched} of ${meld.total} melded` : 'No two minds matched 😬'}
          </p>
        )}
        <p className="mt-1 font-display text-4xl font-extrabold text-sun">+{meld.points}</p>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
          banked: {banked}
        </p>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {meld.clusters.map((c) => (
          <ClusterRow key={c.key} cluster={c} mine={c.members.includes(myId)} />
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>See the recap 🏁</Button>
          ) : (
            <Button onClick={() => void nextQuestion()}>Next prompt →</Button>
          )
        ) : (
          <p className="text-center font-body text-sm font-bold text-white/50">Waiting for the host…</p>
        )}
        {!isHost && <HostHandoff />}
      </div>
    </Screen>
  );
}

function ClusterRow({ cluster, mine }: { cluster: Cluster; mine: boolean }) {
  const matched = cluster.members.length >= 2;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ${
        mine ? 'border-sun' : matched ? 'border-emerald-400/40' : 'border-white/10'
      } ${matched ? 'bg-white/[0.06]' : 'bg-white/[0.02]'}`}
    >
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-extrabold leading-tight">
          {cluster.label}
          {mine && <span className="ml-2 text-sm text-sun">(you)</span>}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {cluster.members.map((pid) => (
            <MemberDot key={pid} playerId={pid} />
          ))}
        </div>
      </div>
      <span
        className={`shrink-0 font-display text-2xl font-extrabold ${
          matched ? 'text-emerald-300' : 'text-white/35'
        }`}
      >
        ×{cluster.members.length}
      </span>
    </div>
  );
}

function MemberDot({ playerId }: { playerId: string }) {
  const p = getPlayer(playerId);
  if (!p) return null;
  return <PlayerAvatar player={p} size={22} />;
}

// ----------------------------------------------------------------- final ---
/** Rate the crew's overall telepathy from the average per-round meld fraction. */
function meldRating(avgFraction: number): { label: string; emoji: string } {
  if (avgFraction >= 0.9) return { label: 'One Mind', emoji: '🧠' };
  if (avgFraction >= 0.7) return { label: 'Telepathic', emoji: '🔮' };
  if (avgFraction >= 0.5) return { label: 'In Sync', emoji: '🤝' };
  if (avgFraction >= 0.3) return { label: 'Getting There', emoji: '🌱' };
  return { label: 'Total Strangers', emoji: '👽' };
}

function FinalView({
  session,
  answers,
  myId,
  isHost,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  myId: string;
  isHost: boolean;
  onQuit: () => void;
}) {
  const deck = session.deck as MindMeldCard[];
  const group = useGroup();

  const rows = useMemo(
    () =>
      deck.map((card, i) => ({
        card,
        meld: meldOf(answers.filter((ans) => ans.questionIndex === i)),
      })),
    [deck, answers],
  );
  const banked = rows.reduce((n, r) => n + r.meld.points, 0);
  const played = rows.filter((r) => r.meld.total > 0);
  const avgFraction = played.length
    ? played.reduce((n, r) => n + (r.meld.unanimous ? 1 : r.meld.fraction), 0) / played.length
    : 0;
  const rating = meldRating(avgFraction);
  const totalMelds = rows.filter((r) => r.meld.unanimous).length;

  // Persist my own answers to the all-time results store once, so profile
  // history / "rooms played" keep working. (Collaborative game → no score.)
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((ans) => ans.playerId === myId)
      .sort((x, y) => x.questionIndex - y.questionIndex);
    if (mine.length > 0) {
      const out: MindMeldAnswer[] = mine.map((ans) => ({
        promptId: deck[ans.questionIndex]?.promptId ?? '',
        promptText: deck[ans.questionIndex]?.text ?? '',
        text: ans.answer,
      }));
      addResult({
        id: uid(),
        gameId: 'mind-meld',
        playerId: myId,
        playedAt: Date.now(),
        data: { answers: out },
      });
    }
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId, deck]);

  const startNew = async () => {
    const fresh = buildMindMeldDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(fresh, session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-5 text-center">
        <div className="text-6xl">{rating.emoji}</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">{rating.label}</h1>
        <p className="font-body text-sm text-white/50">Mind Meld — Live</p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl px-2 py-4 text-center">
          <div className="font-display text-3xl font-extrabold text-sun">{banked}</div>
          <div className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
            Points banked
          </div>
        </div>
        <div className="glass rounded-2xl px-2 py-4 text-center">
          <div className="font-display text-3xl font-extrabold text-emerald-300">{totalMelds}</div>
          <div className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
            Total melds 🧠
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {rows.map(({ card, meld }) => (
          <div key={card.promptId} className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold leading-tight">
                {card.text}
              </span>
              <span
                className={`shrink-0 font-display text-sm font-extrabold ${
                  meld.unanimous ? 'text-emerald-300' : 'text-sun'
                }`}
              >
                +{meld.points}
              </span>
            </div>
            <p className="mt-1 font-body text-xs font-bold text-white/45">
              {meld.total === 0 ? (
                'no answers'
              ) : meld.clusters[0] ? (
                <>
                  top answer: <span className="text-white/70">{meld.clusters[0].label}</span> ×
                  {meld.clusters[0].members.length}
                </>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost && <Button onClick={startNew}>Play again ▶</Button>}
        <Button variant="ghost" onClick={onQuit}>
          Back to Cabo
        </Button>
      </div>
    </Screen>
  );
}

// --------------------------------------------------------------- shared ---
function HostHandoff() {
  return (
    <button
      onClick={() => void becomeHost()}
      className="font-body text-xs font-bold uppercase tracking-widest text-white/35 active:scale-95"
    >
      Host gone? Tap to take over
    </button>
  );
}
