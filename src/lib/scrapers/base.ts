import type { ScrapeRequest, ScrapeResult } from '@/types/scrape';

/**
 * BaseScraper — すべてのスクレイパーの抽象基底クラス
 *
 * 拡張方法:
 *   class MyScraper extends BaseScraper {
 *     async scrape(req) { ... }
 *     async isAvailable() { return true; }
 *   }
 */
export abstract class BaseScraper {
  /** スクレイピング実行 */
  abstract scrape(request: ScrapeRequest): Promise<ScrapeResult>;

  /** このスクレイパーが利用可能か (Playwright 未インストール等のチェック用) */
  abstract isAvailable(): Promise<boolean>;

  /** 共通: エラー結果を生成 */
  protected makeErrorResult(
    request: ScrapeRequest,
    error: string,
    startTime: number,
    statusCode?: number,
  ): ScrapeResult {
    return {
      url: request.url,
      title: '',
      bodyPreview: '',
      links: [],
      meta: {},
      mode: request.mode,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      statusCode,
      error,
    };
  }
}
