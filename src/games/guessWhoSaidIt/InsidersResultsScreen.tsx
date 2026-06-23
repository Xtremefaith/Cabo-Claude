import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useResults, useMyPlayerId } from '../../store/useStore';
import { buildInsiderLeaderboard, buildInsiderReveal } from './insidersStats';

const MEDALS = ['🥇', '🥈', '🥉'];

export function InsidersResultsScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const myPlayerId = useMyPlayerId();

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const standings = useMemo(() => buildInsiderLeaderboard(results), [results]);
  const reveal = useMemo(() => buildInsiderReveal(results), [results]);

  return (
    <Screen>
      <BackButton onClick={() => navigate('/play/guess-who-said-it/insiders')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Insiders 🤫</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        Who reads the crew best — and which quotes stumped everyone.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {reveal.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="text-5xl">🤫</div>
            <p className="font-display text-2xl font-extrabold">No quotes yet</p>
            <Button onClick={() => navigate('/play/guess-who-said-it/insiders/add')}>
              Add the first quote
            </Button>
          </div>
        ) : (
          <>
            {/* Leaderboard */}
            {standings.length > 0 && (
              <>
                <p className="font-display text-sm font-extrabold uppercase tracking-widest text-sun">
                  Best guessers
                </p>
                {standings.map((row, i) => {
                  const p = byId.get(row.playerId);
                  if (!p) return null;
                  const isMe = row.playerId === myPlayerId;
                  return (
                    <motion.div
                      key={row.playerId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-hot/15' : 'glass'}`}
                    >
                      <span className="w-7 text-center font-display text-xl font-extrabold">
                        {MEDALS[i] ?? i + 1}
                      </span>
                      <PlayerAvatar player={p} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-extrabold leading-tight">
                          {p.name}
                          {isMe && <span className="ml-1 text-white/40">(you)</span>}
                        </p>
                        <p className="font-body text-xs font-bold text-white/45">
                          {row.accuracy}% accuracy
                        </p>
                      </div>
                      <p className="font-display text-lg font-extrabold text-emerald-300">
                        {row.correct}
                        <span className="text-sm text-white/40"> / {row.total}</span>
                      </p>
                    </motion.div>
                  );
                })}
                <div className="my-1 h-px bg-white/10" />
              </>
            )}

            {/* Per-quote reveal */}
            <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
              The quotes
            </p>
            {reveal.map((row) => {
              const saidBy = byId.get(row.quote.saidById);
              const rate = row.totalGuesses ? row.correctCount / row.totalGuesses : null;
              const stumper = rate !== null && rate <= 0.34 && row.totalGuesses >= 2;
              return (
                <div key={row.quote.id} className="glass rounded-2xl p-4">
                  <p className="font-display text-lg font-extrabold leading-snug">
                    “{row.quote.text}”
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {saidBy && <PlayerAvatar player={saidBy} size={32} />}
                    <p className="font-body text-sm font-bold text-white/70">
                      Said by{' '}
                      <span className="font-display font-extrabold text-white">
                        {saidBy?.name ?? '—'}
                      </span>
                    </p>
                    {stumper && (
                      <span className="ml-auto rounded-full bg-hot/20 px-2 py-0.5 font-body text-[10px] font-extrabold uppercase tracking-widest text-hot">
                        Stumper
                      </span>
                    )}
                  </div>

                  {row.totalGuesses === 0 ? (
                    <p className="mt-2 font-body text-xs font-bold text-white/35">
                      No guesses yet
                    </p>
                  ) : (
                    <>
                      <p className="mt-3 font-body text-xs font-bold text-white/45">
                        {row.correctCount} of {row.totalGuesses} guessed right
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.ballots.map(({ guesserId, guessId, correct }) => {
                          const guesser = byId.get(guesserId);
                          const guess = byId.get(guessId);
                          if (!guesser || !guess) return null;
                          return (
                            <div
                              key={guesserId}
                              className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                                correct ? 'bg-emerald-400/15' : 'bg-white/5'
                              }`}
                              title={`${guesser.name} guessed ${guess.name}`}
                            >
                              <PlayerAvatar player={guesser} size={22} />
                              <span className="text-white/40">→</span>
                              <PlayerAvatar player={guess} size={22} />
                              <span className="ml-0.5 text-xs">{correct ? '✓' : '✗'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={() => navigate('/play/guess-who-said-it/insiders/play')}>Guess more</Button>
        <Button variant="ghost" onClick={() => navigate('/play/guess-who-said-it/insiders')}>
          Back to Insiders
        </Button>
      </div>
    </Screen>
  );
}
