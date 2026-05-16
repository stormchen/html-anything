---
name: invoice
zh_name: "可列印發票"
en_name: "Printable Invoice"
emoji: "🧾"
description: "標准發票: 寄件/收件 + 明细 + 税 + 總額 + 付款指引"
category: finance
scenario: finance
aspect_hint: "A4"
recommended: 13
tags: ["invoice", "bill", "發票"]
---

【模板: 可列印發票】
【意圖】A4 可列印的發票單頁。
【布局】
- Header: 發票号 / 日期 / 截止日
- From / Bill to 兩块
- Line items table (描述 / 數量 / 單價 / 金額)
- Tax breakdown + Totals (右對齊)
- Payment instructions 區
【設計細節】
- @media print 樣式; 顏色對比保留
