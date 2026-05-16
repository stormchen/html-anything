---
name: email-marketing
zh_name: "行銷郵件"
en_name: "Marketing Email"
emoji: "📧"
description: "產品發布郵件, 含 masthead、hero、CTA、规格表, table-fallback"
category: email
scenario: marketing
aspect_hint: "600 郵件宽"
featured: 7
tags: ["email", "newsletter", "mjml"]
---

【模板: 品牌產品發布郵件】
【意圖】纯 HTML 郵件, 600px 單欄, 相容郵件客户端。
【布局】
- Masthead (wordmark 居中)
- Hero 圖块 (SVG 占位)
- Headline lockup (含 skewed-italic accent)
- Body copy + primary CTA 按钮
- Specifications grid (3 列)
- Footer (社交 + 退订)
【設計細節】
- 使用 `<table role='presentation'>` 做布局兜底
- 顏色用 inline style (不要依赖 class)
