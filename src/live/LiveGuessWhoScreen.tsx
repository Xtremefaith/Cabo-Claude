// Live (synchronous, Kahoot-style) Famous Lines. One screen, four phases:
// lobby -> question -> reveal -> final, driven by the shared session row.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, isCloud } from '../store/storage';
import { QUOTE_PROMPTS } from '../data/quotePrompts';
import { DEFAULT_SPICE } from '../data/spice';
import { sample, shuffle, uid } from '../lib/util';
import type { GuessWhoAnswer } from '../types';
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
import { liveLeaderboard } from './scoring';
import type { LiveDeckCard, LiveSession, SessionAnswer } from './types';

const GAME_ID = 'guess-who-said-it';
const DECK_SIZE = 8;
const QUESTION_SECONDS = 20;
const MEDALS = ['🥇', '🥈', '🥉'];

export function LiveGuessWhoScreen() {
  const navigate = useNavigate();
  const session = useLiveSession();
  const roster = useSessionRoster();
  const answers = useSessionAnswers();
  const myPlayerId = useMyPlayerId();
  const me = getPlayer(myPlayerId ?? '');

  // Connect to this group's live room on mount; tear down on leave.
  useEffect(() => {
    void connectLive(GAME_ID);
    return () => disconnectLive();
  }, []);

  if (!isCloud()) {
    return (
      <Fallback
        title="Live play needs the cloud"
        body="Famous Lines is now a live, play-together game. Connect the group to Supabase to host a room from one phone and play across the crew."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <Fallback
        title="Set up your player first"
        body="Live Famous Lines is a group game — join your crew and create your player to play."
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
      return (
        <RevealView
          session={session}
          answers={answers}
          isHost={isHost}
          myId={me.id}
          onQuit={quit}
        />
      );
    case 'final':
      return <FinalView session={session} answers={answers} isHost={isHost} myId={me.id} onQuit={quit} />;
  }
}

// ----------------------------------------------------------------- start ---
function StartView({ onStart }: { onStart: () => void }) {
  const group = useGroup();
  const [hostPlays, setHostPlays] = useState(true);

  const start = async () => {
    const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
    const pool = QUOTE_PROMPTS.filter((p) => p.spice <= maxSpice);
    const deck: LiveDeckCard[] = sample(pool, Math.min(DECK_SIZE, pool.length)).map((p) => ({
      promptId: p.id,
      quote: p.quote,
      answer: p.answer,
      hint: p.hint,
      options: shuffle([p.answer, ...p.decoys]),
    }));
    await hostCreateSession(deck, { questionSeconds: QUESTION_SECONDS, deckSize: deck.length }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">🎬</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Famous Lines — Live</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            Host a room from this phone. Everyone answers the same quote at the same time — fastest
            correct guess scores the most.
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

  // Anyone who opens the room to play auto-joins the roster.
  useEffect(() => {
    if (!amIn && !(isHost && !session.hostPlays)) void joinSession();
  }, [amIn, isHost, session.hostPlays]);

  return (
    <Screen>
      <Header title="🎬 Lobby" onQuit={onQuit} />
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
            <Button onClick={() => void startQuestion(0)} disabled={roster.length === 0}>
              Start game ▶ ({roster.length} in)
            </Button>
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
  const card = session.deck[idx];

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

  // Only the host advances, and only once per question.
  const advancedRef = useRef(false);
  useEffect(() => {
    advancedRef.current = false;
  }, [idx]);
  useEffect(() => {
    if (isHost && (timeUp || everyoneIn) && !advancedRef.current) {
      advancedRef.current = true;
      void revealQuestion();
    }
  }, [isHost, timeUp, everyoneIn]);

  if (!card) return <Fallback title="…" body="Loading question." onHome={onQuit} />;

  const pct = Math.max(0, Math.min(100, (1 - elapsed / limitMs) * 100));

  return (
    <Screen>
      <Header title={`💬 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      {/* Timer bar */}
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hot to-sun transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {remaining}s · {answeredCount} / {rosterCount} answered
      </p>

      <div className="py-5 text-center">
        <p className="font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
          Which movie?
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">“{card.quote}”</h1>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {card.options.map((opt) => {
          const isPick = myAnswer?.answer === opt;
          const cls = myAnswer
            ? isPick
              ? 'border-sun bg-sun/15 text-white'
              : 'border-white/10 bg-white/5 text-white/40'
            : 'border-white/10 bg-white/5 text-white';
          return (
            <button
              key={opt}
              onClick={() => !myAnswer && void submitAnswer(opt)}
              disabled={!!myAnswer}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-display text-lg font-extrabold transition active:scale-[0.98] ${cls}`}
            >
              <span>{opt}</span>
              {isPick && <span>🔒</span>}
            </button>
          );
        })}
      </div>

      <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        {myAnswer ? 'Locked in — waiting for the crew' : 'Tap your answer — fastest scores most'}
      </p>
      {isHost && (
        <Button variant="ghost" className="mt-1" onClick={() => void revealQuestion()}>
          Reveal answer now
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
  const card = session.deck[idx];
  const isLast = idx + 1 >= session.deck.length;

  const thisQ = answers.filter((a) => a.questionIndex === idx);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of thisQ) m.set(a.answer, (m.get(a.answer) ?? 0) + 1);
    return m;
  }, [answers, idx]);
  const mine = thisQ.find((a) => a.playerId === myId);
  const board = useMemo(() => liveLeaderboard(answers), [answers]);

  if (!card) return <Fallback title="…" body="Loading." onHome={onQuit} />;

  return (
    <Screen>
      <Header title={`💬 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="py-4 text-center">
        <h1 className="font-display text-2xl font-extrabold leading-tight">“{card.quote}”</h1>
        {mine && (
          <p className={`mt-3 font-display text-lg font-extrabold ${mine.correct ? 'text-emerald-300' : 'text-hot'}`}>
            {mine.correct ? `✓ +${mine.points} pts` : '✗ no points'}
          </p>
        )}
        {card.hint && (
          <p className="mt-1 font-body text-sm font-bold text-white/50">
            It was {card.answer}. {card.hint}
          </p>
        )}
      </div>

      {/* Per-option tally */}
      <div className="flex flex-col gap-2">
        {card.options.map((opt) => {
          const isAnswer = opt === card.answer;
          const n = counts.get(opt) ?? 0;
          return (
            <div
              key={opt}
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 font-display font-extrabold ${
                isAnswer ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-white/5 text-white/55'
              }`}
            >
              <span>
                {isAnswer && '✓ '}
                {opt}
              </span>
              <span className="text-white/60">{n}</span>
            </div>
          );
        })}
      </div>

      {/* Running leaderboard */}
      <p className="mb-2 mt-4 font-display text-xs font-extrabold uppercase tracking-widest text-sun">
        Leaderboard
      </p>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {board.map((row, i) => (
          <LeaderRow key={row.playerId} rank={i} playerId={row.playerId} points={row.points} myId={myId} />
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>See final results 🏆</Button>
          ) : (
            <Button onClick={() => void nextQuestion()}>Next quote →</Button>
          )
        ) : (
          <p className="text-center font-body text-sm font-bold text-white/50">
            Waiting for the host…
          </p>
        )}
        {!isHost && <HostHandoff />}
      </div>
    </Screen>
  );
}

// ----------------------------------------------------------------- final ---
function FinalView({
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
  const board = useMemo(() => liveLeaderboard(answers), [answers]);

  // Persist my run to the all-time results store exactly once per session, so
  // the existing profiles / Famous Lines leaderboard keep working.
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((a) => a.playerId === myId)
      .sort((a, b) => a.questionIndex - b.questionIndex);
    if (mine.length === 0) {
      localStorage.setItem(flag, '1');
      return;
    }
    const gwAnswers: GuessWhoAnswer[] = mine.map((a) => ({
      promptId: session.deck[a.questionIndex]?.promptId ?? '',
      pick: a.answer,
      correct: !!a.correct,
    }));
    addResult({
      id: uid(),
      gameId: 'guess-who-said-it',
      playerId: myId,
      playedAt: Date.now(),
      data: { mode: 'classic', answers: gwAnswers },
    });
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId]);

  const startNew = async () => {
    const deck = session.deck; // reuse same group's deck size via StartView next time
    // A fresh room: re-shuffle a new deck of the same size.
    const pool = QUOTE_PROMPTS;
    const fresh: LiveDeckCard[] = sample(pool, Math.min(deck.length || DECK_SIZE, pool.length)).map(
      (p) => ({
        promptId: p.id,
        quote: p.quote,
        answer: p.answer,
        hint: p.hint,
        options: shuffle([p.answer, ...p.decoys]),
      }),
    );
    await hostCreateSession(fresh, session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-6 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Final results</h1>
        <p className="font-body text-sm text-white/50">Famous Lines — Live</p>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {board.map((row, i) => (
          <LeaderRow
            key={row.playerId}
            rank={i}
            playerId={row.playerId}
            points={row.points}
            subtitle={`${row.correct}/${row.answered} correct`}
            myId={myId}
            big
          />
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
function LeaderRow({
  rank,
  playerId,
  points,
  subtitle,
  myId,
  big,
}: {
  rank: number;
  playerId: string;
  points: number;
  subtitle?: string;
  myId: string;
  big?: boolean;
}) {
  const p = getPlayer(playerId);
  if (!p) return null;
  const isMe = playerId === myId;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank * 0.04, 0.4) }}
      className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-hot/15' : 'glass'}`}
    >
      <span className="w-7 text-center font-display text-xl font-extrabold">
        {MEDALS[rank] ?? rank + 1}
      </span>
      <PlayerAvatar player={p} size={big ? 44 : 36} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-extrabold leading-tight">
          {p.name}
          {isMe && <span className="ml-1 text-white/40">(you)</span>}
        </p>
        {subtitle && <p className="font-body text-xs font-bold text-white/45">{subtitle}</p>}
      </div>
      <p className="font-display text-lg font-extrabold text-sun">{points}</p>
    </motion.div>
  );
}

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

function Header({ title, onQuit }: { title: string; onQuit: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <span className="font-display text-lg font-extrabold">{title}</span>
      <button
        onClick={() => {
          if (confirm('Leave the live game?')) onQuit();
        }}
        className="glass flex h-8 w-8 items-center justify-center rounded-full text-white/70 active:scale-90"
        aria-label="Leave"
      >
        ✕
      </button>
    </div>
  );
}

function Fallback({ title, body, onHome }: { title: string; body: string; onHome: () => void }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl font-extrabold">{title}</p>
        <p className="max-w-xs font-body text-white/55">{body}</p>
        <Button onClick={onHome}>Home</Button>
      </div>
    </Screen>
  );
}

// Ticking clock for the question timer (only runs while active).
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active]);
  return now;
}