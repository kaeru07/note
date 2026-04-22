import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrape Lab',
  description: '手動スクレイピング実験ツール',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-gray-950 text-gray-100 overflow-x-hidden md:h-screen md:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
