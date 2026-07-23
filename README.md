# NOVA 超星計畫 — 官網 v2（AI 賦能改版）

單頁式行銷官網 + 自建 CMS 管理後台。此 `nova-web-v2/` 資料夾即部署根目錄。

> **交付／驗收文件在 `_交付文件/`**：技術規格書、業主接手待辦清單、驗收確認單（PDF）、資料庫移轉 SQL。接手請先看那裡。

## 快速開始（本機）
```bash
npm install       # 首次安裝依賴
npm run build     # 拉「已發布」內容 → dist/
npm run serve     # http://localhost:4179（後台在 /admin/）
```

## v2 改版重點（依銷售方案 v7 + 官網優化報告）
- 主軸改「AI 賦能」：別人練好幾年的專業，用 AI 賦能快速做出成果
- 領域重構：6 工具領域 → 5 成果導向專案班（行銷/設計/自媒體/產品設計/工程設計，各有代表色）
- 「1 對 5 小班、每月一梯」專案班模式；新增 104 數據、Tab 學習地圖（5 領域 × 12 週真課綱）、學員成果牆、12 週後的你
- 3D 徽章 5 顆，hover 顯示領域代表色
- 自建 CMS：後台 `/admin/` 可編輯全站文案/圖片、草稿預覽、一鍵發布

## 結構
```
nova-web-v2/
├── index.html            官網本體＝內容單一來源（data-cms 標注 + 內建預設文案）
├── assets/cms.js         CMS 資料層（抓取／套用內容／送出表單）
├── admin/                後台 SPA（app.js + design-system.js）
├── scripts/build.mjs     建置：已發布內容 → dist/
├── img/                  靜態素材
├── zbpack.json           Zeabur 建置設定
├── CMS.md                CMS 操作手冊
├── DEPLOY_CLOUDFLARE.md  Cloudflare 部署 + 一鍵發布
└── _交付文件/             交付／驗收文件（不會部署到正式站）
```

## CMS ／ 部署
- CMS 操作：見 [`CMS.md`](CMS.md)
- 部署（建議 Cloudflare Pages，支援一鍵發布）：見 [`DEPLOY_CLOUDFLARE.md`](DEPLOY_CLOUDFLARE.md)
- 目前部署：Zeabur（靜態，`zbpack.json`）；發布後需手動 Redeploy

## 外部相依（CDN，瀏覽時需連網）
- three.js 0.160（3D 徽章）、GSAP 3.12 + ScrollTrigger、Lenis 1.1
- Google Fonts：Chakra Petch / Michroma / JetBrains Mono / Noto Sans TC / Dancing Script
- `@supabase/supabase-js@2`（後台，經 esm.sh）
