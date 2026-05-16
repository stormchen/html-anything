---
name: frame-data-chart-nyt
zh_name: "NYT 風數據圖表帧"
en_name: "NYT-Style Data Chart Frame"
emoji: "📈"
description: "NYT-newsroom 排版 + 錯峰揭示動畫 + 編輯级圖表 (折线/柱/范围带)"
category: video
scenario: video
aspect_hint: "1920×1080 (16:9)"
featured: 46
tags: ["data", "chart", "nyt", "editorial", "frame"]
example_id: sample-frame-data-chart-nyt
example_name: "NYT 風折线圖 · 全球用户量"
example_format: markdown
example_tagline: "編輯级圖表 + 錯峰揭示"
example_desc: "8 年周活跃用户折线 + NYT red accent + 注釋 mono"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · data-chart"
---

【模板: NYT 風數據圖表帧】
【意圖】把一段數據 (CSV / JSON / 一句結論) 做成《纽约時報》专栏感的單帧/動畫圖表, 適合影片片段或推特卡。Inspired by hyperframes data-chart。

【畫布】1920×1080, 暖白底 `#f7f5ee` 或墨黑底 `#0e0e0e` 二選一; 文字色和背景相反。

【布局】
- **頂部 kicker** (11px uppercase letterspace 0.14em, 顏色 = accent 红 `#a91d1d` 或 mint `#5fb38a`): 數據来源 + 類別目, 如 "GLOBAL · WEEKLY ACTIVE USERS · 2018–2026"。
- **大字標題** (Cheltenham / Playfair / Source Serif Pro, 5.6vw, italic 副標可選): 一句結論。**結論必須从用户數據中提炼**, 不是描述圖。
- **圖表區** (占畫布 55-65%):
  - 折线: 1-2 条线, 主线 ink 實心 2.5px, 次线 dashed 1.5px; 數據點用 6px 實心圆; 關键點旁標注 `2024 · 412M` 黑色 mono 小字。
  - 柱状: 全部 ink 單色或加 1 道 accent 高亮柱; 柱頂大數字; 柱底類別目斜體 (Cheltenham italic)。
  - 范围带 (range band): 浅灰填充 `#e6e2d2` 包絡 + 中线 ink。
- **底部 source + footnote** (10px mono, opacity 0.6): "Source: 用户數據 · Chart by html-anything"。
- **錯峰揭示動畫**: 標題 fade-in (0s), kicker (200ms), 折线 stroke-dashoffset 1.2s ease-out (400ms), 數據標籤依次 100ms 間隔。可被 `prefers-reduced-motion` 關閉。

【設計細節】
- **绝不**: 使用 chart.js / d3 库 (除非 jsdelivr CDN 引入); 推荐手寫 SVG, 不超過 80 行 inline。
- 字體: 標題 `Source Serif Pro` 或 `Cheltenham` (无则用 `Playfair Display`); body `IBM Plex Sans` 或 `Inter`; 數據標籤 `IBM Plex Mono`。
- 1 個主色 (ink) + 1 個 accent (NYT red `#a91d1d` / 編輯 mint `#5fb38a` / 暖橙 `#d97757` 三選一)。
- Y 轴刻度仅 hairline + 3-4 個 tick, 標籤在轴外侧 mono 字。
- 严禁 grid 全螢幕铺线、陰影、3D 立體柱; 严禁 emoji。
- 必須用用户提供的數據。如果輸入是文本結論, 自動估算合理坐標 (但要標注 "schematic"); 如果是 CSV/JSON, 直接繪製。
- 單文件 HTML; 數據點旁注釋格式: `<text class="annot">2024 · 412M</text>`。
