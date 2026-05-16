---
name: deck-swiss-international
zh_name: "瑞士国際主義 Deck"
en_name: "Swiss International Deck"
emoji: "🟦"
description: "16 列網格 + 單一飽和 accent + 22 個鎖死版面 (Klein Blue / Lemon / Mint / Safety Orange)"
category: slides
scenario: marketing
aspect_hint: "16:9 横向翻頁"
featured: 50
recommended: 2
tags: ["swiss", "grid", "international", "ikb", "editorial", "facts"]
example_id: sample-swiss-international
example_name: "Swiss International · 產品路线"
example_format: markdown
example_tagline: "Klein Blue IKB + 16 列網格"
example_desc: "S01 Cover + S06 KPI Tower 兩頁預覽, IKB 全螢幕標題 + 4 柱状 KPI"
example_source_url: "https://github.com/op7418/guizang-ppt-skill"
example_source_label: "op7418/guizang-ppt-skill"
---

【模板: 瑞士国際主義 Deck (Swiss International)】
【意圖】事實、產品、分析、方法論表达。極度冷靜、理性、学院派, 没有任何手繪 / 噪點 / 装飾。Inspired by op7418/guizang-ppt-skill Style B。

【佈景主題】**只能从下面 4 套二選一, 不许混用、不许改 hex**:
- 🔵 **Klein Blue (IKB)** — accent `#002FA7`, paper `#fafaf8`, ink `#0a0a0a`. 商業 / AI / 設計場景。
- 🟡 **Lemon Yellow** — accent `#FFD500`, paper `#f7f5ee` (淡奶油), ink `#0a0a0a`. 年轻 / 零售 / 體育。文字必須用黑色 (不能白色)。
- 🟢 **Lemon Green / Neon** — accent `#C5E803`, paper `#f7f5ee`, ink `#0a0a0a`. 可持續 / 科技初创 / Gen-Z 品牌。文字必須用黑色。
- 🟠 **Safety Orange** — accent `#FF6B35`, paper `#f7f5ee`, ink `#0a0a0a`. 工業 / 汽車 / 紧急訊息。文字用白色 + bold ≥ 600。

【布局 — 22 個可复用版式池, 不许新增或改造版式; **數量由內容决定**, 把【用户內容】完整覆盖完為止 (短內容 6-10 張起步, 長內容應遠超此范围, 同一版式可在不同章節重复使用)】
- **S01 Cover** — 全螢幕 accent + ASCII 呼吸點阵 + 反白標題 + 元數據 chrome (date / № / topic)。
- **S02 Vertical Timeline** — 左侧虚线轴 + 圆點; 右侧節點 = 年份 + KPI + 描述。
- **S03 Statement** — 9.6vw 居中巨字 + 左侧大段留白 + 底部 hairline + 注釋。
- **S04 Six Cells** — 2×3 網格, 每格: icon + 编号 + 短標題 + 單行描述。
- **S05 Three Sub-cards** — 左侧 hero 標題 + 右侧 3 張水平堆叠的灰色卡。
- **S06 KPI Tower** — 4 列变高藍色柱状; 柱頂 icon; 柱底大數字 + 標籤。
- **S07 H-Bar Chart** — 水平排名横条, 宽度反映數據, 末端標數字。
- **S08 Duo Compare** — 垂直分割线; 左 Before / 右 After。
- **S09 Closing Manifesto** — 左 IKB 块 + ASCII 點阵 + 宣言; 右白底 + 3 条要點。
- **S10 Dot Matrix Statement** — 居中宣言 + 角落几何點矩阵 / 圆环矩阵。
- **S11 Horizontal Timeline** — 頂部 headline, 中部 hairline 轴, 等距節點, 節點下方步驟名。
- **S12 Manifesto + Ink Banner** — 上半 headline + 解釋; 下半全宽黑色横幅 + 反白小字。
- **S13 Three Forces Cards** — 左 ink hero 块; 右 3 張灰色卡, 每卡: 大數字 + 文本。
- **S14 Loop Diagram** — 左编号步驟; 右 SVG 同心环; 中心 "LOOP" 標籤。
- **S15 Image Matrix + Hero Stat** — 4×3 等高卡片 (12 項) + 底部 summary 大數字 + 標籤。
- **S16 Multi-card Brief** — 3×2 微卡; 主文左上, 注脚右下, 單卡 accent 高亮。
- **S17 System Diagram** — 左 headline + 3 段描述; 右 SVG 三同心圆 + 外部標籤。
- **S18 Why Now** — 3 列, 每列: category label + headline + 描述 + 底部數字 (最後一列 accent)。
- **S19 Four Cards** — 頂部 accent hairline + headline + 4 張等宽卡 (元數據 / 標題 / 正文)。
- **S20 Stacked KPI Ledger** — 垂直行 + hairline 分隔; 左大數字 / 中標籤 / 右 icon。
- **S21 Tech Spec Sheet** — 左標題块 / 中 3 個 KPI hairline / 右变高柱 / 底數據。
- **S22 Image Hero** — 上 60% 全宽圖 + 白色標題块覆盖; 下 40% 解釋 + 3 列 KPI。

【設計細節 — 绝對鐵律】
- **只用直角**: 全程 `border-radius: 0`。圓角 = 立刻違反。
- **1px hairline borders**, 黑色或 accent; 严禁陰影 / 渐变 / blur。
- **16 列網格**: `grid-template-columns: repeat(16, 1fr); gap: 0`。
- **字體**: Inter Tight (Latin display) / Inter (body) / Noto Sans SC (中文) / JetBrains Mono (數據); 严禁衬线、严禁装飾字體。
- **字号極端反差**: cover 用 9.6vw display, body 14-16px, label 11px uppercase letterspacing 0.08em。
- **键盘 ← / → 切换 + hash 同步**; 角標固定: `№N/N` 右下, topic 標籤左下。
- **不许编造**: 數字必須来自用户輸入, 圖表柱高 = 真實數據按比例。
- 輸出單文件 HTML, 不用任何外部圖片 URL; 装飾几何 (ASCII 矩阵 / 同心圆) 用纯 CSS 或內聯 SVG。
