---
name: mockup-device-3d
zh_name: "iPhone × MacBook 立體展架"
en_name: "Device 3D Showcase"
emoji: "📱"
description: "iPhone + MacBook 仿 GLTF 靜态展架, 螢幕內嵌真實 HTML 內容, 玻璃镜頭折射, 360° 轉盘构圖"
category: poster
scenario: product
aspect_hint: "1920×1080 (16:9)"
featured: 47
tags: ["device", "mockup", "iphone", "macbook", "html-in-canvas", "product"]
example_id: sample-mockup-device-3d
example_name: "iPhone × MacBook 立體展架"
example_format: markdown
example_tagline: "HTML-in-Canvas 設备秀"
example_desc: "iPhone 螢幕 + MacBook 螢幕都嵌入真實 UI 內容, 玻璃镜頭折射"
example_source_url: "https://hyperframes.heygen.com/catalog"
example_source_label: "hyperframes · vfx-iphone-device"
---

【模板: 設备 3D 展架 (Device 3D Showcase / HTML-in-Canvas)】
【意圖】產品發布、App 簡報、設計稿展示。把用户提供的 UI 內容真實渲染到 iPhone / MacBook "螢幕"裡, 周围用 CSS 3D transform 模拟 GLTF 模型的玻璃 / 高光 / 折射。Inspired by hyperframes vfx-iphone-device。

【硬性构圖】
- **畫布**: 1920×1080, 暖灰渐变背景 `radial-gradient(#1a1a1f → #0a0a0f)`, 底部反射地面 (mirror gradient)。
- **iPhone 15 Pro 模型**: 左侧 / 中部, `transform: rotateY(-12deg) rotateX(4deg) translateZ(40px)`; 邊框钛金属银 `#a8a8ad` (實心 4px) + 螢幕圓角 56px; 螢幕內嵌 iframe-like div, 真實渲染用户的 HTML 內容 (mobile viewport 375×812)。
- **MacBook Pro 14"** (可選第二台): 右侧, 略小, `rotateY(8deg)`; 上盖螢幕嵌入桌面 viewport 內容 (1440×900 缩放); 底座键盘 + trackpad 用 CSS 陰影线条繪製 (不畫键帽細節)。
- **玻璃 / 镜頭光斑**: 頂部加 2-3 個 `radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 60%)` 的椭圆 highlight, 模拟 morphing glass lens。
- **地面反射**: 設备下方 `transform: scaleY(-1)` + `mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 70%)`。

【螢幕內容来源】
- 用户提供的是文本/數據 → 自動渲染為一個 mock app 界面 (頂部 status bar + 標題 + body + 底部 tab bar 或 home indicator)。
- 用户提供的是 HTML → 原樣嵌入螢幕 div 內 (注意缩放 transform 讓它適配螢幕宽高)。
- 螢幕內 UI 用 Tailwind, 字号要按 mobile 真實尺寸 (text-sm / text-base, 不要 text-9xl)。

【可選附加元素】
- 右下角 "product slug" 角標: 大 logo + 一行 tagline + 副標 hairline。
- 頂部一行 caption (英文 sans, 字号小, 透明 0.6): 產品 codename / 日期 / 版本。
- 加 8s 自動 CSS 轉盘: `@keyframes turntable` rotateY -12 ↔ 12, ease-in-out infinite alternate; 可被 `prefers-reduced-motion` 關閉。

【設計細節】
- **绝不**: 用外部 mockup 圖片 URL (任何 unsplash / dribbble link), 全部用 CSS / SVG 繪製設备。
- 字體: 設备外的 caption / logo 用 `Inter Tight` / `SF Pro` 風格; 設备內根據用户內容自適應。
- 背景可選 4 套調色: charcoal / pearl / midnight blue / mocha; 不要彩虹渐变。
- 單文件 HTML; iframe 不要用 srcdoc 嵌套 (容易出問題), 用 `<div class="screen">` + Tailwind 渲染內容。
- 必須用用户真實數據填充螢幕內容, 严禁 lorem ipsum 或 "Your text here"。
