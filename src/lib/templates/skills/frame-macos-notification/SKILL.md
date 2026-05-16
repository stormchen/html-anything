---
name: frame-macos-notification
zh_name: "macOS 通知横幅"
en_name: "macOS Notification Banner"
emoji: "🔔"
description: "拟真 macOS 通知 banner + app icon + 標題正文, 適合 video overlay / 產品發布預告"
category: card
scenario: video
aspect_hint: "1920×1080 影片或 480×120 横幅"
featured: 41
tags: ["macos", "notification", "banner", "overlay", "frame"]
example_id: sample-frame-macos-notification
example_name: "macOS 通知 · 新功能發布"
example_format: markdown
example_tagline: "Big Sur 磨砂玻璃 banner"
example_desc: "App icon + 標題 + 双行正文, 影片角落叠加用"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · macos-notification"
---

【模板: macOS 通知横幅】
【意圖】把一段公告 / 訊息 / 提示渲染成 macOS Big Sur+ 風格的通知横幅, 適合影片角落叠加、產品發布預告、社群媒體圖。Inspired by hyperframes macos-notification。

【畫布】兩種用法:
- 影片叠加 1920×1080, 通知放右上角, 周围透明。
- 單独 banner 480×120, 居中輸出。

【横幅結构】
- 外框: 圓角 14px (macOS Big Sur 標准), 480×120 (或更長 480×180 含正文), 12-16px 內邊距。
- 背景: **frosted glass** 效果 — `background: rgba(245,245,247,0.78)` + `backdrop-filter: blur(40px) saturate(180%)`; 暗色版 `rgba(28,28,30,0.78)`。
- 邊框: 1px `rgba(0,0,0,0.06)` (light) / `rgba(255,255,255,0.08)` (dark); 頂部加 1px 亮 highlight `rgba(255,255,255,0.5)`。
- 陰影: `0 10px 40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)`。

【內容】
- 左侧: **App icon** (44×44, 圓角 10px, CSS gradient + 1 個 emoji 或 monogram 字母, **不用外链圖片**)。
- 中間:
  - 頂部 row: App 名 (SF Pro 13px, weight 600) + `now` 或具體時間 (12px, opacity 0.6) — 兩端對齊。
  - 標題 (15px, weight 600, 1 行截斷)。
  - 正文 (13px, weight 400, 1-2 行截斷, line-height 1.35)。
- 右侧 (可選): action button "Open" 或 "Reply" (capsule, 浅灰底)。

【字體】
- 主: `SF Pro Text` → fallback `Inter` / `system-ui`; 中文用 `PingFang SC` / `Noto Sans SC`。

【可選附加】
- 多条通知堆叠: 第一条在前, 後面 2 条向後向下递缩 (scale 0.96 + opacity 0.6 + translateY)。
- 入場動效: 从螢幕外右侧滑入 `transform: translateX(110%)→0`, 200ms ease-out; 可被 `prefers-reduced-motion` 關閉。
- 右上角控製 chip "Clear" (hover 顯示, opacity 預設 0)。

【設計細節】
- light mode 背景白磨砂, dark mode (推荐 video) 几乎黑磨砂。
- icon 不能用外链 emoji 圖片, 用 unicode emoji 或 CSS 繪製几何。
- 必須用用户提供的內容; 標題 + 正文清晰来自用户輸入。
- 單文件 HTML, 注意 `backdrop-filter` Safari 需要 `-webkit-` 前缀。
