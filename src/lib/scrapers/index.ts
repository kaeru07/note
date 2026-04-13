import type { ScrapeMode } from '@/types/scrape';
import { BaseScraper } from './base';
import { BrowserScraper } from './browser';
import { StaticScraper } from './static';

export { BaseScraper } from './base';
export { StaticScraper } from './static';
export { BrowserScraper } from './browser';

/** モードに応じたスクレイパーを返すファクトリ */
export function createScraper(mode: ScrapeMode): BaseScraper {
  switch (mode) {
    case 'static':
      return new StaticScraper();
    case 'browser':
      return new BrowserScraper();
    default:
      throw new Error(`Unknown scrape mode: ${mode}`);
  }
}
