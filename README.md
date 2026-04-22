# Scrape Lab

手動スクレイピング実験ツール。URL を入力するだけで本文・リンク・メタ情報を取得し、変更検知・Cookie 認証・ブラウザレンダリングに対応。

## 起動

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 機能一覧

| 機能 | 状態 |
|------|------|
| static モード (fetch + Cheerio) | ✅ |
| browser モード (Playwright) | ✅ |
| タイトル・本文プレビュー | ✅ |
| リンク一覧 (内部 / 外部フィルタ) | ✅ |
| Meta タグ表示 | ✅ |
| JSON / CSV エクスポート | ✅ |
| 実行履歴 (localStorage) | ✅ |
| サイトプロファイル自動検出 | ✅ |
| CSSセレクタ カスタマイズ | ✅ |
| Cookie インポート (Netscape / raw) | ✅ |
| 差分比較・変更検知 | ✅ |
| 定期実行 | 未実装 |

## 使い方

### 基本

1. URL を入力して **▶ 実行**
2. 結果タブ: **概要 / 本文 / リンク / Meta**
3. 同じ URL を再実行すると **変更タブ** が出現し差分を表示

### Cookie でログイン済みページを取得

1. 左パネル下部の **🍪 Cookie** を開く
2. ブラウザエクスポートの `.txt` ファイルを読み込む、または直接ペースト
3. 実行すると Cookie が付与されたリクエストを送信

**対応形式:**
- Netscape 形式 (Chrome / Firefox のエクスポート)
- raw 形式: `session=abc123; token=xyz`

### browser モード (JS レンダリング)

モード選択で **🌐 browser** を選択。Playwright でページをレンダリングしてから取得するため、SPA・動的サイトに有効。

> ローカル実行には `npx playwright install chromium` が必要。

### サイトプロファイル

対応サイトは URL 入力で自動検出。手動選択も可能。

| プロファイル | 対象 |
|------|------|
| Generic | 汎用 |
| GitHub | リポジトリ・Issue・PR |
| Zenn | 記事 |
| Qiita | 記事 |
| note | 記事 |
| はてなブログ | 記事 |
| MDN Web Docs | リファレンス |
| npm | パッケージページ |
| Amazon JP | 商品ページ |
| YouTube | 動画ページ (browser モード推奨) |

### CSSセレクタ カスタマイズ

左パネルの **CSSセレクタ (オプション)** を開いて title / body / links セレクタを指定。概要タブに一致件数が表示される。

## ファイル構成

```
src/
├── types/scrape.ts            # 全型定義
├── lib/
│   ├── htmlParser.ts          # HTML パース共有ロジック
│   ├── cookieParser.ts        # Cookie パーサー (Netscape / raw)
│   ├── diff.ts                # ワードレベル差分 (LCS)
│   ├── siteProfiles.ts        # サイトプロファイル定義
│   ├── export.ts              # JSON / CSV エクスポート
│   └── scrapers/
│       ├── base.ts            # BaseScraper 抽象クラス
│       ├── static.ts          # StaticScraper
│       ├── browser.ts         # BrowserScraper
│       └── index.ts           # createScraper() ファクトリ
├── components/
│   ├── InputPanel.tsx         # URL 入力・モード・Cookie
│   ├── ResultPanel.tsx        # 結果表示 (5タブ)
│   └── HistoryPanel.tsx       # 履歴
└── app/
    ├── page.tsx               # 状態管理・差分計算
    ├── layout.tsx
    ├── globals.css
    └── api/scrape/route.ts    # POST /api/scrape
```

## 環境変数

`.env.local.example` を `.env.local` にコピーして使用。

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `SCRAPE_USER_AGENT` | Chrome 124 UA | リクエスト UA |
| `SCRAPE_TIMEOUT_MS` | `10000` | static モードのタイムアウト (ms) |
| `SCRAPE_TLS_REJECT_UNAUTHORIZED` | `true` | `false` で自己署名証明書を許可 |

## Vercel デプロイ

- **Pro プラン推奨**: `maxDuration = 60` 秒に設定済み
- static モードは Hobby プランでも動作
- browser モードは `@sparticuz/chromium` を使用するため **Pro プランが必要**
  - 関数サイズ上限 250 MB (compressed) 以内に収まる構成

### サイトプロファイルを追加する

`src/lib/siteProfiles.ts` の `BUILT_IN_PROFILES` に追加するだけで UI に自動反映。

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
