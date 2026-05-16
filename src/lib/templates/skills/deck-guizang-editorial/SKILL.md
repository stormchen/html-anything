---
name: deck-guizang-editorial
zh_name: "贵赞編輯墨水 Deck"
en_name: "Guizang Editorial E-Ink Deck"
emoji: "🖋️"
description: "電子雜誌 × 電子墨水; 10 個版面 + 5 套調色板 (墨水/靛藍瓷/森林墨/牛皮纸/沙丘)"
category: slides
scenario: marketing
aspect_hint: "16:9 横向翻頁"
featured: 49
recommended: 1
tags: ["editorial", "e-ink", "magazine", "narrative", "guizang"]
example_id: sample-guizang-editorial
example_name: "贵赞編輯墨水 · 章節封頁"
example_format: markdown
example_tagline: "墨水經典調色板 + 衬线 display"
example_desc: "L02 Act Divider 章節封頁 + L03 Big Numbers Grid 數據格, 纸感印刷"
example_source_url: "https://github.com/op7418/guizang-ppt-skill"
example_source_label: "op7418/guizang-ppt-skill"
---

【模板: 贵赞編輯墨水 Deck (Editorial × E-Ink)】
【意圖】叙事、觀點、分享、個人風格表达。墨纸印刷感, 不要科技感。Inspired by op7418/guizang-ppt-skill Style A。

【調色板 — 5 選 1, 严禁改 hex、严禁混用】
- 🖋 **墨水經典 Monocle** — ink `#0a0a0b`, paper `#f1efea`, paper-tint `#e8e5de`, ink-tint `#18181a`. 預設 / 通用商業 / 科技。
- 🌊 **靛藍瓷 Indigo Porcelain** — ink `#0a1f3d`, paper `#f1f3f5`, paper-tint `#e4e8ec`, ink-tint `#152a4a`. 科技 / 研究 / 數據。
- 🌿 **森林墨 Forest Ink** — ink `#1a2e1f`, paper `#f5f1e8`, paper-tint `#ece7da`, ink-tint `#253d2c`. 自然 / 可持續 / 文化。
- 🍂 **牛皮纸 Kraft Paper** — ink `#2a1e13`, paper `#eedfc7`, paper-tint `#e0d0b6`, ink-tint `#3a2a1d`. 怀旧 / 人文 / 文学。
- 🌙 **沙丘 Dune** — ink `#1f1a14`, paper `#f0e6d2`, paper-tint `#e3d7bf`, ink-tint `#2d2620`. 艺術 / 設計 / 時尚。

【布局 — 10 個磁带式版式池, 可复用; **數量由【用户內容】决定**, 完整覆盖每個要點; 短內容 6-12 張起步, 長內容應更多 (同一版式可在不同章節重复使用)】
- **L01 Hero Cover** — 居中大字 hero typography + kicker + subtitle + lead paragraph + 底部元數據 row。
- **L02 Act Divider** — kicker + 8.5-10vw 巨大 headline + 一句引言; 章節切换可反色 (ink ↔ paper)。
- **L03 Big Numbers Grid** — 3×2 數據卡 (label / 大數字 / 注釋)。
- **L04 Quote + Image** — 左 kicker + headline + body + callout; 右 16:10 圖 (基线對齊 baseline 不是 top)。
- **L05 Image Grid** — 3×2 或 3×1 等高圖網格 (26vh 或 22vh); 严格統一高度。
- **L06 Pipeline / Flow** — 横向编号步驟组, 每步: №X + 標題 + 描述; 支援键盘逐步推進。
- **L07 Hero Question** — 7vw 全螢幕單一問句, 按語義斷行, 周围極簡。
- **L08 Big Quote** — 5.8vw 巨大衬线引文 + 英文翻译 + 署名 + 日期。
- **L09 Before / After** — 1:1 split; 左列 opacity .55 (旧/before); 右列 full brightness (新/after)。
- **L10 Mixed Media** — 8:4 比例; 左大段文字 (kicker / headline / body / callout) + 右 3:4 竖圖作辅助。

【設計細節】
- **严禁**: 渐变 / drop-shadow / 圓角 / 圆形装飾 / blur / SVG 圖示库 / emoji 装飾。
- **字體**: Display 用 `Playfair Display` (英) / `Noto Serif SC` (中); Body 用 `Inter` / `Noto Sans SC`; 编号 / 數字偶尔可用 italic 衬线。
- **雜誌感細節**: kicker 用 11px uppercase letterspacing 0.12em; folio 右下角 `01 / 12`; 頂部细 hairline rule + 期刊 logo / topic。
- **不许**: 數據捏造、Lorem ipsum、占位圖片 URL。所有圖请用纯 CSS / SVG 內聯描繪 (色块 + 简笔)。
- 键盘 ← / → 切换; hash 同步; 單文件 HTML。
