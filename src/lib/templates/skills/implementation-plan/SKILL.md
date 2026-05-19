---
name: implementation-plan
zh_name: "實作計畫"
en_name: "Implementation Plan"
emoji: "📋"
description: "規劃完整的實作計畫，包含 Mockup、資料流 (Data Flow) 與核心程式碼片段"
category: doc
scenario: development
aspect_hint: "長頁面"
tags: ["implementation", "plan", "spec", "architecture", "架構", "實作"]
---

【模板: 實作計畫 / Implementation Plan】
【意圖】
在單個 HTML 檔案中生成詳盡的實作計畫，使開發團隊能快速理解架構設計並進行評審。

【版面佈局】
- **Plan Header**: 包含計畫名稱、狀態指標（Draft/In Review/Approved）、架構師及預估時程。
- **Mockup Gallery**: 使用 HTML/CSS 與簡單的 SVG 元素繪製精美且具備線框圖感的介面預覽，並可點擊查看互動。
- **Data Flow Diagram**: 透過流程圖（利用純 CSS 或精美排版的 SVG）展示前端、後端、資料庫與外部 API 的資料傳遞與通訊。
- **Key Code Snippets**: 展示重要且待評估的核心代碼（如 API 路由、資料庫 Schema、關鍵演算法）。

【設計與樣式】
- **側邊欄導航 (Sticky Table of Contents)**: 左側附帶快速跳轉導航，方便跳轉到不同實作階段。
- **程式碼高亮**: VS Code 般乾淨的深色主題程式碼區塊。
- **資料流圖表**: 滑鼠懸停於節點時提供發光與路徑描邊動效，增添視覺高級感。
