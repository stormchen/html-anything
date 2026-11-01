# Project: html-anything Cloud Run Deployment & Google OAuth Security

## Architecture
本專案為 `html-anything` 建立生產就緒之容器化構建、Google Cloud Run 自動化部署，並在應用層透過 Google OAuth 2.0 與管理員信箱白名單實現單一使用者存取防護。

```
[外部使用者 / 訪客] ──HTTP/HTTPS──> [Cloud Run (*.run.app:3000)]
                                           │
                                    [Next.js 16 Proxy (src/proxy.ts)]
                                           ├── 白名單放行: /login, /api/auth/*, /api/health, _next/*, favicon.ico
                                           └── 存取控制檢驗:
                                                 ├── 帶有效 Session -> 放行至核心頁面與 API
                                                 ├── 未授權 API 請求 (/api/*) -> 回傳 HTTP 401 / 403 JSON
                                                 └── 未登入網頁存取 (/*) -> HTTP 307 重導向至 /login
                                           │
                                    [認證模組 (src/lib/auth/)]
                                           ├── OAuth 跳轉: /api/auth/google
                                           ├── OAuth 回呼: /api/auth/callback (比對 ALLOWED_EMAILS)
                                           ├── 會話加密: jose JWE Cookie (HttpOnly, Secure, SameSite=Lax)
                                           └── 登出與當前資訊: /api/auth/logout, /api/auth/me
                                           │
                                    [核心業務功能]
                                           ├── AI 生成串流: /api/convert, /api/draft (SSE, 支援 3600s 超時)
                                           ├── 靜態資源與前端: standalone server (非 root 使用者 nextjs:1001)
                                           └── 存活檢查: /api/health (Node 原生 fetch 探測)
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | `jose` 加密 Session 機制 | 基於 Web Crypto API 與 JWE 實作無狀態加密 Session 讀寫、簽發與校驗 | M1 | Survey Auth |
| F2 | Google OAuth 2.0 端點 | 實作 `/api/auth/google` (授權 URL 產生) 與 `/api/auth/callback` (Code 換取 Token 與 UserInfo) | M1 | Survey Auth |
| F3 | 管理員信箱白名單檢驗 | 讀取 `ADMIN_EMAIL` 或 `ALLOWED_EMAILS`，於 Callback 進行校驗，非白名單拒絕並導向錯誤頁面 | M1 | Survey Auth |
| F4 | 繁體中文 Google 登入介面 | 建立 `/login` 頁面，具備繁體中文引導、錯誤訊息提示與一鍵 Google 登入按鈕 | M1 | Survey Auth |
| F5 | Next.js 16 全域 Proxy 攔截 | 遵循 Next.js 16 規範建立 `src/proxy.ts`，阻絕未授權 API (401/403) 與未授權頁面 (導向 /login) | M1 | Survey Auth |
| F6 | 健康檢查端點 | 建立 `/api/health` 端點，回傳 HTTP 200 `{ status: "ok" }`，並由 `src/proxy.ts` 明確放行 | M1 | Survey Docker |
| F7 | Dockerfile 最佳化 | 鎖定 `corepack prepare pnpm@9 --activate`，確保 `--frozen-lockfile` 穩定 | M2 | Survey Docker |
| F8 | 非 root 權限與檔案結構修補 | 補齊 `public` 與 `.next/cache` 之 `--chown=nextjs:nodejs`，確保最小權限安全 | M2 | Survey Docker |
| F9 | 原生 Docker HEALTHCHECK | 於 Dockerfile 配置基於 Node 內建 fetch 之存活性探測命令 | M2 | Survey Docker |
| F10 | .dockerignore 健全化 | 排除 `.agents`、`*.tsbuildinfo`、`html-anything-backup-*.json`，防止機敏外洩與快取污染 | M2 | Survey Docker |
| F11 | Cloud Run 參數最適化配置 | 規範 `--timeout 3600`、`--port 3000`、`--cpu 1`、`--memory 1Gi`、`--min-instances 0`、`--allow-unauthenticated` | M3 | Survey CloudRun |
| F12 | 環境變數範本與安全指南 | 提供 `.env.production.example` 與 `DEPLOYMENT_GUIDE.md`，說明 Google OAuth 憑證與金鑰配置 | M3 | Survey CloudRun |
| F13 | 自動化部署腳本 (PowerShell & Bash) | 建立 `deploy.ps1` 與 `deploy.sh`，整合專案綁定、API 啟用、Artifact Registry 推播、Cloud Run 發布與 URL 獲取 | M3 | Survey CloudRun |
| F14 | E2E 端到端功能與安全防護驗證 | 驗證未授權攔截、白名單登入、容器建置、健康檢查與 Cloud Run SSE 串流穩定性 | M4 | Survey E2E |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 應用層 Google OAuth 認證與單一存取白名單 | F1, F2, F3, F4, F5, F6 | none | DONE |
| M2 | 容器化構建、非 root 執行與本機驗證 | F7, F8, F9, F10 | M1 (依賴健康檢查端點) | DONE |
| M3 | Cloud Run 部署腳本與環境適配 | F11, F12, F13 | M2 (依賴 Dockerfile 產出) | DONE |
| M4 | 端到端綜合驗收與安全鑑識硬化 (Final Milestone) | F14 (全功能整合、Reviewer、Challenger、Auditor) | M1, M2, M3 | DONE |

## Interface Contracts
### 1. Auth 模組介面契約 (`src/lib/auth/session.ts`)
```typescript
export interface SessionPayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string; // Google user ID
  expiresAt: number; // Unix timestamp in seconds
}

export async function encryptSession(payload: SessionPayload): Promise<string>;
export async function decryptSession(sessionToken?: string): Promise<SessionPayload | null>;
export async function getSession(): Promise<SessionPayload | null>;
export function isEmailAllowed(email?: string): boolean;
```

### 2. 環境變數契約
- `GOOGLE_CLIENT_ID`: Google Cloud Console 簽發之 OAuth 2.0 Client ID (必填)
- `GOOGLE_CLIENT_SECRET`: Google Cloud Console 簽發之 OAuth 2.0 Client Secret (必填)
- `AUTH_SECRET`: 用於 JWE 加密 Session 之 32 位元以上密鑰 (必填)
- `ALLOWED_EMAILS`: 允許存取之管理員信箱，多筆以逗號分隔 (或使用 `ADMIN_EMAIL`) (必填)
- `NEXT_PUBLIC_APP_URL` / `AUTH_URL`: 部署後之應用網址，未設定時自動由 Request Header 推導 (選填)
- `GEMINI_API_KEY`: 核心 AI 生成金鑰 (必填)

### 3. API 路由行為契約
- `GET /api/health` -> HTTP 200 `{ status: "ok", timestamp: "..." }`（免認證）
- `GET /api/auth/google` -> HTTP 302 跳轉至 Google Accounts 授權頁面（免認證）
- `GET /api/auth/callback` -> 驗證 code、換取 token、比對白名單；成功簽發 Cookie 並導向 `/`，失敗導向 `/login?error=access_denied`（免認證）
- `POST /api/auth/logout` -> 清除 Session Cookie 並導向 `/login`
- `GET /api/auth/me` -> 回傳當前使用者資訊 `{ authenticated: true, user: { email, name, picture } }`
- `ALL /api/*` (除白名單路徑外) -> 未認證回傳 HTTP 401 `{ error: "Unauthorized", message: "請先登入後再進行操作" }`

### 4. Next.js 16 Proxy 契約 (`src/proxy.ts`)
- 攔截除靜態資源 (`_next/*`, `favicon.ico`, `*.png`, `*.jpg` 等) 與授權放行路徑 (`/login`, `/api/auth/*`, `/api/health`) 以外之所有請求。
- API 請求未登入回傳 HTTP 401 JSON。
- 頁面請求未登入發送 HTTP 307 跳轉至 `/login`。

## Code Layout
- `src/lib/auth/`
  - `session.ts`: `jose` 加密/解密、Session Cookie 操作
  - `config.ts`: OAuth 參數與白名單判定邏輯
- `src/app/api/auth/`
  - `google/route.ts`: 發起 OAuth 授權請求
  - `callback/route.ts`: 接收回呼、驗證白名單、簽發 Cookie
  - `logout/route.ts`: 登出與清除 Cookie
  - `me/route.ts`: 取得當前使用者身分
- `src/app/api/health/route.ts`: 存活探測端點
- `src/app/login/page.tsx`: 繁體中文登入介面
- `src/proxy.ts`: Next.js 16 全域存取攔截中介軟體
- `Dockerfile`: 多階構建、pnpm@9、Node fetch 健康檢查、非 root 權限
- `.dockerignore`: 健全化排除清單
- `deploy.ps1`: Windows PowerShell 一鍵 Cloud Run 部署腳本
- `deploy.sh`: Linux / macOS Bash 一鍵 Cloud Run 部署腳本
- `.env.production.example`: 生產環境變數範本
- `DEPLOYMENT_GUIDE.md`: 詳細部屬與 OAuth 配置操作指南
