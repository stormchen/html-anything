---
name: frame-light-leak-cinema
zh_name: "底片漏光電影帧"
en_name: "Light-Leak Cinematic Frame"
emoji: "🎞️"
description: "底片漏光 + 顆粒噪點 + 16:9 letterbox + 衬线大字, 電影感開場 / 章節卡"
category: video
scenario: video
aspect_hint: "2.39:1 letterbox (1920×800) 或 16:9 (1920×1080)"
featured: 36
tags: ["cinema", "film", "light-leak", "grain", "letterbox", "frame"]
example_id: sample-frame-light-leak-cinema
example_name: "底片漏光 · REEL 03"
example_format: markdown
example_tagline: "暖橙漏光 + 35mm 顆粒"
example_desc: "2.39:1 letterbox + 衬线斜體大字 + 底片齿孔"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · light-leak"
---

【模板: 底片漏光電影帧】
【意圖】纪錄片 / 個人短片 / 影片章節卡的開場單帧 —— 暖橙漏光 + 35mm 顆粒 + 衬线大字, 古典底片質感。Inspired by hyperframes light-leak。

【畫布】
- **2.39:1 letterbox** (推荐): 1920×800, 上下黑邊各 140px (`#000`)。
- 或 16:9: 1920×1080, 无 letterbox。

【背景】
- 底层: 深暖色 (深红棕 `#1a0d08` / 墨绿 `#0a1410` / 藍紫 `#0d0e1a`) 或場景描繪 (CSS gradient 模拟天空 / 室內 / 室外)。
- **底片漏光 (Light Leak)**: 2-3 個大 `radial-gradient(ellipse at top right, #ffb547 0%, transparent 50%)` + 1 個底部 `linear-gradient(to top, #d97757 0%, transparent 30%)`; 顏色取暖橙 / 桃 / 玫红 / 暗黃, **不要冷藍**。
- **35mm Grain**: 全螢幕覆盖 SVG turbulence noise 圖层, opacity 14%, `mix-blend-mode: overlay`; 也可用 `background-image: url("data:image/svg+xml,...feTurbulence...")`。
- 可選: 1 道 `feDisplacementMap` 模拟底片摆動 (慎用)。

【文字】
- 中央或左下: 大字衬线 (Source Serif Pro / Playfair Display / EB Garamond) 5-8vw, weight 500 italic; 顏色暖白 `#f5e9d6` 或 cream。
- 副標 (24-28px) 一行, opacity 0.7, 同樣衬线。
- 角落 caption (uppercase letterspace 0.18em, 10-11px, mono, opacity 0.5): "REEL 03 · CH I · 1985"。
- 底部 timecode + 拍摄地 + 日期 (mono, opacity 0.4)。

【可選附加】
- "底片划痕": 几条 1-2px 竖向白线, opacity 0.2, 不规则間距 (用 `box-shadow` 多重 inset 或多個 `<div>`)。
- "底片齿孔": letterbox 黑邊內, 等距小白方块 (CSS repeating-linear-gradient)。
- 入場動效: 整畫面从 underexposed (brightness 0.3) → normal, 800ms 內; 漏光位置缓慢漂移 12s 一個周期。

【設計細節】
- 顏色绝不超過 4 個色相 (深背景 + 2 個暖漏光色 + 文字 cream)。
- 严禁: 藍紫漏光 (違反底片質感)、emoji、霓虹色、几何 dashboard 装飾。
- 中文: `Noto Serif SC` italic 不存在 → 用 `Noto Serif SC` regular + 字距加大。
- 必須用用户提供的標題; 自動估算合理"年份 / 章節 / 地點" 元數據 (但来源用户內容)。
- 單文件 HTML, 用 `prefers-reduced-motion` 關動效。
