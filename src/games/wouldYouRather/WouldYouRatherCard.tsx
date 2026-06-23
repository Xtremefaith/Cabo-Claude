import { forwardRef, useImperativeHandle } from 'react';
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { WouldYouRatherPrompt } from '../../data/wouldYouRatherPrompts';

export interface WouldYouRatherCardHandle {
  choose: (choice: 'a' | 'b') => void;
}

interface Props {
  prompt: WouldYouRatherPrompt;
  onDecide: (choice: 'a' | 'b') => void;
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 600;

/**
 * The either/or card. Option A is the left half, option B the right half, split
 * by a neon VS. Drag/fling left to pick A, right to pick B — or just tap a side.
 * Calling `choose()` via ref lets the on-screen buttons drive the same fling.
 * Reports the decision exactly once.
 */
export const WouldYouRatherCard = forwardRef<WouldYouRatherCardHandle, Props>(
  function WouldYouRatherCard({ prompt, onDecide }, ref) {
    const x = useMotionValue(0);
    const controls = useAnimationControls();

    const rotate = useTransform(x, [-260, 0, 260], [-10, 0, 10]);
    // Light up whichever side you're leaning toward.
    const aActive = useTransform(x, [-110, -20], [1, 0]);
    const bActive = useTransform(x, [20, 110], [0, 1]);

    const fling = (choice: 'a' | 'b') => {
      const dir = choice === 'a' ? -1 : 1;
      controls
        .start({ x: dir * 700, opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } })
        .then(() => onDecide(choice));
    };

    useImperativeHandle(ref, () => ({ choose: fling }));

    return (
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        animate={controls}
        onDragEnd={(_, info) => {
          const past = Math.abs(info.offset.x) > SWIPE_THRESHOLD;
          const flung = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;
          if (past || flung) {
            fling(info.offset.x > 0 ? 'b' : 'a');
          } else {
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
          }
        }}
      >
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-night-800 shadow-card">
          {/* Option A */}
          <OptionHalf
            label={prompt.optionA}
            side="left"
            active={aActive}
            className="bg-gradient-to-br from-hot/30 to-hot/5"
            accent="text-hot"
          />

          {/* VS divider sitting on the seam between the two options */}
          <div className="relative z-10 flex h-0 items-center justify-center">
            <span className="rounded-full border border-white/15 bg-night-900 px-4 py-1 font-display text-xl font-extrabold text-white shadow-card">
              VS
            </span>
          </div>

          {/* Option B */}
          <OptionHalf
            label={prompt.optionB}
            side="right"
            active={bActive}
            className="bg-gradient-to-tr from-not/5 to-not/30"
            accent="text-not"
          />
        </div>
      </motion.div>
    );
  },
);

function OptionHalf({
  label,
  side,
  active,
  className,
  accent,
}: {
  label: string;
  side: 'left' | 'right';
  active: MotionValue<number>;
  className: string;
  accent: string;
}) {
  return (
    <div
      className={`relative flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center ${className}`}
    >
      {/* highlight ring as you lean this way */}
      <motion.div
        style={{ opacity: active }}
        className={`pointer-events-none absolute inset-0 ring-4 ring-inset ${
          side === 'left' ? 'ring-hot' : 'ring-not'
        }`}
      />
      <span className={`font-body text-xs font-extrabold uppercase tracking-[0.3em] ${accent}`}>
        {side === 'left' ? '👈 Swipe left' : 'Swipe right 👉'}
      </span>
      <span className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow">
        {label}
      </span>
    </div>
  );
}
