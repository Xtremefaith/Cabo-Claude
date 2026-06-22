import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Screen } from '../../components/ui';
import { useMyPlayerId, useGroup } from '../../store/useStore';
import { addResult, getPlayer, getResults } from '../../store/storage';
import { WOULD_YOU_RATHER_PROMPTS, type WouldYouRatherPrompt } from '../../data/wouldYouRatherPrompts';
import { DEFAULT_SPICE } from '../../data/spice';
import { myWouldYouRatherChoices } from './stats';
import { WouldYouRatherCard, type WouldYouRatherCardHandle } from './WouldYouRatherCard';
import { sample, uid } from '../../lib/util';
import type { WouldYouRatherChoice } from '../../types';

const DECK_SIZE = 10;

export function WouldYouRatherScreen() {
  const navigate = useNavigate();
  const myPlayerId = useMyPlayerId();
  const group = useGroup();
  const me = getPlayer(myPlayerId ?? '');
  const cardRef = useRef<WouldYouRatherCardHandle>(null);

  // One deck per game, built once: prompts at or below the group's spice that
  // this player hasn't answered yet (so replays go deeper, never repeat).
  const [deck] = useState<WouldYouRatherPrompt[]>(() => {
    const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
    const answered = myWouldYouRatherChoices(getResults(), myPlayerId ?? '');
    const pool = WOULD_YOU_RATHER_PROMPTS.filter((p) => p.spice <= maxSpice && !answered.has(p.id));
    return sample(pool, Math.min(DECK_SIZE, pool.length));
  });
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<WouldYouRatherChoice[]>([]);

  if (!me) {
    return (
      <Fallback
        title="Join a group first"
        body="Would You Rather is a group game — set up your player to play."
        onHome={() => navigate('/')}
      />
    );
  }
  if (deck.length === 0) {
    return (
      <DoneScreen
        title="All caught up!"
        body="You've answered every dilemma at this spice level. Check the results, or raise the spice in Manage Group for more."
        onResults={() => navigate('/play/would-you-rather/results')}
        onHome={() => navigate('/')}
      />
    );
  }
  if (index >= deck.length) {
    return <DoneScreen onResults={() => navigate('/play/would-you-rather/results')} onHome={() => navigate('/')} />;
  }

  const prompt = deck[index];

  const decide = (choice: 'a' | 'b') => {
    const next = [
      ...choices,
      { promptId: prompt.id, optionA: prompt.optionA, optionB: prompt.optionB, choice },
    ];
    setChoices(next);
    const newIndex = index + 1;
    setIndex(newIndex);
    if (newIndex >= deck.length) {
      // Persist once, the moment the deck is finished.
      addResult({
        id: uid(),
        gameId: 'would-you-rather',
        playerId: me.id,
        playedAt: Date.now(),
        data: { choices: next },
      });
    }
  };

  return (
    <Screen>
      <div className="flex items-center justify-between pt-1">
        <span className="font-display text-lg font-extrabold">🤔 Would You Rather</span>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold text-white/60">
            {index + 1} / {deck.length}
          </span>
          <button
            onClick={() => {
              if (confirm('Quit? Your answers for this round will be lost.')) navigate('/');
            }}
            className="glass flex h-8 w-8 items-center justify-center rounded-full text-white/70 active:scale-90"
            aria-label="Quit"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="py-4 text-center">
        <p className="font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
          Would you rather…
        </p>
      </div>

      <div className="relative flex-1">
        <AnimatePresence>
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0"
          >
            <WouldYouRatherCard ref={cardRef} prompt={prompt} onDecide={decide} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-8 pb-2 pt-3">
        <button
          onClick={() => cardRef.current?.choose('a')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-hot text-2xl text-white shadow-glow-hot active:scale-90"
          aria-label="Pick the first option"
        >
          👈
        </button>
        <button
          onClick={() => cardRef.current?.choose('b')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-not text-2xl text-night-900 shadow-glow-not active:scale-90"
          aria-label="Pick the second option"
        >
          👉
        </button>
      </div>
      <p className="pb-1 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        Swipe or tap a side — there's no wrong answer
      </p>
    </Screen>
  );
}

function DoneScreen({
  onResults,
  onHome,
  title = 'Answers in!',
  body = 'See how the whole group split — the results update as more people play.',
}: {
  onResults: () => void;
  onHome: () => void;
  title?: string;
  body?: string;
}) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-6xl">⚖️</div>
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        <p className="font-body text-white/55">{body}</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Button onClick={onResults}>See group results 📊</Button>
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
