import { NextRequest, NextResponse } from 'next/server';
import { decryptSession, isEmailAllowed, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { getAuthConfig } from '@/lib/auth/config';
import { verifySignedState } from '@/lib/auth/state';

/**
 * Next.js 16 全域安全攔截 Proxy
 * 注意：Next.js 16 正式棄用 middleware.ts，全域中介層統一採用 proxy.ts 並匯出 proxy 函式。
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 靜態資源與 Next.js 內部機制白名單放行
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/icon' ||
    pathname.startsWith('/icon/') ||
    pathname === '/apple-icon' ||
    pathname.startsWith('/apple-icon/') ||
    /\.(ico|png|jpg|jpeg|svg|css|js|webp|woff|woff2|ttf|eot|gif|avif|webmanifest)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. 公開認證、健康檢查端點與公開模板資源白名單放行
  const isPublicAuthPath =
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/health/') ||
    pathname === '/api/templates' ||
    pathname.startsWith('/api/templates/');

  // 3. 讀取並檢驗 Session Token（支援 Cookie 與 Authorization Header 雙通道讀取）
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;
  const sessionToken =
    request.cookies.get(SESSION_COOKIE_NAME)?.value || bearerToken;
  let isAuthenticated = false;

  if (sessionToken) {
    const session = await decryptSession(sessionToken);
    if (session && session.email && isEmailAllowed(session.email)) {
      isAuthenticated = true;
    } else {
      console.warn(
        `[Proxy Check] 憑證無效或非白名單用戶: path=${pathname}, email=${session?.email}, allowed=${session?.email ? isEmailAllowed(session.email) : false}`
      );
    }
  }

  // 雙通道保護：若 Cookie 傳遞受阻或延遲，但帶有 60 秒有效之 quick_auth 簽名憑證
  const quickAuth = request.nextUrl.searchParams.get('quick_auth');
  if (!isAuthenticated && quickAuth) {
    const { authSecret } = getAuthConfig();
    const secretKey =
      authSecret || 'html-anything-production-secret-key-fallback-32chars!!';
    const isQuickValid = verifySignedState(quickAuth, secretKey, 60);
    if (isQuickValid) {
      console.log(`[Proxy] 透過 quick_auth 雙通道驗證成功，直接放行 (path=${pathname})`);
      isAuthenticated = true;
    } else {
      console.warn(`[Proxy Warning] quick_auth 驗證未通過或已逾期`);
    }
  }

  // 4. 已驗證使用者處理
  if (isAuthenticated) {
    // 若已登入且白名單合法，造訪 /login 自動轉向首頁
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 5. 未通過驗證使用者處理
  // 5.1 若造訪公開端點（登入頁、OAuth 端點、健康檢查），放行
  if (isPublicAuthPath) {
    return NextResponse.next();
  }

  // 5.2 受保護之 API 請求：回傳標準 HTTP 401 JSON
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: '未授權存取：請先透過 Google OAuth 登入並取得有效會話。',
      },
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }

  // 5.3 受保護之頁面請求：重導向至 /login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * 攔截除靜態檔案以外之所有路徑
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
