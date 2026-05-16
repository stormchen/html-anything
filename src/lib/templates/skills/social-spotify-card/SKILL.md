---
name: social-spotify-card
zh_name: "Spotify 正在播放卡"
en_name: "Spotify Now-Playing Card"
emoji: "🎵"
description: "Spotify Now Playing 風格卡: 专辑封面 + 進度条 + 播放控製, 適配影片叠加 / 個人主頁"
category: card
scenario: personal
aspect_hint: "1280×720 或 600×200"
featured: 43
tags: ["spotify", "music", "now-playing", "card", "overlay"]
example_id: sample-social-spotify-card
example_name: "Spotify Now Playing · Lo-Fi"
example_format: markdown
example_tagline: "Spotify 經典 dark 卡"
example_desc: "Lo-Fi Beats · Chillhop 進度条 1:24 / 3:42 + 控製行"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · spotify-card"
---

【模板: Spotify Now-Playing 卡】
【意圖】把一首歌、一段播客、或一段個人介绍渲染成 Spotify 正在播放卡, 適合 video overlay / 個人 about page / 創作者 hero。Inspired by hyperframes spotify-card。

【畫布】兩個尺寸:
- 横版影片叠加: 1280×720, 卡片居中或左下角浮動。
- 紧凑横条 widget: 600×200, 可嵌入到任何 hero。

【卡片結构】
- 外框: 圓角 12-16px; bg 用专辑封面色提取的暗渐变 (e.g. `linear-gradient(135deg, #1e3264 0%, #0d1f3d 100%)`) 或 Spotify 經典 `#121212`; 邊缘有 1px subtle border。
- 左侧: **专辑封面** (CSS 渐变 + 大字 monogram 或抽象几何描繪, 不能外链圖片), 圓角 6px, 60-200px 方形。
- 右侧:
  - 頂部 `NOW PLAYING` (uppercase letterspace 0.14em, 11px, 绿色 `#1DB954`)。
  - **歌名 / 標題** (Inter / Spotify Circular, 22-28px, weight 700, 白色)。
  - **艺人 / 副標** (16px, weight 400, opacity 0.7)。
  - 進度条: 4px 高, 圓角, 灰色背景 + 白色 fill (`width: 38%`); 兩端時間戳 `1:24 / 3:42` (mono, 11px, 灰)。
  - 控製行: ⏮ ⏯ ⏭ icon (inline SVG, 24px, 白色 fill), shuffle / repeat icon 较小。
- 右上角: Spotify logo (內聯 SVG, 绿色 `#1DB954` 圆 + 三道白色波纹)。
- 可選: 右下角小型音波動效 (3 個 bar `@keyframes`)。

【字體】
- 主: `Spotify Circular` → fallback `Inter` / `Inter Tight`, weight 400 / 700。
- 數字: 同主字體, 不用 mono 太多。

【設計細節】
- Spotify 經典 dark mode: `#121212` bg, `#1DB954` accent, `#b3b3b3` secondary text。
- 若用户輸入是文本/標題 → 把 "標題" 当歌名, "副標/作者" 当艺人, 估算"時長" 3:42 預設。
- 若用户輸入是音樂相關 → 直接對應。
- 严禁外链圖片; 封面用 CSS 渐变 + 文字 logo / 几何描繪。
- 微動效: 音波動效用 `@keyframes`, 可被 `prefers-reduced-motion` 關閉。
- 單文件 HTML。
