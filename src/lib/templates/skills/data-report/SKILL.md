---
name: data-report
zh_name: "數據可視化報告"
en_name: "Data Visualization Report"
emoji: "📊"
description: "把 CSV/Excel/JSON 數據轉成漂亮的可視化報告頁"
category: data
scenario: finance
aspect_hint: "桌面長頁面"
featured: 10
tags: ["data", "report", "chart", "數據", "報告"]
example_id: sample-data-weekly-report
example_name: "數據報告 · 週報"
example_format: csv
example_tagline: "KPI 卡 + Chart.js 圖表 + 表格"
example_desc: "9 個月增長數據自動渲染成可視化報告, 內聯 Chart.js"
---

【模板: 數據可視化報告】
- 頭部: 報告標題 + 時間區間 + 數據来源說明。
- KPI 卡片網格: 3-5 個最重要指標, 每個卡片顯示數值 + 同比变化 + 微型趋势线。
- 主圖表區: 至少 2 個圖表 (柱状 / 折线 / 饼 / 散點), 使用 Chart.js 或 ECharts (jsdelivr CDN 引入), 數據从用户輸入解析得到。
- **圖表容器必須有固定高度**: 每個 `<canvas>` 外层包一個 `<div style="position:relative;height:NNNpx">` (KPI 迷你圖 ~40px, 主圖表 ~240–280px)。Chart.js 用 `responsive:true, maintainAspectRatio:false` 時若父容器没有顯式高度, 會陷入 ResizeObserver 死循环, 圖表无限增高直至卡死浏覽器。**绝對不要**直接給 canvas 寫 `height=` 属性当布局, 那個只是初始值。
- 數據表格: 用户原始數據節選, 使用 `<table>` + 現代化樣式 (zebra stripe, hover, sticky header)。
- 洞察块: 3-5 条文字洞察, 用 emoji 開頭, 像產品週報。
- 底部"方法論"折叠區。
- 配色克製专業: 主色 1 + 中性色階, 圖表用調色板。
- **必須解析用户提供的實際數據**, 不要捏造。
