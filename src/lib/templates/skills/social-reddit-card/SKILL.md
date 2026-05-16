---
name: social-reddit-card
zh_name: "Reddit 貼文卡"
en_name: "Reddit Post Card"
emoji: "🔺"
description: "拟真 Reddit 貼文卡 + 上下投票 + 留言數, 適合影片叠加 / 故事分享"
category: card
scenario: marketing
aspect_hint: "1280×720 或 800×600"
featured: 42
tags: ["reddit", "social", "card", "overlay", "story"]
example_id: sample-social-reddit-card
example_name: "Reddit 貼文 · r/programming"
example_format: markdown
example_tagline: "Reddit dark mode + vote rail"
example_desc: "一条 AITA 風格故事 + 12.3k upvotes + 1.2k comments"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · reddit-post"
---

【模板: Reddit 貼文卡】
【意圖】把一段故事 / 提問 / 段子, 渲染成 Reddit 貼文卡片, 用于影片叠加、社群媒體故事分享。Inspired by hyperframes reddit-post。

【畫布】1280×720 (影片叠加) 或 800×600 (單卡分享); 背景透明或暗色 `#0b1416`。

【卡片結构】
- 外框: 圓角 16px, bg 白 `#ffffff` (light) 或 `#1a1a1b` (dark, 推荐 video overlay), border 1px `#edeff1` / `#343536`。
- 左侧 **vote rail** (40-56px 宽):
  - 上箭頭 ▲ (16px, `#878a8c`, hover 变橙 `#ff4500`)。
  - 票數 (Inter, 17px, weight 700, 居中, 顏色: 0 灰 / 正橙 / 负藍); 大數字用 `12.3k` 格式。
  - 下箭頭 ▼ (hover 变藍 `#7193ff`)。
- 主體區:
  - 頂部 meta row: 子版块圖示 (CSS 圆形 + 字母) + `r/subreddit` (粗) + `· Posted by u/username · 3h` (小字灰)。
  - **標題** (Inter / IBM Plex Sans, 22-28px, weight 500, dark text)。
  - 內容: 16px body 或 引用块或 1 張圖 (CSS 渐变占位)。
  - 底部 action row: 💬 `1.2k Comments` · 🏆 Awards · ⤴️ Share · ⋯ icon。
- 頂部右上角 Reddit Snoo logo (內聯 SVG, 橙色 `#ff4500`)。

【字體】
- 主: `IBM Plex Sans` → fallback `Inter`, weight 400/500/700。
- 數字: 同主字體。
- 中文: `Noto Sans SC`。

【設計細節】
- Light mode: bg `#fff`, text `#1c1c1c`, secondary `#7c7c7c`。
- Dark mode (推荐): bg `#1a1a1b`, text `#d7dadc`, secondary `#818384`, border `#343536`。
- 票數顏色: 正 = `#ff4500`, 负 = `#7193ff`, 0 = `#878a8c`。
- 標題點擊區可加微妙背景 hover。
- 严禁外链圖片; 圖片占位用 CSS 渐变 + 描述。
- 必須用用户提供的內容; 自動生成合理的 subreddit / username / 票數。
- 單文件 HTML; icon 內聯 SVG (上下箭頭、留言气泡、奖杯)。
