import type { ScrapeRequest, ScrapeResult } from '@/types/scrape';
import { cookiesToPlaywright } from '../cookieParser';
import { parseHtml } from '../htmlParser';
import { BaseScraper } from './base';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BROWSER_TIMEOUT_MS = 45_000;

export class BrowserScraper extends BaseScraper {
  async isAvailable(): Promise<boolean> {
    try {
      await import('playwright-core');
      return true;
    } catch {
      return false;
    }
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    const t0 = Date.now();

    try {
      const { chromium } = await import('playwright-core');
      const launchOptions = await resolveLaunchOptions();

      const browser = await chromium.launch(launchOptions);
      try {
        const context = await browser.newContext({ userAgent: USER_AGENT });

        if (request.cookies) {
          const cookies = cookiesToPlaywright(request.cookies, request.url);
          if (cookies.length > 0) await context.addCookies(cookies);
        }

        const page = await context.newPage();

        // メインリクエストのステータスコードを捕捉
        let statusCode = 200;
        page.on('response', (r) => {
          if (r.url() === request.url || r.url() === request.url + '/') {
            statusCode = r.status();
          }
        });

        await page.goto(request.url, { waitUntil: 'networkidle', timeout: BROWSER_TIMEOUT_MS });

        const html = await page.content();
        return parseHtml(request, html, statusCode, t0);
      } finally {
        await browser.close();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.toLowerCase().includes('timeout');
      const prefix = isTimeout
        ? `BrowserScraper タイムアウト (${BROWSER_TIMEOUT_MS / 1000}秒): `
        : 'BrowserScraper: ';
      return this.makeErrorResult(request, `${prefix}${msg}`, t0);
    }
  }
}

/**
 * 実行環境に応じた Chromium 起動オプションを解決する。
 * Vercel (Lambda 環境) では @sparticuz/chromium を使用。
 * ローカル開発では playwright のインストール済み Chromium を使用。
 */
async function resolveLaunchOptions() {
  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true as const,
    };
  } catch {
    // ローカル: playwright でインストールされた Chromium を使用
    return { headless: true as const };
  }
}
