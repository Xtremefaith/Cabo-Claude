// Synthwave-sunset backdrop for the arcade home screen: gradient sky, a retro
// slatted sun, a few twinkling stars, palm silhouettes, and a moving neon grid.
// Purely decorative — sits behind the content and ignores pointer events.

const STARS = [
  { top: '8%', left: '14%', d: '0s' },
  { top: '12%', left: '78%', d: '0.6s' },
  { top: '5%', left: '52%', d: '1.2s' },
  { top: '20%', left: '32%', d: '1.8s' },
  { top: '16%', left: '64%', d: '0.9s' },
  { top: '24%', left: '88%', d: '1.5s' },
  { top: '10%', left: '40%', d: '2.1s' },
];

export function HomeBackground() {
  return (
    <div className="cabo-sunset pointer-events-none absolute inset-0 overflow-hidden">
      {/* stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{ top: s.top, left: s.left, animation: `twinkle 3s ease-in-out ${s.d} infinite` }}
        />
      ))}

      {/* retro sun */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2">
        <div className="cabo-sun relative overflow-hidden">
          <div className="absolute inset-0 cabo-sun-slats" />
        </div>
      </div>

      {/* palm silhouettes */}
      <Palm className="absolute bottom-[20%] left-[-10px] h-44 w-auto opacity-90" />
      <Palm className="absolute bottom-[19%] right-[-12px] h-52 w-auto scale-x-[-1] opacity-90" />

      {/* neon grid floor */}
      <div className="cabo-grid" />

      {/* readability fades top & bottom */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night-900/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night-900 via-night-900/70 to-transparent" />
    </div>
  );
}

function Palm({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="#0a0820" aria-hidden>
      {/* trunk */}
      <path
        d="M58 200c-4-46-6-92-2-128 1-9 3-18 7-26l5 2c-4 8-6 17-7 26-3 36-1 82 3 126z"
        fill="#0a0820"
      />
      {/* fronds */}
      <g fill="#0a0820">
        <path d="M62 46C46 30 26 24 6 26c18 4 33 14 47 28z" />
        <path d="M62 46C54 24 38 8 16 2c16 12 27 28 34 48z" />
        <path d="M64 46C74 26 94 12 116 10c-18 8-32 22-42 40z" />
        <path d="M64 46c14-14 34-22 54-20-18 2-35 11-48 26z" />
        <path d="M63 44c-2-14-2-30 4-44-2 14-1 30 2 44z" />
      </g>
      <circle cx="62" cy="46" r="6" fill="#0a0820" />
    </svg>
  );
}
