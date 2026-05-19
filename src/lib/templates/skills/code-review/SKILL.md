---
name: code-review
zh_name: "程式碼審查"
en_name: "Code Review"
emoji: "🔍"
description: "生成包含 inline annotations 的實際 diff，並用不同顏色與嚴重程度標示審查結果，聚焦於效能與異步流"
category: doc
scenario: development
aspect_hint: "長頁面"
tags: ["code-review", "git", "diff", "engineering", "開發", "審查"]
---

【模板: 程式碼審查 / Code Review】
【意圖】
協助使用者審查拉取請求（PR）或代碼片段，並創建一個說明 PR 的 HTML 互動檔案。
著重分析異步流與背壓控制（Streaming / Backpressure），並使用邊欄與行內註解展示審查結果。

【版面佈局】
- **Summary Header**: 顯示 PR 的基本資訊（如分支名稱、提交作者、審查狀態摘要，如 Blocked / Changes Requested / Approved）。
- **Severity Summary**: 以色塊區分 Blockers (紅), Criticals (橙), Warnings (黃), Suggestions (藍) 的數量。
- **Core Code Diff View**: 提供精美的程式碼 Diff 區塊。
  - 對比或單欄 Diff 顯示。
  - 邊欄或行間附帶對應的審查註釋（Inline Annotations）。
- **Specialized Topic (Streaming/Backpressure)**: 針對資料流與背壓邏輯，提供圖形化的邏輯流分析或序列圖。

【設計與樣式】
- **嚴重度配色**: Blocker 為亮紅色，Critical 為深橙色，Warning 為琥珀色，Suggestion 為柔和藍/綠。
- **代碼高亮**: 程式碼區塊具備行號、深色主題（如 VS Code 風格）以及變動處高亮（紅色/綠色底色）。
- **邊欄註解**: 懸停或點擊註解時有微光過渡動畫，方便閱讀。
