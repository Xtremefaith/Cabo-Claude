import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { getGame } from '../games/registry';
import { CATEGORIES } from '../data/celebrities';
import { getPlayer } from '../store/storage';
import { useMyPlayerId } from '../store/useStore';

export function CategoryPickScreen() {
  const { gameId = '', playerId = '' } = useParams();
  const navigate = useNavigate();
  const myPlayerId = useMyPlayerId();
  const game = getGame(gameId);
  const player = getPlayer(playerId);
  // When the player is the logged-in device (cloud mode), the "who's playing?"
  // picker is skipped — so Back should go Home instead of looping through it.
  const back = () => navigate(myPlayerId === playerId ? '/' : `/play/${gameId}`);

  if (!game || !player) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-2xl">Something went wrong.</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  // The deck is drawn from the OPPOSITE sex of the player's chosen gender.
  const showing = player.gender === 'male' ? 'women' : 'men';
  const start = (categoryId: string) =>
    navigate(`/play/${gameId}/run/${playerId}/${categoryId}`);

  return (
    <Screen>
      <BackButton onClick={back} />

      <div className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <PlayerAvatar player={player} size={32} />
          <span className="font-display text-lg font-extrabold">{player.name}</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold">Pick a category</h1>
        <p className="font-body text-sm text-white/50">
          You'll rate 10 {showing} — Hot or Not?
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            onClick={() => start(c.id)}
            className={`flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br ${c.gradient} p-5 text-left shadow-card transition active:scale-[0.98]`}
          >
            <span className="text-4xl drop-shadow">{c.emoji}</span>
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-extrabold text-night-900">{c.plural}</h3>
              <p className="font-body text-sm font-bold text-night-900/70">{c.blurb}</p>
            </div>
            <span className="ml-auto font-display text-xl font-extrabold text-night-900/60">›</span>
          </motion.button>
        ))}
      </div>
    </Screen>
  );
}
