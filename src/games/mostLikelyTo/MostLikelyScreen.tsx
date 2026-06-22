import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useMyPlayerId, useGroup } from '../../store/useStore';
import { addResult, getPlayer, getResults } from '../../store/storage';
import { MOST_LIKELY_PROMPTS, type MostLikelyPrompt } from '../../data/mostLikelyPrompts';
import { DEFAULT_SPICE } from '../../data/spice';
import { myMostLikelyVotes } from './stats';
import { sample, uid } from '../../lib/util';
import type { MostLikelyVote } from '../../types';

const DECK_SIZE = 10;

export function MostLikelyScreen() {
  const navigate = useNavigate();
  const members = usePlayers();
  const myPlayerId = useMyPlayerId();
  const group = useGroup();
  const me = getPlayer(myPlayerId ?? '');

  // One deck per game, built once: prompts at or below the group's spice that
  // this player hasn't answered yet (so replays go deeper, never repeat).
  const [deck] = useState<MostLikelyPrompt[]>(() => {
    const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
    const answered = myMostLikelyVotes(getResults(), myPlayerId ?? '');
    const pool = MOST_LIKELY_PROMPTS.filter((p) => p.spice <= maxSpice && !answered.has(p.id));
    return sample(pool, Math.min(DECK_SIZE, pool.length));
  });
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<MostLikelyVote[]>([]);

  if (!me) {
    return (
      <Fallback
        title="Join a group first"
        body="Most Likely To is a group game — set up your player to play."
        onHome={() => navigate('/')}
      />
    );
  }
  if (members.length < 2) {
    return (
      <Fallback
        title="Need more players"
        body="Add at least one more person to the group, then the votes get fun."
        onHome={() => navigate('/')}
      />
    );
  }
  if (deck.length === 0) {
    return (
      <DoneScreen
        title="All caught up!"
        body="You've voted on every prompt at this spice level. Check the results, or raise the spice in Manage Group for more."
        onResults={() => navigate('/play/most-likely-to/results')}
        onHome={() => navigate('/')}
      />
    );
  }

  if (index >= deck.length) {
    return <DoneScreen onResults={() => navigate('/play/most-likely-to/results')} onHome={() => navigate('/')} />;
  }

  const prompt = deck[index];

  const vote = (targetPlayerId: string) => {
    const next = [...votes, { promptId: prompt.id, promptText: prompt.text, targetPlayerId }];
    setVotes(next);
    const newIndex = index + 1;
    setIndex(newIndex);
    if (newIndex >= deck.length) {
      // Persist once, the moment the deck is finished.
      addResult({
        id: uid(),
        gameId: 'most-likely-to',
        playerId: me.id,
        playedAt: Date.now(),
        data: { votes: next },
      });
    }
  };

  return (
    <Screen>
      <div className="flex items-center justify-between pt-1">
        <span className="font-display text-lg font-extrabold">🏆 Most Likely To</span>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold text-white/60">
            {index + 1} / {deck.length}
          </span>
          <button
            onClick={() => {
              if (confirm('Quit? Your votes for this round will be lost.')) navigate('/');
            }}
            className="glass flex h-8 w-8 items-center justify-center rounded-full text-white/70 active:scale-90"
            aria-label="Quit"
          >
            ✕
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.18 }}
          className="flex flex-1 flex-col"
        >
          <div className="py-6 text-center">
            <p className="font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
              Most likely to
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">
              {prompt.text}?
            </h1>
          </div>

          <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto pb-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => vote(m.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 p-2 active:scale-95"
              >
                <PlayerAvatar player={m} size={72} />
                <span className="w-full truncate text-center font-display text-sm font-extrabold">
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        Tap whoever fits best
      </p>
    </Screen>
  );
}

function DoneScreen({
  onResults,
  onHome,
  title = 'Votes in!',
  body = 'See how the whole group voted — the results update as more people play.',
}: {
  onResults: () => void;
  onHome: () => void;
  title?: string;
  body?: string;
}) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-6xl">🗳️</div>
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        <p className="font-body text-white/55">{body}</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Button onClick={onResults}>See group results 🏆</Button>
          <Button variant="ghost" onClick={onHome}>
            Back to Cabo
          </Button>
        </div>
      </div>
    </Screen>
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
