'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ScrapeApiResponse, ScrapeHistoryItem, ScrapeRequest, ScrapeResult } from '@/types/scrape';
import { HistoryPanel } from '@/components/HistoryPanel';
import { InputPanel } from '@/components/InputPanel';
import { ResultPanel } from '@/components/ResultPanel';
import { computeDiff, type DiffResult } from '@/lib/diff';

const HISTORY_KEY = 'scrapelab_history';
const MAX_HISTORY = 50;

export default function HomePage() {
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScrapeHistoryItem[]>([]);

  // localStorage から履歴を復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const saveHistory = useCallback((items: ScrapeHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = useCallback(
    async (request: ScrapeRequest) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setDiff(null);

      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        const data: ScrapeApiResponse = await res.json();

        if (!data.success || !data.result) {
          setError(data.error ?? '不明なエラー');
          return;
        }

        setResult(data.result);

        // 同一 URL の直近結果があれば差分を計算
        const prevItem = [...history].reverse().find((h) => h.request.url === request.url);
        if (prevItem) setDiff(computeDiff(prevItem.result, data.result));

        // 履歴に追加
        // Cookieは生値をlocalStorageに残さない
        const item: ScrapeHistoryItem = {
          id: uuidv4(),
          request: { ...request, cookies: undefined },
          result: data.result,
          timestamp: new Date().toISOString(),
        };
        saveHistory([...history, item].slice(-MAX_HISTORY));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [history, saveHistory],
  );

  const handleClearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return (
    <div className="flex flex-col min-h-screen md:h-screen overflow-x-hidden">
      {/* トップバー */}
      <header className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <span className="text-base font-bold text-white tracking-tight">🔬 Scrape Lab</span>
        <span className="hidden sm:inline text-xs text-gray-600">手動スクレイピング実験ツール</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
          <span className="hidden sm:inline">Phase 2</span>
          <a
            href="https://github.com/kaeru07/note"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* モバイル: 縦積み / md以上: 3カラム */}
      <div className="flex flex-col md:flex-row flex-1 md:min-h-0">
        {/* 入力パネル */}
        <div className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800">
          <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* 結果パネル */}
        <div className="flex-1 min-w-0">
          <ResultPanel result={result} isLoading={isLoading} error={error} diff={diff} />
        </div>

        {/* 履歴パネル */}
        <div className="w-full md:w-72 md:flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-800">
          <HistoryPanel
            history={history}
            onRerun={handleSubmit}
            onClear={handleClearHistory}
          />
        </div>
      </div>
    </div>
  );
}
