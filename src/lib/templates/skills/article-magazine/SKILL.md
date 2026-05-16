---
name: article-magazine
zh_name: "雜誌文章"
en_name: "Magazine Article"
emoji: "📖"
description: "Substack / Medium 高級感長文排版，適合公眾號、部落格發布"
category: article
scenario: marketing
aspect_hint: "A4 / 長頁面"
featured: 11
tags: ["blog", "essay", "newsletter", "公眾號", "部落格", "文章"]
example_id: sample-article-trq212-html
example_name: "雜誌文章 · HTML 取代 Markdown"
example_format: markdown
example_tagline: "靈感來自 @trq212 的推文"
example_desc: "圍繞「AI 時代 HTML > Markdown」的延伸留言，含原推附註與可點擊連結"
example_source_url: "https://x.com/trq212/status/2052809885763747935"
example_source_label: "@trq212 / x.com"
---

【模板: 雜誌文章】
- 頂部 hero: 大標題 (text-5xl/6xl) + 可選副標題 + 作者 / 閱讀時間 / 日期元數據。
- 正文: 單欄，最大寬度約 700px，居中。段落 `text-lg leading-relaxed text-neutral-700 dark:text-neutral-300`。
- H2 / H3 標題用 serif 字體，讓正文與標題有視覺對比。
- 引用塊使用左側粗 accent 色邊線 + 斜體。
- 程式碼區塊: 圓角 + 深色背景 + 淺色文字，顯示語言標籤。
- 列表項使用自訂 bullet（小方塊 / accent 圓點）。
- 章節之間用 `<hr>` 分隔，但樣式做成中央居中的小 ornament。
- 文末加一個簡單的「如果覺得有用，歡迎分享」行動卡片。
