// Live (synchronous) Cancún vs Cabo — the crew's head-to-head trip survey.
// Same room/phase machine as the other live games (lobby → question → reveal →
// final), but it's a SURVEY, not a quiz: no score, no timer, nothing
// auto-advances on a clock. Every topic pits the same two contestants against
// each other (set per room, default Cancún vs Cabo); the crew votes, the split
// reveals, everyone deliberates, then the host taps Next. The final screen
// tallies topics won by each side and crowns the overall winner — where the
// group should plan next year's trip.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, isCloud } from '../store/storage';
import { CANCUN_VS_CABO_TOPICS } from '../data/cancunVsCaboTopics';
import { uid } from '../lib/util';
import type { CancunVsCaboPick } from '../types';
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
import { LiveFallback, LiveHeader } from './ui';
import type { CancunVsCaboCard, LiveSession, SessionAnswer } from './types';

const GAME_ID = 'cancun-vs-cabo';
const NO_SCORE = { correct: null, points: 0 } as const;
const DEFAULT_A = 'Cancún';
const DEFAULT_B = 'Cabo';

/** Build the survey deck — every topic, in order (a survey measures everything). */
function buildDeck(): CancunVsCaboCard[] {
  return CANCUN_VS_CABO_TOPICS.map((t) => ({ topicId: t.id, label: t.label, emoji: t.emoji }));
}

/** Count side-A vs side-B votes in a set of answers. */
function splitVotes(answers: SessionAnswer[]): { a: number; b: number } {
  let a = 0;
  let b = 0;
  for (const ans of answers) {
    if (ans.answer === 'a') a++;
    else if (ans.answer === 'b') b++;
  }
  return { a, b };
}

type Winner = 'a' | 'b' | 'draw';
function topicWinner(a: number, b: number): Winner {
  if (a === b) return 'draw';
  return a > b ? 'a' : 'b';
}

export function LiveCancunVsCaboScreen() {
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
        body="Cancún vs Cabo is a vote-together survey. Connect the group to Supabase to host a room from one phone and settle the debate as a crew."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <LiveFallback
        title="Set up your player first"
        body="Cancún vs Cabo is a group survey — join your crew and create your player to vote."
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
  const [hostPlays, setHostPlays] = useState(true);
  const [sideA, setSideA] = useState(DEFAULT_A);
  const [sideB, setSideB] = useState(DEFAULT_B);

  const start = async () => {
    const deck = buildDeck();
    const a = sideA.trim() || DEFAULT_A;
    const b = sideB.trim() || DEFAULT_B;
    await hostCreateSession(deck, { deckSize: deck.length, sideA: a, sideB: b }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">🏝️</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Cancún vs Cabo</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            Settle it as a crew. Vote topic by topic, deliberate, then crown a winner — where are we
            going next year?
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2 text-left">
          <label className="font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
            Contestants
          </label>
          <input
            value={sideA}
            onChange={(e) => setSideA(e.target.value)}
            maxLength={20}
            className="w-full rounded-2xl border-2 border-hot/40 bg-white/5 px-4 py-3 text-center font-display text-lg font-extrabold text-white focus:border-hot focus:outline-none"
          />
          <span className="text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/30">
            vs
          </span>
          <input
            value={sideB}
            onChange={(e) => setSideB(e.target.value)}
            maxLength={20}
            className="w-full rounded-2xl border-2 border-sky-400/40 bg-white/5 px-4 py-3 text-center font-display text-lg font-extrabold text-white focus:border-sky-400 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setHostPlays((v) => !v)}
          className="glass flex w-full max-w-xs items-center justify-between rounded-2xl px-4 py-3 text-left active:scale-[0.99]"
        >
          <span className="font-display text-sm font-extrabold">Are you voting too?</span>
          <span
            className={`font-display text-sm font-extrabold ${hostPlays ? 'text-emerald-300' : 'text-white/40'}`}
          >
            {hostPlays ? "Yes — I'm in" : 'No — just hosting'}
          </span>
        </button>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button onClick={start}>Start the survey ▶</Button>
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
  const a = session.config.sideA ?? DEFAULT_A;
  const b = session.config.sideB ?? DEFAULT_B;

  useEffect(() => {
    if (!amIn && !(isHost && !session.hostPlays)) void joinSession();
  }, [amIn, isHost, session.hostPlays]);

  return (
    <Screen>
      <LiveHeader title="🏝️ Lobby" onQuit={onQuit} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-5xl">🎉</div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            {a} <span className="text-white/40">vs</span> {b}
          </h1>
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
                Start survey ▶ ({roster.length} in)
              </Button>
              {!canStart && (
                <p className="font-body text-xs font-bold text-white/40">
                  Need at least 2 in the room to vote.
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
  const idx = session.currentIndex;
  const card = (session.deck as CancunVsCaboCard[])[idx];
  const a = session.config.sideA ?? DEFAULT_A;
  const b = session.config.sideB ?? DEFAULT_B;

  const myAnswer = answers.find((ans) => ans.questionIndex === idx && ans.playerId === myId);
  const answeredCount = useMemo(
    () => new Set(answers.filter((ans) => ans.questionIndex === idx).map((ans) => ans.playerId)).size,
    [answers, idx],
  );
  const everyoneIn = rosterCount > 0 && answeredCount >= rosterCount;

  // Survey pacing: no timer. Once everyone's voted, reveal the split so the crew
  // can deliberate. The host can also reveal early.
  const advancedRef = useRef(false);
  useEffect(() => {
    advancedRef.current = false;
  }, [idx]);
  useEffect(() => {
    if (isHost && everyoneIn && !advancedRef.current) {
      advancedRef.current = true;
      void revealQuestion();
    }
  }, [isHost, everyoneIn]);

  if (!card) return <LiveFallback title="…" body="Loading topic." onHome={onQuit} />;

  return (
    <Screen>
      <LiveHeader title={`🏝️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {answeredCount} / {rosterCount} voted
      </p>

      <div className="py-6 text-center">
        <div className="text-5xl">{card.emoji}</div>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">{card.label}</h1>
        <p className="mt-2 font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
          Which was better?
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 pb-2">
        <OptionButton
          label={a}
          picked={myAnswer?.answer === 'a'}
          dimmed={!!myAnswer && myAnswer.answer !== 'a'}
          color="hot"
          onClick={() => !myAnswer && void submitAnswer('a', NO_SCORE)}
        />
        <div className="text-center font-display text-sm font-extrabold uppercase tracking-widest text-white/30">
          vs
        </div>
        <OptionButton
          label={b}
          picked={myAnswer?.answer === 'b'}
          dimmed={!!myAnswer && myAnswer.answer !== 'b'}
          color="sky"
          onClick={() => !myAnswer && void submitAnswer('b', NO_SCORE)}
        />
      </div>

      <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        {myAnswer ? 'Vote locked — waiting for the crew' : 'Tap your pick'}
      </p>
      {isHost && (
        <Button variant="ghost" className="mt-1" onClick={() => void revealQuestion()}>
          Show the results now
        </Button>
      )}
    </Screen>
  );
}

function OptionButton({
  label,
  picked,
  dimmed,
  color,
  onClick,
}: {
  label: string;
  picked: boolean;
  dimmed: boolean;
  color: 'hot' | 'sky';
  onClick: () => void;
}) {
  const pickedCls = color === 'hot' ? 'border-hot bg-hot/20 text-white' : 'border-sky-400 bg-sky-400/20 text-white';
  return (
    <button
      onClick={onClick}
      disabled={dimmed || picked}
      className={`flex min-h-[5.5rem] items-center justify-center rounded-3xl border-2 px-5 py-5 text-center font-display text-2xl font-extrabold leading-tight transition active:scale-[0.98] ${
        picked ? pickedCls : dimmed ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/15 bg-white/5 text-white'
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
  const deck = session.deck as CancunVsCaboCard[];
  const idx = session.currentIndex;
  const card = deck[idx];
  const isLast = idx + 1 >= deck.length;
  const a = session.config.sideA ?? DEFAULT_A;
  const b = session.config.sideB ?? DEFAULT_B;

  const thisQ = answers.filter((ans) => ans.questionIndex === idx);
  const { a: votesA, b: votesB } = useMemo(() => splitVotes(thisQ), [answers, idx]);
  const myPick = thisQ.find((p) => p.playerId === myId)?.answer;

  // Running scoreboard through this topic (inclusive).
  const score = useMemo(() => {
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    for (let i = 0; i <= idx; i++) {
      const s = splitVotes(answers.filter((ans) => ans.questionIndex === i));
      if (s.a === 0 && s.b === 0) continue; // nobody voted → skip
      const w = topicWinner(s.a, s.b);
      if (w === 'a') winsA++;
      else if (w === 'b') winsB++;
      else draws++;
    }
    return { winsA, winsB, draws };
  }, [answers, idx]);

  if (!card) return <LiveFallback title="…" body="Loading." onHome={onQuit} />;

  const total = votesA + votesB;
  const pctA = total ? Math.round((votesA / total) * 100) : 0;
  const pctB = total ? 100 - pctA : 0;
  const winner = topicWinner(votesA, votesB);

  return (
    <Screen>
      <LiveHeader title={`🏝️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="pt-3 text-center">
        <div className="text-4xl">{card.emoji}</div>
        <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">{card.label}</h1>
        <p className="mt-1 font-display text-sm font-extrabold uppercase tracking-widest text-sun">
          {winner === 'draw' ? '🤝 Draw' : `Winner: ${winner === 'a' ? a : b}`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <SplitRow label={a} count={votesA} pct={pctA} mine={myPick === 'a'} win={winner === 'a'} color="bg-hot" />
        <SplitRow label={b} count={votesB} pct={pctB} mine={myPick === 'b'} win={winner === 'b'} color="bg-sky-400" />
      </div>

      {/* Running scoreboard */}
      <div className="mt-5 rounded-2xl bg-white/[0.04] p-3 text-center">
        <p className="font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
          Topics won so far
        </p>
        <div className="mt-1 flex items-center justify-center gap-3 font-display text-2xl font-extrabold">
          <span className="text-hot-glow">
            {a} {score.winsA}
          </span>
          <span className="text-white/30">—</span>
          <span className="text-sky-300">
            {score.winsB} {b}
          </span>
        </div>
        {score.draws > 0 && (
          <p className="mt-1 font-body text-xs font-bold text-white/40">{score.draws} draw{score.draws === 1 ? '' : 's'}</p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>Declare the winner 🏆</Button>
          ) : (
            <Button onClick={() => void nextQuestion()}>Next topic →</Button>
          )
        ) : (
          <p className="text-center font-body text-sm font-bold text-white/50">
            Deliberate… waiting for the host
          </p>
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
  win,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  mine: boolean;
  win: boolean;
  color: string;
}) {
  return (
    <div className={`rounded-3xl border-2 p-4 ${win ? 'border-sun' : 'border-white/10'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-display text-lg font-extrabold leading-tight">
          {win && '👑 '}
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
  const deck = session.deck as CancunVsCaboCard[];
  const a = session.config.sideA ?? DEFAULT_A;
  const b = session.config.sideB ?? DEFAULT_B;

  const rows = useMemo(
    () =>
      deck.map((card, i) => {
        const s = splitVotes(answers.filter((ans) => ans.questionIndex === i));
        const total = s.a + s.b;
        return { card, votesA: s.a, votesB: s.b, total, winner: total ? topicWinner(s.a, s.b) : ('draw' as Winner) };
      }),
    [deck, answers],
  );
  const winsA = rows.filter((r) => r.total > 0 && r.winner === 'a').length;
  const winsB = rows.filter((r) => r.total > 0 && r.winner === 'b').length;
  const draws = rows.filter((r) => r.total > 0 && r.winner === 'draw').length;
  const overall: Winner = winsA === winsB ? 'draw' : winsA > winsB ? 'a' : 'b';
  const champ = overall === 'a' ? a : overall === 'b' ? b : null;

  // Persist my picks once per session, so profiles / history keep working.
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((ans) => ans.playerId === myId)
      .sort((x, y) => x.questionIndex - y.questionIndex);
    if (mine.length > 0) {
      const picks: CancunVsCaboPick[] = mine.map((ans) => ({
        topicId: deck[ans.questionIndex]?.topicId ?? '',
        topicLabel: deck[ans.questionIndex]?.label ?? '',
        side: ans.answer === 'b' ? 'b' : 'a',
      }));
      addResult({
        id: uid(),
        gameId: 'cancun-vs-cabo',
        playerId: myId,
        playedAt: Date.now(),
        data: { sideA: a, sideB: b, picks },
      });
    }
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId, deck, a, b]);

  const startNew = async () => {
    await hostCreateSession(buildDeck(), session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-5 text-center">
        <div className="text-6xl">🏆</div>
        {champ ? (
          <>
            <p className="mt-2 font-body text-sm font-extrabold uppercase tracking-widest text-sun">
              The crew has decided
            </p>
            <h1 className="mt-1 font-display text-5xl font-extrabold">{champ}</h1>
            <p className="mt-1 font-body text-sm text-white/55">wins — start planning next year ✈️</p>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-extrabold">Dead heat 😳</h1>
            <p className="mt-1 font-body text-sm text-white/55">
              Too close to call — sudden-death tiebreaker needed.
            </p>
          </>
        )}
      </div>

      <div className="mb-4 flex items-center justify-center gap-3 font-display text-3xl font-extrabold">
        <span className={overall === 'a' ? 'text-hot-glow' : 'text-white/70'}>
          {a} {winsA}
        </span>
        <span className="text-white/30">—</span>
        <span className={overall === 'b' ? 'text-sky-300' : 'text-white/70'}>
          {winsB} {b}
        </span>
      </div>
      {draws > 0 && (
        <p className="-mt-2 mb-3 text-center font-body text-xs font-bold text-white/40">
          {draws} topic{draws === 1 ? '' : 's'} drawn
        </p>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {rows.map(({ card, votesA, votesB, total, winner }) => (
          <div key={card.topicId} className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
            <span className="text-xl">{card.emoji}</span>
            <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold">{card.label}</span>
            <span
              className={`shrink-0 font-display text-sm font-extrabold ${
                winner === 'a' ? 'text-hot-glow' : winner === 'b' ? 'text-sky-300' : 'text-white/40'
              }`}
            >
              {total === 0 ? '—' : winner === 'draw' ? `Draw ${votesA}-${votesB}` : `${winner === 'a' ? a : b}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost && <Button onClick={startNew}>Run it again ▶</Button>}
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
