/**
 * Cookie パーサーユーティリティ
 * Netscape 形式 (ブラウザエクスポート) と raw 形式 (name=value; ...) の両方を処理する
 */

export interface PlaywrightCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

function isNetscape(cookieStr: string): boolean {
  return cookieStr.includes('\t') || cookieStr.trimStart().startsWith('#');
}

function parseNetscapeLines(cookieStr: string): Array<{ name: string; value: string; domain: string; path: string; secure: boolean; expires: number }> {
  const results = [];
  for (const line of cookieStr.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('\t');
    if (parts.length < 7) continue;
    results.push({
      domain: parts[0].replace(/^\./, ''),
      path: parts[2] || '/',
      secure: parts[3]?.toUpperCase() === 'TRUE',
      expires: parseInt(parts[4]) || -1,
      name: parts[5],
      value: parts[6],
    });
  }
  return results;
}

/** fetch の Cookie ヘッダー値として使える文字列に変換 */
export function cookiesToHeader(cookieStr: string): string {
  if (!cookieStr.trim()) return '';

  if (isNetscape(cookieStr)) {
    return parseNetscapeLines(cookieStr)
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
  }

  // raw 形式: 複数行は '; ' で結合
  return cookieStr
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('; ');
}

/** Playwright の addCookies() に渡せるオブジェクト配列に変換 */
export function cookiesToPlaywright(cookieStr: string, pageUrl: string): PlaywrightCookie[] {
  if (!cookieStr.trim()) return [];

  const hostname = (() => {
    try { return new URL(pageUrl).hostname; } catch { return ''; }
  })();

  if (isNetscape(cookieStr)) {
    return parseNetscapeLines(cookieStr).map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain || hostname,
      path: c.path,
      expires: c.expires,
      httpOnly: false,
      secure: c.secure,
      sameSite: 'None' as const,
    }));
  }

  // raw 形式
  const cookies: PlaywrightCookie[] = [];
  for (const pair of cookieStr.split(/[;\n]/)) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    cookies.push({
      name: trimmed.slice(0, eqIdx).trim(),
      value: trimmed.slice(eqIdx + 1).trim(),
      domain: hostname,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'None',
    });
  }
  return cookies;
}
