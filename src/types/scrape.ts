// ============================================================
// Scrape Lab — 型定義
// 将来のログイン対応・Playwright 対応を概念として包含した設計
// ============================================================

/** スクレイピング実行モード */
export type ScrapeMode = 'static' | 'browser';

/** 抽出方式 */
export type ExtractionMode = 'generic' | 'selector-based';

/** セレクタ一致件数 */
export interface SelectorMatchInfo {
  titleCount: number;
  bodyCount: number;
  linkCount: number;
}

/** 認証モード (将来用) */
export type AuthMode = 'none' | 'basic' | 'form' | 'cookie' | 'manual';

// ── リクエスト ────────────────────────────────────────────

export interface ScrapeRequest {
  url: string;
  mode: ScrapeMode;
  /** サイトプロファイルID (オプション) */
  siteProfileId?: string;
  /** 認証設定 (Phase 2) */
  authConfig?: AuthConfig;
  /** セレクタカスタマイズ */
  selectors?: ScrapeSelectors;
}

// ── 結果 ──────────────────────────────────────────────────

export interface ScrapeResult {
  url: string;
  title: string;
  /** 本文テキストのプレビュー (最大 3000 文字) */
  bodyPreview: string;
  links: ScrapeLink[];
  /** メタタグ情報 */
  meta: Record<string, string>;
  mode: ScrapeMode;
  timestamp: string;
  /** 実行時間 (ms) */
  durationMs: number;
  /** ステータスコード */
  statusCode?: number;
  error?: string;
  /** 抽出方式 */
  extractionMode?: ExtractionMode;
  /** selector-based 抽出時に実際に使用したセレクタ */
  usedSelectors?: ScrapeSelectors;
  /** セレクタ使用時の一致件数 */
  selectorMatchInfo?: SelectorMatchInfo;
  /** 警告 (セレクタ未一致・不正など) */
  warnings?: string[];
}

export interface ScrapeLink {
  href: string;
  text: string;
  isExternal: boolean;
}

// ── 履歴 ──────────────────────────────────────────────────

export interface ScrapeHistoryItem {
  id: string;
  request: ScrapeRequest;
  result: ScrapeResult;
  /** ISO 8601 */
  timestamp: string;
}

// ── サイトプロファイル ────────────────────────────────────

export interface ScrapeSelectors {
  title?: string;
  body?: string;
  links?: string;
}

/** サイト別スクレイパー設定テンプレート */
export interface SiteProfile {
  id: string;
  name: string;
  /** URL マッチ用正規表現文字列 (例: "github\\.com") */
  urlPattern: string;
  description: string;
  loginRequired: boolean;
  authConfig?: AuthConfig;
  selectors?: ScrapeSelectors;
}

// ── 認証設定 (Phase 2 実装用、型のみ Phase 1 に組込) ───────

export interface AuthConfig {
  authMode: AuthMode;
  /** ログインページ URL */
  loginUrl?: string;
  username?: string;
  /** 本番では環境変数・安全なストアに移動すること */
  password?: string;
  /** Cookie ファイルパス (Netscape 形式) */
  cookieFile?: string;
  /** Playwright storageState ファイルパス */
  storageStatePath?: string;
  /** 2FA が必要か (手動介入フラグ) */
  requiresTwoFactor?: boolean;
  /** セッション有効期限 (ISO 8601) */
  sessionExpiresAt?: string;
}

// ── API レスポンス ────────────────────────────────────────

export interface ScrapeApiResponse {
  success: boolean;
  result?: ScrapeResult;
  error?: string;
}

// ── エクスポート ──────────────────────────────────────────

export interface ExportOptions {
  format: 'json' | 'csv';
  includeRawHtml?: boolean;
}
