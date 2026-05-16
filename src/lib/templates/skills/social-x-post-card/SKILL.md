---
name: social-x-post-card
zh_name: "X (Twitter) 貼文卡"
en_name: "X / Twitter Post Card"
emoji: "𝕏"
description: "拟真 X 推文卡片 + 互動數據 (likes/reposts/views), 適配影片叠加或圖卡分享"
category: card
scenario: marketing
aspect_hint: "1280×720 或 1080×1080"
featured: 44
tags: ["twitter", "x", "social", "card", "overlay"]
example_id: sample-social-x-post-card
example_name: "X 貼文卡 · AlchainHust 金句"
example_format: markdown
example_tagline: "X dark mode + 互動數據"
example_desc: "一条金句推文 + 12.3K likes / 1.2K reposts + 藍勾"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · x-post"
---

【模板: X (Twitter) 貼文卡】
【意圖】把一段推文內容 (或用户的金句) 渲染成一張拟真度極高的 X 貼文卡片, 用于影片叠加、推特發圖、知識沉淀。Inspired by hyperframes x-post。

【畫布】1280×720 或 1080×1080, 暗背景 `#0f1419` 或亮背景 `#ffffff` (按 X 佈景主題); 卡片居中, 陰影柔和。

【卡片結构】
- 外框: 圓角 16px, 1px border `#2f3336` (dark) / `#eff3f4` (light), 內邊距 16px。
- 頂部 row: 頭像 (48×48 圆形, 用 CSS gradient 占位) + 用户名 + handle `@username` + verified 藍勾 + 時間 (mono, 12px, 灰)。
- 正文: 17-22px, 字重 400; 連結用 X 藍 `#1d9bf0`; hashtag 同色; mention 同色; 段落間空 0.6em。
- 可選: 引用卡 (小卡內嵌, 灰底, 圓角 12px)。
- 可選: 1 張圖 (CSS 渐变 + 描述占位, 不能外链圖片), 比例 16:9, 圓角 12px。
- 互動 row: 4 個 icon + 數字 (回覆 / 轉推 / 引用 / 點赞), icon 用 inline SVG (X 官方風格), 灰色, hover 時变色。
- 頂部右上 X logo 單线 SVG。
- 浏覽量 row: 👁️ + 數字 (小字)。

【字體】
- 西文: `Chirp` (X 的字體) → fallback `Inter` 或 `Segoe UI`。
- 中文: `Noto Sans SC` / `PingFang SC`。
- 數字: 同主字體, 不用 mono。

【設計細節】
- 配色 light: bg `#fff`, text `#0f1419`, secondary `#536471`, border `#eff3f4`, accent `#1d9bf0`。
- 配色 dark (推荐, 影片叠加用): bg `#000`, text `#e7e9ea`, secondary `#71767b`, border `#2f3336`, accent `#1d9bf0`。
- 數字格式化: 1.2K / 4.5M (不要原始 1234)。
- 內容必須来自用户輸入, 不能编造推文。
- 若用户輸入是數據 → 自動總結成一句"金句"推文 (≤ 280 字符)。
- 單文件 HTML; icon 內聯 SVG; 不要任何外部圖片 URL。
- 可選: 卡片背後加微妙径向高光 `radial-gradient(...)` 增加影片叠加的可讀性。
