import { useState, type ReactNode } from 'react';
import type { GameMeta } from '../games/registry';

// Tracks which game logos are missing so we don't retry a 404 on every render.
const missingCache: Record<string, boolean> = {};

/**
 * Renders a game's logo art if `public/<game.logo>` exists, otherwise renders
 * the provided fallback (emoji tile, text header, etc.). Lets us ship before
 * the art lands and have it appear automatically once dropped in.
 */
export function GameLogo({
  game,
  className = '',
  fallback,
}: {
  game: GameMeta;
  className?: string;
  fallback: ReactNode;
}) {
  const [missing, setMissing] = useState(!game.logo || missingCache[game.id]);

  if (missing || !game.logo) return <>{fallback}</>;

  return (
    <img
      src={game.logo}
      alt={game.title}
      draggable={false}
      onError={() => {
        missingCache[game.id] = true;
        setMissing(true);
      }}
      className={className}
    />
  );
}

/** True once we've confirmed the logo art is available this session. */
export function hasGameLogo(game: GameMeta): boolean {
  return Boolean(game.logo) && !missingCache[game.id];
}
