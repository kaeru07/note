import * as cheerio from 'cheerio';
import type { ExtractionMode, ScrapeLink, ScrapeRequest, ScrapeResult, SelectorMatchInfo } from '@/types/scrape';

/** StaticScraper と BrowserScraper が共用する HTML パーサー */
export function parseHtml(
  request: ScrapeRequest,
  html: string,
  statusCode: number,
  t0: number,
): ScrapeResult {
  const $ = cheerio.load(html);
  const sel = request.selectors ?? {};
  const warnings: string[] = [];

  const hasTitleSel = !!sel.title?.trim();
  const hasBodySel = !!sel.body?.trim();
  const hasLinkSel = !!sel.links?.trim();
  const hasAnySel = hasTitleSel || hasBodySel || hasLinkSel;

  let titleCount = 0;
  let bodyCount = 0;
  let linkCount = 0;

  // タイトル
  let titleFromSelector = '';
  if (hasTitleSel) {
    try {
      const matched = $(sel.title!);
      titleCount = matched.length;
      if (titleCount > 0) {
        titleFromSelector = matched.first().text().trim();
      } else {
        warnings.push(`titleSelector "${sel.title}" に一致する要素がありませんでした (0件)`);
      }
    } catch {
      warnings.push(`titleSelector "${sel.title}" は無効なCSSセレクタです`);
    }
  }
  const titleFromTag = $('title').text().trim();
  const titleFromOg = $('meta[property="og:title"]').attr('content')?.trim() ?? '';
  const titleFromH1 = $('h1').first().text().trim();
  const title = titleFromSelector || titleFromTag || titleFromOg || titleFromH1 || '(no title)';

  // 本文
  let resolvedBodySel: string | undefined;
  if (hasBodySel) {
    try {
      const matched = $(sel.body!);
      bodyCount = matched.length;
      if (bodyCount > 0) {
        resolvedBodySel = sel.body;
      } else {
        warnings.push(`bodySelector "${sel.body}" に一致する要素がありませんでした (0件)`);
      }
    } catch {
      warnings.push(`bodySelector "${sel.body}" は無効なCSSセレクタです`);
    }
  }
  const $body = resolvedBodySel ? $(resolvedBodySel) : $('body');
  $body.find('script, style, nav, footer, header, aside, [aria-hidden="true"]').remove();
  const bodyPreview = $body.text().replace(/\s+/g, ' ').trim().slice(0, 3000);

  // リンク
  let links: ScrapeLink[];
  if (hasLinkSel) {
    try {
      const rawCount = $(sel.links!).length;
      if (rawCount === 0) {
        warnings.push(`linkSelector "${sel.links}" に一致する要素がありませんでした (0件)`);
      }
      links = extractLinks($, request.url, sel.links);
      linkCount = links.length;
    } catch {
      warnings.push(`linkSelector "${sel.links}" は無効なCSSセレクタです`);
      links = extractLinks($, request.url);
      linkCount = 0;
    }
  } else {
    links = extractLinks($, request.url);
    linkCount = links.length;
  }

  // メタタグ
  const meta: Record<string, string> = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || '';
    const content = $(el).attr('content') || '';
    if (name && content) meta[name] = content;
  });

  const extractionMode: ExtractionMode = hasAnySel ? 'selector-based' : 'generic';
  const selectorMatchInfo: SelectorMatchInfo | undefined = hasAnySel
    ? { titleCount, bodyCount, linkCount }
    : undefined;
  const usedSelectors = hasAnySel
    ? {
        title: sel.title?.trim() || undefined,
        body: sel.body?.trim() || undefined,
        links: sel.links?.trim() || undefined,
      }
    : undefined;

  return {
    url: request.url,
    title,
    bodyPreview,
    links,
    meta,
    mode: request.mode,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - t0,
    statusCode,
    extractionMode,
    usedSelectors,
    selectorMatchInfo,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string, selector?: string): ScrapeLink[] {
  const links: ScrapeLink[] = [];
  const seen = new Set<string>();
  let base: URL;

  try {
    base = new URL(baseUrl);
  } catch {
    return links;
  }

  $(selector || 'a[href]').each((_, el) => {
    const raw = $(el).attr('href') ?? '';
    if (!raw || raw.startsWith('#') || raw.startsWith('javascript:')) return;

    let href: string;
    try {
      href = new URL(raw, baseUrl).toString();
    } catch {
      return;
    }

    if (seen.has(href)) return;
    seen.add(href);

    const text = ($(el).text() || $(el).attr('aria-label') || raw).trim().slice(0, 120);
    let isExternal = false;
    try {
      isExternal = new URL(href).hostname !== base.hostname;
    } catch {
      /* ignore */
    }

    links.push({ href, text, isExternal });
  });

  return links.slice(0, 200);
}
