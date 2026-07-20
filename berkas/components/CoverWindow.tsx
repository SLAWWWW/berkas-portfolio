'use client';

import Image from 'next/image';
import MacWindow from './MacWindow';
import { PORTFOLIO } from '@/data/portfolio';

export default function CoverWindow({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <MacWindow address="berkas.my.id/work" onClose={onClose} closeLabel="Close" maxWidth="max-w-4xl">
      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {PORTFOLIO.map((cat, i) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Open ${cat.title} portfolio`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[14px] border border-graphite bg-ashstone"
            >
              <Image
                src={cat.cover.src}
                alt={cat.cover.alt}
                fill
                sizes="(max-width: 640px) 90vw, 30vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pearl/85 to-transparent p-4 pt-10">
                <div className="text-[17px] font-bold text-vellum">{cat.title}</div>
                <div className="text-[13px] text-vellum/70">{cat.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MacWindow>
  );
}
