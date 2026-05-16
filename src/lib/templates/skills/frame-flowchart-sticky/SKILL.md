---
name: frame-flowchart-sticky
zh_name: "便利贴流程圖帧"
en_name: "Sticky Flowchart Frame"
emoji: "📝"
description: "SVG 曲线連接 + 便利贴節點 + 光標互動, 像白板 brainstorm"
category: video
scenario: operations
aspect_hint: "1920×1080 (16:9)"
featured: 45
tags: ["flowchart", "diagram", "sticky", "whiteboard", "frame"]
example_id: sample-frame-flowchart-sticky
example_name: "便利贴流程圖 · 用户 onboarding"
example_format: markdown
example_tagline: "SVG 曲线 + 4 色便利贴"
example_desc: "6 節點 onboarding 流程, 手寫體 + 白板纸底"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · flowchart"
---

【模板: 便利贴流程圖帧 (Sticky Flowchart)】
【意圖】把一個流程 / 系統 / 工作流畫成"白板 + 便利贴"的樣子, 適合 onboarding 影片、營運流程說明、系統架構講解。Inspired by hyperframes flowchart。

【畫布】1920×1080。背景: 米黃白板纸 `#f4ede1` 或冷灰白板 `#f0f2f4`; 加非常浅的 hex grid `rgba(0,0,0,0.04)` 讓它有白板感。

【節點 (Sticky Notes)】
- 每節點 = 一張 240×180px 便利贴, 4 套顏色隨機分配: 黃 `#fcd34d` / 桃 `#fca5a5` / 薄荷 `#a7f3d0` / 天 `#a5b4fc`。
- 便利贴有轻微旋轉 `transform: rotate(±2deg)` 不一致, 投影 `drop-shadow(0 6px 14px rgba(0,0,0,0.12))`, 頂部膠带 `linear-gradient(...)` 装飾。
- 節點內容: 1 個 emoji 或單线 SVG icon + 大字標題 (16-20px) + 一行描述 (12px)。
- 節點字體: `Kalam` / `Caveat` / `Patrick Hand` 手寫感字體 (中文用 `霞鹜文楷` 或 `LXGW WenKai Screen`)。

【連接线 (SVG)】
- 用 `<path>` Bezier 曲线連接節點, stroke `#2a2a2a`, width 2.5, `stroke-linecap: round`, `stroke-dasharray: 0` (實线) 或 `8 6` (虚线 = 条件分支)。
- 箭頭终端用 `marker-end`, 黑色三角小箭頭。
- 复杂節點可有循环或分支: 同一節點連出 2 条 (分叉) 或 2 条進入一節點 (合並)。

【可選互動】
- 頂部 caption (sans, 12px uppercase): "FLOW · MIGRATION · 2026"。
- 鼠標 hover 節點: 抬起陰影 + scale 1.05, 用 CSS transition。
- 一個"光標"装飾 (`<svg>` arrow + name tag), 浮在某節點旁, 模拟 figma 協作光標。

【設計細節】
- 至少 5 個節點, 最多 12 個。
- 節點排布不要全部居中對齊, 要有一點白板風的"隨手贴"感, 但保證連接线清晰不交叉。
- 严禁: 全螢幕深色背景、霓虹色、企業 dashboard 風格。
- 字體不能用 Inter / 衬线, 必須手寫感。
- 單文件 HTML, 不要外部圖示库 (用 inline SVG)。
- 必須用用户的真實流程內容; 節點文字直接来自用户輸入。
