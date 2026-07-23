# 部署到 Cloudflare Pages（含 CMS 發布流程）

> 為什麼從 Zeabur 搬過來：CMS 的「發布更新」需要 **Deploy Hook**（一條可直接 POST 的觸發 URL）。
> Cloudflare Pages 原生支援；Zeabur 只有帳號級 API token，放進後台會是資安風險。
> Zeabur 舊站可先不動，Cloudflare 驗證沒問題後再把網域切過來。

## 一次性設定（約 10 分鐘）

1. **建立專案**
   Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
   → 選 `iron-chen820510/nova-programe` → Branch 選 **`v2`**。

2. **建置設定**
   - Framework preset：`None`
   - Build command：`npm ci && npm run build`
   - Build output directory：`dist`

3. **首次部署**：按 Save and Deploy，等 1–2 分鐘 → 取得 `*.pages.dev` 網址。
   官網、`/admin/` 後台、`/?preview=1` 預覽此時全部可用。

4. **建立 Deploy Hook（發布按鈕的開關）**
   專案 → Settings → Builds & deployments → **Deploy hooks** → Create
   → 名稱隨意（如 `cms-publish`）、Branch `v2` → 複製產生的 URL。

5. **貼進後台**
   開 `https://<你的網址>/admin/` → 用 owner 帳號登入（與 XP CMS 同一組帳密）
   → 側欄「網站設定」→ 貼上 Deploy Hook URL → 儲存。

完成。之後編輯人員在後台按「發布更新」，就會自動：草稿快照 → 觸發 Cloudflare 重建 → 1–2 分鐘生效。

## 換網域（驗證完成後）

專案 → Custom domains → 加入正式網域 → 依指示調 DNS。Zeabur 舊服務確認無流量後可下線。

## 本機開發

```bash
npm install          # 首次
npm run build        # 拉「已發布」內容 → dist/
npm run serve        # http://localhost:4179（服務原始碼；後台在 /admin/）
```

## 資安檢查清單（已完成）

- [x] RLS 全表啟用；三級角色由 DB 觸發器與 SECURITY DEFINER 函式強制
- [x] anon 撤銷所有 nova 函式執行權；觸發器函式下架 API
- [x] 留資欄位長度上限（防灌爆）；匿名只能寫入、不能讀
- [x] Storage 寫入僅白名單；公開讀取（官網素材）
- [x] E2E 越權實測 7 項通過（editor 改開關/發布/讀設定/自我升權全被擋）
- [ ] 建議（選配）：Supabase Dashboard → Authentication → 開啟 Leaked Password Protection
