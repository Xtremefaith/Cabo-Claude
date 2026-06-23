import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { usePlayers, useResults, useMyPlayerId } from '../../store/useStore';
import { getPlayer } from '../../store/storage';
import { insiderQuotes, myInsiderGuesses } from './insidersStats';

export function InsidersHubScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const myPlayerId = useMyPlayerId();
  const me = getPlayer(myPlayerId ?? '');

  const quotes = useMemo(() => insiderQuotes(results), [results]);
  const myGuesses = useMemo(
    () => myInsiderGuesses(results, myPlayerId ?? ''),
    [results, myPlayerId],
  );

  const toGuess = useMemo(
    () => quotes.filter((q) => q.authorId !== myPlayerId && !myGuesses.has(q.id)),
    [quotes, myPlayerId, myGuesses],
  );
  const myQuoteCount = quotes.filter((q) => q.authorId === myPlayerId).length;

  if (!me) {
    return (
      <Fallback
        title="Set up your player first"
        body="Insiders is a group game — join your crew and create your player to play."
        onHome={() => navigate('/')}
      />
    );
  }
  if (players.length < 2) {
    return (
      <Fallback
        title="Need more players"
        body="Add at least one more person to the group, then you can attribute quotes and guess who said them."
        onHome={() => navigate('/')}
      />
    );
  }

  return (
    <Screen>
      <BackButton onClick={() => navigate('/play/guess-who-said-it')} />
      <div className="mb-6 text-center">
        <div className="text-5xl">🤫</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Insiders</h1>
        <p className="mx-auto max-w-xs font-body text-sm text-white/50">
          Add the wild things your crew actually said. Everyone else guesses who said it.
        </p>
      </div>

      {/* Stat strip */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Quotes" value={quotes.length} />
        <Stat label="You added" value={myQuoteCount} />
        <Stat label="To guess" value={toGuess.length} tone="hot" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col gap-3"
      >
        <Button onClick={() => navigate('/play/guess-who-said-it/insiders/add')}>
          ＋ Add a quote
        </Button>
        <Button
          variant={toGuess.length ? 'primary' : 'ghost'}
          disabled={toGuess.length === 0}
          onClick={() => navigate('/play/guess-who-said-it/insiders/play')}
        >
          🕵️ {toGuess.length ? `Guess (${toGuess.length})` : 'All caught up'}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/play/guess-who-said-it/insiders/results')}>
          🏆 Leaderboard & reveal
        </Button>
      </motion.div>

      {quotes.length === 0 && (
        <p className="mt-6 text-center font-body text-sm text-white/40">
          No quotes yet — be the first to add one your crew will have to puzzle over.
        </p>
      )}
    </Screen>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'hot' }) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl py-3">
      <span
        className={`font-display text-2xl font-extrabold ${tone === 'hot' ? 'text-hot' : 'text-white'}`}
      >
        {value}
      </span>
      <span className="font-body text-[10px] font-extrabold uppercase tracking-widest text-white/40">
        {label}
      </span>
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
