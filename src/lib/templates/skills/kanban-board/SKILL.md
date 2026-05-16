---
name: kanban-board
zh_name: "儀表板 / Kanban"
en_name: "Kanban Board"
emoji: "📌"
description: "To do / In progress / In review / Done 四列, 卡片 + 頭像 + 泳道"
category: dashboard
scenario: operations
aspect_hint: "桌面 1440"
tags: ["kanban", "trello", "sprint", "儀表板"]
---

【模板: Kanban 儀表板】
【意圖】類別 Trello 的 Kanban 單頁。
【布局】
- 頂部 filter bar (assignee / label / search)
- 4 列: To do / In progress / In review / Done
- 卡片含: 標題 / labels / due / avatar / 留言數
- 可選 swimlanes (按 epic / assignee 分组)
【設計細節】
- 不需要真 drag, 但視覺上要像可拖
