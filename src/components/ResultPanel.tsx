'use client';

import { useState } from 'react';
import type { ScrapeResult } from '@/types/scrape';
import {
  downloadCsv,
  downloadJson,
  exportLinksAsCsv,
  exportResultAsJson,
} from '@/lib/export';

interface Props {
  result: ScrapeResult | null;
  isLoading: boolean;
  error: string | null;
}

type Tab = 'overview' | 'body' | 'links' | 'meta';

export function ResultPanel({ result, isLoading, error }: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  if (isLoading) {
    return (
      <main className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-3xl mb-2 animate-pulse">⟳</div>
          <p className="text-sm">取得中…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center h-full p-4">
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 max-w-lg w-full">
          <p className="text-red-400 text-sm font-semibold mb-1">エラー</p>
          <p className="text-red-300 text-sm font-mono break-all">{error}</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex items-center justify-center h-full text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">URL を入力して実行してください</p>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '概要' },
    { id: 'body', label: '本文' },
    { id: 'links', label: `リンク (${result.links.length})` },
    { id: 'meta', label: `Meta (${Object.keys(result.meta).length})` },
  ];

  return (
    <main className="flex flex-col h-full overflow-hidden bg-gray-950 text-gray-100">
      {/* ヘッダー */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 border-b border-gray-800 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-white truncate" title={result.title}>
            {result.title}
          </h1>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline truncate block"
          >
            {result.url}
          </a>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                result.mode === 'static'
                  ? 'bg-green-900 text-green-400'
                  : 'bg-yellow-900 text-yellow-400'
              }`}
            >
              {result.mode}
            </span>
            {result.statusCode && (
              <span
                className={result.statusCode < 400 ? 'text-green-500' : 'text-red-500'}
              >
                HTTP {result.statusCode}
              </span>
            )}
            <span>{result.durationMs}ms</span>
            <span>{new Date(result.timestamp).toLocaleTimeString('ja-JP')}</span>
          </div>
        </div>

        {/* エクスポートボタン */}
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={() => downloadJson(exportResultAsJson(result), 'scrape')}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
          >
            ↓ JSON
          </button>
          <button
            onClick={() => downloadCsv(exportLinksAsCsv(result), 'links')}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-800 px-4 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && <OverviewTab result={result} />}
        {tab === 'body' && <BodyTab result={result} />}
        {tab === 'links' && <LinksTab result={result} />}
        {tab === 'meta' && <MetaTab result={result} />}
      </div>
    </main>
  );
}

// ── タブコンテンツ ─────────────────────────────────────────

function OverviewTab({ result }: { result: ScrapeResult }) {
  return (
    <div className="space-y-3">
      <InfoRow label="URL" value={result.url} mono />
      <InfoRow label="タイトル" value={result.title} />
      <InfoRow label="モード" value={result.mode} mono />
      <InfoRow label="ステータス" value={result.statusCode ? `HTTP ${result.statusCode}` : '—'} />
      <InfoRow label="実行時間" value={`${result.durationMs}ms`} mono />
      <InfoRow label="リンク数" value={`${result.links.length}`} mono />
      <InfoRow
        label="本文文字数"
        value={`${result.bodyPreview.length.toLocaleString()} 文字 (プレビュー)`}
        mono
      />
      {result.error && <InfoRow label="エラー" value={result.error} mono />}
    </div>
  );
}

function BodyTab({ result }: { result: ScrapeResult }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">本文テキストプレビュー (最大 3000 文字)</p>
      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed bg-gray-900 p-3 rounded border border-gray-800">
        {result.bodyPreview || '(本文なし)'}
      </pre>
    </div>
  );
}

function LinksTab({ result }: { result: ScrapeResult }) {
  const [filter, setFilter] = useState<'all' | 'internal' | 'external'>('all');
  const filtered = result.links.filter((l) => {
    if (filter === 'internal') return !l.isExternal;
    if (filter === 'external') return l.isExternal;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {(['all', 'internal', 'external'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              filter === f
                ? 'bg-blue-700 border-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {f === 'all' ? `全て (${result.links.length})` : f === 'internal' ? '内部' : '外部'}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {filtered.map((link, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 bg-gray-900 rounded border border-gray-800 hover:border-gray-700 group"
          >
            <span
              className={`mt-0.5 shrink-0 text-xs px-1 rounded ${
                link.isExternal ? 'bg-orange-900 text-orange-400' : 'bg-gray-800 text-gray-500'
              }`}
            >
              {link.isExternal ? 'ext' : 'int'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-300 truncate">{link.text || '(no text)'}</p>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline font-mono break-all"
              >
                {link.href}
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">リンクなし</p>
        )}
      </div>
    </div>
  );
}

function MetaTab({ result }: { result: ScrapeResult }) {
  const entries = Object.entries(result.meta);
  return (
    <div className="space-y-1">
      {entries.length === 0 && (
        <p className="text-xs text-gray-600 text-center py-4">メタタグなし</p>
      )}
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2 p-2 bg-gray-900 rounded border border-gray-800">
          <span className="text-xs text-blue-400 font-mono shrink-0 w-48 truncate">{k}</span>
          <span className="text-xs text-gray-300 break-all">{v}</span>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <span className={`text-xs text-gray-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
