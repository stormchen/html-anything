import React from 'react';

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;
  const email = typeof params.email === 'string' ? params.email : undefined;

  let errorMessage: string | null = null;
  let errorDetail: string | null = null;

  if (error) {
    switch (error) {
      case 'access_denied':
        errorMessage = '存取拒絕：未授權的 Google 帳號';
        errorDetail = email
          ? `您的帳號 (${email}) 不在系統管理員白名單中。請切換為授權帳號或通知管理員配置 ALLOWED_EMAILS。`
          : '您的帳號不在系統管理員白名單中，無法存取核心功能。';
        break;
      case 'invalid_state':
        errorMessage = '安全性檢驗失敗';
        errorDetail = '狀態驗證憑證已過期或不符（防 CSRF 安全機制），請重新嘗試登入。';
        break;
      case 'missing_credentials':
        errorMessage = 'OAuth 憑證未配置';
        errorDetail = '伺服器未設定 GOOGLE_CLIENT_ID 或 GOOGLE_CLIENT_SECRET，請確認環境變數配置。';
        break;
      case 'token_exchange_failed':
        errorMessage = '憑證交換失敗';
        errorDetail = '無法向 Google 伺服器換取授權 Token，請檢查網路連線或稍後再試。';
        break;
      case 'missing_code':
        errorMessage = '缺少授權碼';
        errorDetail = 'Google 未傳回有效的授權碼，請重新嘗試。';
        break;
      case 'userinfo_failed':
        errorMessage = '無法讀取帳號資料';
        errorDetail = '無法自 Google 取得您的個人基本資料與電子郵件。';
        break;
      default:
        errorMessage = '登入失敗';
        errorDetail = `授權流程發生未預期的問題 (${error})，請再試一次。`;
        break;
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#15140f] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* 典雅背景光暈裝飾 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-[#f7f1de] via-[#faf9f7] to-[#f4ebe1] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      {/* 主卡片 */}
      <div className="w-full max-w-md bg-white border border-[#15140f]/10 shadow-[0_12px_40px_-12px_rgba(21,20,15,0.08)] rounded-2xl p-8 sm:p-10 flex flex-col items-center">
        {/* 系統 Logo / 標誌 */}
        <div className="w-14 h-14 rounded-2xl bg-[#c96442]/10 border border-[#c96442]/20 flex items-center justify-center text-[#c96442] mb-6 shadow-sm">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>

        {/* 系統標題 */}
        <h1 className="text-2xl font-bold tracking-tight text-[#15140f] text-center mb-1">
          HTML Anything
        </h1>
        <p className="text-xs font-mono text-[#8b8676] mb-6 uppercase tracking-wider">
          AI-Powered Interactive HTML Canvas
        </p>

        {/* 錯誤警告區塊 */}
        {errorMessage && (
          <div className="w-full mb-6 p-4 rounded-xl bg-red-50/80 border border-red-200/60 text-left transition-all">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-900">{errorMessage}</p>
                {errorDetail && (
                  <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                    {errorDetail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 說明文字 */}
        <p className="text-sm text-[#5a5448] text-center mb-8 leading-relaxed">
          本平台已啟用安全存取防護，僅限受信任的個人管理員帳號存取。請使用經授權的 Google 帳號驗證身分。
        </p>

        {/* Google OAuth 登入按鈕 (使用原生 <a> 避免 Next.js prefetch 競態) */}
        <a
          href="/api/auth/google"
          className="w-full flex items-center justify-center gap-3.5 px-6 py-3.5 bg-white hover:bg-[#faf9f7] text-[#15140f] border border-[#15140f]/15 hover:border-[#15140f]/30 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] group"
        >
          {/* 官方 Google 向量標誌 */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="font-semibold tracking-wide">
            使用 Google 帳號登入
          </span>
        </a>

        {/* 底部環境提示 */}
        <div className="mt-8 pt-6 border-t border-[#15140f]/8 w-full flex items-center justify-between text-[11px] text-[#8b8676]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Run 保護就緒
          </span>
          <span>Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}
