import { type ReactNode, useState } from 'react';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="cabo-bg no-select min-h-full w-full">
      <div
        className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'hot' | 'not';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className = '',
  type = 'button',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display text-lg font-extrabold tracking-wide transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';
  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-hot to-sun text-night-900 shadow-glow-hot hover:brightness-110',
    ghost: 'glass text-white hover:bg-white/10',
    hot: 'bg-hot text-white shadow-glow-hot',
    not: 'bg-not text-night-900 shadow-glow-not',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xl text-white/80 active:scale-90"
      aria-label="Back"
    >
      ‹
    </button>
  );
}

// Drop the official logo art at `public/logo.png` and it replaces the wordmark
// automatically. Until then (or if it fails to load) the neon wordmark below
// stands in. Module-scoped flag avoids retrying a missing file every render.
const LOGO_SRC = './logo.png';
let rasterUnavailable = false;

export function Logo({ small = false }: { small?: boolean }) {
  const [useWordmark, setUseWordmark] = useState(rasterUnavailable);

  if (!useWordmark) {
    return (
      <div className="text-center">
        <img
          src={LOGO_SRC}
          alt="Claude Cabo"
          draggable={false}
          onError={() => {
            rasterUnavailable = true;
            setUseWordmark(true);
          }}
          className={`mx-auto w-auto ${small ? 'h-12' : 'h-56 max-w-full'}`}
        />
      </div>
    );
  }

  return <Wordmark small={small} />;
}

function Wordmark({ small }: { small: boolean }) {
  if (small) {
    return (
      <span className="font-script text-2xl leading-none">
        <span className="neon-pink">Claude</span>{' '}
        <span className="neon-teal font-display font-extrabold uppercase">Cabo</span>
      </span>
    );
  }
  return (
    <div className="text-center">
      <div className="font-script text-6xl leading-none neon-pink">Claude</div>
      <div className="-mt-1 font-display text-6xl font-extrabold uppercase tracking-wide neon-teal">
        Cabo
      </div>
      <p className="mt-3 font-body text-xs font-bold uppercase tracking-[0.35em] text-sun/80">
        Arcade of Social Games
      </p>
    </div>
  );
}
