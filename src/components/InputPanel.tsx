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
  const [showSelectors, setShowSelectors] = useState(false);
  const [titleSel, setTitleSel] = useState('');
  const [bodySel, setBodySel] = useState('');
  const [linkSel, setLinkSel] = useState('');
  const [cookies, setCookies] = useState('');
  const [showCookies, setShowCookies] = useState(false);

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

  const handleCookieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCookies((ev.target?.result as string) ?? '');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const t = titleSel.trim() || undefined;
    const b = bodySel.trim() || undefined;
    const l = linkSel.trim() || undefined;
    onSubmit({
      url: url.trim(),
      mode,
      siteProfileId: profileId,
      selectors: (t || b || l) ? { title: t, body: b, links: l } : undefined,
      cookies: cookies.trim() || undefined,
    });
  };

  return (
    <aside className="flex flex-col gap-4 p-4 bg-gray-900 text-gray-100 w-full min-h-0 overflow-x-hidden overflow-y-auto">
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
            <button
              type="button"
              onClick={() => setMode('static')}
              className="flex-1 py-1.5 rounded text-xs font-medium border transition-colors bg-blue-600 border-blue-500 text-white"
            >
              ⚡ static
            </button>
            <button
              type="button"
              disabled
              title="Vercel Pro プランが必要です"
              className="flex-1 py-1.5 rounded text-xs font-medium border bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
            >
              🌐 browser
              <span className="ml-1 text-xs opacity-60">Pro</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-600">fetch + Cheerio — 高速・軽量</p>
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

        {/* CSSセレクタ (オプション) */}
        <div>
          <button
            type="button"
            onClick={() => setShowSelectors(!showSelectors)}
            className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-300 mb-1"
          >
            <span>CSSセレクタ <span className="text-gray-600">(オプション)</span></span>
            <span>{showSelectors ? '▲' : '▼'}</span>
          </button>
          {showSelectors && (
            <div className="flex flex-col gap-2 mt-1 pl-1 border-l border-gray-700">
              {[
                { label: 'タイトル', val: titleSel, set: setTitleSel, ph: 'h1' },
                { label: '本文', val: bodySel, set: setBodySel, ph: 'article' },
                { label: 'リンク', val: linkSel, set: setLinkSel, ph: 'nav a' },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={`例: ${ph}`}
                    className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs
                               text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              ))}
              <p className="text-xs text-gray-600">空欄は既存の汎用抽出を使用</p>
            </div>
          )}
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

      {/* Cookie インポート */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <button
          type="button"
          onClick={() => setShowCookies(!showCookies)}
          className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-300 mb-2"
        >
          <span className="font-semibold">🍪 Cookie</span>
          <span>{showCookies ? '▲' : '▼'}</span>
        </button>
        {showCookies && (
          <div className="flex flex-col gap-2">
            <textarea
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              placeholder={'Netscape 形式 (.txt) またはraw形式\n例: session=abc123; token=xyz'}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs
                         text-gray-300 font-mono h-24 resize-none focus:outline-none focus:border-blue-500
                         placeholder-gray-600"
            />
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1 py-1 bg-gray-800
                               border border-gray-700 rounded text-xs text-gray-400 hover:border-gray-500
                               cursor-pointer transition-colors">
                📂 ファイルから読込
                <input type="file" accept=".txt" className="hidden" onChange={handleCookieFile} />
              </label>
              {cookies && (
                <button
                  type="button"
                  onClick={() => setCookies('')}
                  className="px-2 py-1 bg-red-900 border border-red-800 rounded text-xs text-red-300
                             hover:bg-red-800 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
            {cookies && (
              <p className="text-xs text-green-500">
                ✓ Cookie セット済み ({cookies.split('\n').filter(l => l.trim() && !l.startsWith('#')).length} 件)
              </p>
            )}
            <p className="text-xs text-gray-600">
              Netscape 形式 (ブラウザエクスポート) または name=value; 形式
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
