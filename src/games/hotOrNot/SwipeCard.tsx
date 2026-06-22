import { forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimationControls, useMotionValue, useTransform } from 'framer-motion';
import { Headshot } from '../../components/Headshot';
import type { Candidate } from '../../types';

export interface SwipeCardHandle {
  swipe: (hot: boolean) => void;
}

interface Props {
  candidate: Candidate;
  imageUrl: string | null | undefined;
  onDecide: (hot: boolean) => void;
}

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 600;

/**
 * A single draggable card. Drag past the threshold (or fling with velocity), or
 * call `swipe()` via ref from the HOT/NOT buttons. Either way it flings off
 * screen and reports the decision exactly once.
 */
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { candidate, imageUrl, onDecide },
  ref,
) {
  const x = useMotionValue(0);
  const controls = useAnimationControls();

  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
  const hotOpacity = useTransform(x, [20, 130], [0, 1]);
  const notOpacity = useTransform(x, [-130, -20], [1, 0]);

  const fling = (hot: boolean) => {
    const dir = hot ? 1 : -1;
    controls
      .start({
        x: dir * 700,
        opacity: 0,
        transition: { duration: 0.28, ease: 'easeIn' },
      })
      .then(() => onDecide(hot));
  };

  useImperativeHandle(ref, () => ({ swipe: fling }));

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      animate={controls}
      whileTap={{ scale: 0.98 }}
      onDragEnd={(_, info) => {
        const past = Math.abs(info.offset.x) > SWIPE_THRESHOLD;
        const flung = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;
        if (past || flung) {
          fling(info.offset.x > 0);
        } else {
          controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
        }
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-night-800 shadow-card">
        <Headshot url={imageUrl} name={candidate.name} className="h-full w-full" />

        {/* readability gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* category tag */}
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 font-body text-xs font-extrabold uppercase tracking-widest text-white/80 backdrop-blur">
          🎤 Comedian
        </span>

        {/* HOT stamp */}
        <motion.div
          style={{ opacity: hotOpacity }}
          className="pointer-events-none absolute right-5 top-6 -rotate-12 rounded-xl border-4 border-hot px-4 py-1 font-display text-3xl font-extrabold uppercase text-hot"
        >
          Hot
        </motion.div>
        {/* NOT stamp */}
        <motion.div
          style={{ opacity: notOpacity }}
          className="pointer-events-none absolute left-5 top-6 rotate-12 rounded-xl border-4 border-not px-4 py-1 font-display text-3xl font-extrabold uppercase text-not"
        >
          Not
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow">
            {candidate.name}
          </h2>
          <p className="font-body text-sm font-bold text-white/70">{candidate.blurb}</p>
        </div>
      </div>
    </motion.div>
  );
});
