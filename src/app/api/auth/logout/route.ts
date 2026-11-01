import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { getBaseUrl } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

function handleLogout(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const response = NextResponse.redirect(new URL('/login', baseUrl));

  // 清除 session cookie
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}
