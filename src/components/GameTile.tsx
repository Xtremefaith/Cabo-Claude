import { useState } from 'react';
import type { ComingSoonGame, GameMeta } from '../games/registry';

const missingCache: Record<string, boolean> = {};

/**
 * Home-screen game tile. When logo art is available it shows the art on a dark
 * tile (the art carries its own title/tagline); otherwise it falls back to a
 * bright gradient tile with the emoji, title, and tagline.
 */
export function GameTile({ game, onClick }: { game: GameMeta; onClick: () => void }) {
  const [showLogo, setShowLogo] = useState(Boolean(game.logo) && !missingCache[game.id]);
  const locked = !game.available;

  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl shadow-card transition active:scale-[0.98] ${
        showLogo
          ? 'border border-white/10 bg-night-800 p-3'
          : `bg-gradient-to-br ${game.gradient} p-5 text-left`
      }`}
    >
      {/* Content (dimmed when locked so the stamp stays punchy) */}
      <div className={locked ? 'opacity-30 grayscale' : ''}>
        {showLogo && game.logo ? (
          <img
            src={game.logo}
            alt={game.title}
            draggable={false}
            onError={() => {
              missingCache[game.id] = true;
              setShowLogo(false);
            }}
            className="mx-auto h-40 w-auto max-w-full object-contain"
          />
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-4xl">{game.emoji}</span>
            <div>
              <h3 className="font-display text-2xl font-extrabold text-night-900">{game.title}</h3>
              <p className="font-body text-sm font-bold text-night-900/70">{game.tagline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lock stamp */}
      {locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="rotate-[-11deg] rounded-xl border-[3px] border-hot/90 bg-night-900/45 px-4 py-1.5 font-display text-xl font-extrabold uppercase tracking-[0.15em] text-hot backdrop-blur-[1px]"
            style={{ textShadow: '0 1px 10px rgba(255,61,119,0.6)' }}
          >
            🔒 {game.lockNote ?? 'Locked'}
          </span>
        </div>
      )}
    </button>
  );
}

/** A locked "coming soon" arcade slot — dimmed, padlocked, not playable. */
export function LockedTile({ game }: { game: ComingSoonGame }) {
  return (
    <div
      aria-disabled
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-night-800/60 p-4"
    >
      <div className="absolute right-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 font-body text-[9px] font-extrabold uppercase tracking-widest text-white/50">
        Soon
      </div>
      <div className="text-3xl opacity-70 grayscale">{game.emoji}</div>
      <div className="mt-3">
        <h3 className="font-display text-base font-extrabold leading-tight text-white/75">
          {game.title}
        </h3>
        <p className="font-body text-xs font-bold text-white/35">{game.tagline}</p>
      </div>
      {/* lock overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-2xl opacity-25">🔒</span>
      </div>
    </div>
  );
}
