---
name: frame-logo-outro
zh_name: "品牌 Logo 收尾帧"
en_name: "Logo Outro Frame"
emoji: "🎬"
description: "Logo 分块组装入場 + glow bloom + tagline 揭示, 適合影片片尾 / 品牌閉幕"
category: video
scenario: video
aspect_hint: "1920×1080 (16:9)"
featured: 40
recommended: 8
tags: ["logo", "outro", "branding", "end-card", "frame"]
example_id: sample-frame-logo-outro
example_name: "品牌 Logo 收尾 · HTML Anything"
example_format: markdown
example_tagline: "Midnight Indigo + glow bloom"
example_desc: "Logo 装配 + 品牌名 + tagline + CTA, 影片片尾用"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · logo-outro"
---

【模板: Logo 收尾帧 (Logo Outro)】
【意圖】影片結尾的品牌 reveal 帧 —— logo 分块拼装 + glow bloom + tagline 上浮 + CTA。Inspired by hyperframes logo-outro。

【畫布】1920×1080, 黑色 `#08090c` 或品牌深色背景; 加微妙 vignette `radial-gradient(...)` 讓中心更亮。

【布局】
- **中心 Logo**: 用 CSS / 內聯 SVG 繪製; 由 4-8 個几何块 (圆 / 方 / 三角 / hairline) 组成。
  - 入場動畫: 每個块从螢幕外滑入 (±100px 不同方向) + scale 1.4→1.0 + opacity 0→1, 錯峰 80ms; 總時長 1.2s。
  - 入場完成後, 整個 logo 加 glow bloom: `filter: drop-shadow(0 0 24px <accent>40)`; 同時一道 shimmer `mask-image` 横扫 logo (500ms)。
- **品牌名**: logo 下方 6-8% 位置, 大字 (Inter Tight / SF Pro Display, 48-72px, weight 700, letter-spacing -0.02em), 入場: typewriter or fade-up after logo bloom (1.4s 開始)。
- **Tagline**: 品牌名下方一行 (24-28px, weight 400, opacity 0.7), fade in (1.8s)。
- **底部 CTA + 元數據**: 双行底部 row, 例如 `htmlanything.dev · @htmlanything · 2026`, 11px uppercase letter-spacing 0.16em, 顏色 opacity 0.4, hairline 分隔。

【調色 — 4 選 1, 不混用】
- 🌌 **Midnight Indigo** — bg `#08090c`, accent `#7c5cff` (霓虹紫藍 glow)。
- 🌅 **Solar Amber** — bg `#0e0a08`, accent `#ffb547` (暖琥珀)。
- 🌿 **Forest Mint** — bg `#0a1410`, accent `#5fb38a` (薄荷绿)。
- ⚪ **Bone & Ink** — bg `#f1efea`, accent `#0a0a0b` (无 neon, 走 editorial 風, glow 改成陰影)。

【設計細節】
- **绝不**: 用外链 logo 圖片; logo 必須用纯 CSS / 內聯 SVG 几何繪製。
- 入場動畫用 `@keyframes` + `animation-delay`; 可被 `prefers-reduced-motion` 關閉。
- 字體: 西文 `Inter Tight` / `SF Pro Display` / `Manrope`; 中文 `Noto Sans SC` weight 700。
- 必須用用户提供的品牌名 + tagline; 若没有, 跑 fallback "HTML Anything" / "Anything → beautiful HTML"。
- 單文件 HTML; 整個動畫完成後 freeze (不要 loop, 這是影片結尾帧)。
- 頂部可選 5px ribbon (accent 色) 增加品牌識别。
