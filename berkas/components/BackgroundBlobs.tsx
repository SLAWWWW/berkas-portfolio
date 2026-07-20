'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/*
  A macOS-wallpaper-style backdrop: a soft gradient wash with slow-drifting
  blurred colour, plus gentle scroll parallax — the frosted-glass folder and
  windows sit on top of this. Fixed, so it reads as a desktop wallpaper
  rather than page content.
*/
const BLOBS = [
  {
    position: 'left-[-10%] top-[-15%]',
    size: 'h-[60vh] w-[60vh] bg-arcane/25',
    duration: 26,
    range: [0, 40, -20, 0],
    parallax: 70,
  },
  {
    position: 'right-[-15%] top-[20%]',
    size: 'h-[55vh] w-[55vh] bg-arcane-deep/20',
    duration: 32,
    range: [0, -30, 25, 0],
    parallax: -100,
  },
  {
    position: 'left-[15%] bottom-[-20%]',
    size: 'h-[50vh] w-[50vh] bg-arcane/20',
    duration: 29,
    range: [0, 25, -35, 0],
    parallax: 130,
  },
] as const;

export default function BackgroundBlobs() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-void via-obsidian to-ashstone"
    >
      {BLOBS.map((blob, i) => (
        <Blob key={i} blob={blob} reducedMotion={reducedMotion} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function Blob({
  blob,
  reducedMotion,
  scrollYProgress,
}: {
  blob: (typeof BLOBS)[number];
  reducedMotion: boolean | null;
  scrollYProgress: MotionValue<number>;
}) {
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : blob.parallax]);

  return (
    <motion.div className={`absolute ${blob.position}`} style={{ y: parallaxY }}>
      <motion.div
        className={`rounded-full blur-[110px] ${blob.size}`}
        animate={
          reducedMotion
            ? undefined
            : { x: [...blob.range], y: blob.range.map((v) => -v) }
        }
        transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
