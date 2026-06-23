// Live (synchronous) Most Likely To. Same room/phase machine as Famous Lines
// (lobby → question → reveal → final) but it's an opinion game: you vote for a
// crew member, there's no right answer and no score — just the crowned reveal.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, isCloud } from '../store/storage';
import { MOST_LIKELY_PROMPTS } from '../data/mostLikelyPrompts';
import { DEFAULT_SPICE } from '../data/spice';
import { sample, uid } from '../lib/util';
import type { MostLikelyVote } from '../types';
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
import type { LiveSession, MostLikelyCard, SessionAnswer } from './types';

const GAME_ID = 'most-likely-to';
const DECK_SIZE = 10;
const QUESTION_SECONDS = 25;
const NO_SCORE = { correct: null, points: 0 } as const;

export function LiveMostLikelyScreen() {
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
        body="Most Likely To is now a live, vote-together game. Connect the group to Supabase to host a room from one phone and crown the crew."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <LiveFallback
        title="Set up your player first"
        body="Most Likely To is a group game — join your crew and create your player to play."
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
          roster={roster.map((r) => r.playerId)}
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
    const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
    const pool = MOST_LIKELY_PROMPTS.filter((p) => p.spice <= maxSpice);
    const deck: MostLikelyCard[] = sample(pool, Math.min(DECK_SIZE, pool.length)).map((p) => ({
      promptId: p.id,
      text: p.text,
    }));
    await hostCreateSession(deck, { questionSeconds: QUESTION_SECONDS, deckSize: deck.length }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">🏆</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Most Likely To — Live</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            Host a room from this phone. Everyone votes the same prompt at once, then we crown whoever
            the crew picked.
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
  // Need at least two crew members in the room before votes get fun.
  const canStart = roster.length >= 2;

  useEffect(() => {
    if (!amIn && !(isHost && !session.hostPlays)) void joinSession();
  }, [amIn, isHost, session.hostPlays]);

  return (
    <Screen>
      <LiveHeader title="🏆 Lobby" onQuit={onQuit} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-5xl">🗳️</div>
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
  roster,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  roster: string[];
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const now = useNow(session.phase === 'question');
  const idx = session.currentIndex;
  const card = (session.deck as MostLikelyCard[])[idx];

  const myVote = answers.find((a) => a.questionIndex === idx && a.playerId === myId);
  const votedCount = useMemo(
    () => new Set(answers.filter((a) => a.questionIndex === idx).map((a) => a.playerId)).size,
    [answers, idx],
  );

  const limitMs = (session.config.questionSeconds ?? QUESTION_SECONDS) * 1000;
  const elapsed = session.questionStartedAt ? now - session.questionStartedAt : 0;
  const remaining = Math.max(0, Math.ceil((limitMs - elapsed) / 1000));
  const timeUp = elapsed >= limitMs;
  const everyoneIn = roster.length > 0 && votedCount >= roster.length;

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

  if (!card) return <LiveFallback title="…" body="Loading prompt." onHome={onQuit} />;

  const pct = Math.max(0, Math.min(100, (1 - elapsed / limitMs) * 100));

  return (
    <Screen>
      <LiveHeader title={`🗳️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-hot transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {remaining}s · {votedCount} / {roster.length} voted
      </p>

      <div className="py-5 text-center">
        <p className="font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
          Most likely to
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">{card.text}?</h1>
      </div>

      <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto pb-2">
        {roster.map((pid) => {
          const p = getPlayer(pid);
          if (!p) return null;
          const isPick = myVote?.answer === pid;
          const dim = myVote && !isPick ? 'opacity-40' : '';
          return (
            <button
              key={pid}
              onClick={() => !myVote && void submitAnswer(pid, NO_SCORE)}
              disabled={!!myVote}
              className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 active:scale-95 ${
                isPick ? 'bg-hot/20 ring-2 ring-hot' : 'bg-white/5'
              } ${dim}`}
            >
              <PlayerAvatar player={p} size={72} />
              <span className="w-full truncate text-center font-display text-sm font-extrabold">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        {myVote ? 'Vote locked — waiting for the crew' : 'Tap whoever fits best'}
      </p>
      {isHost && (
        <Button variant="ghost" className="mt-1" onClick={() => void revealQuestion()}>
          Reveal votes now
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
  const card = (session.deck as MostLikelyCard[])[idx];
  const isLast = idx + 1 >= session.deck.length;

  const thisQ = answers.filter((a) => a.questionIndex === idx);
  const tally = useMemo(() => tallyVotes(thisQ), [answers, idx]);
  const myPick = thisQ.find((a) => a.playerId === myId)?.answer;

  if (!card) return <LiveFallback title="…" body="Loading." onHome={onQuit} />;

  return (
    <Screen>
      <LiveHeader title={`🗳️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="py-4 text-center">
        <p className="font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
          Most likely to
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">{card.text}?</h1>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {tally.rows.map(({ playerId, count }) => {
          const p = getPlayer(playerId);
          if (!p) return null;
          const isWinner = tally.winnerIds.includes(playerId);
          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                isWinner ? 'bg-hot/20 ring-2 ring-hot' : 'glass'
              }`}
            >
              <PlayerAvatar player={p} size={40} />
              <span className="min-w-0 flex-1 truncate font-display text-base font-extrabold">
                {isWinner && '👑 '}
                {p.name}
                {playerId === myPick && <span className="ml-1 text-white/40">(your pick)</span>}
              </span>
              <span className="font-display text-lg font-extrabold text-hot-glow">
                {count} {count === 1 ? 'vote' : 'votes'}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>See the crowns 🏆</Button>
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
  const deck = session.deck as MostLikelyCard[];

  // Per-prompt crowns + who got crowned most overall.
  const { perPrompt, topCrowned } = useMemo(() => {
    const perPrompt = deck.map((card, i) => {
      const tally = tallyVotes(answers.filter((a) => a.questionIndex === i));
      return { card, winnerIds: tally.winnerIds, topCount: tally.topCount };
    });
    const crowns = new Map<string, number>();
    for (const row of perPrompt) for (const id of row.winnerIds) crowns.set(id, (crowns.get(id) ?? 0) + 1);
    const max = Math.max(0, ...crowns.values());
    const topCrowned = max > 0 ? [...crowns.entries()].filter(([, n]) => n === max).map(([id]) => id) : [];
    return { perPrompt, topCrowned, topCount: max };
  }, [deck, answers]);

  // Persist my votes to the all-time results store once, so the existing group
  // reveal / Most Likely To stats keep working.
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((a) => a.playerId === myId)
      .sort((a, b) => a.questionIndex - b.questionIndex);
    if (mine.length > 0) {
      const votes: MostLikelyVote[] = mine.map((a) => ({
        promptId: deck[a.questionIndex]?.promptId ?? '',
        promptText: deck[a.questionIndex]?.text ?? '',
        targetPlayerId: a.answer,
      }));
      addResult({
        id: uid(),
        gameId: 'most-likely-to',
        playerId: myId,
        playedAt: Date.now(),
        data: { votes },
      });
    }
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId, deck]);

  const startNew = async () => {
    const pool = MOST_LIKELY_PROMPTS;
    const fresh: MostLikelyCard[] = sample(pool, Math.min(deck.length || DECK_SIZE, pool.length)).map(
      (p) => ({ promptId: p.id, text: p.text }),
    );
    await hostCreateSession(fresh, session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-6 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">The crowns</h1>
        <p className="font-body text-sm text-white/50">Most Likely To — Live</p>
      </div>

      {topCrowned.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-hot/15 p-3 text-center">
          <span className="font-display text-sm font-extrabold uppercase tracking-widest text-sun">
            Most crowned
          </span>
          {topCrowned.map((id) => {
            const p = getPlayer(id);
            return p ? (
              <span key={id} className="flex items-center gap-1 font-display text-base font-extrabold">
                <PlayerAvatar player={p} size={28} /> {p.name}
              </span>
            ) : null;
          })}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {perPrompt.map(({ card, winnerIds, topCount }) => (
          <div key={card.promptId} className="glass rounded-2xl p-3">
            <p className="font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
              Most likely to
            </p>
            <p className="mb-2 font-display text-base font-extrabold leading-tight">{card.text}?</p>
            <div className="flex flex-wrap items-center gap-2">
              {winnerIds.length === 0 ? (
                <span className="font-body text-sm text-white/40">No votes</span>
              ) : (
                winnerIds.map((id) => {
                  const p = getPlayer(id);
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 rounded-full bg-hot/15 px-2.5 py-1 font-display text-sm font-extrabold"
                    >
                      <PlayerAvatar player={p} size={24} /> {p.name}
                      <span className="text-hot-glow">· {topCount}</span>
                    </span>
                  );
                })
              )}
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
/** Count votes per target and surface the winner(s) (ties allowed). */
function tallyVotes(answers: SessionAnswer[]): {
  rows: { playerId: string; count: number }[];
  winnerIds: string[];
  topCount: number;
} {
  const counts = new Map<string, number>();
  for (const a of answers) counts.set(a.answer, (counts.get(a.answer) ?? 0) + 1);
  const rows = [...counts.entries()]
    .map(([playerId, count]) => ({ playerId, count }))
    .sort((a, b) => b.count - a.count);
  const topCount = rows.length ? rows[0].count : 0;
  const winnerIds = rows.filter((r) => r.count === topCount && topCount > 0).map((r) => r.playerId);
  return { rows, winnerIds, topCount };
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
