import { NextRequest, NextResponse } from 'next/server';
import { getAuthConfig, getRedirectUri, isEmailAllowed, getBaseUrl } from '@/lib/auth/config';
import { generateSignedState, verifySignedState } from '@/lib/auth/state';
import {
  encryptSession,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  SessionPayload,
} from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = getBaseUrl(request);

  // 1. 處理 Google 回傳之授權錯誤
  if (error) {
    console.error(`[OAuth Callback Error] Google 授權失敗: ${error}`);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  // 2. 檢驗 code 參數
  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', baseUrl)
    );
  }

  // 3. 雙重檢驗 state 防範 CSRF 攻擊
  const { authSecret, clientId, clientSecret } = getAuthConfig();
  const secretKey = authSecret || 'development-secret-must-be-at-least-32-chars-long!!';
  const isSignedStateValid = verifySignedState(state, secretKey);
  const savedState = request.cookies.get('oauth_state')?.value;
  const isCookieStateValid = Boolean(savedState && savedState === state);

  if (!isSignedStateValid && !isCookieStateValid) {
    console.error(
      `[OAuth Callback Error] State 檢驗失敗 (signedValid=${isSignedStateValid}, cookieValid=${isCookieStateValid})`
    );
    return NextResponse.redirect(
      new URL('/login?error=invalid_state', baseUrl)
    );
  }

  const redirectUri = getRedirectUri(request);

  try {
    // 4. 以授權碼向 Google 換取 Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error(`[OAuth Callback Error] Token 換取失敗: ${tokenResponse.status} ${errText}`);
      return NextResponse.redirect(
        new URL('/login?error=token_exchange_failed', baseUrl)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 5. 取得 Google 授權使用者資訊
    const userinfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userinfoResponse.ok) {
      console.error('[OAuth Callback Error] 無法讀取 Google 使用者資料');
      return NextResponse.redirect(
        new URL('/login?error=userinfo_failed', baseUrl)
      );
    }

    const userInfo = (await userinfoResponse.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    // 6. 白名單檢驗
    if (!isEmailAllowed(userInfo.email)) {
      console.warn(
        `[Auth Warning] 存取拒絕: 信箱 ${userInfo.email} 不在管理員授權名單中`
      );
      const deniedUrl = new URL('/login', baseUrl);
      deniedUrl.searchParams.set('error', 'access_denied');
      deniedUrl.searchParams.set('email', userInfo.email);
      return NextResponse.redirect(deniedUrl);
    }

    // 7. 白名單通過，建立 Session Payload 並加密簽發
    const sessionPayload: SessionPayload = {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    };

    const sessionToken = await encryptSession(sessionPayload);
    const quickAuth = generateSignedState(secretKey);
    console.log(`[OAuth Callback Success] 登入成功，已為授權信箱簽發會話: ${userInfo.email}`);

    // 8. 寫入 Cookie 並回傳過渡跳轉 HTML
    // 重要：藉由回傳 HTTP 200 HTML 落地頁面，打破跨站重定向鏈
    // 搭配 /?quick_auth 雙通道通行機制，確保即便瀏覽器 Cookie 寫入延遲也能 100% 順暢進入系統
    const redirectHtml = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <title>驗證成功，正在進入 HTML Anything...</title>
  <script>
    try {
      const token = "${sessionToken}";
      // 1. 客戶端直寫 Cookie (同源第一方寫入，不受任何反向代理標頭或過期解析影響)
      const isHttps = window.location.protocol === 'https:';
      const cookieStr = "session=" + encodeURIComponent(token) + "; path=/; max-age=604800; SameSite=Lax" + (isHttps ? "; Secure" : "");
      document.cookie = cookieStr;

      // 2. LocalStorage 備份 (作為雙重保險，供 API 讀取防防禦性補位)
      localStorage.setItem("html_anything_session", token);
    } catch (err) {
      console.warn("Storage write error:", err);
    }
    // 3. 雙通道直通首頁
    window.location.replace("/?quick_auth=" + encodeURIComponent("${quickAuth}"));
  </script>
  <style>
    body {
      background: #faf9f7;
      color: #15140f;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #ffffff;
      border: 1px solid rgba(21, 20, 15, 0.1);
      border-radius: 16px;
      padding: 32px 40px;
      box-shadow: 0 12px 36px -12px rgba(21, 20, 15, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(201, 100, 66, 0.2);
      border-top-color: #c96442;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <div style="font-size: 15px; font-weight: 600; color: #15140f;">授權驗證成功</div>
    <div style="font-size: 13px; color: #8b8676; margin-top: 6px;">正在進入系統，請稍候...</div>
  </div>
</body>
</html>`;

    const response = new NextResponse(redirectHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    // 僅設置單一 Session Cookie，避免多個 Set-Cookie 觸發反向代理的逗點合併 bug
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions()
    );

    return response;
  } catch (err) {
    console.error('[OAuth Callback Exception]', err);
    return NextResponse.redirect(
      new URL('/login?error=internal_error', baseUrl)
    );
  }
}
