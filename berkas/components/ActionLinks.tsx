'use client';

import { motion } from 'framer-motion';
import { BOOKING_URL } from '@/lib/links';

export default function ActionLinks() {
  return (
    <motion.nav
      aria-label="Booking"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative z-10 flex flex-col items-center gap-6 px-6 pb-28 pt-4"
    >
      <h2 className="text-center text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#123C57] sm:text-[28px]">
        Your Moments,
        <br />
        Last Forever.
      </h2>
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-arcane-deep px-8 text-[15px] font-medium text-pearl transition-colors duration-200 hover:bg-arcane-deep hover:text-void active:scale-[0.97]"
      >
        Book your slots now
      </a>
    </motion.nav>
  );
}
