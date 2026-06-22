import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameLogo } from '../components/GameLogo';
import { getGame } from '../games/registry';
import { usePlayers } from '../store/useStore';
import { addPlayer } from '../store/storage';
import { pickPlayerColor, uid } from '../lib/util';
import type { Gender } from '../types';

export function PlayerPickScreen() {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const players = usePlayers();
  const game = getGame(gameId);

  // Jump straight to player creation the first time around.
  const [mode, setMode] = useState<'pick' | 'create'>(players.length ? 'pick' : 'create');

  if (!game) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="font-display text-2xl">Unknown game.</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  const start = (playerId: string) => navigate(`/play/${gameId}/run/${playerId}`);

  if (mode === 'create') {
    return (
      <CreatePlayer
        onCancel={() => (players.length ? setMode('pick') : navigate('/'))}
        onCreate={(name, gender) => {
          const player = {
            id: uid(),
            name: name.trim(),
            gender,
            color: pickPlayerColor(players.length),
            createdAt: Date.now(),
          };
          addPlayer(player);
          start(player.id);
        }}
      />
    );
  }

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <div className="mb-6 text-center">
        <GameLogo
          game={game}
          className="mx-auto mb-2 h-28 w-auto object-contain"
          fallback={
            <p className="font-body text-sm font-bold uppercase tracking-widest text-white/50">
              {game.emoji} {game.title}
            </p>
          }
        />
        <h1 className="font-display text-3xl font-extrabold">Who's playing?</h1>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => start(p.id)}
            className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-left active:scale-[0.99]"
          >
            <PlayerAvatar player={p} size={48} />
            <div>
              <span className="font-display text-lg font-extrabold">{p.name}</span>
              <p className="font-body text-xs font-bold capitalize text-white/40">{p.gender}</p>
            </div>
            <span className="ml-auto font-display text-sm font-extrabold text-sun">Play ›</span>
          </button>
        ))}
      </div>

      <Button className="mt-4" variant="ghost" onClick={() => setMode('create')}>
        ＋ New Player
      </Button>
    </Screen>
  );
}

function CreatePlayer({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, gender: Gender) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const canStart = name.trim().length > 0 && gender !== null;

  return (
    <Screen>
      <BackButton onClick={onCancel} />
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (canStart) onCreate(name, gender!);
        }}
        className="flex flex-1 flex-col"
      >
        <h1 className="mt-4 font-display text-3xl font-extrabold">New player</h1>
        <p className="font-body text-white/50">We'll save you for future games too.</p>

        <label className="mt-8 mb-2 block font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Your name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nick"
          maxLength={20}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-display text-xl font-extrabold text-white placeholder:text-white/25 focus:border-hot focus:outline-none"
        />

        <p className="mb-3 mt-8 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          I am
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as Gender[]).map((g) => {
            const selected = gender === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-2xl border-2 px-4 py-6 font-display text-xl font-extrabold capitalize transition active:scale-[0.97] ${
                  selected
                    ? 'border-hot bg-hot/15 text-white shadow-glow-hot'
                    : 'border-white/10 bg-white/5 text-white/70'
                }`}
              >
                <span className="mr-2 text-2xl">{g === 'male' ? '♂' : '♀'}</span>
                {g}
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-body text-xs font-bold text-white/35">
          Hot or Not shows you the opposite sex from the Comedian category.
        </p>

        <div className="flex-1" />
        <Button type="submit" disabled={!canStart} className="w-full">
          Begin →
        </Button>
      </motion.form>
    </Screen>
  );
}
