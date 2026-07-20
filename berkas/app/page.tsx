import FolderHero from '@/components/FolderHero';
import MottoSection from '@/components/MottoSection';
import JourneyStrip from '@/components/JourneyStrip';
import ActionLinks from '@/components/ActionLinks';
import Reveal from '@/components/Reveal';
import { CONTACT_URL } from '@/lib/links';

export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col">
      <MottoSection />
      <FolderHero />
      <JourneyStrip />
      <ActionLinks />
      <footer className="flex flex-col items-center gap-2 px-6 pb-9 pt-2">
        <Reveal delay={0.1}>
          <span className="text-[13px] tracking-[0.08em] text-mist">
            berkas.my.id
          </span>
        </Reveal>
        <Reveal delay={0.15}>
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-ghost transition-colors hover:text-mist hover:underline"
          >
            Contact us for more info
          </a>
        </Reveal>
      </footer>
    </main>
  );
}
