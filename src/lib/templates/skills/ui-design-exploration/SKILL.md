---
name: ui-design-exploration
zh_name: "UI 設計探索"
en_name: "UI Design Exploration"
emoji: "🗂️"
description: "並排展示 6 種截然不同的 UI 方案，對比佈局、語氣與內容密度，並註明優缺點"
category: prototype
scenario: design
aspect_hint: "1440×900 桌面"
tags: ["ui", "exploration", "variant", "onboarding", "設計", "對比"]
---

【模板: UI 設計探索 / UI Design Exploration】
【意圖】
設計一個網格頁面，並排呈現 6 種截然不同方向的畫面佈局（例如啟動引導 Onboarding 畫面）。
在版面結構（Layout）、設計語氣（Tone）、以及內容密度（Density）上做出顯著區隔，幫助決策者評估。

【版面佈局】
- **Exploration Header**: 顯示設計主題、核心目標以及全域切換開關（例如：切換為 Light/Dark 模式、切換為行動裝置/桌面預覽）。
- **Comparison Grid**: 採用響應式網格（桌面 3 欄，行動裝置 1 欄），放置 6 個獨立方案卡片。
- **Variant Card Structure**:
  - **Header**: 方案名稱、編號與屬性標籤（例如：#極簡風 #高密度 #卡片流 #對話式）。
  - **Interactive Preview (Mockup)**: 用 HTML/CSS 精心繪製的高保真介面，需具備微互動（如 Hover、按鈕點擊等）。
  - **Tradeoffs Panel**: 列表說明此方案採取的取捨（Tradeoffs）以及優缺點（Pros & Cons）。

【設計與樣式】
- 提供「方案放大」或「對焦」功能，點擊任一方案卡片可展開全螢幕檢視。
- 版面色彩與風格需乾淨優雅，突出內容本身的排版設計。
- 懸停於卡片上時，卡片應有精美的陰影浮起與圓角微動效。
