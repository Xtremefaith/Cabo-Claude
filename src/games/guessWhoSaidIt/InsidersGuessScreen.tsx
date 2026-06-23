import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useMyPlayerId } from '../../store/useStore';
import { addResult, getPlayer, getResults } from '../../store/storage';
import { insiderQuotes, myInsiderGuesses, type InsiderQuote } from './insidersStats';
import { uid } from '../../lib/util';
import type { InsidersGuess } from '../../types';

export function InsidersGuessScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const myPlayerId = useMyPlayerId();
  const me = getPlayer(myPlayerId ?? '');

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  // Build the deck once: quotes I didn't author and haven't guessed yet.
  const [deck] = useState<InsiderQuote[]>(() => {
    const quotes = insiderQuotes(getResults());
    const guessed = myInsiderGuesses(getResults(), myPlayerId ?? '');
    return quotes.filter((q) => q.authorId !== myPlayerId && !guessed.has(q.id));
  });
  const [index, setIndex] = useState(0);
  const [guesses, setGuesses] = useState<InsidersGuess[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  if (!me) {
    return (
      <Done
        title="Set up your player first"
        body="Join your crew and create your player to play Insiders."
        onResults={() => navigate('/play/guess-who-said-it/insiders/results')}
        onHome={() => navigate('/')}
      />
    );
  }
  if (deck.length === 0) {
    return (
      <Done
        title="All caught up!"
        body="You've guessed every quote your crew has added so far. Add more, or check the leaderboard."
        onResults={() => navigate('/play/guess-who-said-it/insiders/results')}
        onHome={() => navigate('/play/guess-who-said-it/insiders')}
        resultsLabel="See leaderboard 🏆"
        homeLabel="Back to Insiders"
      />
    );
  }
  if (index >= deck.length) {
    return (
      <Done
        onResults={() => navigate('/play/guess-who-said-it/insiders/results')}
        onHome={() => navigate('/play/guess-who-said-it/insiders')}
        homeLabel="Back to Insiders"
      />
    );
  }

  const quote = deck[index];
  const correctCount = guesses.filter((g) => g.correct).length;

  const choose = (guessPlayerId: string) => {
    if (picked) return;
    setPicked(guessPlayerId);
    const correct = guessPlayerId === quote.saidById;
    const next = [...guesses, { quoteId: quote.id, guessPlayerId, correct }];
    setGuesses(next);
    if (index + 1 >= deck.length) {
      addResult({
        id: uid(),
        gameId: 'guess-who-said-it',
        playerId: me.id,
        playedAt: Date.now(),
        data: { mode: 'insiders-guess', guesses: next },
      });
    }
  };

  const advance = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const answer = byId.get(quote.saidById);

  return (
    <Screen>
      <div className="flex items-center justify-between pt-1">
        <span className="font-display text-lg font-extrabold">🤫 Insiders</span>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold text-white/60">
            {index + 1} / {deck.length}
          </span>
          <button
            onClick={() => {
              if (confirm('Quit? Your guesses for this round will be lost.'))
                navigate('/play/guess-who-said-it/insiders');
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
          key={quote.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.18 }}
          className="flex flex-1 flex-col"
        >
          <div className="py-6 text-center">
            <p className="font-body text-sm font-extrabold uppercase tracking-widest text-white/45">
              Who said it?
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold leading-snug">
              “{quote.text}”
            </h1>
          </div>

          <div className="grid grid-cols-3 content-start gap-3 overflow-y-auto pb-2">
            {players.map((p) => {
              const isAnswer = p.id === quote.saidById;
              const isPick = p.id === picked;
              let ring = '';
              if (picked) {
                if (isAnswer) ring = 'ring-2 ring-emerald-400 bg-emerald-400/15';
                else if (isPick) ring = 'ring-2 ring-hot bg-hot/15';
                else ring = 'opacity-40';
              }
              return (
                <button
                  key={p.id}
                  onClick={() => choose(p.id)}
                  disabled={!!picked}
                  className={`relative flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 p-2 transition active:scale-95 ${ring}`}
                >
                  <PlayerAvatar player={p} size={64} />
                  <span className="w-full truncate text-center font-display text-sm font-extrabold">
                    {p.name}
                  </span>
                  {picked && isAnswer && <span className="absolute right-1 top-1 text-lg">✓</span>}
                  {picked && isPick && !isAnswer && (
                    <span className="absolute right-1 top-1 text-lg">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {picked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-3">
              <p className="mb-3 text-center font-body text-sm font-bold text-white/55">
                {picked === quote.saidById
                  ? `Right — that was ${answer?.name ?? 'them'}.`
                  : `Nope — ${answer?.name ?? 'someone else'} said it.`}
              </p>
              <Button className="w-full" onClick={advance}>
                {index + 1 >= deck.length ? 'See leaderboard 🏆' : 'Next quote →'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!picked && (
        <p className="pb-1 pt-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
          Score {correctCount} / {guesses.length} · tap who said it
        </p>
      )}
    </Screen>
  );
}

function Done({
  onResults,
  onHome,
  title = 'Guesses in!',
  body = 'See how the whole crew guessed — the leaderboard updates as more people play.',
  resultsLabel = 'See leaderboard 🏆',
  homeLabel = 'Back to Cabo',
}: {
  onResults: () => void;
  onHome: () => void;
  title?: string;
  body?: string;
  resultsLabel?: string;
  homeLabel?: string;
}) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-6xl">🕵️</div>
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        <p className="font-body text-white/55">{body}</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Button onClick={onResults}>{resultsLabel}</Button>
          <Button variant="ghost" onClick={onHome}>
            {homeLabel}
          </Button>
        </div>
      </div>
    </Screen>
  );
}
