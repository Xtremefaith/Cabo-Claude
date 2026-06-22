import { initials } from '../lib/util';
import type { Player } from '../types';

export function PlayerAvatar({
  player,
  size = 56,
}: {
  player: Player;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-extrabold text-night-900"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `radial-gradient(circle at 30% 25%, #ffffff55, ${player.color})`,
        boxShadow: `0 0 18px -4px ${player.color}`,
      }}
    >
      {initials(player.name)}
    </div>
  );
}
