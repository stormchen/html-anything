/**
 * Google OAuth 2.0 與存取控制配置模組
 */

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  authSecret: string;
  allowedEmails: string[];
  appUrl?: string;
}

/**
 * 讀取認證與白名單相關環境變數
 */
export function getAuthConfig(): AuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const authSecret =
    process.env.AUTH_SECRET ||
    'html-anything-production-secret-key-fallback-32chars!!';

  const rawAllowed =
    process.env.ALLOWED_EMAILS || process.env.ADMIN_EMAIL || '';

  const allowedEmails = rawAllowed
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;

  return {
    clientId,
    clientSecret,
    authSecret,
    allowedEmails,
    appUrl,
  };
}

/**
 * 嚴格比對電子郵件是否在管理員授權白名單內
 * - 大小寫不敏感
 * - 去除前後空白
 * - 若未設定任何白名單，安全預設拒絕所有人
 */
export function isEmailAllowed(email?: string | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const { allowedEmails } = getAuthConfig();

  if (allowedEmails.length === 0) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[Auth Warning] 未設定 ALLOWED_EMAILS 或 ADMIN_EMAIL，基於安全考量拒絕所有存取。'
      );
    }
    return false;
  }

  const normalized = email.trim().toLowerCase();
  return allowedEmails.includes(normalized);
}

/**
 * 根據 Request Headers 或環境變數推導應用程式 Base URL
 */
export function getBaseUrl(request?: Request | { headers: Headers }): string {
  if (request && 'headers' in request) {
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (request.headers.get('referer')?.startsWith('https') ? 'https' : 'http');
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host');

    if (host) {
      return `${proto}://${host}`;
    }
  }

  const { appUrl } = getAuthConfig();
  if (appUrl) {
    return appUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}

/**
 * 取得 Google OAuth 2.0 回呼完整路徑
 */
export function getRedirectUri(request?: Request | { headers: Headers }): string {
  const base = getBaseUrl(request);
  return `${base}/api/auth/callback`;
}
