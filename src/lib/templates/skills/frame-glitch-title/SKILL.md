---
name: frame-glitch-title
zh_name: "故障艺術標題帧"
en_name: "Glitch Title Frame"
emoji: "⚡"
description: "數字故障 / 像散偏移 / 數據腐败標題, 適合影片轉場 / cyberpunk hero"
category: video
scenario: video
aspect_hint: "1920×1080 (16:9)"
featured: 37
recommended: 6
tags: ["glitch", "cyberpunk", "title", "transition", "vfx", "frame"]
example_id: sample-frame-glitch-title
example_name: "故障標題 · SIGNAL_LOST"
example_format: markdown
example_tagline: "cyan / magenta 像散 + CRT 扫描线"
example_desc: "巨大標題 + 數據腐败伪影 + 角落 ASCII 噪點 chunks"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · glitch"
---

【模板: 故障艺術標題帧 (Glitch Title)】
【意圖】單帧 hero / 影片轉場 / cyberpunk 風格標題。Inspired by hyperframes glitch。

【畫布】1920×1080, 背景 `#070708` 近黑或 CRT 暗灰 `#0d0e10`; 加 56px 網格 (透明 5%) + scanlines 横线 (透明 8%, 2px 間隔)。

【主標題】
- 居中, 6-9vw, weight 800/900, 字體 `Space Grotesk Bold` / `Inter Tight Black` / `JetBrains Mono Bold`。
- 顏色: 主层 `#f5f5f7`; 後面套 2 层伪影:
  - cyan `#00f0ff` translate(`-3px`, `1px`)。
  - magenta `#ff2bd6` translate(`3px`, `-1px`)。
- 整层加 clip-path 切片 5-8 段, 每段 `@keyframes` 隨機 translateX -10px → 10px, 持續 80-160ms, 錯峰播放, 营造 "data corruption" 像散。
- 每隔 1.5s 觸發一次"重故障" — 整個標題被 horizontal smear 1 frame, 用 `filter: url(#displacementFilter)` 或简單 CSS 平移。

【附加层】
- 頂部一行 caption (uppercase mono, 11px, opacity 0.6): `>> SIGNAL_LOST · CH-04 · 14:32:08`。
- 標題下面 1 行副標 (24-28px, mono, opacity 0.7), 偶發被 ` ̶▒̶` 字符替換 (假乱码)。
- 角落隨機點缀 `█▓▒░` ASCII 噪點 chunks。
- 底部 timecode (mono, opacity 0.4)。
- 整畫面叠 noise grain 层 `background-image: url("data:image/svg+xml,...turbulence...")`, opacity 6%, mix-blend-mode overlay。

【SVG 滤镜 (可選)】
- 定義 `<filter id="rgbShift">` 用 `feColorMatrix` + `feOffset` + `feMerge` 把 R/G/B 三通道偏移; 整层 `filter: url(#rgbShift)` 在故障瞬間應用。

【設計細節】
- 顏色仅用: 黑 / 白 / cyan / magenta / 一點 amber 警告色; 严禁全彩虹。
- 字體: 西文 `Space Grotesk` 或 `JetBrains Mono` Bold; 中文 `Noto Sans Mono CJK SC` 或 `Noto Sans SC` Bold。
- 严禁 lorem ipsum; 必須用用户的標題 + 副標。
- 動效用 `@keyframes`, 可被 `prefers-reduced-motion` 關閉 (退回靜态 chromatic split)。
- 單文件 HTML。
