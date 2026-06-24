export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older engines: RFC4122-ish v4.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/**
 * Pick up to `n` items, preferring ones not yet `seen`. Unseen items (shuffled)
 * come first, then already-seen ones (also shuffled) only to top up if there
 * aren't enough fresh. Used so a live room exhausts the whole prompt pool before
 * ever repeating a question the group has already played.
 */
export function pickFreshFirst<T>(arr: T[], n: number, seen: (item: T) => boolean): T[] {
  const fresh = shuffle(arr.filter((x) => !seen(x)));
  if (fresh.length >= n) return fresh.slice(0, n);
  const used = shuffle(arr.filter((x) => seen(x)));
  return [...fresh, ...used].slice(0, n);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const PLAYER_COLORS = ['#ff3d77', '#ffb347', '#39c0d6', '#9b6bff', '#52e0a0', '#ff7a59'];

export function pickPlayerColor(existingCount: number): string {
  return PLAYER_COLORS[existingCount % PLAYER_COLORS.length];
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Read an image File, center-crop it to a square, downscale to `size`px, and
 * return a JPEG data URL. Keeps player photos tiny (~10–25KB) so they fit
 * comfortably in localStorage alongside the rest of the store.
 */
export async function fileToSquareDataUrl(file: File, size = 256): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error ?? new Error('read failed'));
    fr.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('image decode failed'));
    i.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // extremely unlikely; fall back to the original

  // Center-crop to a square so portraits/landscapes both fill the circle.
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.82);
}
