/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      // Playwright は将来の Phase 2 用オプション依存。未インストール時もビルドを通す。
      config.externals = [
        ...(config.externals ?? []),
        'playwright',
        'playwright-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
