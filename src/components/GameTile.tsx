import { useState } from 'react';
import type { GameMeta } from '../games/registry';

const missingCache: Record<string, boolean> = {};

/**
 * Home-screen game tile. When logo art is available it shows the art on a dark
 * tile (the art carries its own title/tagline); otherwise it falls back to a
 * bright gradient tile with the emoji, title, and tagline.
 */
export function GameTile({ game, onClick }: { game: GameMeta; onClick: () => void }) {
  const [showLogo, setShowLogo] = useState(Boolean(game.logo) && !missingCache[game.id]);

  return (
    <button
      disabled={!game.available}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl shadow-card transition active:scale-[0.98] disabled:opacity-40 ${
        showLogo
          ? 'border border-white/10 bg-night-800 p-3'
          : `bg-gradient-to-br ${game.gradient} p-5 text-left`
      }`}
    >
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
    </button>
  );
}
