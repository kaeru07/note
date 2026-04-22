import type { ScrapeResult } from '@/types/scrape';

export interface WordDiff {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface DiffResult {
  titleChanged: boolean;
  prevTitle: string;
  nextTitle: string;
  linksAdded: number;
  linksRemoved: number;
  newLinks: string[];
  removedLinks: string[];
  bodyDiff: WordDiff[];
  hasDiff: boolean;
}

const MAX_WORDS = 400;

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean).slice(0, MAX_WORDS);
}

function buildLcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function buildDiff(a: string[], b: string[], dp: number[][]): WordDiff[] {
  const chunks: WordDiff[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      chunks.unshift({ type: 'equal', text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      chunks.unshift({ type: 'insert', text: b[j - 1] });
      j--;
    } else {
      chunks.unshift({ type: 'delete', text: a[i - 1] });
      i--;
    }
  }

  // 同種チャンクを結合
  const merged: WordDiff[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.type === chunk.type) {
      last.text += ' ' + chunk.text;
    } else {
      merged.push({ ...chunk });
    }
  }
  return merged;
}

export function computeDiff(prev: ScrapeResult, next: ScrapeResult): DiffResult {
  const titleChanged = prev.title !== next.title;

  const prevHrefs = new Set(prev.links.map((l) => l.href));
  const nextHrefs = new Set(next.links.map((l) => l.href));
  const newLinks = next.links.filter((l) => !prevHrefs.has(l.href)).map((l) => l.href).slice(0, 20);
  const removedLinks = prev.links.filter((l) => !nextHrefs.has(l.href)).map((l) => l.href).slice(0, 20);

  const prevWords = tokenize(prev.bodyPreview);
  const nextWords = tokenize(next.bodyPreview);
  const dp = buildLcs(prevWords, nextWords);
  const bodyDiff = buildDiff(prevWords, nextWords, dp);

  const hasBodyDiff = bodyDiff.some((d) => d.type !== 'equal');
  const hasDiff = titleChanged || newLinks.length > 0 || removedLinks.length > 0 || hasBodyDiff;

  return {
    titleChanged,
    prevTitle: prev.title,
    nextTitle: next.title,
    linksAdded: newLinks.length,
    linksRemoved: removedLinks.length,
    newLinks,
    removedLinks,
    bodyDiff,
    hasDiff,
  };
}
