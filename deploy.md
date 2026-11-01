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
### 5. Windows 桌面捷徑快速啟動 (專屬功能)
針對 Windows 使用者，專案提供了極致便捷的一鍵建立捷徑與啟動功能：
1. **建立捷徑**：雙擊根目錄下的 `windows_setup.bat`，系統會自動在您的 Windows 桌面建立名為 **「HTML Anything」** 的精緻捷徑（附帶系統內建地球圖示）。
2. **一鍵啟動與瀏覽**：以後只要雙擊桌面捷徑，系統就會自動在背景檢查 `pnpm` 並啟動伺服器，並於 3 秒後自動彈出預設瀏覽器導向 `http://localhost:3000`。
3. **優雅關閉**：當不需使用時，直接點擊伺服器控制台視窗右上角的 `[X]` 關閉視窗，即可完美停止伺服器運行。

---

## 🐳 Docker 容器化與 Mac mini 部署指引

本專案支援 Next.js 16 的 `output: "standalone"` 模式，並已配置多階段（Multi-stage）構建，映像檔輕量（約 150MB~200MB）、啟動迅速且支援 Apple Silicon (ARM64) 架構。

### 部署到 Mac mini（推薦方式：直接在 Mac mini 上構建與運行）

1. **在 Mac mini 上安裝 Docker**
   - 推薦安裝 **[Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)** 或更輕量快速的 **[OrbStack](https://orbstack.dev/)**。
2. **將專案放至 Mac mini**
   - 透過 Git clone 或檔案傳輸將專案目錄複製到 Mac mini：
     ```bash
     git clone <your-repo> html-anything
     cd html-anything
     ```
3. **設定環境變數**
   - 複製範本建立 `.env`：
     ```bash
     cp .env.docker.example .env
     ```
   - 若 Mac mini 宿主機同時有運行 Ollama，專案預設已將 Ollama 連線設為 `http://host.docker.internal:11434`，容器可直接存取宿主機的 Ollama。
4. **一鍵編譯並在背景啟動**
   ```bash
   docker compose up -d --build
   ```
5. **瀏覽器存取**
   - Mac mini 本機：`http://localhost:3000`
   - 家中/辦公室區域網路裝置（手機、平板、其他電腦）：`http://<Mac-mini-IP>:3000`
6. **停止與重啟**
   - 停止：`docker compose down`
   - 查看日誌：`docker compose logs -f`

---

## 📦 生產環境傳統建置 (Node.js 原生模式)

若不想使用 Docker，也可直接以 Node.js 原生模式部署：

### 1. 執行正式建置
```bash
pnpm build
```

### 2. 啟動生產環境伺服器
```bash
pnpm start
```

---

## 💡 針對 macOS 搭配 MLX-VLM / 本地 Ollama 的優勢

若您的後端 AI 推論伺服器是使用 Mac Mini / Mac Studio 執行 **MLX-VLM** 或 **Ollama**（基於 Apple Silicon 晶片加速）：
- 只要將本網頁服務與 Mac AI 伺服器置於同一個環境或區域網路下：
  - Docker 容器內可直接使用 `http://host.docker.internal:11434` 或 `http://host.docker.internal:8080` 連線宿主機。
- 由於同機或同網段內，網路傳輸延遲趨近於零，可充分展現串流生成 HTML 與即時預覽的高效流暢體驗。
