import type { Metadata, Viewport } from 'next';
import { colors } from '@/tokens/colors';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GrainOverlay from '@/components/GrainOverlay';
import SmoothScroll from '@/components/SmoothScroll';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://berkas.my.id'),
  title: '[berkas.]',
  description: 'Convocation Photoshoot.',
};

export const viewport: Viewport = {
  themeColor: colors.void,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-void text-pearl antialiased">
        <BackgroundBlobs />
        <SmoothScroll>{children}</SmoothScroll>
        <GrainOverlay />
      </body>
    </html>
  );
}
