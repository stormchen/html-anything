---
name: flowai-team-dashboard
zh_name: "FlowAI 团队管理"
en_name: "FlowAI Team Dashboard"
emoji: "🌊"
description: "三個 tab 的团队管理後台: 成员、详情、活動日志, 含圖表 + CSV 匯出"
category: dashboard
scenario: operations
aspect_hint: "桌面 1440"
tags: ["flowai", "team", "members"]
---

【模板: FlowAI 团队管理 Dashboard】
【意圖】FlowAI 美学的团队管理 admin 單頁。
【布局】
- Tabs: Team Members / Team Details / Activity Log
- KPI stat row
- Member table (avatar + 角色 + 状态)
- Role distribution bar chart
- Online presence + activity sparklines
- Top contributors panel
【設計細節】
- light/dark 切换, hover tooltip, click-to-zoom panels
- CSV export 按钮 (前端實現)
