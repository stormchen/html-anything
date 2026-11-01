import crypto from 'node:crypto';

const STATE_MAX_AGE_SEC = 10 * 60; // 10 分鐘

/**
 * 產生防篡改且自帶時間戳的 Signed State Token (Stateless CSRF Protection)
 * 格式: timestamp.nonce.signature
 */
export function generateSignedState(secret: string): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const payload = `${timestamp}.${nonce}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const sig = hmac.digest('hex');
  return `${payload}.${sig}`;
}

/**
 * 驗證 Signed State Token 的簽名與時效性
 */
export function verifySignedState(
  state: string | null | undefined,
  secret: string,
  maxAgeSec = STATE_MAX_AGE_SEC
): boolean {
  if (!state || typeof state !== 'string') return false;

  const parts = state.split('.');
  if (parts.length !== 3) return false;

  const [timestampStr, nonce, receivedSig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  // 檢查是否超時 (預設 10 分鐘)
  const now = Date.now();
  if (now - timestamp > maxAgeSec * 1000 || timestamp > now + 60 * 1000) {
    return false;
  }

  // 驗證 HMAC 簽名防篡改
  const payload = `${timestampStr}.${nonce}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSig = hmac.digest('hex');

  // 時間常數比對防時序攻擊
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );
  } catch {
    return false;
  }
}
