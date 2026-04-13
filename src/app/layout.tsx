import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrape Lab',
  description: '手動スクレイピング実験ツール',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-gray-950 text-gray-100 h-screen overflow-hidden">{children}</body>
    </html>
  );
}
