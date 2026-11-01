# HTML Anything - Google Cloud Run 部署與維運完整指南

本指南詳細記錄如何將 `html-anything` 容器化部署至 **Google Cloud Run**，並透過 **Google OAuth 2.0** 與 **信箱白名單機制** 落實單一使用者存取防護。

---

## 目錄 (Table of Contents)

1. [架構特點與成本防護](#1-架構特點與成本防護)
2. [前置準備與工具安裝](#2-前置準備與工具安裝)
3. [Google Cloud Console OAuth 2.0 設置指南 (手把手)](#3-google-cloud-console-oauth-20-設置指南-手把手)
   - 3.1 建立或選定 GCP 專案
   - 3.2 設定 OAuth 同意畫面 (Testing 模式)
   - 3.3 建立 OAuth 2.0 用戶端憑證
4. [配置生產環境變數檔 (.env.production)](#4-配置生產環境變數檔-envproduction)
5. [一鍵自動化部署指南](#5-一鍵自動化部署指南)
   - 5.1 Windows PowerShell (`deploy.ps1`)
   - 5.2 Linux / macOS / WSL Bash (`deploy.sh`)
   - 5.3 無本機 Docker 之替代方案：Google Cloud Build 雲端建置
6. [部署後關鍵步驟：回填 Google OAuth 重新導向 URI](#6-部署後關鍵步驟回填-google-oauth-重新導向-uri)
7. [端到端功能驗收清單與測試指令](#7-端到端功能驗收清單與測試指令)
8. [常見問題排查 (Troubleshooting)](#8-常見問題排查-troubleshooting)

---

## 1. 架構特點與成本防護

- **Next.js 16 Standalone 輕量架構**：多階段 Alpine 容器映像檔體積僅約 180MB，冷啟動延遲僅約 1.5 秒。
- **超長請求超時保障 (`--timeout 3600`)**：支援最長 1 小時 (3600 秒) 請求維持，完美保障 Server-Sent Events (SSE) AI 串流長連線與非同步部署任務不中斷。
- **縮容至零 (Scale-to-Zero, `--min-instances 0`)**：無人存取時自動休眠，計費歸零；在 GCP 官方每月免費額度 (Free Tier: 200 萬次請求、360,000 GiB-秒運算) 保護下，個人使用預估月費為 **$0.00 美元**。
- **物理防刷上限 (`--max-instances 10`)**：限制最高同時擴展 10 個容器實例，徹底阻絕惡意流量刷取產生的雲端帳單風險。
- **雙軌安全防護模型**：Cloud Run 配置 `--allow-unauthenticated` 提供公網連線便利，由 Next.js 應用層全域 Proxy (`src/proxy.ts`) 接管身份認證，未授權連線即刻被攔截。

---

## 2. 前置準備與工具安裝

在執行部署前，請確認本機已安裝以下工具：

1. **Google Cloud SDK (`gcloud` CLI)**：
   - 官方下載安裝：https://cloud.google.com/sdk/docs/install
   - 驗證安裝：
     ```bash
     gcloud --version
     ```
   - 登入您的 Google 帳號：
     ```bash
     gcloud auth login
     ```

2. **容器構建環境 (二擇一)**：
   - **方案 A (推薦)**：本機安裝並啟動 **Docker Desktop** (https://www.docker.com/products/docker-desktop/)。
   - **方案 B (免本機 Docker)**：直接使用 GCP 雲端 **Google Cloud Build** 構建（在部署指令中加入 `-UseCloudBuild` 或 `--use-cloud-build` 參數）。

---

## 3. Google Cloud Console OAuth 2.0 設置指南 (手把手)

為啟用 Google 帳號登入與白名單存取控制，必須在 Google Cloud Console 中建立憑證。

### 3.1 建立或選定 GCP 專案
1. 進入 [Google Cloud Console](https://console.cloud.google.com/)。
2. 點擊頂部專案選單，點選「**新增專案 (New Project)**」，輸入專案名稱（例如 `html-anything-prod`）並建立。
3. 記下該專案的 **專案 ID (Project ID)**。

### 3.2 設定 OAuth 同意畫面 (Testing 模式)
> 💡 **核心優勢**：設定為「測試 (Testing)」模式免於向 Google 提交複雜的應用程式驗證、隱私權政策網址審核，即可供指定的測試使用者永久安全登入。

1. 導覽至「**API 和服務**」->「**OAuth 同意畫面 (OAuth consent screen)**」。
2. 使用者類型 (User Type) 選擇「**外部 (External)**」，點擊「**建立**」。
3. 填寫應用程式基本資訊：
   - **應用程式名稱**：`HTML Anything`
   - **使用者支援電子郵件**：選擇您自己的 Google 信箱
   - **開發人員聯絡資訊**：填寫您自己的 Google 信箱
   - 點擊「**儲存並繼續**」。
4. **範圍 (Scopes)** 步驟：
   - 點擊「**新增或移除範圍**」，勾選 `.../auth/userinfo.email` 與 `.../auth/userinfo.profile`（以及 `openid`）。
   - 點擊「**更新**」，接著點擊「**儲存並繼續**」。
5. **測試使用者 (Test users)** 步驟 (關鍵！)：
   - 點擊「**ADD USERS**」。
   - 輸入您允許登入此系統的 Google 信箱（例如您的個人 Gmail）。
   - 點擊「**儲存並繼續**」。
6. 確認摘要後返回資訊主頁，確認發布狀態維持在「**測試中 (Testing)**」。

### 3.3 建立 OAuth 2.0 用戶端憑證
1. 導覽至「**API 和服務**」->「**憑證 (Credentials)**」。
2. 點擊頂部的「**+ 建立憑證 (+ CREATE CREDENTIALS)**」->「**OAuth 用戶端 ID (OAuth client ID)**」。
3. 應用程式類型選擇「**網頁應用程式 (Web application)**」。
4. 名稱填寫：`HTML Anything Web Client`。
5. **已授權的重新導向 URI (Authorized redirect URIs)**：
   - 由於初次部署前尚未得知 Cloud Run 產生的隨機域名，可先新增本機測試網址：
     ```text
     http://localhost:3000/api/auth/callback
     ```
   - *(待部署完成取得正式網址後，再回填正式 URI，詳見第 6 節)*。
6. 點擊「**建立**」。
7. 彈出視窗將顯示您的：
   - **用戶端 ID (Client ID)**
   - **用戶端密鑰 (Client Secret)**
8. 請複製妥善保存，供下一步填入環境變數。

---

## 4. 配置生產環境變數檔 (.env.production)

在專案根目錄下，複製範本檔案：

```bash
cp .env.production.example .env.production
```

使用文字編輯器開啟 `.env.production`，填入真實內容：

```dotenv
# 1. 系統設定
NODE_ENV=production
PORT=3000
AUTH_TRUST_HOST=true

# 2. Google Gemini API Key (至 https://aistudio.google.com/ 取得)
GEMINI_API_KEY=AIzaSyYourRealGeminiApiKeyHere

# 3. Session 加密主密鑰 (長度至少 32 字元的高熵隨機字串)
AUTH_SECRET=your-random-high-entropy-secret-at-least-32-chars-long

# 4. Google OAuth 憑證 (由 Google Cloud Console 複製)
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-yourSecretKeyHere

# 5. 管理員單一存取白名單 (僅允許此信箱登入)
ALLOWED_EMAILS=owner@gmail.com

# 6. 公開網址 (首次部署可先留空或填寫暫定值，部署後取得 *.run.app 再回填)
NEXT_PUBLIC_APP_URL=
```

### 如何生成高熵 AUTH_SECRET：
- **Linux / macOS / Git Bash**：
  ```bash
  openssl rand -base64 32
  ```
- **Windows PowerShell**：
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```

---

## 5. 一鍵自動化部署指南

本專案提供跨平台自動化腳本，自動處理：
GCP 專案切換 -> API 啟用 -> 建立 Artifact Registry 儲存庫 -> 構建與推播映像檔 -> 發布 Cloud Run 服務 -> 自動取得服務網址與連線健康探測。

### 5.1 Windows PowerShell (`deploy.ps1`)

開啟 PowerShell 終端機，切換至專案根目錄：

```powershell
# 若遇到系統禁止執行腳本之安全性限制，可先在當前工作階段放行：
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 基本一鍵部署 (指定專案 ID)
.\deploy.ps1 -ProjectId "your-gcp-project-id"

# 或直接透過單行 Bypass 呼叫：
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -ProjectId "your-gcp-project-id"

# 完整參數範例
.\deploy.ps1 `
  -ProjectId "your-gcp-project-id" `
  -Region "us-central1" `
  -ServiceName "html-anything" `
  -EnvFile ".env.production"
```

### 5.2 Linux / macOS / WSL Bash (`deploy.sh`)

開啟 Bash 終端機，切換至專案根目錄：

```bash
# 確保腳本具備執行權限
chmod +x deploy.sh

# 基本一鍵部署
./deploy.sh --project-id "your-gcp-project-id"

# 完整參數範例
./deploy.sh \
  --project-id "your-gcp-project-id" \
  --region "us-central1" \
  --service-name "html-anything" \
  --env-file ".env.production"
```

### 5.3 無本機 Docker 之替代方案：Google Cloud Build 雲端建置

若本機未安裝或未啟動 Docker Desktop，只要加上 Cloud Build 參數，腳本便會自動將源碼打包至 GCP 雲端進行容器構建：

- **PowerShell**：
  ```powershell
  .\deploy.ps1 -ProjectId "your-gcp-project-id" -UseCloudBuild
  ```
- **Bash**：
  ```bash
  ./deploy.sh --project-id "your-gcp-project-id" --use-cloud-build
  ```

---

## 6. 部署後關鍵步驟：回填 Google OAuth 重新導向 URI

部署完成後，腳本會輸出類似如下的預設服務連線網址：
```text
https://html-anything-98425173-uc.a.run.app
```

請執行以下反向回填設定以使 Google OAuth 登入生效：

1. 前往 [Google Cloud Console 憑證頁面](https://console.cloud.google.com/apis/credentials)。
2. 點選進入先前記下的「**OAuth 2.0 用戶端 ID**」。
3. 在「**已授權的重新導向 URI**」清單中，點選「**+ 新增 URI**」，貼上：
   ```text
   https://html-anything-98425173-uc.a.run.app/api/auth/callback
   ```
   *(請將上方域名換成您實際產出的 `*.run.app` 網址，結尾固定為 `/api/auth/callback`)*。
4. 在「**已授權的 JavaScript 來源**」中，新增基礎網址：
   ```text
   https://html-anything-98425173-uc.a.run.app
   ```
5. 點擊「**儲存**」。
6. 更新本地 `.env.production` 中的 `NEXT_PUBLIC_APP_URL`：
   ```dotenv
   NEXT_PUBLIC_APP_URL=https://html-anything-98425173-uc.a.run.app
   ```
7. 再次執行部署指令，將最新的 `NEXT_PUBLIC_APP_URL` 注入 Cloud Run：
   ```powershell
   .\deploy.ps1 -ProjectId "your-gcp-project-id"
   ```

---

## 7. 端到端功能驗收清單與測試指令

取得 Cloud Run 服務網址後，可透過瀏覽器與 `curl` 進行端到端功能驗收：

### 驗收項目 1: 存活探測端點 (/api/health)
```bash
curl -i https://<SERVICE_URL>/api/health
```
- **預期結果**：回傳 HTTP 200 OK，Body 為 `{"status":"ok",...}`。

### 驗收項目 2: 未登入首頁存取攔截
```bash
curl -i https://<SERVICE_URL>/
```
- **預期結果**：回傳 HTTP 307 重導向至 `/login`，或於瀏覽器中直接顯示繁體中文 Google 登入介面。

### 驗收項目 3: 未授權 API 存取阻斷
```bash
curl -i -X POST https://<SERVICE_URL>/api/convert \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello"}'
```
- **預期結果**：回傳 HTTP 401 Unauthorized，Body 為 `{"error":"Unauthorized","message":"請先登入後再進行操作"}`。

### 驗收項目 4: 白名單帳號登入
1. 使用瀏覽器開啟 `<SERVICE_URL>`，自動導向登入頁面。
2. 點擊「**使用 Google 帳號登入**」。
3. 登入列於 `ALLOWED_EMAILS` 中的 Google 帳號。
4. **預期結果**：成功登入並進入 HTML Anything 主工作區，右上角顯示登入者信箱。

### 驗收項目 5: 非白名單帳號拒絕存取
1. 於無痕視窗開啟 `<SERVICE_URL>`。
2. 嘗試使用未列於 `ALLOWED_EMAILS` 的其他 Google 帳號登入。
3. **預期結果**：系統拒絕存取並跳轉至 `/login?error=access_denied`，畫面顯示授權失敗警語。

### 驗收項目 6: SSE 長連線串流轉換測試
1. 在主工作區輸入轉換提示詞，觸發 AI 生成。
2. **預期結果**：AI 生成的 HTML 與樣式即時分段串流輸出，連線維持穩定無逾時中斷現象。

---

## 8. 常見問題排查 (Troubleshooting)

### Q1: 點擊 Google 登入後出現 `redirect_uri_mismatch` (錯誤代碼 400)
- **原因**：Google Cloud Console 憑證中設定的「已授權的重新導向 URI」與應用發起的 URI 不一致。
- **排查方式**：
  1. 檢查 Google 授權畫面上的詳細錯誤資訊，查看所請求的 `redirect_uri` 為何。
  2. 確認已將該完整 URL (`https://<SERVICE_URL>/api/auth/callback`) 正確填入 Google Cloud Console 憑證中。
  3. 注意：協議必須為 `https://`，且結尾不能有多餘斜線。

### Q2: 出現「存取已遭封鎖：應用程式尚未驗證」或「存取遭拒」
- **原因**：OAuth 同意畫面處於「測試 (Testing)」狀態，但嘗試登入的信箱尚未加入「測試使用者 (Test Users)」名單。
- **排查方式**：
  前往 Google Cloud Console ->「API 和服務」->「OAuth 同意畫面」->「測試使用者」，點擊「ADD USERS」將該 Gmail 帳號加入名單中。

### Q3: 部署時出現 `gcloud: command not found` 或認證失敗
- **排查方式**：
  1. 請確認已安裝 Google Cloud SDK 並加入系統 PATH。
  2. 執行 `gcloud auth login` 重新登入。
  3. 執行 `gcloud config set project <PROJECT_ID>` 綁定目標專案。

### Q4: 本機未啟動 Docker 導致映像檔推播失敗
- **排查方式**：
  請在部署指令後方加入 `-UseCloudBuild` (PowerShell) 或 `--use-cloud-build` (Bash)，改由 Google Cloud Build 於雲端進行構建。

---

至此，您的 HTML Anything 已具備最頂級的雲端無伺服器架構、自動化流水線與嚴密的身分安全防護！
