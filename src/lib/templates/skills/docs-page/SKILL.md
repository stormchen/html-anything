---
name: docs-page
zh_name: "技術文件頁"
en_name: "Docs Page"
emoji: "📘"
description: "三栏文件頁: 侧導航 + 正文 + 右 TOC"
category: doc
scenario: engineering
aspect_hint: "桌面 1440"
tags: ["docs", "api", "tutorial", "guide"]
---

【模板: 技術文件頁】
【意圖】API / 教學文件單頁, 長讀體驗優先。
【布局】
- Inline-start nav (sections + sticky)
- Article body (含程式碼區塊, callouts, 表格)
- Inline-end TOC (sticky, scroll-spy)
- 頂栏 search + version + 佈景主題切换
【設計細節】
- 程式碼區塊: 圓角 + dark + 語言標籤 + 複製按钮
- callout: info / warn / danger 三色
