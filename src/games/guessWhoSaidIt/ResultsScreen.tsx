import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useResults, useMyPlayerId } from '../../store/useStore';
import { QUOTE_PROMPTS } from '../../data/quotePrompts';
import { buildGuessWhoLeaderboard, myLatestRound } from './stats';

const MEDALS = ['🥇', '🥈', '🥉'];

export function GuessWhoResultsScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const myPlayerId = useMyPlayerId();

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const promptById = useMemo(() => new Map(QUOTE_PROMPTS.map((p) => [p.id, p])), []);
  const standings = useMemo(() => buildGuessWhoLeaderboard(results), [results]);
  const lastRound = useMemo(
    () => myLatestRound(results, myPlayerId ?? ''),
    [results, myPlayerId],
  );

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Famous Lines 🏆</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        Most correct guesses across the whole crew.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {standings.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="text-5xl">💬</div>
            <p className="font-display text-2xl font-extrabold">No rounds yet</p>
            <Button onClick={() => navigate('/live/guess-who-said-it')}>
              Play Famous Lines
            </Button>
          </div>
        ) : (
          <>
            {/* Leaderboard */}
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
                  className={`flex items-center gap-3 rounded-2xl p-3 ${
                    isMe ? 'bg-hot/15' : 'glass'
                  }`}
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
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold text-emerald-300">
                      {row.correct}
                      <span className="text-sm text-white/40"> / {row.total}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Your latest round, quote by quote */}
            {lastRound.length > 0 && (
              <>
                <p className="mt-3 font-display text-sm font-extrabold uppercase tracking-widest text-sun">
                  Your last round
                </p>
                {lastRound.map((a) => {
                  const prompt = promptById.get(a.promptId);
                  if (!prompt) return null;
                  return (
                    <div key={a.promptId} className="glass rounded-2xl p-4">
                      <p className="font-display text-base font-extrabold leading-tight">
                        “{prompt.quote}”
                      </p>
                      <p
                        className={`mt-2 font-body text-sm font-bold ${
                          a.correct ? 'text-emerald-300' : 'text-hot-glow'
                        }`}
                      >
                        {a.correct ? '✓ ' : '✗ '}
                        {a.correct ? prompt.answer : `You said ${a.pick} — it was ${prompt.answer}`}
                      </p>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={() => navigate('/live/guess-who-said-it')}>Play again</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Cabo
        </Button>
      </div>
    </Screen>
  );
}
