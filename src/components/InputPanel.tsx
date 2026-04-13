'use client';

import { useState } from 'react';
import type { ScrapeMode, ScrapeRequest } from '@/types/scrape';
import { BUILT_IN_PROFILES, detectProfile } from '@/lib/siteProfiles';

interface Props {
  onSubmit: (request: ScrapeRequest) => void;
  isLoading: boolean;
}

export function InputPanel({ onSubmit, isLoading }: Props) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<ScrapeMode>('static');
  const [profileId, setProfileId] = useState('generic');
  const [autoDetect, setAutoDetect] = useState(true);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (autoDetect && value) {
      try {
        const p = detectProfile(value);
        setProfileId(p.id);
      } catch {
        /* ignore */
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({
      url: url.trim(),
      mode,
      siteProfileId: profileId,
    });
  };

  return (
    <aside className="flex flex-col gap-4 p-4 bg-gray-900 text-gray-100 min-h-0 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">入力</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* URL */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100
                       placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* 実行モード */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">実行モード</label>
          <div className="flex gap-2">
            {(['static', 'browser'] as ScrapeMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                  mode === m
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {m === 'static' ? '⚡ static' : '🌐 browser'}
                {m === 'browser' && (
                  <span className="ml-1 text-xs opacity-60">(未実装)</span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {mode === 'static'
              ? 'fetch + Cheerio — 高速・軽量'
              : 'Playwright — JS レンダリング対応 (Phase 2)'}
          </p>
        </div>

        {/* サイトプロファイル */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">サイトプロファイル</label>
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="w-3 h-3"
              />
              自動検出
            </label>
          </div>
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100
                       focus:outline-none focus:border-blue-500"
          >
            {BUILT_IN_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-600">
            {BUILT_IN_PROFILES.find((p) => p.id === profileId)?.description ?? ''}
          </p>
        </div>

        {/* 実行ボタン */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="mt-2 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                     disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
        >
          {isLoading ? '取得中…' : '▶ 実行'}
        </button>
      </form>

      {/* 将来: ログイン設定 (Phase 2) */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 font-semibold mb-1">🔒 ログイン設定 (Phase 2)</p>
        <div className="flex flex-col gap-1 opacity-40 pointer-events-none">
          <input
            disabled
            placeholder="ログイン URL"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500"
          />
          <input
            disabled
            placeholder="ユーザー名"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500"
          />
          <input
            disabled
            type="password"
            placeholder="パスワード"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500"
          />
          <div className="flex gap-2">
            <button disabled className="flex-1 py-1 rounded bg-gray-700 text-xs text-gray-500">
              ログイン
            </button>
            <button disabled className="flex-1 py-1 rounded bg-gray-700 text-xs text-gray-500">
              State 保存
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
