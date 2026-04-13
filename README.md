# Scrape Lab

手動スクレイピング実験ツール。拡張を前提とした設計。

## 起動方法

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 機能 (Phase 1 — MVP)

| 機能 | 状態 |
|------|------|
| URL 入力 → 取得 | ✅ |
| static モード (fetch + Cheerio) | ✅ |
| browser モード (Playwright) | 🔲 Phase 2 |
| タイトル・本文プレビュー | ✅ |
| リンク一覧 (内部/外部フィルタ) | ✅ |
| Meta タグ表示 | ✅ |
| JSON エクスポート | ✅ |
| CSV エクスポート | ✅ |
| 実行履歴 (localStorage) | ✅ |
| 再実行 | ✅ |
| サイトプロファイル自動検出 | ✅ |
| ログイン UI | 🔲 Phase 2 |
| Cookie / storageState 保存 | 🔲 Phase 2 |
| 定期実行 | 🔲 Phase 3 |

## ディレクトリ構成

```
src/
├── types/
│   └── scrape.ts          # 全型定義 (ScrapeRequest, ScrapeResult, ...)
├── lib/
│   ├── scrapers/
│   │   ├── base.ts        # BaseScraper 抽象クラス
│   │   ├── static.ts      # StaticScraper (fetch + Cheerio)
│   │   ├── browser.ts     # BrowserScraper (Playwright stub)
│   │   └── index.ts       # ファクトリ関数
│   ├── export.ts          # JSON/CSV エクスポートユーティリティ
│   └── siteProfiles.ts    # サイト別スクレイパーテンプレート
├── components/
│   ├── InputPanel.tsx     # 左：URL入力・モード選択
│   ├── ResultPanel.tsx    # 中央：結果表示
│   └── HistoryPanel.tsx   # 右：履歴
└── app/
    ├── page.tsx           # メインページ (状態管理)
    ├── layout.tsx
    ├── globals.css
    └── api/scrape/
        └── route.ts       # POST /api/scrape
```

## 拡張方法

### サイトプロファイルを追加する

`src/lib/siteProfiles.ts` の `BUILT_IN_PROFILES` 配列にエントリを追加。

```ts
{
  id: 'mysite',
  name: 'My Site',
  urlPattern: 'mysite\\.com',
  description: '...',
  loginRequired: false,
  selectors: {
    title: 'h1.article-title',
    body: '.article-content',
  },
}
```

### Playwright を有効化する (Phase 2)

```bash
npm install playwright
npx playwright install chromium
```

`src/lib/scrapers/browser.ts` のコメントアウト部分を実装。

### ログイン対応 (Phase 2)

`src/types/scrape.ts` の `AuthConfig` 型が対応済み。
`BrowserScraper` 内の `storageStatePath` 注入ポイントにコードを追加。

## 環境変数

`.env.local.example` を `.env.local` にコピーして設定。

```
SCRAPE_USER_AGENT=...   # カスタム UA
SCRAPE_TIMEOUT_MS=10000 # タイムアウト
```

## Vercel デプロイ時の注意

- `maxDuration = 30` (Pro プランで最大 300 秒まで変更可)
- Playwright はサーバーレス環境では動作しない → Remote Browser (Browserless 等) を使う
- `PLAYWRIGHT_WS_ENDPOINT` 環境変数で接続先を設定 (Phase 2)

## Phase 2 追加案

- [ ] Playwright ブラウザモード実装
- [ ] ログイン → storageState 保存フロー
- [ ] Cookie ファイル (.txt) インポート
- [ ] サイト別スクレイパー精度向上
- [ ] 差分比較・変更検知
- [ ] 定期実行 (cron)
- [ ] 結果の DB / ファイル永続化
- [ ] Slack / Discord 通知
