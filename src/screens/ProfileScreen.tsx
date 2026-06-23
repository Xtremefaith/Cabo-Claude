import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../components/ui';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Headshot } from '../components/Headshot';
import { PhotoPicker } from '../components/PhotoPicker';
import { deletePlayer, getPlayer, getResultsForPlayer, updatePlayer } from '../store/storage';
import { useResults } from '../store/useStore';
import { hotOrNotStats } from '../games/hotOrNot/stats';
import { CELEBRITIES } from '../data/celebrities';
import { resolveHeadshots } from '../lib/wikiImages';
import { formatDate } from '../lib/util';

// Name -> candidate lookup so a tapped chip can resolve the right headshot.
const CANDIDATE_BY_NAME = new Map(CELEBRITIES.map((c) => [c.name, c]));

export function ProfileScreen() {
  const { playerId = '' } = useParams();
  const navigate = useNavigate();
  useResults(); // re-render when results change
  const player = getPlayer(playerId);

  // Photo modal: tap a candidate's name to show their picture for onlookers.
  const [photoFor, setPhotoFor] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null | undefined>(undefined);
  const photoReq = useRef<string | null>(null);

  const openPhoto = (name: string) => {
    photoReq.current = name;
    setPhotoFor(name);
    setPhotoUrl(undefined); // loading shimmer
    const cand = CANDIDATE_BY_NAME.get(name);
    if (!cand) {
      setPhotoUrl(null);
      return;
    }
    // Request a large thumbnail so the picture is crisp and flattering.
    resolveHeadshots([cand.wikiTitle], 800).then((map) => {
      if (photoReq.current !== name) return; // a newer tap won
      setPhotoUrl(map[cand.wikiTitle] ?? null);
    });
  };

  const closePhoto = () => {
    photoReq.current = null;
    setPhotoFor(null);
  };

  if (!player) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="font-display text-2xl">Player not found.</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  const results = getResultsForPlayer(player.id);
  const stats = hotOrNotStats(results);

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />

      <div className="flex flex-col items-center pt-2 text-center">
        <PhotoPicker onPhoto={(photo) => updatePlayer(player.id, { photo })} label="Change photo">
          <PlayerAvatar player={player} size={88} />
        </PhotoPicker>
        <h1 className="mt-3 font-display text-3xl font-extrabold">{player.name}</h1>
        <p className="font-body text-sm font-bold capitalize text-white/40">{player.gender}</p>
      </div>

      <div className="mb-6 mt-6 grid grid-cols-3 gap-3">
        <Stat label="Games" value={stats.gamesPlayed} />
        <Stat label="Swipes" value={stats.totalSwipes} />
        <Stat label="Hot %" value={`${Math.round(stats.hotRate * 100)}%`} accent />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="mb-2 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Hot or Not 🔥
        </h2>

        {stats.totalSwipes === 0 ? (
          <p className="rounded-2xl glass px-4 py-6 text-center font-body text-white/50">
            No Hot or Not picks yet.
          </p>
        ) : (
          <>
            <p className="mb-3 font-body text-xs font-bold text-white/30">
              Tap a name to show their picture 👀
            </p>
            <Chips title="Called Hot" tone="hot" names={stats.hotPicks} onSelect={openPhoto} />
            <Chips title="Called Not" tone="not" names={stats.notPicks} onSelect={openPhoto} />
          </>
        )}

        {results.length > 0 && (
          <>
            <h3 className="mb-2 mt-5 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
              History
            </h3>
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="glass flex items-center justify-between rounded-2xl px-4 py-3"
                >
                  <span className="font-display font-extrabold">
                    {r.gameId === 'hot-or-not'
                      ? 'Hot or Not'
                      : r.gameId === 'most-likely-to'
                        ? 'Most Likely To'
                        : r.data.mode === 'classic'
                          ? 'Famous Lines'
                          : 'Insiders'}
                  </span>
                  <span className="font-body text-sm text-white/50">{formatDate(r.playedAt)}</span>
                  <span className="font-display font-extrabold text-hot">
                    {r.gameId === 'hot-or-not'
                      ? `${r.data.choices.filter((c) => c.hot).length}/${r.data.choices.length} 🔥`
                      : r.gameId === 'most-likely-to'
                        ? `${r.data.votes.length} votes 🏆`
                        : r.data.mode === 'classic'
                          ? `${r.data.answers.filter((a) => a.correct).length}/${r.data.answers.length} 💬`
                          : r.data.mode === 'insiders-quote'
                            ? 'Added a quote 🤫'
                            : `${r.data.guesses.filter((g) => g.correct).length}/${r.data.guesses.length} 🕵️`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Button onClick={() => navigate('/play/hot-or-not/category/' + player.id)}>
          Play again
        </Button>
        <button
          onClick={() => {
            if (confirm(`Delete ${player.name} and all their stats? This can't be undone.`)) {
              deletePlayer(player.id);
              navigate('/');
            }
          }}
          className="py-2 font-body text-sm font-bold text-white/30 active:scale-95"
        >
          Delete player
        </button>
      </div>

      <AnimatePresence>
        {photoFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePhoto}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs"
            >
              <div className="overflow-hidden rounded-3xl bg-night-800 shadow-card">
                <Headshot url={photoUrl} name={photoFor} className="aspect-[3/4] w-full" />
                <p className="px-3 py-3 text-center font-display text-2xl font-extrabold">
                  {photoFor}
                </p>
              </div>
              <p className="mt-3 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
                Tap anywhere to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl px-2 py-4 text-center">
      <div className={`font-display text-3xl font-extrabold ${accent ? 'text-hot' : 'text-white'}`}>
        {value}
      </div>
      <div className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
        {label}
      </div>
    </div>
  );
}

function Chips({
  title,
  names,
  tone,
  onSelect,
}: {
  title: string;
  names: string[];
  tone: 'hot' | 'not';
  onSelect: (name: string) => void;
}) {
  if (names.length === 0) return null;
  const cls =
    tone === 'hot' ? 'bg-hot/15 text-hot-glow border-hot/40' : 'bg-not/15 text-not-glow border-not/40';
  return (
    <div className="mb-4">
      <p className="mb-2 font-body text-xs font-extrabold uppercase tracking-widest text-white/40">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {names.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`rounded-full border px-3 py-1 font-body text-sm font-bold transition active:scale-95 ${cls}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
