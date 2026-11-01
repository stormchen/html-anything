/**
 * 客戶端會話同步與 API 請求自動防護模組
 * 確保在任何瀏覽器 Cookie 限制或代理層影響下，API 均能具備 100% 的通過率
 */

export function setupClientAuthSync() {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('html_anything_session');

  // 1. 若本地存有有效 Session，主動補充至 document.cookie
  if (token && !document.cookie.includes('session=')) {
    const isHttps = window.location.protocol === 'https:';
    document.cookie = `session=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isHttps ? '; Secure' : ''}`;
  }

  // 2. 全域攔截 window.fetch，為所有 /api/ 請求自動注入 Authorization Bearer 標頭
  const win = window as typeof window & { __html_anything_fetch_patched?: boolean };
  if (!win.__html_anything_fetch_patched) {
    win.__html_anything_fetch_patched = true;
    const originalFetch = window.fetch;

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const activeToken = localStorage.getItem('html_anything_session');
      if (activeToken) {
        let isApiRequest = false;
        if (typeof input === 'string') {
          isApiRequest = input.startsWith('/api/') || input.includes('/api/');
        } else if (input instanceof URL) {
          isApiRequest = input.pathname.startsWith('/api/');
        } else if (input instanceof Request) {
          isApiRequest = input.url.includes('/api/');
        }

        if (isApiRequest) {
          const customInit: RequestInit = { ...init };
          const headers = new Headers(
            customInit.headers || (input instanceof Request ? input.headers : undefined)
          );
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${activeToken}`);
          }
          customInit.headers = headers;
          return originalFetch.call(this, input, customInit);
        }
      }
      return originalFetch.call(this, input, init);
    };
  }
}

// 在瀏覽器端模組載入時立即自執行，杜絕與提早發起的 fetch 出現時序競態
if (typeof window !== 'undefined') {
  setupClientAuthSync();
}
