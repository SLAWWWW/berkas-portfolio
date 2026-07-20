'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/* "Last Forever." sits on its own line below "Your Moments," — a deliberate
   break, not just wherever flex-wrap happens to land at a given width. */
const LINES = [['Your', 'Moments,'], ['Last', 'Forever.']];
const WORDS = LINES.flat();

/*
  A deliberately long, pinned scroll track: each word gets its own slice of
  scroll distance to sharpen into focus and then HOLD there before the next
  word starts — so by the time the section releases (progress reaches 1) and
  the next section can come into view, every word has unmistakably finished
  revealing. A leading and trailing buffer give the opening and closing
  moments room to breathe instead of the effect starting/ending abruptly.
*/
const LEAD = 0.06;
const TAIL = 0.12;
const TRANSITION_FRACTION = 0.55;

function wordWindow(index: number, total: number): [number, number] {
  const activeRange = 1 - LEAD - TAIL;
  const slot = activeRange / total;
  const slotStart = LEAD + index * slot;
  return [slotStart, slotStart + slot * TRANSITION_FRACTION];
}

export default function MottoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={containerRef} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-y-2 px-6 text-center text-[clamp(2.75rem,9vw,6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        {LINES.map((line, lineIndex) => {
          const lineStart = LINES.slice(0, lineIndex).reduce((sum, l) => sum + l.length, 0);
          return (
            <p key={lineIndex} className="flex flex-wrap justify-center gap-x-4">
              {line.map((word, i) => (
                <Word
                  key={word}
                  word={word}
                  revealWindow={wordWindow(lineStart + i, WORDS.length)}
                  progress={scrollYProgress}
                />
              ))}
            </p>
          );
        })}
      </div>
    </section>
  );
}

function Word({
  word,
  revealWindow,
  progress,
}: {
  word: string;
  revealWindow: [number, number];
  progress: MotionValue<number>;
}) {
  // Encodes the "fade in" via the alpha channel of the colour itself, rather
  // than a separate `opacity` style — combining a standalone opacity motion
  // value with these on the same element didn't apply correctly in testing.
  const color = useTransform(progress, revealWindow, [
    'rgba(18, 60, 87, 0.16)', // deep navy, faint
    'rgba(18, 60, 87, 1)', // deep navy, fully revealed
  ]);
  const blurAmount = useTransform(progress, revealWindow, [6, 0]);
  const filter = useTransform(blurAmount, (b) => `blur(${b}px)`);

  return (
    <motion.span style={{ color, filter }}>
      {word}
    </motion.span>
  );
}
