import { type ReactNode } from 'react';

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

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="text-center">
      <h1
        className={`font-display font-extrabold leading-none tracking-tight ${
          small ? 'text-2xl' : 'text-5xl'
        }`}
      >
        <span className="bg-gradient-to-r from-hot via-sun to-not bg-clip-text text-transparent">
          Cabo
        </span>{' '}
        <span className="text-white">Claude</span>
      </h1>
      {!small && (
        <p className="mt-2 font-body text-sm font-bold uppercase tracking-[0.3em] text-white/50">
          Arcade
        </p>
      )}
    </div>
  );
}
