import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useResults } from '../../store/useStore';
import { buildMostLikelyReveal } from './stats';

export function MostLikelyResultsScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();

  const rows = useMemo(() => buildMostLikelyReveal(results), [results]);
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  if (rows.length === 0) {
    return (
      <Screen>
        <BackButton onClick={() => navigate('/')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="text-5xl">🏆</div>
          <p className="font-display text-2xl font-extrabold">No votes yet</p>
          <p className="font-body text-white/50">Play a round of Most Likely To first!</p>
          <Button onClick={() => navigate('/play/most-likely-to/run')}>Play Most Likely To</Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Most Likely To 🏆</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        Who the group crowned — updates as more people vote.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {rows.map((row, i) => (
          <motion.div
            key={row.promptId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.5) }}
            className="glass rounded-2xl p-4"
          >
            <p className="font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
              Most likely to
            </p>
            <p className="mb-3 font-display text-lg font-extrabold leading-tight">{row.promptText}</p>

            <div className="flex flex-wrap items-center gap-3">
              {row.winnerIds.map((id) => {
                const p = byId.get(id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center gap-2 rounded-2xl bg-hot/15 px-3 py-2">
                    <PlayerAvatar player={p} size={40} />
                    <div>
                      <p className="font-display text-base font-extrabold leading-tight">{p.name}</p>
                      <p className="font-body text-xs font-bold text-hot-glow">
                        {row.topCount} {row.topCount === 1 ? 'vote' : 'votes'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* who voted for whom */}
            <div className="mt-3 flex flex-wrap gap-2">
              {row.ballots.map(({ voterId, targetId }) => {
                const voter = byId.get(voterId);
                const target = byId.get(targetId);
                if (!voter || !target) return null;
                return (
                  <div
                    key={voterId}
                    className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1"
                    title={`${voter.name} → ${target.name}`}
                  >
                    <PlayerAvatar player={voter} size={22} />
                    <span className="text-white/40">→</span>
                    <PlayerAvatar player={target} size={22} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={() => navigate('/play/most-likely-to/run')}>Vote again</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Cabo
        </Button>
      </div>
    </Screen>
  );
}
