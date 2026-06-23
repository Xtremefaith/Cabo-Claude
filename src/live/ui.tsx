// Small UI bits shared across the live game screens.

import { useEffect, useState } from 'react';
import { Button, Screen } from '../components/ui';

/** Top bar with a phase title and a confirm-to-leave button. */
export function LiveHeader({ title, onQuit }: { title: string; onQuit: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <span className="font-display text-lg font-extrabold">{title}</span>
      <button
        onClick={() => {
          if (confirm('Leave the live game?')) onQuit();
        }}
        className="glass flex h-8 w-8 items-center justify-center rounded-full text-white/70 active:scale-90"
        aria-label="Leave"
      >
        ✕
      </button>
    </div>
  );
}

/** Full-screen message + a single "Home" button (no session / no player / errors). */
export function LiveFallback({
  title,
  body,
  onHome,
}: {
  title: string;
  body: string;
  onHome: () => void;
}) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl font-extrabold">{title}</p>
        <p className="max-w-xs font-body text-white/55">{body}</p>
        <Button onClick={onHome}>Home</Button>
      </div>
    </Screen>
  );
}

/** Ticking clock for question timers; only runs while `active`. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active]);
  return now;
}
