import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Headshot } from '../components/Headshot';
import { usePlayers, useResults } from '../store/useStore';
import { buildReveal } from '../games/hotOrNot/stats';
import { COMEDIANS } from '../data/comedians';
import { resolveHeadshots } from '../lib/wikiImages';

export function RevealScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const [revealed, setRevealed] = useState(false);
  const [images, setImages] = useState<Record<string, string | null>>({});

  const rows = useMemo(() => buildReveal(results), [results]);
  const byName = useMemo(() => new Map(COMEDIANS.map((c) => [c.name, c])), []);
  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  useEffect(() => {
    const titles = rows
      .map((r) => byName.get(r.candidateName)?.wikiTitle)
      .filter((t): t is string => Boolean(t));
    if (titles.length) resolveHeadshots(titles).then(setImages);
  }, [rows, byName]);

  if (rows.length === 0) {
    return (
      <Screen>
        <BackButton onClick={() => navigate('/')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="text-5xl">🤫</div>
          <p className="font-display text-2xl font-extrabold">Nothing to reveal yet</p>
          <p className="font-body text-white/50">Play a round of Hot or Not first!</p>
          <Button onClick={() => navigate('/play/hot-or-not')}>Play Hot or Not</Button>
        </div>
      </Screen>
    );
  }

  if (!revealed) {
    return (
      <Screen>
        <BackButton onClick={() => navigate('/')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-7xl"
          >
            🥁
          </motion.div>
          <h1 className="font-display text-4xl font-extrabold">The Reveal</h1>
          <p className="font-body text-white/60">
            Everyone's Hot/Not picks, side by side. Ready to spill it at the table?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {players.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <PlayerAvatar player={p} size={44} />
                <span className="font-body text-xs font-bold text-white/60">{p.name}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => setRevealed(true)}>Reveal it 🎉</Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">The Reveal 👀</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        🔥 = Hot · 👎 = Not · sorted by most agreed-hot
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {rows.map((row, i) => {
          const cand = byName.get(row.candidateName);
          return (
            <motion.div
              key={row.candidateName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              className="glass flex items-center gap-3 rounded-2xl p-3"
            >
              <Headshot
                url={cand ? images[cand.wikiTitle] : null}
                name={row.candidateName}
                className="h-14 w-14 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-extrabold">{row.candidateName}</p>
                <p className="font-body text-xs font-bold text-white/40">
                  {row.hotCount} hot · {row.notCount} not
                </p>
              </div>
              <div className="flex gap-1.5">
                {row.votes.map((v) => {
                  const p = playerById.get(v.playerId);
                  if (!p) return null;
                  return (
                    <div key={v.playerId} className="relative">
                      <PlayerAvatar player={p} size={34} />
                      <span className="absolute -bottom-1 -right-1 text-sm">
                        {v.hot ? '🔥' : '👎'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Screen>
  );
}
