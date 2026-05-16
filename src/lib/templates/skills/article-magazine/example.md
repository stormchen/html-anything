# 我讀完 @trq212 那條推之後，把所有 Markdown 都換成了 HTML

> 靈感原文: https://x.com/trq212/status/2052809885763747935
>
> 簡而言之：在 AI 寫作 / 編輯器 / 代理時代，Markdown 這個「中間態」已經撐不住了 —— HTML 才是面向讀者的最終形態。

## 讓我點頭的三個觀察

第一，我們對 Markdown 的愛，主要是寫起來爽。但讀者從來沒投過票。
讀者拿到的永遠是某個 Markdown 渲染器吐出來的結果 —— 而那個渲染器屬於平台，不屬於你。

第二，截圖發推這件事，Markdown 輸了。
隨便挑一段 Markdown，截圖發出去都是被 GitHub 預設佈景主題壓扁的灰白方塊。HTML 可以是桌布級圖片。

第三，公眾號 / 知乎 / 小紅書 / Notion / 飛書 —— 每一家解釋 Markdown 的方式都不一樣。
你寫一份，5 個平台得調 5 次。HTML + 內聯 CSS，一次貼上，任何平台都還原。

## 但 HTML 太囉嗦，這是真的

`<div class="...">` 寫多了想吐，這是事實。
之前沒人願意花成本寫 HTML，因為同樣的內容，Markdown 30 秒，HTML 30 分鐘。

變數是 —— **AI 把這 30 分鐘降到 30 秒了**。
你寫 Markdown，AI 把它升級成可可交付的 HTML。你管最終形態，AI 管囉嗦細節。

## 我們順手做了一個工具

靈感來自原推，加上 Claude Code 團隊的實踐，我們做了 [HTML Anything](https://github.com/nexu-io/html-anything)。
左側貼上 Markdown / CSV / JSON，選一個模板（雜誌、PPT、海報、小紅書、數據報告 …），按 ⌘+Enter ——
本地的 Claude / Cursor / Codex 在你**已經登入**的 session 裡跑，幾秒後右側就是一份可以直接複製到公眾號 / 推特 / 知乎的 HTML。

不需要 API Key，不浪費 token（二次編輯只跑 diff）。

## 結論

如果你也覺得「Markdown → 編輯器手動重排」這件事浪費了你的人生 —— 看一眼原推，看一眼 Claude Code 團隊的遷移，然後試試任何一個能把 Markdown 自動升格為 HTML 的工具。

> 題圖致敬：推文中那個「everything is HTML」的瞬間。

