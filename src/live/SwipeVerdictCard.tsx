// A draggable "send them up or down" card for live Heaven or Hell. It mirrors
// Hot or Not's SwipeCard (framer-motion drag + fling) but is generic about the
// visual (headshot or crew avatar) and stamps HEAVEN (right) / HELL (left).
//
// Right = heaven, left = hell. Drag past the threshold (or fling with velocity),
// or call `swipe()` via ref from the 😇 / 😈 buttons. Either way it flings off
// screen and reports the verdict exactly once.

import { forwardRef, useImperativeHandle, type ReactNode } from 'react';
import { motion, useAnimationControls, useMotionValue, useTransform } from 'framer-motion';

export interface SwipeVerdictHandle {
  swipe: (heaven: boolean) => void;
}

interface Props {
  name: string;
  blurb: string;
  /** The card art (a filled Headshot / avatar element). */
  visual: ReactNode;
  onDecide: (heaven: boolean) => void;
}

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 600;

export const SwipeVerdictCard = forwardRef<SwipeVerdictHandle, Props>(function SwipeVerdictCard(
  { name, blurb, visual, onDecide },
  ref,
) {
  const x = useMotionValue(0);
  const controls = useAnimationControls();

  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
  const heavenOpacity = useTransform(x, [20, 130], [0, 1]);
  const hellOpacity = useTransform(x, [-130, -20], [1, 0]);

  const fling = (heaven: boolean) => {
    const dir = heaven ? 1 : -1;
    controls
      .start({ x: dir * 700, opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } })
      .then(() => onDecide(heaven));
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
        {visual}

        {/* readability gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* prompt tag */}
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 font-body text-xs font-extrabold uppercase tracking-widest text-white/80 backdrop-blur">
          ⚖️ Heaven or Hell?
        </span>

        {/* HEAVEN stamp (right) */}
        <motion.div
          style={{ opacity: heavenOpacity }}
          className="pointer-events-none absolute right-5 top-6 -rotate-12 rounded-xl border-4 border-sky-400 px-4 py-1 font-display text-3xl font-extrabold uppercase text-sky-300"
        >
          Heaven
        </motion.div>
        {/* HELL stamp (left) */}
        <motion.div
          style={{ opacity: hellOpacity }}
          className="pointer-events-none absolute left-5 top-6 rotate-12 rounded-xl border-4 border-red-500 px-4 py-1 font-display text-3xl font-extrabold uppercase text-red-400"
        >
          Hell
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow">
            {name}
          </h2>
          <p className="font-body text-sm font-bold text-white/70">{blurb}</p>
        </div>
      </div>
    </motion.div>
  );
});
