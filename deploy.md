# HTML Anything 跨平台運行與部署指南

本專案基於 **Next.js 16 + React 19 + Tailwind CSS 4** 構建，前端與伺服器端依賴均採用純 JavaScript/TypeScript 套件，無需依賴特定作業系統的原生二進位檔案。因此，本專案完全支援在 **macOS**、**Windows** 及 **Linux** 系統上原生運行。

---

## 🚀 系統需求與環境準備

在任何作業系統上運行本專案前，請確認已安裝以下工具：

1. **Node.js**: 建議使用 v20 或以上 LTS 版本。
2. **套件管理工具**: 本專案使用 `pnpm` 進行依賴管理。

### macOS 安裝指引
若尚未安裝 Node.js 與 pnpm，可透過 Homebrew 快速安裝：
```bash
brew install node pnpm
```

### Windows 安裝指引
可透過官方安裝檔或使用 Scoop / Winget 安裝：
```powershell
winget install OpenJS.NodeJS
npm install -g pnpm
```

---

## 🛠️ 本地開發與啟動步驟

### 1. 下載專案並安裝依賴
開啟終端機（macOS Terminal / iTerm2 或 Windows PowerShell）：
```bash
git clone <your-repository-url>
cd html-anything
pnpm install
```

### 2. 環境變數配置
在專案根目錄建立 `.env.local` 檔案（可參考現有的設定檔），並設定後端 AI 伺服器（Ollama 或 MLX-VLM）連線資訊：

```env
# Ollama / MLX-VLM 遠端或本地 AI 伺服器位址
NEXT_PUBLIC_OLLAMA_URL=http://192.168.68.112:8080

# 預設使用的模型 ID（留空則使用伺服器的預設/首個模型）
NEXT_PUBLIC_OLLAMA_MODEL=mlx-community/gemma-4-e4b-it-4bit

# 預設啟用的 Agent（填入 "ollama" 表示啟動時自動選擇 Ollama/MLX-VLM）
NEXT_PUBLIC_DEFAULT_AGENT=ollama
```

### 3. 區域網路連線與 HMR 設定注意事項
為了允許在手機或其他區域網路裝置上測試，專案在 `package.json` 的啟動指令已設定綁定全網域 (`-H 0.0.0.0`)。

請同步檢查 `next.config.ts` 中的 `allowedDevOrigins` 白名單。若您的 Mac 或開發裝置的 IP 網段不同，請依實際情況新增：
```typescript
allowedDevOrigins: [
  "192.168.68.115",
  "192.168.68.*",
  "192.168.*.*",
  // 若有其他特定網段需求，請在此處新增，例如 "10.0.*.*"
]
```

### 4. 啟動開發伺服器
```bash
pnpm dev
```
啟動後，瀏覽器前往 `http://localhost:3000` 或 `http://<您的區域網路IP>:3000` 即可開始使用。

---

## 📦 生產環境建置與正式部署 (Production Deployment)

若要將應用程式打包部署到正式環境（如伺服器或 Vercel、Docker 容器等）：

### 1. 執行正式建置
```bash
pnpm build
```
此步驟會執行 TypeScript 型別檢查並產出最佳化後的正式生產檔案於 `.next` 目錄中。

### 2. 啟動生產環境伺服器
```bash
pnpm start
```
應用程式將會以生產模式運行，提供最佳的載入與執行效能。

---

## 💡 針對 macOS 搭配 MLX-VLM 伺服器的優勢

若您的後端 AI 推論伺服器是使用 Mac Mini / Mac Studio 執行 **MLX-VLM**（基於 Apple Silicon 晶片加速）：
- 只要將本網頁服務與 Mac AI 伺服器置於同一個區域網路下（例如 `192.168.68.*` 網段），並在 `.env.local` 正確指定 IP 與埠號（例如 `8080` 或 `11434`）。
- 由於都在同網段內，網路傳輸延遲極低，可充分展現串流生成 HTML 與即時預覽的高效流暢體驗。
