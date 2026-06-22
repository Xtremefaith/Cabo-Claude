import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PhotoPicker } from '../components/PhotoPicker';
import { useGroup, usePlayers } from '../store/useStore';
import { addPlayer, setMyPlayer } from '../store/storage';
import { pickPlayerColor, uid } from '../lib/util';
import type { Gender } from '../types';

/**
 * Shown once per device right after entering a group: each person sets up their
 * own player (with a fun headshot encouraged) and can see who's already here —
 * tapping an existing member claims it as themselves instead of duplicating.
 */
export function PlayerSetupScreen() {
  const group = useGroup();
  const members = usePlayers();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [photo, setPhoto] = useState<string>();

  const canStart = name.trim().length > 0 && gender !== null;

  const create = () => {
    const player = {
      id: uid(),
      name: name.trim(),
      gender: gender!,
      color: pickPlayerColor(members.length),
      photo,
      createdAt: Date.now(),
    };
    addPlayer(player);
    setMyPlayer(player.id); // remember this player as "me" -> leaves this screen
  };

  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        <div className="pt-6 text-center">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold">
            Welcome to {group?.name ?? 'the group'}!
          </h1>
          <p className="font-body text-white/55">Set up your player to get in on the games.</p>
        </div>

        {/* Members already in the group */}
        {members.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 font-display text-xs font-extrabold uppercase tracking-widest text-white/45">
              Already here — tap if that's you
            </p>
            <div className="flex flex-wrap gap-3">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMyPlayer(m.id)}
                  className="flex w-16 flex-col items-center gap-1 active:scale-95"
                >
                  <PlayerAvatar player={m} size={52} />
                  <span className="w-full truncate text-center font-body text-xs font-bold text-white/60">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo — encouraged */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <PhotoPicker onPhoto={setPhoto}>
            {photo ? (
              <img
                src={photo}
                alt="Your headshot"
                draggable={false}
                className="h-28 w-28 rounded-full object-cover shadow-card"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-hot/50 bg-hot/10 text-4xl">
                📸
              </div>
            )}
          </PhotoPicker>
          <p className="font-display text-sm font-extrabold text-white/70">
            {photo ? 'Looking good! Tap to change' : 'Add a fun headshot'}
          </p>
          <p className="font-body text-xs font-bold text-white/35">
            It makes the games way better — your face shows up for everyone.
          </p>
        </div>

        <label className="mb-2 mt-8 block font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nick"
          maxLength={20}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-display text-xl font-extrabold text-white placeholder:text-white/25 focus:border-hot focus:outline-none"
        />

        <p className="mb-3 mt-6 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
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
                className={`rounded-2xl border-2 px-4 py-5 font-display text-xl font-extrabold capitalize transition active:scale-[0.97] ${
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

        <div className="flex-1" />
        <Button disabled={!canStart} onClick={create} className="mt-6 w-full">
          Join the fun →
        </Button>
      </motion.div>
    </Screen>
  );
}
