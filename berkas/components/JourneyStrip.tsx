'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import PhotoLightbox from './PhotoLightbox';

/* A curated spread across all three collections, mixed orientations. */
const PHOTOS = [
  { src: '/images/events/jo14.jpeg', alt: 'Outdoor collection — photo 2 of 18', width: 1333, height: 2000 },
  { src: '/images/candid/DSC09292.jpeg', alt: 'Candid collection — photo 1 of 23', width: 1126, height: 2000 },
  { src: '/images/golden-hour/IMG_4205.JPG', alt: 'Beauty shoot collection — photo 1 of 19', width: 1333, height: 2000 },
  { src: '/images/events/jo21.jpeg', alt: 'Outdoor collection — photo 6 of 18', width: 2000, height: 1125 },
  { src: '/images/candid/DSC09297.jpeg', alt: 'Candid collection — photo 2 of 23', width: 2000, height: 1126 },
  { src: '/images/golden-hour/IMG_4208.JPG', alt: 'Beauty shoot collection — photo 4 of 19', width: 2000, height: 1333 },
  { src: '/images/events/jo34.jpeg', alt: 'Outdoor collection — photo 12 of 18', width: 1125, height: 2000 },
  { src: '/images/candid/DSC09348.jpeg', alt: 'Candid collection — photo 5 of 23', width: 1126, height: 2000 },
  { src: '/images/golden-hour/IMG_4213.JPG', alt: 'Beauty shoot collection — photo 9 of 19', width: 1333, height: 2000 },
] as const;

const LEAD_PEEK = 64;
const EDGE_PADDING = 24;

export default function JourneyStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const distance = trackWidth - window.innerWidth + EDGE_PADDING * 2;
      setScrollDistance(Math.max(0, distance));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Progress spans exactly the section's own time crossing the viewport —
  // no extra scroll track needed, unlike MottoSection's pinned reveal.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [LEAD_PEEK, -scrollDistance]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-32 sm:py-44">
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex w-max gap-5 px-6 sm:gap-8 sm:px-10"
      >
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open ${photo.alt}`}
            className="group relative h-[280px] w-[200px] shrink-0 overflow-hidden rounded-[16px] border border-graphite bg-ashstone shadow-lg transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] sm:h-[380px] sm:w-[270px]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 200px, 270px"
              className="object-cover"
            />
          </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={PHOTOS}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
