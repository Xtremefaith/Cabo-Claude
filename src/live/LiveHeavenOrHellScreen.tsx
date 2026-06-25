// Live (synchronous) Heaven or Hell. Same room/phase machine as the other live
// games (lobby → question → reveal → final). It's a swipe opinion game in the
// Hot or Not mould: each round is a famous candidate (with a crew member mixed
// in now and then), and you swipe them to Heaven (right) or Hell (left). No
// right answer, no score — the reveal is the group's split, framed as the
// angel/demon on the candidate's shoulders.
//
// LONG-TERM (not built yet): show each candidate's *public* verdict — the tally
// across ALL groups — on the shoulders, with the crew's split below. That needs
// a cross-group aggregate that bypasses per-group RLS (a SECURITY DEFINER RPC
// writing to a public, PII-free `candidate_id → {heaven,hell}` tally, written
// only for famous candidates, never crew members). The reveal layout below is
// built to receive it: swap the shoulder numbers to public, keep the crew bar.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '../components/ui';
import { Headshot } from '../components/Headshot';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGroup, useMyPlayerId } from '../store/useStore';
import { addResult, getPlayer, getPlayers, getResults, isCloud } from '../store/storage';
import { HEAVEN_OR_HELL_CANDIDATES } from '../data/heavenOrHellCandidates';
import { DEFAULT_SPICE } from '../data/spice';
import { resolveHeadshots } from '../lib/wikiImages';
import { pickFreshFirst, shuffle, uid } from '../lib/util';
import type { HeavenOrHellVerdict } from '../types';
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
import { SwipeVerdictCard, type SwipeVerdictHandle } from './SwipeVerdictCard';
import type { HeavenOrHellCard, LiveSession, SessionAnswer } from './types';

const GAME_ID = 'heaven-or-hell';
const DECK_SIZE = 10;
const QUESTION_SECONDS = 15;
/** How many crew members to mix into a deck of famous candidates, max. */
const MAX_CREW_CANDIDATES = 3;
const NO_SCORE = { correct: null, points: 0 } as const;

type Images = Record<string, string | null>;

/** Candidate ids the whole group has already judged (across every saved round). */
function seenCandidateIds(): Set<string> {
  const seen = new Set<string>();
  for (const r of getResults()) {
    if (r.gameId === 'heaven-or-hell') for (const v of r.data.verdicts) seen.add(v.candidateId);
  }
  return seen;
}

/**
 * Build a fresh deck: famous faces at/under the group's spice (preferring ones
 * the group hasn't judged), with a few crew members shuffled in for fun. Higher
 * spice unlocks more controversial candidates. Order is frozen here so every
 * device sees the same candidates in the same order.
 */
function buildDeck(maxSpice: number): HeavenOrHellCard[] {
  const seen = seenCandidateIds();
  const players = getPlayers();
  // 0..MAX crew candidates, never more than half the deck.
  const crewCount = Math.min(MAX_CREW_CANDIDATES, players.length, Math.floor(DECK_SIZE / 2));
  const crew: HeavenOrHellCard[] = pickFreshFirst(players, crewCount, (p) =>
    seen.has(`player:${p.id}`),
  ).map((p) => ({
    promptId: `player:${p.id}`,
    name: p.name,
    blurb: 'One of the crew 👀',
    playerId: p.id,
  }));

  const pool = HEAVEN_OR_HELL_CANDIDATES.filter((c) => c.spice <= maxSpice);
  const famous: HeavenOrHellCard[] = pickFreshFirst(pool, DECK_SIZE - crew.length, (c) =>
    seen.has(c.id),
  ).map((c) => ({ promptId: c.id, name: c.name, blurb: c.blurb, wikiTitle: c.wikiTitle }));

  return shuffle([...famous, ...crew]);
}

/** A candidate's portrait — a Wikipedia headshot, or a crew member's avatar. */
function CandidateVisual({ card, images }: { card: HeavenOrHellCard; images: Images }) {
  if (card.playerId) {
    const p = getPlayer(card.playerId);
    return <Headshot url={p?.photo ?? null} name={p?.name ?? card.name} className="h-full w-full" />;
  }
  const url = card.wikiTitle ? images[card.wikiTitle] : null;
  return <Headshot url={url} name={card.name} className="h-full w-full" />;
}

export function LiveHeavenOrHellScreen() {
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

  // Resolve famous-candidate headshots once per room so swipes/reveals are smooth.
  const [images, setImages] = useState<Images>({});
  const sessionId = session?.id ?? null;
  useEffect(() => {
    if (!session) return;
    const titles = (session.deck as HeavenOrHellCard[])
      .map((c) => c.wikiTitle)
      .filter((t): t is string => !!t);
    if (titles.length === 0) return;
    let alive = true;
    void resolveHeadshots(titles).then((map) => {
      if (alive) setImages(map);
    });
    return () => {
      alive = false;
    };
    // Deck is frozen per room, so the session id is the right key to re-resolve on.
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isCloud()) {
    return (
      <LiveFallback
        title="Live play needs the cloud"
        body="Heaven or Hell is a live, swipe-together game. Connect the group to Supabase to host a room from one phone and see where the crew sends each soul."
        onHome={() => navigate('/')}
      />
    );
  }
  if (!me) {
    return (
      <LiveFallback
        title="Set up your player first"
        body="Heaven or Hell is a group game — join your crew and create your player to play."
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
          images={images}
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
          images={images}
          isHost={isHost}
          myId={me.id}
          onQuit={quit}
        />
      );
    case 'final':
      return (
        <FinalView session={session} answers={answers} myId={me.id} isHost={isHost} onQuit={quit} />
      );
  }
}

// ----------------------------------------------------------------- start ---
function StartView({ onStart }: { onStart: () => void }) {
  const group = useGroup();
  const [hostPlays, setHostPlays] = useState(true);

  const start = async () => {
    const deck = buildDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(deck, { questionSeconds: QUESTION_SECONDS, deckSize: deck.length }, hostPlays);
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">😇😈</div>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Heaven or Hell — Live</h1>
          <p className="mt-2 max-w-xs font-body text-white/55">
            Host a room from this phone. Everyone swipes the same soul at once — right for Heaven,
            left for Hell — then we reveal where the crew sent them.
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
      <LiveHeader title="⚖️ Lobby" onQuit={onQuit} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-5xl">😇😈</div>
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
  images,
  rosterCount,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  images: Images;
  rosterCount: number;
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const now = useNow(session.phase === 'question');
  const idx = session.currentIndex;
  const card = (session.deck as HeavenOrHellCard[])[idx];
  const cardRef = useRef<SwipeVerdictHandle>(null);

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

  if (!card) return <LiveFallback title="…" body="Loading candidate." onHome={onQuit} />;

  const pct = Math.max(0, Math.min(100, (1 - elapsed / limitMs) * 100));
  const decide = (heaven: boolean) => {
    if (!myAnswer) void submitAnswer(heaven ? 'heaven' : 'hell', NO_SCORE);
  };

  return (
    <Screen>
      <LiveHeader title={`⚖️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-red-500 transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
        {remaining}s · {answeredCount} / {rosterCount} judged
      </p>

      {myAnswer ? (
        <LockedCard card={card} images={images} verdict={myAnswer.answer} />
      ) : (
        <>
          <div className="relative my-3 flex-1">
            <SwipeVerdictCard
              key={card.promptId}
              ref={cardRef}
              name={card.name}
              blurb={card.blurb}
              visual={<CandidateVisual card={card} images={images} />}
              onDecide={decide}
            />
          </div>

          <div className="flex items-center justify-center gap-8 pb-1">
            <button
              onClick={() => cardRef.current?.swipe(false)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-3xl shadow-glow-not active:scale-90"
              aria-label="Hell"
            >
              😈
            </button>
            <button
              onClick={() => cardRef.current?.swipe(true)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-400 text-3xl shadow-glow-hot active:scale-90"
              aria-label="Heaven"
            >
              😇
            </button>
          </div>
          <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
            Swipe or tap — left for Hell, right for Heaven
          </p>
        </>
      )}
    </Screen>
  );
}

/** The static "verdict cast" state once you've swiped, while the crew finishes. */
function LockedCard({
  card,
  images,
  verdict,
}: {
  card: HeavenOrHellCard;
  images: Images;
  verdict: string;
}) {
  const heaven = verdict === 'heaven';
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="relative h-56 w-44 overflow-hidden rounded-[28px] bg-night-800 shadow-card">
        <CandidateVisual card={card} images={images} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
        <p className="absolute inset-x-0 bottom-2 px-2 font-display text-lg font-extrabold leading-tight text-white drop-shadow">
          {card.name}
        </p>
      </div>
      <p
        className={`font-display text-xl font-extrabold ${heaven ? 'text-sky-300' : 'text-red-400'}`}
      >
        You sent them to {heaven ? 'Heaven 😇' : 'Hell 😈'}
      </p>
      <p className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
        Verdict locked — waiting for the crew
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- reveal ---
function RevealView({
  session,
  answers,
  images,
  isHost,
  myId,
  onQuit,
}: {
  session: LiveSession;
  answers: SessionAnswer[];
  images: Images;
  isHost: boolean;
  myId: string;
  onQuit: () => void;
}) {
  const idx = session.currentIndex;
  const card = (session.deck as HeavenOrHellCard[])[idx];
  const isLast = idx + 1 >= session.deck.length;

  const thisQ = answers.filter((a) => a.questionIndex === idx);
  const { heaven, hell } = useMemo(() => splitVerdicts(thisQ), [answers, idx]);
  const myPick = thisQ.find((a) => a.playerId === myId)?.answer;

  if (!card) return <LiveFallback title="…" body="Loading." onHome={onQuit} />;

  const total = heaven + hell;
  const pctHeaven = total ? Math.round((heaven / total) * 100) : 0;
  const pctHell = total ? 100 - pctHeaven : 0;

  return (
    <Screen>
      <LiveHeader title={`⚖️ ${idx + 1} / ${session.deck.length}`} onQuit={onQuit} />

      <p className="py-3 text-center font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
        The crew decided…
      </p>

      {/* Angel on one shoulder, demon on the other (group split for now; public
          verdict slots in here long-term — see file header). */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-2">
          <ShoulderBadge
            emoji="😇"
            label="Heaven"
            count={heaven}
            pct={pctHeaven}
            mine={myPick === 'heaven'}
            tone="heaven"
          />
          <div className="relative h-52 w-40 shrink-0 overflow-hidden rounded-[24px] bg-night-800 shadow-card">
            <CandidateVisual card={card} images={images} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
            <p className="absolute inset-x-0 bottom-2 px-2 text-center font-display text-base font-extrabold leading-tight text-white drop-shadow">
              {card.name}
            </p>
          </div>
          <ShoulderBadge
            emoji="😈"
            label="Hell"
            count={hell}
            pct={pctHell}
            mine={myPick === 'hell'}
            tone="hell"
          />
        </div>

        <div className="w-full max-w-xs">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-sky-400" style={{ width: `${pctHeaven}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${pctHell}%` }} />
          </div>
          <p className="mt-1.5 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
            {total === 0 ? 'No verdicts' : `${pctHeaven}% Heaven · ${pctHell}% Hell`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isHost ? (
          isLast ? (
            <Button onClick={() => void finishSession()}>See the final reckoning 🔔</Button>
          ) : (
            <Button onClick={() => void nextQuestion()}>Next soul →</Button>
          )
        ) : (
          <p className="text-center font-body text-sm font-bold text-white/50">Waiting for the host…</p>
        )}
        {!isHost && <HostHandoff />}
      </div>
    </Screen>
  );
}

function ShoulderBadge({
  emoji,
  label,
  count,
  pct,
  mine,
  tone,
}: {
  emoji: string;
  label: string;
  count: number;
  pct: number;
  mine: boolean;
  tone: 'heaven' | 'hell';
}) {
  const ring = tone === 'heaven' ? 'border-sky-400 bg-sky-500/10' : 'border-red-400 bg-red-500/10';
  return (
    <div
      className={`flex w-[4.5rem] flex-col items-center gap-0.5 rounded-2xl border-2 p-2 ${
        mine ? ring : 'border-white/10 bg-white/5'
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="font-display text-2xl font-extrabold leading-none">{pct}%</span>
      <span className="font-body text-[10px] font-extrabold uppercase tracking-widest text-white/45">
        {label}
      </span>
      <span className="font-body text-[11px] font-bold text-white/40">
        {count} {count === 1 ? 'vote' : 'votes'}
        {mine && ' · you'}
      </span>
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
  const deck = session.deck as HeavenOrHellCard[];
  const group = useGroup();

  const rows = useMemo(
    () =>
      deck.map((card, i) => {
        const { heaven, hell } = splitVerdicts(answers.filter((a) => a.questionIndex === i));
        const total = heaven + hell;
        const pctHeaven = total ? Math.round((heaven / total) * 100) : 0;
        return { card, heaven, hell, total, pctHeaven, pctHell: total ? 100 - pctHeaven : 0 };
      }),
    [deck, answers],
  );

  const scored = rows.filter((r) => r.total > 0);
  const mostHeavenly = useMemo(
    () => [...scored].sort((a, b) => b.pctHeaven - a.pctHeaven || b.heaven - a.heaven)[0],
    [scored],
  );
  const mostDamned = useMemo(
    () => [...scored].sort((a, b) => b.pctHell - a.pctHell || b.hell - a.hell)[0],
    [scored],
  );

  // Persist my verdicts to the all-time results store once, so freshness
  // tracking + future career stats keep working.
  useEffect(() => {
    const flag = `cabo:live-persisted:${session.id}`;
    if (localStorage.getItem(flag)) return;
    const mine = answers
      .filter((a) => a.playerId === myId)
      .sort((a, b) => a.questionIndex - b.questionIndex);
    if (mine.length > 0) {
      const verdicts: HeavenOrHellVerdict[] = mine.map((a) => ({
        candidateId: deck[a.questionIndex]?.promptId ?? '',
        candidateName: deck[a.questionIndex]?.name ?? '',
        verdict: a.answer === 'hell' ? 'hell' : 'heaven',
      }));
      addResult({
        id: uid(),
        gameId: 'heaven-or-hell',
        playerId: myId,
        playedAt: Date.now(),
        data: { verdicts },
      });
    }
    localStorage.setItem(flag, '1');
  }, [session.id, answers, myId, deck]);

  const startNew = async () => {
    const fresh = buildDeck(group?.settings?.spice ?? DEFAULT_SPICE);
    await hostCreateSession(fresh, session.config, session.hostPlays);
  };

  return (
    <Screen>
      <div className="py-5 text-center">
        <div className="text-6xl">🔔</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">The reckoning</h1>
        <p className="font-body text-sm text-white/50">Heaven or Hell — Live</p>
      </div>

      <div className="mb-3 flex flex-col gap-2">
        {mostHeavenly && (
          <div className="rounded-2xl bg-sky-500/15 p-3 text-center">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-sky-300">
              😇 Most heaven-bound
            </p>
            <p className="mt-0.5 font-display text-sm font-extrabold">
              {mostHeavenly.card.name}{' '}
              <span className="text-white/40">({mostHeavenly.pctHeaven}% to Heaven)</span>
            </p>
          </div>
        )}
        {mostDamned && (
          <div className="rounded-2xl bg-red-500/15 p-3 text-center">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-red-400">
              😈 Most hell-bound
            </p>
            <p className="mt-0.5 font-display text-sm font-extrabold">
              {mostDamned.card.name}{' '}
              <span className="text-white/40">({mostDamned.pctHell}% to Hell)</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {rows.map(({ card, pctHeaven, pctHell, total }) => (
          <div key={card.promptId} className="glass rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold">
                {card.name}
              </span>
              <span className="shrink-0 font-body text-xs font-bold text-white/45">
                {total === 0 ? 'no verdicts' : `${pctHeaven}% 😇 / ${pctHell}% 😈`}
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-sky-400" style={{ width: `${pctHeaven}%` }} />
              <div className="h-full bg-red-500" style={{ width: `${pctHell}%` }} />
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
/** Count Heaven vs Hell verdicts in a set of answers. */
function splitVerdicts(answers: SessionAnswer[]): { heaven: number; hell: number } {
  let heaven = 0;
  let hell = 0;
  for (const a of answers) {
    if (a.answer === 'heaven') heaven++;
    else if (a.answer === 'hell') hell++;
  }
  return { heaven, hell };
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
