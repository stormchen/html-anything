import { NextRequest, NextResponse } from 'next/server';
import { getAuthConfig, getRedirectUri } from '@/lib/auth/config';
import { generateSignedState } from '@/lib/auth/state';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { clientId, authSecret } = getAuthConfig();

  if (!clientId) {
    console.error('[OAuth Error] GOOGLE_CLIENT_ID 未設置');
    const loginUrl = new URL('/login?error=missing_credentials', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 產生具 HMAC 簽名與時間戳的 Signed State，具備無狀態防 CSRF 能力
  const secretKey = authSecret || 'development-secret-must-be-at-least-32-chars-long!!';
  const state = generateSignedState(secretKey);
  const redirectUri = getRedirectUri(request);

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleAuthUrl);

  // 設定短期 state Cookie (有效期限 10 分鐘，雙重保險)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
