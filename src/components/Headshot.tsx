import { useState } from 'react';
import { initials } from '../lib/util';

/**
 * Candidate headshot with graceful fallback. While `url` is undefined we show a
 * shimmer; if it's null or fails to load we show an initials gradient so the
 * card never looks broken.
 */
export function Headshot({
  url,
  name,
  className = '',
}: {
  url: string | null | undefined;
  name: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (url === undefined) {
    return <div className={`animate-pulse bg-white/10 ${className}`} />;
  }

  if (!url || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-night-600 to-night-800 ${className}`}
      >
        <span className="font-display text-6xl font-extrabold text-white/70">
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      draggable={false}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
