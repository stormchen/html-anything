---
name: interactive-prototype
zh_name: "互動原型 (動畫調整器)"
en_name: "Animation Adjuster"
emoji: "🎛️"
description: "微原型調試器，自訂互動按鈕動畫，支援滑桿調整參數並複製動畫參數代碼"
category: prototype
scenario: design
aspect_hint: "長頁面"
tags: ["prototype", "animation", "interactive", "widget", "微互動", "調整器"]
---

【模板: 互動原型（動畫調整器） / Animation Adjuster】
【意圖】
建立一個實驗室風格的微型互動原型（Micro-prototype），讓使用者能透過 UI 調節器（如滑桿、選單）即時調整與測試特定的動效（例如按鈕點擊後的動畫及色彩過渡），並能一鍵複製當前的動畫設定參數。

【版面佈局】
- **Interactive Sandbox (主預覽區)**: 位於畫面的核心，包含要測試的目標組件（如 Checkout Button）。按鈕在點擊時應能觸發完整的過渡動效（包含縮放、粒子散射或快速變色等）。
- **Control Dashboard (控制面板)**: 包含豐富的調試控制項：
  - **動畫時長 (Duration)** 與 **延遲 (Delay)** 的滑桿 (Sliders)。
  - **貝氏曲線選擇器 (Timing Function)**：支援 Ease-in, Ease-out, Linear 與自訂貝氏曲線。
  - **色彩過渡 (Color Transitions)**：調色盤或色碼輸入。
- **Output & Copy Section (代碼輸出與複製)**: 即時顯示對應的 CSS 變數、Keyframes 或 JS 配置，並提供一個「複製參數代碼」的按鈕。

【設計與樣式】
- 精美的暗黑科技風或實驗室儀表板視覺。
- 參數調整時，必須能即時透過 JS 修改 CSS Variables 讓效果生效。
- 互動組件的動畫需要極度流暢且具有高級感。
