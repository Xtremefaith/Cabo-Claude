import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Screen } from '../../components/ui';
import { Headshot } from '../../components/Headshot';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { SwipeCard, type SwipeCardHandle } from './SwipeCard';
import { comediansByGender } from '../../data/comedians';
import { resolveHeadshots } from '../../lib/wikiImages';
import { addResult, getPlayer } from '../../store/storage';
import { sample, uid } from '../../lib/util';
import type { Candidate, HotOrNotChoice, Player } from '../../types';

const DECK_SIZE = 10;

export function HotOrNotScreen() {
  const { playerId = '' } = useParams();
  const navigate = useNavigate();
  const player = getPlayer(playerId);

  // Opposite sex of the player's chosen gender.
  const deck = useMemo<Candidate[]>(() => {
    if (!player) return [];
    const opposite = player.gender === 'male' ? 'female' : 'male';
    return sample(comediansByGender(opposite), DECK_SIZE);
  }, [player]);

  const [images, setImages] = useState<Record<string, string | null>>();
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<HotOrNotChoice[]>([]);
  const cardRef = useRef<SwipeCardHandle>(null);

  // Resolve all headshots up front so swiping is smooth.
  useEffect(() => {
    if (deck.length === 0) return;
    let alive = true;
    resolveHeadshots(deck.map((c) => c.wikiTitle)).then((map) => {
      if (alive) setImages(map);
    });
    return () => {
      alive = false;
    };
  }, [deck]);

  if (!player) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-2xl">Player not found.</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  const done = index >= deck.length;

  const handleDecide = (hot: boolean) => {
    const candidate = deck[index];
    const next = [...choices, { candidateId: candidate.id, candidateName: candidate.name, hot }];
    setChoices(next);
    const newIndex = index + 1;
    setIndex(newIndex);
    if (newIndex >= deck.length) {
      addResult({
        id: uid(),
        gameId: 'hot-or-not',
        playerId: player.id,
        playedAt: Date.now(),
        data: { choices: next },
      });
    }
  };

  if (!images) return <LoadingDeck player={player} />;
  if (done) return <GameOver player={player} choices={choices} deck={deck} images={images} />;

  const current = deck[index];
  const upcoming = deck[index + 1];

  return (
    <Screen>
      <Header player={player} index={index} total={deck.length} onQuit={() => navigate('/')} />

      <div className="relative my-3 flex-1">
        {/* next card peeking behind */}
        {upcoming && (
          <div className="absolute inset-0 scale-[0.96] opacity-60">
            <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-night-800 shadow-card">
              <Headshot
                url={images[upcoming.wikiTitle]}
                name={upcoming.name}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
        <SwipeCard
          key={current.id}
          ref={cardRef}
          candidate={current}
          imageUrl={images[current.wikiTitle]}
          onDecide={handleDecide}
        />
      </div>

      <div className="flex items-center justify-center gap-8 pb-2">
        <button
          onClick={() => cardRef.current?.swipe(false)}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-not text-3xl text-night-900 shadow-glow-not active:scale-90"
          aria-label="Not"
        >
          👎
        </button>
        <button
          onClick={() => cardRef.current?.swipe(true)}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-hot text-3xl text-white shadow-glow-hot active:scale-90"
          aria-label="Hot"
        >
          🔥
        </button>
      </div>
      <p className="pb-1 text-center font-body text-xs font-bold uppercase tracking-widest text-white/40">
        Swipe or tap — left for Not, right for Hot
      </p>
    </Screen>
  );
}

function Header({
  player,
  index,
  total,
  onQuit,
}: {
  player: Player;
  index: number;
  total: number;
  onQuit: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-2">
        <PlayerAvatar player={player} size={36} />
        <span className="font-display text-lg font-extrabold">{player.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display text-sm font-extrabold text-white/60">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => {
            if (confirm('Quit this game? Your progress will be lost.')) onQuit();
          }}
          className="glass flex h-8 w-8 items-center justify-center rounded-full text-white/70 active:scale-90"
          aria-label="Quit"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function LoadingDeck({ player }: { player: Player }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="animate-float text-6xl">🃏</div>
        <p className="font-display text-2xl font-extrabold">Shuffling the deck…</p>
        <p className="font-body text-white/50">Getting headshots ready for {player.name}</p>
      </div>
    </Screen>
  );
}

function GameOver({
  player,
  choices,
  deck,
  images,
}: {
  player: Player;
  choices: HotOrNotChoice[];
  deck: Candidate[];
  images: Record<string, string | null>;
}) {
  const navigate = useNavigate();
  const hots = choices.filter((c) => c.hot);
  const byId = new Map(deck.map((c) => [c.id, c]));

  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        <div className="pt-6 text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Game Over</h1>
          <p className="font-body text-white/60">
            {player.name} called <span className="font-extrabold text-hot">{hots.length}</span> hot
            out of {choices.length}
          </p>
        </div>

        <p className="mb-2 mt-6 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Your Hot picks 🔥
        </p>
        <div className="flex-1 overflow-y-auto">
          {hots.length === 0 ? (
            <p className="py-6 text-center font-body text-white/40">
              Ice cold — nobody made the cut!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {hots.map((c) => {
                const cand = byId.get(c.candidateId)!;
                return (
                  <div key={c.candidateId} className="overflow-hidden rounded-2xl bg-night-800">
                    <Headshot
                      url={images[cand.wikiTitle]}
                      name={cand.name}
                      className="aspect-[3/4] w-full"
                    />
                    <p className="truncate px-2 py-1 text-center font-body text-xs font-bold">
                      {cand.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={() => navigate('/reveal')}>See the Reveal 👀</Button>
          <Button variant="ghost" onClick={() => navigate(`/players/${player.id}`)}>
            {player.name}'s Profile
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Cabo
          </Button>
        </div>
      </motion.div>
    </Screen>
  );
}
