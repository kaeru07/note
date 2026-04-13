import type { ScrapeHistoryItem, ScrapeResult } from '@/types/scrape';

// ── JSON エクスポート ─────────────────────────────────────

export function exportResultAsJson(result: ScrapeResult): string {
  return JSON.stringify(result, null, 2);
}

export function exportHistoryAsJson(history: ScrapeHistoryItem[]): string {
  return JSON.stringify(history, null, 2);
}

// ── CSV エクスポート ──────────────────────────────────────

/** リンク一覧を CSV に変換 */
export function exportLinksAsCsv(result: ScrapeResult): string {
  const header = 'href,text,isExternal';
  const rows = result.links.map(
    (l) => `${csvEscape(l.href)},${csvEscape(l.text)},${l.isExternal}`,
  );
  return [header, ...rows].join('\n');
}

/** 履歴サマリーを CSV に変換 */
export function exportHistoryAsCsv(history: ScrapeHistoryItem[]): string {
  const header = 'id,timestamp,url,mode,title,durationMs,error';
  const rows = history.map((h) =>
    [
      csvEscape(h.id),
      csvEscape(h.timestamp),
      csvEscape(h.result.url),
      csvEscape(h.result.mode),
      csvEscape(h.result.title),
      h.result.durationMs,
      csvEscape(h.result.error ?? ''),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

// ── ブラウザダウンロード ──────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(content: string, prefix = 'scrape'): void {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile(content, `${prefix}_${ts}.json`, 'application/json');
}

export function downloadCsv(content: string, prefix = 'scrape'): void {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile('\uFEFF' + content, `${prefix}_${ts}.csv`, 'text/csv;charset=utf-8');
}

// ── 内部ユーティリティ ────────────────────────────────────

function csvEscape(value: string): string {
  const str = String(value ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
