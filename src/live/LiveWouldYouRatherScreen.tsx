// Live (synchronous) Would You Rather. Same room/phase machine as the other
// live games (lobby → question → reveal → final). It's an opinion game: pick A
// or B, no right answer and no score — the reveal is the group's split.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, getResults, isCloud } from '../store/storage';
import { WOULD_YOU_RATHER_PROMPTS } from '../data/wouldYouRatherPrompts';
import { DEFAULT_SPICE } from '../data/spice';
import { pickFreshFirst, uid } from '../lib/util';
import type { WouldYouRatherChoice } from '../types';
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
import type { LiveSession, SessionAnswer, WouldYouRatherCard } from './types';

const GAME_ID = 'would-you-rather';
const DECK_SIZE = 10;
const QUESTION_SECONDS = 20;
const NO_SCORE = { correct: null, points: 0 } as const;

/** Prompt ids the whole group has already answered (across every saved round). */
function seenWyrIds(): Set<string> {
  const seen = new Set<string>();
  for (const r of getResults()) {
    if (r.gameId === 'would-you-rather') for (const c of r.data.choices) seen.add(c.promptId);
  }
  return seen;
}

/** Build a fresh deck at/under the group's spice, preferring unplayed dilemmas. */
function buildWyrDeck(maxSpice: number): WouldYouRatherCard[] {
  const seen = seenWyrIds();
  const pool = WOULD_YOU_RATHER_PROMPTS.filter((p) => p.spice <= maxSpice);
  return pickFreshFirst(pool, DECK_SIZE, (p) => seen.has(p.id)).map((p) => ({
    promptId: p.id,
    optionA: p.optionA,
    optionB: p.optionB,
  }));
}

export function LiveWouldYouRatherScreen() {
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
        body="Would You Rather is now a live, answer-together game. Connect the group to Supabase to host a room from one phone and see how the crew splits."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <LiveFallback
        title="Set up your player first"
        body="Would You Rather is a group game — join your crew and create your player to play."
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
    const deck = buildWyrDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(deck, { questionSeconds: QUESTION_SECONDS, deckSize: deck.length }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">🤔</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Would You Rather — Live</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            Host a room from this phone. Everyone picks the same dilemma at once, then we reveal how
            the crew split.
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
      <LiveHeader title="🤔 Lobby" onQuit={onQuit} />
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
                  Need at least 2 in the room to play.
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
  const card = (session.deck as WouldYouRatherCard[])[idx];

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
  }, [idx]);
  useEffect(() => {
    if (isHost && (timeUp || everyoneIn) && !advancedRef.current) {
      advancedRef.current = true;
      void revealQuestion();
    }
  }, [isHost, timeUp, everyoneIn]);

  if (!card) return <LiveFallback title="…" body="Loading dilemma." onHome={onQuit} />;

  const pct = Math.max(0, Math.min(100, (1 - elapsed / limitMs) * 100));

  return (
    <Screen>
      <LiveHeader title={`🤔 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hot to-sun transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {remaining}s · {answeredCount} / {rosterCount} answered
      </p>

      <p className="py-4 text-center font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
        Would you rather…
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4 pb-2">
        <OptionButton
          label={card.optionA}
          picked={myAnswer?.answer === 'a'}
          dimmed={!!myAnswer && myAnswer.answer !== 'a'}
          onClick={() => !myAnswer && void submitAnswer('a', NO_SCORE)}
        />
        <div className="text-center font-display text-sm font-extrabold uppercase tracking-widest text-white/30">
          or
        </div>
        <OptionButton
          label={card.optionB}
          picked={myAnswer?.answer === 'b'}
          dimmed={!!myAnswer && myAnswer.answer !== 'b'}
          onClick={() => !myAnswer && void submitAnswer('b', NO_SCORE)}
        />
      </div>

      <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        {myAnswer ? 'Locked in — waiting for the crew' : 'Tap your pick'}
      </p>
      {isHost && (
        <Button variant="ghost" className="mt-1" onClick={() => void revealQuestion()}>
          Reveal the split now
        </Button>
      )}
    </Screen>
  );
}

function OptionButton({
  label,
  picked,
  dimmed,
  onClick,
}: {
  label: string;
  picked: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={dimmed || picked}
      className={`flex min-h-[5.5rem] items-center justify-center rounded-3xl border-2 px-5 py-5 text-center font-display text-xl font-extrabold leading-tight transition active:scale-[0.98] ${
        picked
          ? 'border-sun bg-sun/20 text-white'
          : dimmed
            ? 'border-white/10 bg-white/5 text-white/40'
            : 'border-white/15 bg-white/5 text-white'
      }`}
    >
      {label}
      {picked && <span className="ml-2">🔒</span>}
    </button>
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
  const card = (session.deck as WouldYouRatherCard[])[idx];
  const isLast = idx + 1 >= session.deck.length;

  const thisQ = answers.filter((a) => a.questionIndex === idx);
  const { a, b } = useMemo(() => splitVotes(thisQ), [answers, idx]);
  const myPick = thisQ.find((p) => p.playerId === myId)?.answer;

  if (!card) return <LiveFallback title="…" body="Loading." onHome={onQuit} />;

  const total = a + b;
  const pctA = total ? Math.round((a / total) * 100) : 0;
  const pctB = total ? 100 - pctA : 0;

  return (
    <Screen>
      <LiveHeader title={`🤔 ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <p className="py-4 text-center font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
        The crew split…
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <SplitRow
          label={card.optionA}
          count={a}
          pct={pctA}
          mine={myPick === 'a'}
          color="bg-hot"
        />
        <SplitRow
          label={card.optionB}
          count={b}
          pct={pctB}
          mine={myPick === 'b'}
          color="bg-sky-400"
        />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>See the recap 🏁</Button>
          ) : (
            <Button onClick={() => void nextQuestion()}>Next dilemma →</Button>
          )
        ) : (
          <p className="text-center font-body text-sm font-bold text-white/50">Waiting for the host…</p>
        )}
        {!isHost && <HostHandoff />}
      </div>
    </Screen>
  );
}

function SplitRow({
  label,
  count,
  pct,
  mine,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  mine: boolean;
  color: string;
}) {
  return (
    <div className={`rounded-3xl border-2 p-4 ${mine ? 'border-sun' : 'border-white/10'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-display text-lg font-extrabold leading-tight">
          {label}
          {mine && <span className="ml-2 text-sm text-sun">(you)</span>}
        </span>
        <span className="shrink-0 font-display text-2xl font-extrabold">{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 font-body text-xs font-bold text-white/40">
        {count} {count === 1 ? 'vote' : 'votes'}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------- final ---
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
  const deck = session.deck as WouldYouRatherCard[];
  const group = useGroup();

  const rows = useMemo(
    () =>
      deck.map((card, i) => {
        const { a, b } = splitVotes(answers.filter((ans) => ans.questionIndex === i));
        const total = a + b;
        const pctA = total ? Math.round((a / total) * 100) : 0;
        // "Divisiveness" = how close to a 50/50 split (0 = unanimous, 50 = dead even).
        const closeness = total ? 50 - Math.abs(pctA - 50) : -1;
        return { card, a, b, pctA, pctB: total ? 100 - pctA : 0, total, closeness };
      }),
    [deck, answers],
  );
  const mostDivisive = useMemo(
    () => rows.filter((r) => r.total > 0).sort((x, y) => y.closeness - x.closeness)[0],
    [rows],
  );

  // Persist my choices to the all-time results store once, so the existing
  // group split reveal / WYR stats keep working.
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((ans) => ans.playerId === myId)
      .sort((x, y) => x.questionIndex - y.questionIndex);
    if (mine.length > 0) {
      const choices: WouldYouRatherChoice[] = mine.map((ans) => ({
        promptId: deck[ans.questionIndex]?.promptId ?? '',
        optionA: deck[ans.questionIndex]?.optionA ?? '',
        optionB: deck[ans.questionIndex]?.optionB ?? '',
        choice: ans.answer === 'b' ? 'b' : 'a',
      }));
      addResult({
        id: uid(),
        gameId: 'would-you-rather',
        playerId: myId,
        playedAt: Date.now(),
        data: { choices },
      });
    }
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId, deck]);

  const startNew = async () => {
    const fresh = buildWyrDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(fresh, session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-6 text-center">
        <div className="text-6xl">🏁</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">The recap</h1>
        <p className="font-body text-sm text-white/50">Would You Rather — Live</p>
      </div>

      {mostDivisive && (
        <div className="mb-3 rounded-2xl bg-hot/15 p-3 text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-widest text-sun">
            Most divided the room
          </p>
          <p className="mt-1 font-display text-sm font-extrabold leading-tight">
            {mostDivisive.card.optionA}{' '}
            <span className="text-white/40">({mostDivisive.pctA}%)</span> vs{' '}
            {mostDivisive.card.optionB}{' '}
            <span className="text-white/40">({mostDivisive.pctB}%)</span>
          </p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {rows.map(({ card, pctA, pctB, total }) => (
          <div key={card.promptId} className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2 font-display text-sm font-extrabold leading-tight">
              <span className="min-w-0 flex-1 truncate">{card.optionA}</span>
              <span className="shrink-0 text-white/40">vs</span>
              <span className="min-w-0 flex-1 truncate text-right">{card.optionB}</span>
            </div>
            <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-hot" style={{ width: `${pctA}%` }} />
              <div className="h-full bg-sky-400" style={{ width: `${pctB}%` }} />
            </div>
            <div className="mt-1 flex justify-between font-body text-xs font-bold text-white/45">
              <span>{pctA}%</span>
              <span>{total === 0 ? 'no votes' : `${pctB}%`}</span>
            </div>
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
/** Count A vs B picks in a set of answers. */
function splitVotes(answers: SessionAnswer[]): { a: number; b: number } {
  let a = 0;
  let b = 0;
  for (const ans of answers) {
    if (ans.answer === 'a') a++;
    else if (ans.answer === 'b') b++;
  }
  return { a, b };
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
