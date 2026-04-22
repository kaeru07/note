import type { SiteProfile } from '@/types/scrape';

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
    description: 'リポジトリ・Issue・PR ページ向け',
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
  {
    id: 'note',
    name: 'note',
    urlPattern: 'note\\.com',
    description: 'note 記事向け',
    loginRequired: false,
    selectors: {
      title: 'h1',
      body: '.note-common-styles__textnote-body, article',
    },
  },
  {
    id: 'hatena',
    name: 'はてなブログ',
    urlPattern: 'hatenablog\\.com|hatena\\.ne\\.jp',
    description: 'はてなブログ記事向け',
    loginRequired: false,
    selectors: {
      title: '.entry-title',
      body: '.entry-content',
    },
  },
  {
    id: 'mdn',
    name: 'MDN Web Docs',
    urlPattern: 'developer\\.mozilla\\.org',
    description: 'MDN Web Docs リファレンス向け',
    loginRequired: false,
    selectors: {
      title: 'h1',
      body: 'article.main-page-content',
    },
  },
  {
    id: 'npm',
    name: 'npm',
    urlPattern: 'npmjs\\.com',
    description: 'npm パッケージページ向け',
    loginRequired: false,
    selectors: {
      title: 'h1, h2.f2',
      body: '#readme',
    },
  },
  {
    id: 'amazon-jp',
    name: 'Amazon JP',
    urlPattern: 'amazon\\.co\\.jp',
    description: 'Amazon.co.jp 商品ページ向け',
    loginRequired: false,
    selectors: {
      title: '#productTitle',
      body: '#feature-bullets, #productDescription',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    urlPattern: 'youtube\\.com|youtu\\.be',
    description: 'YouTube 動画ページ向け (JS レンダリング推奨)',
    loginRequired: false,
    selectors: {
      title: 'title',
    },
  },
];

export function findProfile(id: string): SiteProfile | undefined {
  return BUILT_IN_PROFILES.find((p) => p.id === id);
}

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
