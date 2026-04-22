import type { ScrapeRequest, ScrapeResult } from '@/types/scrape';
import { cookiesToHeader } from '../cookieParser';
import { parseHtml } from '../htmlParser';
import { BaseScraper } from './base';

const rejectUnauthorized = process.env.SCRAPE_TLS_REJECT_UNAUTHORIZED !== 'false';

const USER_AGENT =
  process.env.SCRAPE_USER_AGENT ??
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const TIMEOUT_MS = Number(process.env.SCRAPE_TIMEOUT_MS ?? 10_000);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Agent } = require('undici') as typeof import('undici');

export class StaticScraper extends BaseScraper {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    const t0 = Date.now();

    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    };

    if (request.cookies) {
      const cookieHeader = cookiesToHeader(request.cookies);
      if (cookieHeader) headers['Cookie'] = cookieHeader;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(request.url, {
        headers,
        // @ts-expect-error: undici Agent は Node.js fetch の dispatcher として使用可能
        dispatcher: new Agent({ connect: { rejectUnauthorized } }),
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timer);

      const statusCode = res.status;

      if (!res.ok) {
        return this.makeErrorResult(request, `HTTP ${res.status}: ${res.statusText}`, t0, statusCode);
      }

      const html = await res.text();
      return parseHtml(request, html, statusCode, t0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.makeErrorResult(request, `Fetch failed: ${msg}`, t0);
    }
  }
}
