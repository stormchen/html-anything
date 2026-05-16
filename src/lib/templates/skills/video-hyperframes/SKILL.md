---
name: video-hyperframes
zh_name: "Hyperframes 影片脚本"
en_name: "Hyperframes Video"
emoji: "🎞️"
description: "Hyperframes / Remotion 相容的連續帧動畫, 可自動播放"
category: video
scenario: video
aspect_hint: "1920×1080 (16:9)"
recommended: 5
tags: ["video", "hyperframes", "remotion", "影片"]
example_id: sample-hyperframes-workflow
example_name: "Hyperframes · AI workflow 影片"
example_format: markdown
example_tagline: "8 帧自動播放, 含進度条 + 元數據"
example_desc: "電影感動畫脚本, 可直接喂給 Remotion 做成 mp4"
example_source_url: "https://github.com/heygen-com/hyperframes"
example_source_label: "heygen-com/hyperframes"
---

【模板: Hyperframes 影片帧】
- 輸出 N 個連續 `<section class="frame">`, 每個 `w-[1920px] h-[1080px]`; N 由【用户內容】資訊密度决定 (短脚本 6-10 帧起步, 長脚本應更多, 每帧只承載一個镜頭/概念)。
- 每帧表达一個镜頭/概念: 文字 + 視覺构圖 (中央构圖 / 黃金分割 / 三分法)。
- 每帧底部隱藏標記 `<!-- frame:N duration:3000 transition:fade -->` 供後續 Remotion / Hyperframes 渲染脚本讀取。
- 頂部加一段 JavaScript 自動播放: 每 3 秒切换到下一帧, 也支援點擊 / 方向键控製; 角落顯示進度条。
- 第 1 帧是 hook (一個數據 / 一個反常識 / 一個問題), 第 2-N 是論證, 最後是結論 + CTA。
- 字号巨大 (text-9xl), 一句話即可, 不要堆砌。
- 配色統一一套電影感 (深色背景 + 1 個霓虹强調色)。
- 輸出最後包含一段简短注釋 `<!-- HYPERFRAMES_META: ... -->`, 包含每帧 duration / transition / sceneSummary 的 JSON 元數據, 用于後續轉 Remotion。
