import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Screen } from '../../components/ui';
import { useMyPlayerId, useGroup } from '../../store/useStore';
import { addResult, getPlayer, getResults } from '../../store/storage';
import { QUOTE_PROMPTS, type QuotePrompt } from '../../data/quotePrompts';
import { DEFAULT_SPICE } from '../../data/spice';
import { myAnsweredQuotes } from './stats';
import { sample, shuffle, uid } from '../../lib/util';
import type { GuessWhoAnswer } from '../../types';

const DECK_SIZE = 8;

interface DeckCard {
  prompt: QuotePrompt;
  /** Pre-shuffled multiple-choice options (answer + decoys). */
  options: string[];
}

export function GuessWhoScreen() {
  const navigate = useNavigate();
  const myPlayerId = useMyPlayerId();
  const group = useGroup();
  const me = getPlayer(myPlayerId ?? '');

  // Build one deck per game: quotes at or below the group's spice that this
  // player hasn't answered yet (so replays go deeper, never repeat), each with
  // its options shuffled once up front.
  const [deck] = useState<DeckCard[]>(() => {
    const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
    const answered = myAnsweredQuotes(getResults(), myPlayerId ?? '');
    const pool = QUOTE_PROMPTS.filter((p) => p.spice <= maxSpice && !answered.has(p.id));
    return sample(pool, Math.min(DECK_SIZE, pool.length)).map((prompt) => ({
      prompt,
      options: shuffle([prompt.answer, ...prompt.decoys]),
    }));
  });
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<GuessWhoAnswer[]>([]);
  // The pick for the current card, so we can show ✓/✗ before advancing.
  const [picked, setPicked] = useState<string | null>(null);

  if (!me) {
    return (
      <Fallback
        title="Set up your player first"
        body="Guess Who Said It is a group game — join your crew and create your player to play."
        onHome={() => navigate('/')}
      />
    );
  }
  if (deck.length === 0) {
    return (
      <DoneScreen
        title="All caught up!"
        body="You've answered every quote at this spice level. Check the leaderboard, or raise the spice in Manage Group for more."
        onResults={() => navigate('/play/guess-who-said-it/results')}
        onHome={() => navigate('/')}
      />
    );
  }
  if (index >= deck.length) {
    return (
      <DoneScreen
        onResults={() => navigate('/play/guess-who-said-it/results')}
        onHome={() => navigate('/')}
      />
    );
  }

  const { prompt, options } = deck[index];
  const correctCount = answers.filter((a) => a.correct).length;

  const choose = (pick: string) => {
    if (picked) return; // lock in the first tap
    setPicked(pick);
    const correct = pick === prompt.answer;
    const next = [...answers, { promptId: prompt.id, pick, correct }];
    setAnswers(next);
    if (index + 1 >= deck.length) {
      // Persist once, the moment the deck is finished.
      addResult({
        id: uid(),
        gameId: 'guess-who-said-it',
        playerId: me.id,
        playedAt: Date.now(),
        data: { mode: 'classic', answers: next },
      });
    }
  };

  const advance = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  return (
    <Screen>
      <div className="flex items-center justify-between pt-1">
        <span className="font-display text-lg font-extrabold">💬 Famous Lines</span>
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
              Which movie?
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">
              “{prompt.quote}”
            </h1>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
            {options.map((opt) => {
              const isAnswer = opt === prompt.answer;
              const isPick = opt === picked;
              let cls = 'border-white/10 bg-white/5 text-white';
              if (picked) {
                if (isAnswer) cls = 'border-emerald-400 bg-emerald-400/15 text-white';
                else if (isPick) cls = 'border-hot bg-hot/15 text-white';
                else cls = 'border-white/10 bg-white/5 text-white/40';
              }
              return (
                <button
                  key={opt}
                  onClick={() => choose(opt)}
                  disabled={!!picked}
                  className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-display text-lg font-extrabold transition active:scale-[0.98] ${cls}`}
                >
                  <span>{opt}</span>
                  {picked && isAnswer && <span>✓</span>}
                  {picked && isPick && !isAnswer && <span>✗</span>}
                </button>
              );
            })}
          </div>

          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              {prompt.hint && (
                <p className="mb-3 text-center font-body text-sm font-bold text-white/50">
                  {picked === prompt.answer ? 'Nailed it.' : `It was ${prompt.answer}.`}{' '}
                  {prompt.hint}
                </p>
              )}
              <Button className="w-full" onClick={advance}>
                {index + 1 >= deck.length ? 'See leaderboard 🏆' : 'Next quote →'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!picked && (
        <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
          Score {correctCount} / {answers.length} · tap your answer
        </p>
      )}
    </Screen>
  );
}

function DoneScreen({
  onResults,
  onHome,
  title = 'Round complete!',
  body = 'See how you stack up against the crew — the leaderboard updates as more people play.',
}: {
  onResults: () => void;
  onHome: () => void;
  title?: string;
  body?: string;
}) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        <p className="font-body text-white/55">{body}</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Button onClick={onResults}>See leaderboard 🏆</Button>
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
