---
name: vfx-text-cursor
zh_name: "VFX 文字光標"
en_name: "VFX Text Cursor"
emoji: "✨"
description: "光標拖光 + 彩色像散射线 + 定向光斑, 適合影片片頭逐字揭示金句"
category: video
scenario: video
aspect_hint: "1920×1080 (16:9)"
featured: 38
recommended: 7
tags: ["vfx", "text", "cursor", "chromatic", "reveal", "frame"]
example_id: sample-vfx-text-cursor
example_name: "VFX 光標 · 開場金句"
example_format: markdown
example_tagline: "逐字揭示 + chromatic 拖光"
example_desc: "光標打字 hot pink + cyan 像散, 影片開場用"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · vfx-text-cursor"
---

【模板: VFX 文字光標 (Text Cursor)】
【意圖】影片開場/Hero 帧 —— 光標在畫布上"打字", 文字逐字浮現, 後面拖着彩色像散尾迹 + 定向光斑。Inspired by hyperframes vfx-text-cursor。

【畫布】1920×1080, 背景 `#06070a` 暗哑黑 或 `#0a0d12` (有暖偏藍); 加微妙 vignette。

【內容】
- 一句金句 (中英不限), 居中, 字号 6-8vw, weight 700, 字體 `Inter Tight` / `Source Sans 3` / `Noto Sans SC`。
- 逐字揭示, 每個字符 80ms 間隔; 当前字符後面跟着一個 cursor `▍` (或细 vertical bar)。
- 已揭示文字預設白色 `#f5f5f7`, opacity 1; 即将揭示位置加 chromatic ghost: 一份 `text-shadow: 2px 0 #ff3b6f, -2px 0 #00d4ff` 在 reveal 瞬間, 200ms 內收敛回正常。
- 光標本身: 16px 宽矩形, 顏色 = accent (取 1: hot pink `#ff3b6f` / cyan `#00d4ff` / amber `#ffb547`), 閃烁 `@keyframes` 1.0s 周期; 後面拖一条 60-120px 的 motion blur trail (径向渐变到透明)。

【光斑 / 射线】
- 在打字位置附近隨機生成 3-5 道**定向光斑** (light leak): 用 `linear-gradient(45deg, transparent, accent20, transparent)` 的细長矩形 + `mix-blend-mode: screen`, 不规则角度。
- 当文字打完, 整段文字加 0.5s shimmer sweep (光带横扫)。

【欄位】
- 頂部 caption (uppercase letterspace 0.18em, 11px, opacity 0.5): "FRAME 01 · OPENING"。
- 文字底下副標 (24-28px, opacity 0.6): 来源 / 章節。
- 右下角 timecode (`00:03:21` mono)。

【設計細節】
- **绝不**: 多色彩虹 chromatic (只用 1 個 hot pink + cyan 這種二元像散, 不要 R/G/B 全色)。
- 字體: 西文 `Inter Tight` Bold; 中文 `Noto Sans SC` Bold; 严禁衬线。
- 動效用 `@keyframes` + JS 計時器 (`setTimeout` 逐字), 可被 `prefers-reduced-motion` 關閉 (直接顯示所有字)。
- 必須用用户提供的金句; 不要捏造。
- 單文件 HTML, 不要外链字體以外的資源。
