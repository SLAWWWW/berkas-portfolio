'use client';

import Image from 'next/image';
import MacWindow from './MacWindow';
import type { PORTFOLIO } from '@/data/portfolio';

export default function PortfolioGallery({
  category,
  onClose,
  onOpenPhoto,
}: {
  category: (typeof PORTFOLIO)[number];
  onClose: () => void;
  onOpenPhoto: (index: number) => void;
}) {
  return (
    <MacWindow
      address={`berkas.my.id/${category.key}`}
      onClose={onClose}
      closeLabel="Close portfolio"
      maxWidth="max-w-6xl"
      zIndexClass="z-[90]"
    >
      <div className="shrink-0 border-b border-graphite px-5 py-4 sm:px-8">
        <div className="text-[22px] font-bold tracking-[-0.02em] text-pearl sm:text-[26px]">
          {category.title}
        </div>
        <div className="mt-0.5 text-[13px] text-mist">
          {category.subtitle} · {category.photos.length} photos
        </div>
      </div>

      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {category.photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => onOpenPhoto(i)}
              aria-label={`Open ${photo.alt}`}
              className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-[12px] border border-graphite bg-ashstone"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="block h-auto w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </div>
    </MacWindow>
  );
}
