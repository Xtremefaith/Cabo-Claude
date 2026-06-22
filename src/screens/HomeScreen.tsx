import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GAMES } from '../games/registry';
import { usePlayers, useResults } from '../store/useStore';

export function HomeScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const hasResults = results.length > 0;

  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        <div className="pt-8">
          <Logo />
        </div>

        {/* Games */}
        <p className="mb-3 mt-9 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Games
        </p>
        <div className="flex flex-col gap-3">
          {GAMES.map((g) => (
            <button
              key={g.id}
              disabled={!g.available}
              onClick={() => navigate(`/play/${g.id}`)}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.gradient} p-5 text-left shadow-card transition active:scale-[0.98] disabled:opacity-40`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{g.emoji}</span>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-night-900">{g.title}</h3>
                  <p className="font-body text-sm font-bold text-night-900/70">{g.tagline}</p>
                </div>
              </div>
            </button>
          ))}
          <div className="rounded-3xl border border-dashed border-white/15 p-4 text-center font-body text-sm font-bold text-white/35">
            More games coming this week…
          </div>
        </div>

        {/* Players */}
        <div className="mb-3 mt-9 flex items-center justify-between">
          <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
            Players
          </p>
          {hasResults && (
            <button
              onClick={() => navigate('/reveal')}
              className="font-display text-sm font-extrabold text-sun active:scale-95"
            >
              The Reveal 👀
            </button>
          )}
        </div>

        {players.length === 0 ? (
          <p className="rounded-2xl glass px-4 py-6 text-center font-body text-white/50">
            No players yet. Start a game to add one!
          </p>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/players/${p.id}`)}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-left active:scale-[0.99]"
              >
                <PlayerAvatar player={p} size={44} />
                <span className="font-display text-lg font-extrabold">{p.name}</span>
                <span className="ml-auto text-white/30">›</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </Screen>
  );
}
