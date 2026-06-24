import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameTile, LockedTile } from '../components/GameTile';
import { HomeBackground } from '../components/HomeBackground';
import { COMING_SOON, GAMES } from '../games/registry';
import { usePlayers, useResults, useGroup } from '../store/useStore';
import { DEFAULT_SPICE, SPICE_LABELS } from '../data/spice';

export function HomeScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const group = useGroup();
  const hasResults = results.length > 0;
  const spice = group?.settings?.spice ?? DEFAULT_SPICE;

  return (
    <Screen backdrop={<HomeBackground />}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        {/* Group banner (cloud mode) — tap to manage */}
        {group && (
          <button
            onClick={() => navigate('/manage')}
            className="glass mt-1 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left active:scale-[0.99]"
          >
            {group.photo ? (
              <img
                src={group.photo}
                alt={group.name}
                draggable={false}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg">👥</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-extrabold leading-tight">
                {group.name}
              </p>
              <p className="font-body text-xs font-bold text-white/45">
                Code <span className="tracking-widest text-sun">{group.code}</span>
              </p>
            </div>
            <span className="font-display text-xs font-extrabold uppercase tracking-widest text-white/50">
              Manage ›
            </span>
          </button>
        )}

        {/* Spice meter — group-wide setting, visible to everyone playing */}
        {group && (
          <button
            onClick={() => navigate('/manage')}
            className="glass mt-2 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left active:scale-[0.99]"
          >
            <span className="font-display text-xs font-extrabold uppercase tracking-widest text-white/50">
              Spice
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`text-lg ${n <= spice ? '' : 'opacity-20 grayscale'}`}>
                  🌶️
                </span>
              ))}
            </div>
            <span className="ml-auto truncate font-display text-sm font-extrabold text-hot">
              {SPICE_LABELS[spice]}
            </span>
          </button>
        )}

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
            <GameTile key={g.id} game={g} onClick={() => navigate(g.route)} />
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
              onClick={() => navigate('/results')}
              className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm font-extrabold text-sun active:scale-95"
            >
              🏆 Results ›
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
