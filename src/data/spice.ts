// Shared 1–5 "spice" scale used by group settings and game prompt decks.

export const MIN_SPICE = 1;
export const MAX_SPICE = 5;
export const DEFAULT_SPICE = 3;

export const SPICE_LABELS: Record<number, string> = {
  1: 'Squeaky clean',
  2: 'Playful',
  3: 'A little spicy',
  4: 'Bring the heat',
  5: 'Unhinged',
};

export function clampSpice(n: number): number {
  return Math.max(MIN_SPICE, Math.min(MAX_SPICE, Math.round(n)));
}
