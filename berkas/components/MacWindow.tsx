'use client';

import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const;
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function MacWindow({
  address,
  onClose,
  closeLabel,
  maxWidth = 'max-w-3xl',
  zIndexClass = 'z-[80]',
  children,
}: {
  address: string;
  onClose: () => void;
  closeLabel: string;
  maxWidth?: string;
  zIndexClass?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center bg-pearl/60 p-3 backdrop-blur-md sm:p-10`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-graphite bg-void shadow-2xl`}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-graphite bg-ashstone px-4 py-3 sm:px-5">
          <div aria-hidden className="flex gap-2">
            {TRAFFIC_LIGHTS.map((c) => (
              <span key={c} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="flex-1 truncate text-center text-[12px] text-mist">{address}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-pearl transition-colors hover:bg-graphite/40"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </motion.div>
    </motion.div>
  );
}
