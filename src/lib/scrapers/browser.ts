import type { ScrapeRequest, ScrapeResult } from '@/types/scrape';
import { BaseScraper } from './base';

/**
 * BrowserScraper — Playwright によるブラウザ取得 (Phase 2 実装予定)
 *
 * 向き: SPA、JS レンダリング必須サイト、ログイン必須サイト、2FA 対応
 * 不向き: 高速一括取得 (StaticScraper に劣る)
 *
 * 将来実装ポイント:
 *   1. `npm install playwright`
 *   2. この scrape() に chromium.launch() の実装を追加
 *   3. AuthConfig.storageStatePath で storageState を注入
 *   4. AuthConfig.requiresTwoFactor が true のとき手動介入を待機
 */
export class BrowserScraper extends BaseScraper {
  async isAvailable(): Promise<boolean> {
    try {
      // eval('require') でバンドラー/TypeScript の静的解析を回避しつつ実行時チェック
      const _require = eval('require') as (m: string) => unknown;
      _require('playwright');
      return true;
    } catch {
      return false;
    }
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    const t0 = Date.now();

    const available = await this.isAvailable();
    if (!available) {
      return this.makeErrorResult(
        request,
        'BrowserScraper requires Playwright. Run: npm install playwright && npx playwright install chromium',
        t0,
      );
    }

    // ── Phase 2 実装ここから ─────────────────────────────
    //
    // const { chromium } = await import('playwright');
    // const browser = await chromium.launch({ headless: true });
    //
    // // storageState (cookie) を注入
    // const contextOptions: Parameters<typeof browser.newContext>[0] = {};
    // if (request.authConfig?.storageStatePath) {
    //   contextOptions.storageState = request.authConfig.storageStatePath;
    // }
    //
    // const context = await browser.newContext(contextOptions);
    // const page = await context.newPage();
    // await page.goto(request.url, { waitUntil: 'networkidle' });
    //
    // // 2FA 手動介入: headless: false にして pause()
    // if (request.authConfig?.requiresTwoFactor) {
    //   await page.pause(); // ユーザーが操作後に再開
    // }
    //
    // const html = await page.content();
    // await browser.close();
    // return parseHtml(request, html, 200, t0); // StaticScraper のパーサーを再利用可能
    //
    // ────────────────────────────────────────────────────

    return this.makeErrorResult(request, 'BrowserScraper: Phase 2 未実装', t0);
  }
}
