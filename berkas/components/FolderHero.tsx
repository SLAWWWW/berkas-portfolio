'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { PORTFOLIO } from '@/data/portfolio';
import CoverWindow from './CoverWindow';
import PortfolioGallery from './PortfolioGallery';
import PhotoLightbox from './PhotoLightbox';

/* macOS traffic lights — exact values fixed by the spec (§3.1). */
const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const;

const TILT_SPRING = { stiffness: 180, damping: 22 };
const FLAP_SPRING = { type: 'spring', stiffness: 120, damping: 13 } as const;
const REDUCED_TWEEN = { duration: 0.2, ease: 'easeOut' } as const;
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/* rotateZ spread for the three cards fanning out of the folder — locked by spec (§3.1) */
const CARD_ROTATE = [-14, 0, 14] as const;
const MAX_ROTATE = 14;

/*
  Fan travel distance + card size scale down under 480px. The hero now
  reserves a full viewport of height (see the section className below) so
  there's real headroom for a much bigger, more dramatic fan-out on every
  screen size, not just desktop.

  x is the DESIRED travel distance on a screen with room to spare — the
  actual value used is clamped per-render against the real viewport width
  (see `safeOffset` below), since a rotated card's on-screen bounding box is
  noticeably wider than its own w — a 140×184 card rotated 14° reads as
  ~180px wide, not 140, and the naive fixed-pixel offsets that ignored this
  caused real overflow on viewports between the compact/default breakpoints.
*/
const FAN = {
  default: { x: [-190, 0, 190], y: -260, w: 240, h: 316 },
  compact: { x: [-75, 0, 75], y: -150, w: 140, h: 184 },
} as const;

const FAN_SAFETY_MARGIN = 12;
const FAN_MIN_OFFSET = 24;

function rotatedHalfWidth(w: number, h: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return (w * Math.abs(Math.cos(rad)) + h * Math.abs(Math.sin(rad))) / 2;
}

function safeFanOffset(viewportWidth: number, w: number, h: number, desiredOffset: number) {
  if (viewportWidth <= 0) return desiredOffset;
  const half = rotatedHalfWidth(w, h, MAX_ROTATE);
  const maxSafe = viewportWidth / 2 - half - FAN_SAFETY_MARGIN;
  return Math.max(FAN_MIN_OFFSET, Math.min(desiredOffset, maxSafe));
}

/* How long the flap-lift + card-burst plays before the view warps into the
   CoverWindow "dimension" — long enough to register as a distinct beat,
   short enough that it reads as one continuous gesture rather than a wait. */
const COVER_WINDOW_DELAY = 450;

export default function FolderHero() {
  const [open, setOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [showCoverWindow, setShowCoverWindow] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<number | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const constraintsRef = useRef<HTMLElement>(null);
  const wasDraggingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    setIsCompact(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Replays the light-burst every time the folder opens (not on close).
  useEffect(() => {
    if (open) setBurstKey((k) => k + 1);
  }, [open]);

  // The flap-lift + card-burst plays first, then the view warps into the
  // CoverWindow "dimension" — the folder itself is the trigger, not the
  // final resting state.
  useEffect(() => {
    if (!open) {
      setShowCoverWindow(false);
      return;
    }
    const t = setTimeout(() => setShowCoverWindow(true), COVER_WINDOW_DELAY);
    return () => clearTimeout(t);
  }, [open]);

  const closeEverything = () => {
    setOpen(false);
    setShowCoverWindow(false);
  };

  const fanBase = isCompact ? FAN.compact : FAN.default;
  const fanOffset = safeFanOffset(viewportWidth, fanBase.w, fanBase.h, fanBase.x[2]);
  const fan = { ...fanBase, x: [-fanOffset, 0, fanOffset] };
  const flapTransition = reducedMotion ? REDUCED_TWEEN : FLAP_SPRING;

  const cardsContainerVariants = useMemo(
    () => ({
      open: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
      closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
    }),
    [],
  );

  const cardVariants = useMemo(
    () => ({
      open: (i: number) => ({
        x: fan.x[i],
        y: fan.y,
        rotate: CARD_ROTATE[i],
        scale: 1,
        opacity: 1,
        transition: flapTransition,
      }),
      closed: {
        x: 0,
        y: 26,
        rotate: 0,
        scale: 0.4,
        opacity: 0,
        transition: flapTransition,
      },
    }),
    [fan, flapTransition],
  );

  /* Normalised cursor position over the hero, -0.5 … 0.5 */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  /* Resting pose ~8deg / -4deg; cursor drives ±12deg / ±8deg (§3.1) */
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [20, -4]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 4]), TILT_SPRING);

  /* The ambient glow drifts against the tilt */
  const glowX = useSpring(useTransform(mx, (v) => v * -36), TILT_SPRING);
  const glowY = useSpring(useTransform(my, (v) => v * -30), TILT_SPRING);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    mx.set(0);
    my.set(0);
  };

  const toggle = () => {
    // framer-motion can still fire onTap right after a completed drag on the
    // same element — swallow that one spurious tap rather than toggling.
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <section
      ref={constraintsRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="relative flex min-h-[100dvh] flex-1 items-center justify-center px-6 pb-10 pt-28 sm:pt-32"
    >
      {/*
        Glow + burst live in their own clipping box — both scale well past
        the viewport at times (the burst up to 2.4x), and unlike the folder
        or fanned cards they're purely decorative, so clipping them here
        can't cut off anything that's supposed to stay visible. Scoped to
        this element rather than html/body, which would fight position:sticky
        elsewhere on the page (see MottoSection).
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Ambient arcane glow — shifts with tilt, breathes open */}
        <motion.div
          className="absolute inset-0 m-auto h-[46%] w-[min(86vw,580px)] rounded-full bg-[radial-gradient(closest-side,theme(colors.arcane-glow),transparent_72%)] blur-3xl"
          style={{ x: glowX, y: glowY }}
          animate={{ scale: open ? 1.15 : 1, opacity: open ? 1 : 0.8 }}
          transition={{ duration: 0.8, ease: EASE }}
        />

        {/* Light burst — a quick flash the instant the folder opens */}
        {open && (
          <motion.div
            key={burstKey}
            initial={{ opacity: 0.85, scale: 0.25 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
            className="absolute inset-0 m-auto h-[42%] w-[min(70vw,460px)] rounded-full bg-[radial-gradient(closest-side,theme(colors.arcane),transparent_70%)] blur-2xl"
          />
        )}
      </div>

      <div className="relative" style={{ perspective: 1800 }}>
        {/* Entrance + idle drift */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={
            reducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -8, 0] }
          }
          transition={{
            opacity: { duration: 0.9, ease: EASE, delay: 0.1 },
            scale: { duration: 0.9, ease: EASE, delay: 0.1 },
            y: { duration: 6.5, ease: 'easeInOut', repeat: Infinity },
          }}
        >
          {/* The folder — tilts with the cursor, draggable, tap to open */}
          <motion.div
            role="button"
            tabIndex={0}
            aria-expanded={open}
            aria-label={`${open ? 'Close folder' : 'Open folder'}. SESSION OPEN. [berkas.] — Tap to open.`}
            onTap={toggle}
            onKeyDown={(e) => {
              // Enter is already handled by framer-motion's built-in keyboard
              // press support (it synthesizes pointerdown/up on Enter and
              // fires onTap) — handling it here too would double-toggle.
              // Space isn't covered by that behavior, so it's wired manually.
              if (e.key === ' ') {
                e.preventDefault();
                toggle();
              }
            }}
            drag={!reducedMotion}
            dragConstraints={constraintsRef}
            dragElastic={0.18}
            dragSnapToOrigin
            onDragStart={() => {
              wasDraggingRef.current = true;
            }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative aspect-[10/7] w-[min(82vw,700px)] cursor-pointer select-none outline-none"
          >
            {/* Back panel + tab */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[28px] border border-graphite bg-obsidian [transform:translateZ(-32px)]"
            >
              <div className="absolute -top-[28px] left-[6%] h-7 w-[34%] rounded-t-[16px] border border-b-0 border-graphite bg-obsidian">
                {/* the folder highlight — arcane */}
                <div className="absolute inset-x-[10px] top-0 h-px bg-arcane opacity-60" />
              </div>
              {/* cavity — faint luminous interior, visible once the flap lifts */}
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(70%_55%_at_50%_28%,theme(colors.arcane-glow),transparent)]" />
            </div>

            {/* Front flap — lifts to 110deg; its inside face is vellum */}
            <motion.div
              className="absolute inset-0 origin-bottom [transform-style:preserve-3d]"
              initial={false}
              animate={{ rotateX: open ? 110 : 0 }}
              transition={flapTransition}
            >
              {/* outer face — frosted glass over the drifting background blobs */}
              <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-graphite bg-ashstone/60 backdrop-blur-2xl [backface-visibility:hidden]">
                {/* arcane accent trim */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arcane-trace to-transparent" />
                <div className="absolute inset-x-0 top-14 h-px bg-graphite" />

                {/* traffic lights */}
                <div className="absolute left-5 top-5 flex gap-2.5">
                  {TRAFFIC_LIGHTS.map((c) => (
                    <span
                      key={c}
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* SESSION OPEN — center top, mask-reveals upward (§3.1) */}
                <div className="absolute inset-x-0 top-5 text-center">
                  <motion.span
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    animate={{ clipPath: 'inset(0% 0 0 0)' }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                    className="inline-block text-[14px] font-semibold uppercase tracking-[0.18em] text-arcane-ink"
                  >
                    SESSION OPEN
                  </motion.span>
                </div>

                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 pt-10 text-center">
                  <motion.h1
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    animate={{ clipPath: 'inset(0% 0 0 0)' }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
                    className="text-[clamp(3.5rem,10vw,7rem)] font-bold leading-[0.98] tracking-[-0.04em] text-pearl"
                  >
                    [berkas.]
                  </motion.h1>
                  <motion.p
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    animate={{ clipPath: 'inset(0% 0 0 0)' }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                    className="text-[18px] font-light text-mist"
                  >
                    Tap to open
                  </motion.p>
                </div>
              </div>

              {/* inner face — vellum, the paper-meets-digital moment */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[28px] border border-graphite bg-vellum [backface-visibility:hidden] [transform:rotateX(180deg)]"
              />
            </motion.div>

            {/*
              The three photo cards — a purely decorative burst (§3.1) that
              plays as the folder opens, then hands off to CoverWindow below
              once it fades in. Placed AFTER the flap in DOM order so they'd
              win hit-testing over it if they ever overlapped it visually —
              moot now that they're non-interactive, but harmless to keep.
            */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 [transform:translateZ(40px)]"
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={cardsContainerVariants}
            >
              {CARD_ROTATE.map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  className={cn(
                    'absolute left-1/2 top-1/2',
                    isCompact
                      ? '-ml-[70px] -mt-[92px] h-[184px] w-[140px]'
                      : '-ml-[120px] -mt-[158px] h-[316px] w-[240px]',
                  )}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-graphite bg-vellum shadow-2xl">
                    <Image
                      src={PORTFOLIO[i].cover.src}
                      alt={PORTFOLIO[i].cover.alt}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-3 rounded-[10px] border border-white/40" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Dimension one — the folder opens into a window showing the 3 covers */}
      <AnimatePresence>
        {showCoverWindow && (
          <CoverWindow onClose={closeEverything} onSelect={(i) => setOpenCategory(i)} />
        )}
      </AnimatePresence>

      {/* Dimension two — picking a cover opens another window with its full portfolio */}
      <AnimatePresence>
        {openCategory !== null && (
          <PortfolioGallery
            category={PORTFOLIO[openCategory]}
            onClose={() => setOpenCategory(null)}
            onOpenPhoto={(i) => setLightboxPhoto(i)}
          />
        )}
      </AnimatePresence>

      {/* Single-photo view, reached from within the gallery — supports prev/next + swipe */}
      <AnimatePresence>
        {openCategory !== null && lightboxPhoto !== null && (
          <PhotoLightbox
            photos={PORTFOLIO[openCategory].photos}
            index={lightboxPhoto}
            onClose={() => setLightboxPhoto(null)}
            onNavigate={setLightboxPhoto}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
