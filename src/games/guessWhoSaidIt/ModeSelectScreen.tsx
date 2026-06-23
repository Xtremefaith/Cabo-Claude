import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Screen } from '../../components/ui';

/**
 * Landing screen for Guess Who Said It. Two modes:
 *   • Famous Lines (variant B) — preloaded movie quotes, playable now.
 *   • Insiders (variant A) — your crew's own quotes, added over time. Coming soon.
 */
export function GuessWhoModeScreen() {
  const navigate = useNavigate();

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <div className="mb-6 text-center">
        <div className="text-5xl">💬</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Guess Who Said It</h1>
        <p className="font-body text-sm text-white/50">Pick your deck.</p>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {/* Variant B — playable */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/play/guess-who-said-it/run')}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 p-5 text-left shadow-card active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎬</span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold text-night-900">Famous Lines</h2>
              <p className="font-body text-sm font-bold text-night-900/70">
                Guess the movie behind iconic quotes. Beat your crew on the leaderboard.
              </p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-night-900/20 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-night-900">
            Play now ›
          </span>
        </motion.button>

        {/* Variant A — playable */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate('/play/guess-who-said-it/insiders')}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-5 text-left shadow-card active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🤫</span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold text-night-900">Insiders</h2>
              <p className="font-body text-sm font-bold text-night-900/70">
                Quotes from your own crew. Add the wild things people actually said, then guess
                who said it.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-night-900/20 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-night-900">
              ＋ Add a quote
            </span>
            <span className="rounded-full bg-night-900/20 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-night-900">
              ▶ Play
            </span>
          </div>
        </motion.button>
      </div>
    </Screen>
  );
}
