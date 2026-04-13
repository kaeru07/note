'use client';

import type { ScrapeHistoryItem, ScrapeRequest } from '@/types/scrape';
import { downloadCsv, downloadJson, exportHistoryAsCsv, exportHistoryAsJson } from '@/lib/export';

interface Props {
  history: ScrapeHistoryItem[];
  onRerun: (request: ScrapeRequest) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onRerun, onClear }: Props) {
  return (
    <aside className="flex flex-col bg-gray-900 text-gray-100 h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          履歴 ({history.length})
        </h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={() => downloadJson(exportHistoryAsJson(history), 'history')}
                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded"
              >
                ↓ JSON
              </button>
              <button
                onClick={() => downloadCsv(exportHistoryAsCsv(history), 'history')}
                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded"
              >
                ↓ CSV
              </button>
              <button
                onClick={onClear}
                className="px-2 py-1 text-xs bg-red-900 hover:bg-red-800 border border-red-800 rounded text-red-300"
              >
                クリア
              </button>
            </>
          )}
        </div>
      </div>

      {/* リスト */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {history.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-6">履歴なし</p>
        )}
        {[...history].reverse().map((item) => (
          <HistoryCard key={item.id} item={item} onRerun={onRerun} />
        ))}
      </div>
    </aside>
  );
}

function HistoryCard({
  item,
  onRerun,
}: {
  item: ScrapeHistoryItem;
  onRerun: (request: ScrapeRequest) => void;
}) {
  const r = item.result;
  const isError = !!r.error;
  const time = new Date(item.timestamp).toLocaleTimeString('ja-JP');

  return (
    <div
      className={`p-2 rounded border text-xs ${
        isError
          ? 'bg-red-950 border-red-900'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* タイトル・時刻 */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-gray-200 font-medium truncate flex-1" title={r.title}>
          {r.title || '(no title)'}
        </p>
        <span className="text-gray-500 shrink-0">{time}</span>
      </div>

      {/* URL */}
      <p className="text-blue-400 font-mono truncate mb-1 text-xs" title={r.url}>
        {r.url}
      </p>

      {/* バッジ行 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`px-1 rounded font-mono ${
            r.mode === 'static' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
          }`}
        >
          {r.mode}
        </span>
        {r.statusCode && (
          <span className={r.statusCode < 400 ? 'text-green-500' : 'text-red-500'}>
            {r.statusCode}
          </span>
        )}
        <span className="text-gray-500">{r.durationMs}ms</span>
        {!isError && <span className="text-gray-500">{r.links.length} links</span>}
        {isError && <span className="text-red-400 truncate">{r.error}</span>}
      </div>

      {/* 再実行ボタン */}
      <button
        onClick={() => onRerun(item.request)}
        className="w-full py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
      >
        ↺ 再実行
      </button>
    </div>
  );
}
