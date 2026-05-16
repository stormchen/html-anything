---
name: deck-open-slide-canvas
zh_name: "1920 畫布自由 Deck"
en_name: "Open-Slide 1920 Canvas Deck"
emoji: "🎨"
description: "鎖死 1920×1080 畫布, React 元件级自由组合, 不绑模板"
category: slides
scenario: design
aspect_hint: "1920×1080 (16:9)"
featured: 35
recommended: 9
tags: ["canvas", "open-slide", "freeform", "1920", "react"]
example_id: sample-deck-open-slide-canvas
example_name: "1920 自由畫布 · Sea Indigo"
example_format: markdown
example_tagline: "鎖死 1920×1080 + 自由组合"
example_desc: "Sea Indigo 調色 + 一頁大字 question + 角標"
example_source_url: "https://github.com/1weiho/open-slide"
example_source_label: "1weiho/open-slide"
---

【模板: 1920 畫布自由 Deck】
【意圖】不想被模板束缚的場景 (個人作品集、奇特演講、艺術 / 設計课 deck)。給一個固定 1920×1080 畫布 + 極强的型別 / 調色约束, 讓 agent 像寫 React 元件一樣按內容自由排布每一頁。Inspired by 1weiho/open-slide。

【硬性技術规格】
- 畫布: 每頁严格 `width: 1920px; height: 1080px;` 用 `transform: scale(...)` 適配視窗 (預設 `scale(0.7)` 居中)。
- **绝對禁止 overflow**: 每頁內容必須 fit in 1920×1080, 不许滚動条出現。
- 字号 type scale (px): `2xs:18 · xs:22 · sm:28 · md:36 · lg:48 · xl:64 · 2xl:88 · 3xl:120 · 4xl:160 · 5xl:220`。
- 邊距 padding: 96 / 128 / 160 三档之一。
- 每頁有 `<section class="slide" data-slide-id="<n>">`。

【調色板 — 每個 deck 選 1 套, 全程不改】
- 🌫 **Ash & Lime** — bg `#f1efea`, ink `#161616`, accent `#c5e803`。
- 🌌 **Sea Indigo** — bg `#0a0e1a`, ink `#f5f5f7`, accent `#5ac8fa`。
- 🧉 **Mate Mocha** — bg `#1a1411`, ink `#f5e9d6`, accent `#d97757`。
- 🌸 **Pearl Rose** — bg `#fdf6f3`, ink `#1a1015`, accent `#ff5d8f`。

【布局自由度 — 這是核心】
- 不强製模板, 每頁根據**內容性質**自選布局: cover / question / quote / image-text / 三列 / 五列 / 列表 / 數據卡 / 满版圖。
- 但每頁**必須遵守一条规则**: 視覺重心 (visual hierarchy) 只有 1 個 — 一句金句、一個數字、一張圖, 不要"什么都强調"。
- 不许塞兩段平等的文字; 真要並列就上 3 列等权重網格。

【字體】
- 西文: `Inter Tight` (display) + `Inter` (body); 或 `Source Serif Pro` (editorial 風時)。
- 中文: `Noto Sans SC` (sans 風) 或 `Noto Serif SC` (editorial 風); 不混 sans + serif。
- mono: `JetBrains Mono` 給數據 / 時間戳。

【設計細節】
- 严禁 emoji 装飾 (內容裡的允许); 严禁多色彩虹; accent 只用一個色。
- 严禁 SVG icon 套用 lucide / feather 等通用库 (自己寫 inline SVG)。
- 加键盘 ← / → 切换 + hash 同步; 角標固定: 右下 `№N/M`, 左下 deck title。
- 必須用用户的真實內容; 严禁 lorem ipsum。
- 單文件 HTML; Tailwind CDN; 不要外链圖片。
