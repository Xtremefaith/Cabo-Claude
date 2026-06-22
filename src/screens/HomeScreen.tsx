import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameTile, LockedTile } from '../components/GameTile';
import { HomeBackground } from '../components/HomeBackground';
import { COMING_SOON, GAMES } from '../games/registry';
import { usePlayers, useResults } from '../store/useStore';

export function HomeScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const hasResults = results.length > 0;

  return (
    <Screen backdrop={<HomeBackground />}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        {/* Hero logo */}
        <motion.div
          className="flex justify-center pt-6"
          style={{ filter: 'drop-shadow(0 6px 26px rgba(255,61,119,0.45))' }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Logo />
        </motion.div>

        {/* Games */}
        <p className="mb-3 mt-6 font-display text-sm font-extrabold uppercase tracking-widest text-white/60">
          🕹️ Arcade
        </p>

        <div className="flex flex-col gap-3">
          {GAMES.map((g) => (
            <GameTile key={g.id} game={g} onClick={() => navigate(`/play/${g.id}`)} />
          ))}
        </div>

        {/* Locked / coming soon */}
        <p className="mb-2 mt-5 font-display text-xs font-extrabold uppercase tracking-widest text-white/40">
          Unlocking soon
        </p>
        <div className="grid auto-rows-fr grid-cols-2 gap-3">
          {COMING_SOON.map((g) => (
            <LockedTile key={g.title} game={g} />
          ))}
        </div>

        {/* Players */}
        <div className="mb-3 mt-8 flex items-center justify-between">
          <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/60">
            👥 Players
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
          <p className="glass rounded-2xl px-4 py-6 text-center font-body text-white/60">
            No players yet — tap a game to add one!
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
