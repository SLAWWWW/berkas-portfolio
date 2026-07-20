'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SWIPE_THRESHOLD = 60;

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: readonly { src: string; alt: string; width: number; height: number }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const canNavigate = photos.length > 1;
  const goPrev = () => onNavigate((index - 1 + photos.length) % photos.length);
  const goNext = () => onNavigate((index + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (canNavigate && e.key === 'ArrowLeft') goPrev();
      if (canNavigate && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos.length]);

  const photo = photos[index];

  return (
    <motion.div
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="fixed inset-0 z-[200] flex flex-col bg-pearl"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-[13px] tracking-[0.04em] text-vellum/70">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-void/90 text-pearl shadow-md"
        >
          ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo.src}
            drag={canNavigate ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onClick={(e) => e.stopPropagation()}
            onDragEnd={(_, info) => {
              if (!canNavigate) return;
              if (info.offset.x > SWIPE_THRESHOLD) goPrev();
              else if (info.offset.x < -SWIPE_THRESHOLD) goNext();
            }}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex max-h-full max-w-full cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="96vw"
              priority
              draggable={false}
              className="pointer-events-none max-h-[82vh] max-w-[96vw] w-auto select-none rounded-[4px] object-contain shadow-2xl sm:max-h-[90vh] sm:max-w-[92vw]"
            />
          </motion.div>
        </AnimatePresence>

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
              className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-void/80 text-pearl shadow-md sm:left-4"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-void/80 text-pearl shadow-md sm:right-4"
            >
              ›
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
