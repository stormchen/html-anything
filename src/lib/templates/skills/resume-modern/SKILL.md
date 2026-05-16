---
name: resume-modern
zh_name: "極簡履歷"
en_name: "Modern Resume"
emoji: "📄"
description: "現代極簡履歷, A4 單頁, 適合列印或匯出 PDF"
category: resume
scenario: personal
aspect_hint: "A4 (210×297mm)"
recommended: 12
tags: ["resume", "cv", "履歷"]
example_id: sample-resume-frontend
example_name: "極簡履歷 · 前端工程师"
example_format: markdown
example_tagline: "A4 單頁, 可列印 / 匯出 PDF"
example_desc: "高級前端工程师履歷, 兩栏布局, 數字成就高亮"
---

【模板: 現代極簡履歷】
- 容器宽度模拟 A4: `w-[210mm] min-h-[297mm] mx-auto`, 內邊距 16-20mm。
- 頂部姓名巨大 (text-4xl), 底下一行 contact (郵箱 / 電話 / 城市 / GitHub / LinkedIn), 中間用细竖线分隔。
- 主體兩栏可選: 左 60% 主线（經历/專案/教育）, 右 40% 副线（技能/語言/获奖）。
- 章節標題: small caps 風格, 上方一条短 accent 线 (w-8 h-0.5)。
- 經历每条: 公司 + 职位 + 時間區間 (右對齊), 下方 1-3 条 bullet 用動词開頭。
- 不使用花哨顏色, 黑白灰 + 1 個 accent (深藍 / 墨绿)。
- 添加 @media print 樣式, 隱藏不必要的元素, 顏色保留。
