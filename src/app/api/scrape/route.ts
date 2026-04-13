import { NextRequest, NextResponse } from 'next/server';
import type { ScrapeApiResponse, ScrapeRequest } from '@/types/scrape';
import { createScraper } from '@/lib/scrapers';
import { findProfile } from '@/lib/siteProfiles';

export const runtime = 'nodejs';
// Vercel では最大 60 秒 (Pro) / 10 秒 (Hobby)
export const maxDuration = 30;

export async function POST(req: NextRequest): Promise<NextResponse<ScrapeApiResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── バリデーション ────────────────────────────────────
  const raw = body as Partial<ScrapeRequest>;

  if (!raw.url || typeof raw.url !== 'string') {
    return NextResponse.json({ success: false, error: 'url is required' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(raw.url);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 });
  }

  // セキュリティ: ローカルホスト / プライベート IP への要求はブロック
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json(
      { success: false, error: 'Private/local addresses are not allowed' },
      { status: 400 },
    );
  }

  const mode = raw.mode === 'browser' ? 'browser' : 'static';

  // サイトプロファイル適用
  const profile = raw.siteProfileId ? findProfile(raw.siteProfileId) : undefined;

  const request: ScrapeRequest = {
    url: raw.url,
    mode,
    siteProfileId: raw.siteProfileId,
    authConfig: raw.authConfig,
    selectors: raw.selectors ?? profile?.selectors,
  };

  // ── スクレイピング実行 ────────────────────────────────
  try {
    const scraper = createScraper(mode);
    const result = await scraper.scrape(request);
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── ユーティリティ ────────────────────────────────────────

function isPrivateHost(hostname: string): boolean {
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) return true;
  // 10.x, 172.16–31.x, 192.168.x
  if (/^10\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  return false;
}
