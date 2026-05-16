---
name: frame-liquid-bg-hero
zh_name: "流體背景 Hero 帧"
en_name: "Liquid Background Hero"
emoji: "🌊"
description: "WebGL 風流體置换背景 + 頂部叠加金句, 適合影片片頭 / landing hero / 海報"
category: poster
scenario: video
aspect_hint: "1920×1080 (16:9) 或 1080×1920 (9:16)"
featured: 39
tags: ["liquid", "fluid", "background", "hero", "html-in-canvas", "vfx"]
example_id: sample-frame-liquid-bg-hero
example_name: "流體背景 Hero · 金句"
example_format: markdown
example_tagline: "Aurora Violet 流體"
example_desc: "多层 radial-gradient 呼吸背景 + difference 文字"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · vfx-liquid-background"
---

【模板: 流體背景 Hero】
【意圖】可作為影片片頭帧、SaaS landing 頂部 hero、海報底圖。WebGL 流體感, 但用 CSS / canvas 退化繪製, 確保單文件可双击打開。Inspired by hyperframes vfx-liquid-background。

【畫布】1920×1080 (横) 或 1080×1920 (竖), 二選一。背景占满。

【流體背景 — 3 種實現, 按用户偏好選】
1. **CSS 多层 radial-gradient 錯位呼吸** (最稳, 預設推荐):
   - 3-5 個大椭圆 `radial-gradient(...)`, 顏色取自調色板。
   - 每個椭圆套 `@keyframes` 平移 + scale + hue-rotate, 周期 8-14s, 錯峰; 整個畫面叠 `mix-blend-mode: screen` 或 `overlay`。
   - 頂层加 1 层 `backdrop-filter: blur(80px)` 讓邊缘更糊。
2. **Canvas + simple perlin noise** (中階):
   - 80 行 inline JS, 用 `requestAnimationFrame` 畫 metaballs 或 simplex noise field。
   - 效能允许時启用, `prefers-reduced-motion` 時降回靜态截圖。
3. **WebGL fragment shader** (高階, 慎用):
   - 用 jsdelivr CDN 引 `regl` 或 inline plain WebGL。
   - shader 寫 domain-warp noise; 單個 quad, 一個 uniform `u_time`。

【頂层文字层】
- 居中或左下: 一句巨型金句 (5-7vw, 衬线或粗 sans), 字體: `Source Serif Pro` / `Inter Tight` / `Manrope Black`。
- 文字色用 paper white `#fafaf8` 或 ink, 取决于背景明暗; 加 `mix-blend-mode: difference` 讓它在任何流體顏色上都可讀。
- 副標 (小 sans, opacity 0.7) 一行。
- 底部可選 CTA chip 或 hairline + 元數據 row。

【調色 — 4 選 1, 不要彩虹】
- 🌅 **Solar Peach** — `#ffb18a` + `#f78b4c` + `#d97757`, 暖橙桃。
- 🌊 **Ocean Aqua** — `#5ac8fa` + `#0a84ff` + `#1e3a8a`, 海藍。
- 🌌 **Aurora Violet** — `#a78bfa` + `#7c5cff` + `#1e1b4b`, 極光紫。
- 🌿 **Forest Mint** — `#86efac` + `#34d399` + `#065f46`, 苔森林。

【設計細節】
- 严禁: 多色彩虹 (>4 個色相)、PowerPoint 渐变、霓虹荧光叠加。
- 字體: 中文用 `Noto Serif SC` (display) / `Noto Sans SC` (副標)。
- 严禁外链圖片; 全部 CSS + SVG + 可選 canvas。
- 必須用用户提供的金句 / 標題; 如果用户輸入是數據 → 提炼一句 ≤ 18 字的金句。
- 單文件 HTML, 可被 `prefers-reduced-motion` 關動效。
