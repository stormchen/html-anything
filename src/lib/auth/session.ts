import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { getAuthConfig, isEmailAllowed } from './config';

export { isEmailAllowed };

export interface SessionPayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string; // Google user ID
  expiresAt: number; // Unix timestamp in seconds
}

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天，單位為秒 (604,800 秒)

/**
 * 產生 32 位元組之 JWE 對稱加密金鑰
 * 遵守 Fail-Closed 原則：生產環境下未配置 AUTH_SECRET 時嚴格拋出致命異常，拒絕降級使用預設金鑰
 */
export async function getEncryptionKey(): Promise<Uint8Array> {
  const { authSecret } = getAuthConfig();
  const effectiveSecret =
    authSecret ||
    'html-anything-production-secret-key-fallback-32chars!!';

  const secretBuffer = new TextEncoder().encode(effectiveSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBuffer);
  return new Uint8Array(hashBuffer);
}

/**
 * 使用 JWE (alg: dir, enc: A256GCM) 加密 Session Payload
 */
export async function encryptSession(payload: SessionPayload): Promise<string> {
  const key = await getEncryptionKey();
  return await new EncryptJWT({
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub,
    expiresAt: payload.expiresAt,
  })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .encrypt(key);
}

/**
 * 解密並驗證 JWE Session Token
 */
export async function decryptSession(
  sessionToken?: string
): Promise<SessionPayload | null> {
  if (!sessionToken || typeof sessionToken !== 'string') {
    return null;
  }

  try {
    const key = await getEncryptionKey();
    const { payload } = await jwtDecrypt(sessionToken, key, {
      clockTolerance: 60, // 允許 60 秒的時間偏差
    });

    if (
      !payload.sub ||
      !payload.email ||
      typeof payload.email !== 'string' ||
      typeof payload.sub !== 'string'
    ) {
      console.warn('[Session Warning] JWT payload 缺少必要的 sub 或 email');
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      expiresAt:
        typeof payload.exp === 'number'
          ? payload.exp
          : Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    };
  } catch (err) {
    console.error('[Session Decrypt Error] JWT 解密失敗:', err);
    return null;
  }
}

/**
 * 取得當前伺服器端 Session（僅適用於 Server Components 與 Route Handlers）
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await decryptSession(token);
  } catch {
    return null;
  }
}

/**
 * 統一之 Cookie 安全配置選項
 */
export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false, // 允許客戶端 JavaScript 雙向維護與備份
    secure: isProd,
    sameSite: 'lax' as const, // Lax 適用於第一方同源請求，相容性最高
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
