---
name: ppt-keynote
zh_name: "Keynote 風格 PPT"
en_name: "Keynote-style Slides"
emoji: "🎬"
description: "苹果 Keynote 级别投影片, 一屏一卡, 键盘左右切换"
category: slides
scenario: marketing
aspect_hint: "16:9 (1280×720)"
featured: 19
tags: ["slides", "deck", "presentation", "投影片", "演講"]
example_id: sample-ppt-html-anything
example_name: "Keynote PPT · 產品介绍"
example_format: markdown
example_tagline: "7 張投影片講清產品"
example_desc: "苹果 Keynote 風格的產品介绍, ←/→ 切换"
---

【模板: Keynote 風格 PPT】
- 每張投影片是一個 `<section class="slide">`, 整體宽 1280 高 720, 居中顯示, 背景渐变。
- 單頁內容極簡: 大標題 + 1-3 行支援文字; 或一張數據圖; 或一個金句。
- 字号: 標題 `text-7xl font-semibold tracking-tight`, 副標題 `text-2xl text-neutral-500`。
- 第一頁是封面 (佈景主題 + 演講者 / 日期), 最後一頁是 "Thanks." 或行動号召。
- 頂部右上角小指示器: 当前頁 / 總頁數。
- 加一段 JavaScript 监聽 ArrowLeft / ArrowRight / 空格键切换 slide; 同時维护 hash (#/3)。
- 每頁之間用 fade-in 動畫。
- 保持留白, 數據卡片用 grid 布局對齊, 顏色克製。
