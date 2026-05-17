# HTML Anything

<p align="center"><sub>來自 <a href="https://github.com/nexu-io/open-design"><b>Open Design</b></a> 團隊 —— <b>40k★ · 200+ 貢獻者</b>，更生產級、迭代更快。html-anything 是專注於 agent 時代 HTML 編輯器這一刀的專案；如果你喜歡這個方向，同一批人做的 <a href="https://github.com/nexu-io/open-design">Open Design</a> 是它在更大規模上的形態，順手也看看。</sub></p>

> **Markdown 是草稿，HTML 才是給人讀的成品 —— 讓本地 agent 直接寫 HTML。** Agent 時代的 HTML 編輯器 —— 既然你已經不親手改文件、全都讓 Claude 改了，那 agent 的輸出就該是讀者真正想看的 HTML，而不是中間態的 Markdown。本地優先、零 API Key、複用你已經登入好的 CLI session —— **8 個 coding-agent CLI** 在 `PATH` 上自動識別（Claude Code · Cursor Agent · Codex · Gemini CLI · GitHub Copilot CLI · OpenCode · Qwen Coder · Aider），驅動 **75 套 skill 範本** 和 **9 類可交付場景**（雜誌文章 · Keynote PPT · 履歷 · 海報 · 小紅書 · 推文卡 · Web 原型 · 數據報告 · Hyperframes 影片）。一鍵複製到公眾號 / X / 知乎，或下載 `.html` / `.png`。

<p align="center">
  <img src="docs/assets/banner.png" alt="HTML Anything — agent 時代的 HTML 編輯器，在你的筆電上" width="100%" />
</p>

<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square" /></a>
  <a href="#支援的-coding-agent"><img alt="Agents" src="https://img.shields.io/badge/agents-8%20CLIs-black?style=flat-square" /></a>
  <a href="#技能範本-skills"><img alt="Skills" src="https://img.shields.io/badge/skills-75-orange?style=flat-square" /></a>
  <a href="#匯出目標"><img alt="Export" src="https://img.shields.io/badge/export-WeChat%20%C2%B7%20X%20%C2%B7%20Zhihu%20%C2%B7%20PNG-9b59b6?style=flat-square" /></a>
  <a href="#快速上手"><img alt="Quickstart" src="https://img.shields.io/badge/quickstart-30%20seconds-green?style=flat-square" /></a>
  <a href="#架構"><img alt="No API key" src="https://img.shields.io/badge/no-API%20key%20required-ff6b35?style=flat-square" /></a>
</p>

<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <b>繁體中文</b></p>

---

## 為什麼要做這個

Anthropic 的 [Claude Code 團隊宣布](https://x.com/trq212/status/2052809885763747935)他們已停止用 Markdown 寫內部文件——他們現在直接寫 HTML。理由很簡單：

| Markdown | HTML |
|---|---|
| 對寫作者友善 | 對讀者友善 |
| 版面受限於渲染器 | 版面完全由你決定 |
| 截圖到 X 上很醜 | 本身就像一張設計圖片 |
| 貼到公眾號 / 知乎還要二次排版 | 一鍵格式轉換 |

**HTML 是給人看的最終形式。Markdown 只是寫作過程中的中間狀態。**

但「寫 HTML」過去意味著要親自寫 CSS、選字型、排格線、做響應式 —— 大多數使用者不願做、設計師嫌麻煩、寫作者沒耐心。所以我們做的是：按下 ⌘+Enter 之後，你的**本地 AI agent** 把任何輸入（Markdown / CSV / Excel / JSON / SQL / 原始筆記）在幾秒內轉成**可立即發布的單一 HTML 檔案**，再一鍵送到公眾號 / X / 知乎 / 任何地方。「可立即發布」是標準——生成完成時，產出物就是你的受眾實際看到的樣子。沒有「之後再修一下」的需求。

---

## 快速上手

```bash
git clone https://github.com/nexu-io/html-anything
cd html-anything
pnpm install
pnpm dev
# → http://localhost:3000
```

開啟瀏覽器 → 頂部工具列自動偵測你已登入的 coding-agent CLI → 選一個範本 → 貼入內容 → ⌘+Enter。

**不需要 API Key。** 我們複用你已透過 `claude login` / `cursor login` / `gemini auth` 建立的 session。

---

## 功能總覽

| | 你得到的 |
|---|---|
| **Coding-agent CLI（8 個）** | Claude Code · Cursor Agent · OpenAI Codex · Gemini CLI · GitHub Copilot CLI · OpenCode · Qwen Coder · Aider —— 啟動時掃描 `PATH`（含 `~/.local/bin`、`~/.bun/bin`、`/opt/homebrew/bin`、`~/.npm-global/bin`），從頂部選單切換。 |
| **零 API Key** | 複用你透過 `claude login` / `cursor login` / `gemini auth` 建立的 session，邊際成本為 **$0**。 |
| **75 套技能範本** | `prototype`（Web / SaaS landing / 儀表板 / 數據報告）· `deck`（20 套 Keynote）· `frame`（10 套 Hyperframes 影片幀）· `social`（X / 小紅書 / Spotify / Reddit 卡片）· `office`（PM 規格 · 工程手冊 · 財務報告 · HR 入職 · 發票 · OKRs · 每週更新 · 會議記錄 · 看板）· `doc`（Kami 暖羊皮紙編輯文件）· `mockup`（3D 裝置框架）· `vfx`（文字光標特效）。 |
| **9 種輸出場景** | 📖 雜誌文章 · 🎬 Keynote PPT · 📄 履歷 · 🖼️ 海報 · 📱 小紅書卡片 · 🐦 推文卡 · 🛠️ Web 原型 · 📊 數據報告 · 🎞️ Hyperframes 影片。 |
| **一鍵匯出** | `juice` 內嵌 CSS → 公眾號貼上零排版 · `modern-screenshot` 渲染 iframe 為 2× PNG → `ClipboardItem` → 直接貼入 X 推文框 · 獨立 `.html` 下載 · 高解析度 `.png` 下載。 |
| **串流即時渲染** | `POST /api/convert` over SSE。Agent 的 stdout JSON-line 串流解析為文字差量 → SSE 事件 → 客戶端追加 → iframe `srcdoc` 即時更新。 |
| **沙盒預覽** | `<iframe sandbox="allow-scripts allow-same-origin">`。使用者生成的 HTML 在隔離 origin 執行 —— Tailwind CDN / Google Fonts / 行內 script 均可運作，但 cookies 和 localStorage 與宿主隔離。 |
| **格式自動偵測** | 編輯器接受 Markdown / CSV / TSV / JSON / SQL / 純文字。`papaparse` + `xlsx` 在瀏覽器端解析表格資料，不上傳任何內容。 |
| **授權** | Apache-2.0 |

---

## 支援的 Coding Agent

啟動時掃描 `PATH`（含 GUI 啟動的 Node 通常遺漏的目錄），並列出所有識別到的 CLI：

| Agent | 偵測執行檔 | 呼叫方式 |
|---|---|---|
| **Claude Code** | `claude` | `claude -p --output-format stream-json` |
| **OpenAI Codex** | `codex` | `codex exec --json --sandbox workspace-write` |
| **Cursor Agent** | `cursor-agent` | `cursor-agent --print --output-format stream-json --force --trust` |
| **Gemini CLI** | `gemini` | `gemini --output-format stream-json --yolo` |
| **GitHub Copilot CLI** | `copilot` | `copilot --allow-all-tools --output-format json` |
| **OpenCode** | `opencode-cli` / `opencode` | `opencode run --format json --dangerously-skip-permissions -` |
| **Qwen Coder** | `qwen` | `qwen --yolo -` |
| **Aider** | `aider` | `aider --no-pretty --no-stream --yes-always --message-file -` |

只要你已在終端機執行過 `claude login` / `cursor login` / `gemini auth`，HTML Anything 就能複用那個 session。**不需要第二份 API Key。**

---

## 技能範本（Skills）

**75 套技能範本位於 [`src/lib/templates/skills/`](src/lib/templates/skills/)**，每套都是一個資料夾，遵循 [`SKILL.md`](https://docs.anthropic.com/en/docs/claude-code/skills) 慣例加上擴充 frontmatter（`mode` · `scenario` · `surface` · `preview` · `design_system`）。

Picker 使用兩個軸：

- **mode** — `prototype` · `deck`（20 套橫向翻頁簡報）· `frame`（10 套 Hyperframes 動態幀）· `social`（4 種社群卡片格式）· `office`（PM / 工程 / 財務 / HR / 營運文件場景）
- **scenario** — `design` · `marketing` · `engineering` · `product` · `finance` · `hr` · `sale` · `personal`

**新增一個技能只需要一個資料夾。** 複製一個相近的技能、編輯其 `SKILL.md` frontmatter、重啟 `pnpm dev`，Picker 就會自動顯示它。

---

## 匯出目標

| 平台 | 實作方式 | 貼上行為 |
|---|---|---|
| **微信公眾號** | `juice` 內嵌 CSS + `data-tool` 標記 | 貼入編輯器，樣式完整保留 |
| **知乎** | 同上 + `<mjx-container>` → `data-eeimg` LaTeX 圖片佔位符 | 上傳後公式正常渲染 |
| **X / 微博 / 小紅書** | `modern-screenshot` → 2× PNG → `ClipboardItem` | 直接貼入發文框 |
| **下載 `.html`** | 資產內嵌的單一檔案 | 任何瀏覽器可開啟 |
| **下載 `.png`** | 高解析度截圖 | 任何地方分享 |

---

## 架構

```
┌─────────────────── 瀏覽器（Next.js 16）────────────────────┐
│  編輯器 / 上傳 · 頂部 agent 選擇器 · 範本 picker · iframe   │
└──────────────┬─────────────────────────────┬───────────────┘
               │ ⌘+Enter                      │
               ▼                              ▼
      ┌──────────────────┐         ┌───────────────────────┐
      │ GET /api/agents  │         │ POST /api/convert     │
      │ 掃描 PATH，列出  │         │ SSE — spawn CLI       │
      │ 已安裝的 CLI     │         │ 管道 stdin / stdout   │
      └──────────────────┘         └──────────┬────────────┘
                                              │ spawn + stdin pipe
                                              ▼
                              ┌──────────────────────────────────┐
                              │  你的本地 coding-agent CLI        │
                              │  claude / codex / cursor-agent / │
                              │  gemini / copilot / opencode /   │
                              │  qwen / aider                    │
                              │  → 複用你現有的 session           │
                              └──────────────────────────────────┘
                                              │
                                stdout JSON-line ──► SSE 事件
                                              │
                                iframe srcdoc 追加（即時）
                                              │
                              ⌘+C 複製 → ClipboardItem
                              ⌘+S 下載 → .html / .png
```

| 層次 | 技術棧 |
|---|---|
| 前端 | Next.js 16 App Router + Turbopack · React 19 · Tailwind v4 · zustand |
| 伺服器路由 | `GET /api/agents`（偵測）· `POST /api/convert`（SSE 串流 spawn） |
| Agent 傳輸 | `child_process.spawn` · 每個 CLI 一個 stdin/stdout 轉接器 |
| 瀏覽器端處理 | `juice`（CSS 內嵌）· `modern-screenshot`（PNG 匯出）· `xlsx` / `papaparse`（試算表解析）· `dompurify`（XSS 防護） |
| 預覽沙盒 | `iframe[sandbox="allow-scripts allow-same-origin"]` + `srcdoc` |
| 發布 | 本地 `pnpm dev` · Vercel 一鍵部署 Web 層（agent 仍在本機） |

---

## Storm Chen 的個人化功能

以下功能是在原版 HTML Anything 之上額外加入的，專為個人工作流程設計。

### 一鍵發布到 GitHub Repo（部落格）

生成的 HTML 頁面可透過「發布」功能直接 commit 到指定的 GitHub 倉庫，搭配 Cloudflare Workers 自動 rebuild，實現端到端的內容發布流程。

**設定方式（Settings → Deploy → GitHub Repo）：**

| 欄位 | 說明 | 範例 |
|---|---|---|
| GitHub Token | Personal Access Token，需有 `repo` 讀寫權限 | `ghp_xxxx` |
| Repository | `owner/repo` 格式 | `stormchen/blog` |
| Branch | 目標分支 | `main` |
| Site URL | 部署後的公開網址（顯示於「Live at」連結）| `https://blog.storm-chen.workers.dev` |

**發布流程：**

```
HTML Anything 按下「發布」
  → 將 HTML 以 base64 + GitHub API PUT commit 到 public/p/<slug>/index.html
  → 同時在 src/content/pages/<slug>.json 新增文章詮釋資料
  → GitHub 收到 push → Cloudflare Workers 自動 rebuild
  → 幾分鐘後即可在 /p/<slug>/ 存取
```

**部落格首頁（`https://blog.storm-chen.workers.dev/`）：**

採用 Storm Chen 品牌設計系統——

- **字型**：Noto Serif TC（標題）· Space Mono（等寬/標籤）· Noto Sans TC（正文）
- **色調**：暖色紙白（`#f5f0e8`）· 鐵鏽紅（`#c4532a`）· 石板灰（`#8b8478`）
- **版型**：Hero（動態幾何圓環 + 即時文章計數）· 關於 · 搜尋（前端即時過濾）· 精選文章 + 列表

### 設定備份與還原

所有設定可一次性匯出為加密 JSON 檔案，方便跨機器遷移或定期備份。

**位置：Settings → 備份**

#### 匯出

1. 在「加密密碼」欄位輸入密碼
2. 按「下載備份」
3. 瀏覽器自動下載 `html-anything-backup-YYYY-MM-DD.json`

備份檔案包含三類資料：

| 類型 | 儲存方式 | 內容 |
|---|---|---|
| 任務與 UI 設定 | 明文 JSON | localStorage 中的所有任務、選用 agent、locale 等 |
| 環境變數 | 明文 JSON | `.env.local` 中的 Ollama URL / model / default agent |
| Deploy Token | **AES-256-GCM 加密** | GitHub / Vercel / Cloudflare 的 API token |

**加密規格：**
- 金鑰派生：PBKDF2-SHA256，300,000 次迭代，隨機 16-byte salt
- 加密演算法：AES-GCM，256-bit，隨機 12-byte IV
- 加解密完全在瀏覽器端（Web Crypto API）執行，明文 token 不經過網路傳輸

#### 匯入

1. 點選「備份檔案」選擇 `.json` 檔案
2. 輸入匯出時的密碼
3. 按「還原備份」
4. 還原完成後，依提示重新整理頁面

> **注意：** 匯入會覆寫目前的 localStorage、deploy token 檔案（`~/.html-anything/*.json`）與 `.env.local`，請確認後再執行。

---

## 狀態

| 功能 | 狀態 |
|---|---|
| Agent 偵測（8 個 CLI） | ✅ 穩定 |
| 技能庫 + Picker（75 套） | ✅ 穩定 |
| SSE 串流渲染 | ✅ 穩定 |
| 沙盒 iframe 預覽 | ✅ 穩定 |
| 一鍵公眾號 / X / 知乎 / `.html` / `.png` 匯出 | ✅ 穩定 |
| CSV / Excel / JSON / SQL 格式自動偵測 | ✅ 穩定 |
| GitHub Repo 一鍵發布 | ✅ 穩定 |
| 設定備份與還原（AES-256-GCM） | ✅ 穩定 |
| 多範本比較預覽（生成 4 個，選 1 個）| 🛠 進行中 |
| Hyperframes → `.mp4` 一鍵交付 Remotion | 🛠 進行中 |
| 瀏覽器擴充功能 | ⏳ 規劃中 |

---

## 貢獻

Issue、PR、新技能、新 agent 轉接器、新匯出目標都歡迎。

- **新增技能** — 在 [`src/lib/templates/skills/`](src/lib/templates/skills/) 新增一個資料夾，包含 `SKILL.md` + `example.html`（+ 選用 `assets/` 和 `references/`）。
- **接入新 CLI** — 在 [`src/lib/agents/argv.ts`](src/lib/agents/argv.ts) 新增一個 entry，涵蓋：偵測執行檔、argv builder、stdin/stdout 協定、串流解析器。
- **新增匯出目標** — 在 [`src/lib/export/`](src/lib/export/) 新增模組並在匯出選單加入按鈕。
- **翻譯與文件** — [`README.zh-TW.md`](README.zh-TW.md) 與英文版平行維護，請同步更新。

完整貢獻說明 → [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## 授權

Apache-2.0 © 2026 HTML Anything contributors。詳見 [`LICENSE`](LICENSE)。

每個內嵌的上游技能在其 `src/lib/templates/skills/<skill>/` 資料夾內保留原始授權與作者歸屬。
