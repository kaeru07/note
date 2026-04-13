import type { SiteProfile } from '@/types/scrape';

/**
 * 組み込みサイトプロファイル
 *
 * 追加方法: この配列にエントリを追加するだけで UI に自動反映される。
 * カスタムセレクターを使うことでサイト別の精度向上が可能。
 */
export const BUILT_IN_PROFILES: SiteProfile[] = [
  {
    id: 'generic',
    name: 'Generic (汎用)',
    urlPattern: '.*',
    description: 'すべてのサイトに対応する汎用スクレイパー',
    loginRequired: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    urlPattern: 'github\\.com',
    description: 'GitHub リポジトリ・Issue・PR ページ向け',
    loginRequired: false,
    selectors: {
      title: 'title',
      body: 'article.markdown-body, .js-issue-body, #readme',
    },
  },
  {
    id: 'zenn',
    name: 'Zenn',
    urlPattern: 'zenn\\.dev',
    description: 'Zenn 記事向け',
    loginRequired: false,
    selectors: {
      title: 'h1',
      body: '.znc',
    },
  },
  {
    id: 'qiita',
    name: 'Qiita',
    urlPattern: 'qiita\\.com',
    description: 'Qiita 記事向け',
    loginRequired: false,
    selectors: {
      title: 'h1',
      body: '.it-MdContent',
    },
  },
  // ── Phase 2: ログイン必須サイトの雛形 ───────────────────
  // {
  //   id: 'example-login',
  //   name: 'Example (要ログイン)',
  //   urlPattern: 'example\\.com',
  //   description: 'ログイン必須サイトのサンプル',
  //   loginRequired: true,
  //   authConfig: {
  //     authMode: 'form',
  //     loginUrl: 'https://example.com/login',
  //     storageStatePath: './data/example_state.json',
  //   },
  // },
];

export function findProfile(id: string): SiteProfile | undefined {
  return BUILT_IN_PROFILES.find((p) => p.id === id);
}

/** URL からプロファイルを自動推定 */
export function detectProfile(url: string): SiteProfile {
  const matched = BUILT_IN_PROFILES.filter((p) => p.id !== 'generic').find((p) => {
    try {
      return new RegExp(p.urlPattern).test(url);
    } catch {
      return false;
    }
  });
  return matched ?? BUILT_IN_PROFILES[0];
}
