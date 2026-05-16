---
name: doc-kami-parchment
zh_name: "Kami 羊皮纸文件"
en_name: "Kami Parchment Document"
emoji: "📜"
description: "暖羊皮纸底 (#f5f4ed) + 墨藍單色 accent (#1B365D) + 單一衬线字體, 編輯级排印"
category: doc
scenario: personal
aspect_hint: "A4 / Letter 長頁"
featured: 48
recommended: 3
tags: ["kami", "parchment", "serif", "editorial", "report", "letter", "one-pager"]
example_id: sample-kami-parchment
example_name: "Kami 羊皮纸 · One-Pager"
example_format: markdown
example_tagline: "暖羊皮纸 + 墨藍單色 + 單一衬线"
example_desc: "一頁 Open Design Studio Issue №26 編輯级 one-pager"
example_source_url: "https://github.com/tw93/kami"
example_source_label: "tw93/kami"
---

【模板: Kami 羊皮纸文件】
【意圖】严肃排版文件: one-pager / 長報告 / 信函 / 履歷 / 财報 / changelog / portfolio。Inspired by tw93/kami。强調"寫得像被排過版的纸", 不是 dashboard, 不是網頁。

【硬性視覺签名 — 不许改】
- **畫布**: 暖羊皮纸 `#f5f4ed` (永遠不用纯白 `#fff`)。次级背景 `#efeee5`。
- **墨色**: 主文字 `#1f1d18` (近黑暖灰, 不用纯黑 `#000`)。次文字 `#6b665b`。
- **唯一色彩**: 墨藍 `#1B365D` ——所有 accent (連結、tag 描邊、重點數字、引用左 rule) 只能用這一個色, 严禁多色。
- **字體**: 一種語言一種衬线, 全文不混用:
  - 英文: `Charter` (fallback: `Source Serif Pro`, `Iowan Old Style`)
  - 中文: `TsangerJinKai02 W04` (fallback: `Noto Serif SC`)
  - 日文: `YuMincho` (fallback: `Noto Serif JP`)
  - Body 400, Heading 500 (不要 700/800/900)。
- **行高**: 標題 1.1–1.3, 紧凑正文 1.4–1.45, 閱讀型正文 1.5–1.55。
- **绝不**: drop-shadow / blur / 圓角 ≥ 8px / 渐变 / 霓虹色 / rgba (用 solid hex)。
- **細節**: tag 用 solid hex 背景方块 (因為 WeasyPrint 不渲染 rgba 好); 單线几何 icon; 邊缘 1px hairline `#d4d1c5` rule, 長度受控不到邊。

【可選文件型別 — 按用户內容判斷】
- **One-Pager** — 頂 logotype (Charter italic) + 標題 + lede + 3 列要點 + 底脚 metadata。
- **Long Doc** — 封面頁 (大標題 + 副標 + 作者 + 日期) → 目錄 (kicker + page no.) → 章節 (folio 頂角 + section rule + body) → 注釋脚注 + 文末 colophon。
- **Letter** — 抬頭地址 + 日期 + 收件人 + 正文 (左對齊, 段間空 1.5em) + 署名 + 签名占位线。
- **Portfolio** — 專案 hero (大標題 + sub) + 1 張全幅圖 (用 CSS 块繪製占位) + 專案描述 + 角色 / 時間 / stack 元數據 row。
- **Resume** — 頂部姓名 (大字) + tagline 一行 + contact row + 主要 section: experience (公司 / 時間 / 职位 / bullets) + skills + education。
- **Slides** — keynote 風, 頁數由【用户內容】决定 (短內容 6 頁起步, 長內容應更多), 每頁满铺羊皮纸, 大標題 + lede + 角標 page no., 简洁到只有"被印出来"的感覺。
- **Equity Report** — 公司名 + ticker + Q × 年份 + key metrics row (revenue / margin / yoy) + body 分析 + 圖表 (SVG 單色折线)。
- **Changelog** — 版本号 (Charter italic 大字) + 日期 + 改動列表 (Added / Changed / Fixed), 單 rule 分隔。

【設計准则】
- "Composed pages, not dashboards." 不要堆 KPI 卡, 不要堆 emoji 圖示, 不要 hero gradient。
- "Ring or whisper only, no hard drop shadows." 陰影只能是 `0 0 0 1px #d4d1c5` 這種 hairline 描邊。
- 文字层级靠**衬线對比 + 字号 + 留白**, 不靠顏色。
- 單文件 HTML, 用 Tailwind CDN; 全文中英混排時加盘古之白; 不要外链圖片, 占位用 paper-tint 色块 + 1px ink 描邊。
