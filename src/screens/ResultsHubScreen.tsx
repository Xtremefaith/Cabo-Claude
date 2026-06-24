// The Results hub — one entry point for every game's all-time record. Live
// rooms now handle the in-the-moment reveal, so this page is the lasting record
// across sessions. One card per live game; tap through to its full reveal.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Screen } from '../components/ui';
import { useResults } from '../store/useStore';
import { getPlayer } from '../store/storage';
import { buildGuessWhoLeaderboard } from '../games/guessWhoSaidIt/stats';
import { buildFinishLyricLeaderboard } from '../games/finishTheLyric/stats';
import { buildMostLikelyReveal } from '../games/mostLikelyTo/stats';
import { buildWouldYouRatherReveal } from '../games/wouldYouRather/stats';

export function ResultsHubScreen() {
  const navigate = useNavigate();
  const results = useResults();

  const cards = useMemo(() => {
    // Famous Lines — who leads the all-time board.
    const fl = buildGuessWhoLeaderboard(results);
    const flLeader = fl[0] ? getPlayer(fl[0].playerId) : null;
    const flTeaser = flLeader
      ? `🥇 ${flLeader.name} · ${fl[0].correct} correct`
      : 'No rounds yet';

    // Most Likely To — who's been crowned most.
    const mlt = buildMostLikelyReveal(results);
    const crowns = new Map<string, number>();
    for (const r of mlt) for (const id of r.winnerIds) crowns.set(id, (crowns.get(id) ?? 0) + 1);
    const topCrown = [...crowns.entries()].sort((a, b) => b[1] - a[1])[0];
    const mltPlayer = topCrown ? getPlayer(topCrown[0]) : null;
    const mltTeaser = mltPlayer
      ? `👑 ${mltPlayer.name} · crowned ${topCrown![1]}×`
      : 'No votes yet';

    // Finish the Lyric — who leads the all-time board.
    const ftl = buildFinishLyricLeaderboard(results);
    const ftlLeader = ftl[0] ? getPlayer(ftl[0].playerId) : null;
    const ftlTeaser = ftlLeader ? `🥇 ${ftlLeader.name} · ${ftl[0].correct} correct` : 'No rounds yet';

    // Would You Rather — how many dilemmas the crew has settled.
    const wyr = buildWouldYouRatherReveal(results);
    const wyrTeaser = wyr.length > 0 ? `📊 ${wyr.length} dilemmas settled` : 'No rounds yet';

    return [
      {
        id: 'guess-who-said-it',
        emoji: '💬',
        title: 'Famous Lines',
        teaser: flTeaser,
        route: '/play/guess-who-said-it/results',
        gradient: 'from-emerald-500/20 to-sky-500/10',
      },
      {
        id: 'finish-the-lyric',
        emoji: '🎤',
        title: 'Finish the Lyric',
        teaser: ftlTeaser,
        route: '/play/finish-the-lyric/results',
        gradient: 'from-sky-500/20 to-purple-600/10',
      },
      {
        id: 'most-likely-to',
        emoji: '🏆',
        title: 'Most Likely To',
        teaser: mltTeaser,
        route: '/play/most-likely-to/results',
        gradient: 'from-indigo-500/20 to-hot/10',
      },
      {
        id: 'would-you-rather',
        emoji: '🤔',
        title: 'Would You Rather',
        teaser: wyrTeaser,
        route: '/play/would-you-rather/results',
        gradient: 'from-hot/20 to-purple-500/10',
      },
    ];
  }, [results]);

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Results 🏆</h1>
      <p className="mb-5 font-body text-sm text-white/50">
        The all-time record across every live game.
      </p>

      <div className="flex flex-1 flex-col gap-3">
        {cards.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            onClick={() => navigate(c.route)}
            className={`flex items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br ${c.gradient} p-4 text-left active:scale-[0.98]`}
          >
            <span className="text-4xl">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-extrabold leading-tight">{c.title}</h2>
              <p className="truncate font-body text-sm font-bold text-white/55">{c.teaser}</p>
            </div>
            <span className="text-white/30">›</span>
          </motion.button>
        ))}
      </div>
    </Screen>
  );
}
