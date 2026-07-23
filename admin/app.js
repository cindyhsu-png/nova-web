/* NOVA CMS 管理後台
   - 登入：Supabase Auth（email+password）；權限由 nova_admins 白名單（RLS）把關，三級角色 owner/admin/editor
   - 表單：自動從官網 index.html 的 data-cms 標注生成（單一內容來源；HTML 內建文案＝預設值）
   - 工作流：儲存草稿 → ?preview=1 預覽 → 發布（nova_publish 快照 + Deploy Hook 重建） */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CMS_URL, CMS_ANON_KEY, BUCKET } from "../assets/cms.js";
import { designSystemView, injectDsStyles } from "./design-system.js";

const sb = createClient(CMS_URL, CMS_ANON_KEY);
const $app = document.getElementById("app");
const ROLE_LABEL = { owner: "最高管理者", admin: "管理員", editor: "操作人員" };

/* ---------- 欄位中文名（規則式；對不到就顯示 key） ---------- */
const EXACT = {
  tagline: "主標語", sub: "副標說明", cta: "按鈕文字", lead: "導言", quote: "引言", quote_by: "引言署名", quote_img: "引言頭像",
  key1: "亮點一", key2: "亮點二", key3: "亮點三", ws_k: "溢價區標題", salary: "月薪溢價列", note: "附註", people: "陪跑說明",
  cite_tag: "引用標籤", cite_quote: "引用標題", cite_src: "引用出處", cite_note: "樣本說明", svc: "服務內容清單",
  fit: "適合誰", stuck: "常見卡點", name: "班名", en: "英文名", final: "終點結果", x5: "產能主張", lead_dim: "導言附註",
  ph1: "諮詢照片", ph2: "課堂照片", ph1_tag: "諮詢照標籤", ph2_tag: "課堂照標籤", consult_t: "顧問卡標題", consult_p: "顧問卡說明",
  consult_img: "顧問頭像", p: "說明文字", meta1: "底部標語一", meta2: "底部標語二", meta3: "底部標語三",
  foot_l: "頁尾左", foot_m: "頁尾中",
};
const RULES = [
  [/^m(\d)_k$/, "里程 $1 · 標籤"], [/^m(\d)_t$/, "里程 $1 · 標題"], [/^m(\d)_d$/, "里程 $1 · 說明"], [/^m2_tracks$/, "前導課三軌"],
  [/^seg(\d)$/, "進度標記 $1"], [/^(mkt|des|med|prod|eng)_menu$/, "選單 · 名稱"], [/^(mkt|des|med|prod|eng)_menu_en$/, "選單 · 英文"],
  [/^(mkt|des|med|prod|eng)_title$/, "面板 · 標題"], [/^(mkt|des|med|prod|eng)_en$/, "面板 · 英文"], [/^(mkt|des|med|prod|eng)_d$/, "面板 · 說明"],
  [/^(mkt|des|med|prod|eng)_out_k$/, "產出 · 標籤"], [/^(mkt|des|med|prod|eng)_out_v$/, "產出 · 內容"], [/^(mkt|des|med|prod|eng)_tags$/, "能力標籤"],
  [/^(mkt|des|med|prod|eng)_link$/, "連結文字"], [/^lv(\d)_t$/, "總覽條 L$1 · 名稱"], [/^lv(\d)_w$/, "總覽條 L$1 · 週次"],
  [/^l(\d)_wr$/, "L$1 · 週次範圍"], [/^l(\d)_h$/, "L$1 · 階段名稱"], [/^l(\d)_out$/, "L$1 · 階段產出"], [/^l(\d)_val$/, "L$1 · 階段價值"],
  [/^l(\d)_weeks$/, "L$1 · 週次清單"], [/^imp(\d)_n$/, "提速 $1 · 項目"], [/^imp(\d)_old$/, "提速 $1 · 傳統"], [/^imp(\d)_new$/, "提速 $1 · AI"],
  [/^w(\d)_img$/, "作品 $1 · 圖片"], [/^w(\d)_cap$/, "作品 $1 · 說明"],
  [/^(mkt|des|med|prod|eng)_img$/, "總監照片"], [/^(mkt|des|med|prod|eng)_name$/, "總監名稱"], [/^(mkt|des|med|prod|eng)_desc$/, "一句介紹"], [/^(mkt|des|med|prod|eng)_tag$/, "領域標籤"],
  [/^row(\d)$/, "資訊列 $1"], [/^s(\d)_dom$/, "成果 $1 · 領域"], [/^s(\d)_t$/, "成果 $1 · 標題"], [/^s(\d)_p$/, "成果 $1 · 說明"], [/^s(\d)_by$/, "成果 $1 · 學員"],
  [/^now(\d)_k$/, "現在 $1 · 標籤"], [/^now(\d)_v$/, "現在 $1 · 內容"], [/^af(\d)_k$/, "12週後 $1 · 標籤"], [/^af(\d)_v$/, "12週後 $1 · 內容"],
  [/^g(\d)_k$/, "數據 $1 · 標籤"], [/^g(\d)_v$/, "數據 $1 · 數值"], [/^g(\d)_p$/, "數據 $1 · 說明"],
  [/^st(\d)_t$/, "步驟 $1 · 標題"], [/^st(\d)_p$/, "步驟 $1 · 說明"],
];
const ITEM_LABEL = { label: "名稱", pct: "數值", tag: "編號", text: "文字", w: "週次", t: "主題", o: "產出", k: "關鍵字", v: "說明" };
function labelFor(key) {
  if (EXACT[key]) return EXACT[key];
  for (const [re, tpl] of RULES) { const m = key.match(re); if (m) return tpl.replace(/\$(\d)/g, (_, i) => m[+i]); }
  return key;
}

/* ---------- schema：從官網 HTML 標注自動生成 ---------- */
let SCHEMA = null; // { [secKey]: { fields: [{k,type,label,def,itemKeys?}] } }
async function buildSchema() {
  const res = await fetch("../index.html", { cache: "no-store" });
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  const out = {};
  const push = (sec, field) => {
    (out[sec] ??= { fields: [], seen: new Set() });
    if (out[sec].seen.has(field.k)) return;
    out[sec].seen.add(field.k);
    out[sec].fields.push(field);
  };
  for (const el of doc.querySelectorAll("[data-cms],[data-cms-src],[data-cms-list]")) {
    if (el.hasAttribute("data-cms")) {
      const [sec, k] = splitPath(el.getAttribute("data-cms"));
      const def = el.textContent.trim();
      push(sec, { k, type: def.length > 42 ? "textarea" : "text", label: labelFor(k), def });
    }
    if (el.hasAttribute("data-cms-src")) {
      const [sec, k] = splitPath(el.getAttribute("data-cms-src"));
      push(sec, { k, type: "image", label: labelFor(k), def: el.getAttribute("src") ?? "" });
    }
    if (el.hasAttribute("data-cms-list")) {
      const [sec, k] = splitPath(el.getAttribute("data-cms-list"));
      const items = el.querySelectorAll("[data-cms-item]");
      const tpl = items[0];
      let itemKeys = [];
      if (tpl) {
        for (const f of tpl.querySelectorAll("[data-cms-f]")) itemKeys.push({ k: f.getAttribute("data-cms-f"), type: "text" });
        for (const f of tpl.querySelectorAll("[data-cms-fsrc]")) itemKeys.push({ k: f.getAttribute("data-cms-fsrc"), type: "image" });
      }
      const def = [...items].map((it) => {
        if (itemKeys.length === 0) return it.textContent.trim();
        const row = {};
        for (const f of it.querySelectorAll("[data-cms-f]")) row[f.getAttribute("data-cms-f")] = f.textContent.trim();
        for (const f of it.querySelectorAll("[data-cms-fsrc]")) row[f.getAttribute("data-cms-fsrc")] = f.getAttribute("src") ?? "";
        return row;
      });
      push(sec, { k, type: "list", label: labelFor(k), def, itemKeys });
    }
  }
  for (const s of Object.values(out)) delete s.seen;
  SCHEMA = out;
}
const splitPath = (p) => { const i = p.indexOf("."); return [p.slice(0, i), p.slice(i + 1)]; };

/* 草稿 = 預設值疊上已存覆寫（空值視為未覆寫） */
function makeDraft(secKey, content) {
  const draft = {};
  for (const f of SCHEMA[secKey]?.fields ?? []) {
    const ov = content?.[f.k];
    if (f.type === "list") draft[f.k] = Array.isArray(ov) ? structuredClone(ov) : structuredClone(f.def);
    else draft[f.k] = typeof ov === "string" && ov !== "" ? ov : f.def;
  }
  return draft;
}

/* ---------- 小工具 ---------- */
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid);
  return el;
};
const genPw = () => "Nv" + Math.random().toString(36).slice(2, 10) + "#" + Math.floor(Math.random() * 90 + 10);
/* 官網圖片路徑（img/…）是相對站根；後台在 /admin/ 底下，預覽時要往上一層解析 */
const imgUrl = (v) => (!v ? "" : /^(https?:|data:|\/)/i.test(v) ? v : `../${v}`);
async function uploadToStorage(file) {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${Date.now()}-${safe}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file);
  if (error) { alert(`上傳失敗：${error.message}`); return null; }
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ---------- 欄位渲染（直接改 draft，不重繪 → 輸入不失焦） ---------- */
function fieldEl(f, draft) {
  if (f.type === "image") {
    const img = h("img", { src: imgUrl(draft[f.k]), alt: "" });
    if (!draft[f.k]) img.style.display = "none";
    const input = h("input", { class: "in", value: draft[f.k] ?? "", placeholder: "貼上圖片 URL 或點右側上傳",
      oninput: (e) => { draft[f.k] = e.target.value; img.src = imgUrl(e.target.value); img.style.display = e.target.value ? "" : "none"; } });
    const file = h("input", { type: "file", accept: "image/*", style: "display:none", onchange: async (e) => {
      const fl = e.target.files?.[0]; if (!fl) return;
      up.disabled = true; up.textContent = "上傳中…";
      const url = await uploadToStorage(fl);
      up.disabled = false; up.textContent = "上傳檔案";
      if (url) { draft[f.k] = url; input.value = url; img.src = url; img.style.display = ""; }
      e.target.value = "";
    } });
    const up = h("button", { class: "btn btn-sm", type: "button", onclick: () => file.click() }, "上傳檔案");
    return h("div", { class: "field" }, h("label", {}, f.label),
      h("div", { class: "imgrow" }, img, h("div", { class: "grow" }, input, h("div", {}, up, file))));
  }
  if (f.type === "list") return listEl(f, draft);
  const input = f.type === "textarea"
    ? h("textarea", { class: "in", rows: 3, oninput: (e) => (draft[f.k] = e.target.value) })
    : h("input", { class: "in", oninput: (e) => (draft[f.k] = e.target.value) });
  input.value = draft[f.k] ?? "";
  return h("div", { class: "field" }, h("label", {}, f.label), input);
}

function listEl(f, draft) {
  const box = h("div", {});
  const summary = (it) => typeof it === "string" ? (it || "（空）")
    : (Object.values(it).find((x) => typeof x === "string" && x.trim()) || "未命名項目");
  const render = () => {
    box.textContent = "";
    const items = draft[f.k] ?? [];
    box.append(h("div", { class: "group-title" }, f.label, h("span", { class: "cnt" }, `${items.length} 筆`)));
    const lb = h("div", { class: "listbox" });
    items.forEach((it, i) => {
      const li = h("div", { class: "li" });
      const bodyWrap = h("div", { style: "display:none" });
      const headBtn = h("button", { class: "sum", type: "button", onclick: () => {
        bodyWrap.style.display = bodyWrap.style.display === "none" ? "" : "none"; } },
        h("span", { class: "idx mono" }, `#${i + 1}`), h("span", {}, summary(it)));
      const mv = (dir) => { const j = i + dir; if (j < 0 || j >= items.length) return;
        [items[i], items[j]] = [items[j], items[i]]; render(); };
      li.append(h("div", { class: "li-head" }, headBtn,
        h("button", { class: "btn btn-sm", type: "button", onclick: () => mv(-1) }, "↑"),
        h("button", { class: "btn btn-sm", type: "button", onclick: () => mv(1) }, "↓"),
        h("button", { class: "btn btn-sm btn-danger", type: "button", onclick: () => { items.splice(i, 1); render(); } }, "移除")));
      const body = h("div", { class: "li-body" });
      if (typeof it === "string" || f.itemKeys.length === 0) {
        const inp = h("input", { class: "in", oninput: (e) => (items[i] = e.target.value) });
        inp.value = typeof it === "string" ? it : "";
        body.append(inp);
      } else {
        for (const sub of f.itemKeys) {
          if (sub.type === "image") {
            const proxy = { [sub.k]: it[sub.k] ?? "" };
            const fe = fieldEl({ k: sub.k, type: "image", label: ITEM_LABEL[sub.k] ?? sub.k }, proxy);
            fe.addEventListener("input", () => (it[sub.k] = proxy[sub.k]));
            body.append(fe);
          } else {
            const inp = h("input", { class: "in", oninput: (e) => (it[sub.k] = e.target.value) });
            inp.value = it[sub.k] ?? "";
            body.append(h("div", { class: "field" }, h("label", {}, ITEM_LABEL[sub.k] ?? sub.k), inp));
          }
        }
      }
      bodyWrap.append(body);
      li.append(bodyWrap);
      lb.append(li);
    });
    box.append(lb, h("div", { style: "margin-top:8px" },
      h("button", { class: "btn btn-sm", type: "button", onclick: () => {
        const empty = f.itemKeys.length === 0 ? "" : Object.fromEntries(f.itemKeys.map((x) => [x.k, ""]));
        (draft[f.k] ??= []).push(empty); render();
      } }, "+ 新增一筆")));
  };
  render();
  return box;
}

/* ---------- 區塊卡 ---------- */
function sectionCard(row, ctx) {
  const schema = SCHEMA[row.key];
  const card = h("div", { class: "card" });
  const draft = makeDraft(row.key, row.content);
  let enabled = row.enabled;

  const sw = h("button", { class: `sw ${enabled ? "on" : ""}`, disabled: ctx.canToggle ? null : "",
    title: ctx.canToggle ? "" : "需要管理員以上權限",
    onclick: async () => {
      const next = !enabled;
      const { error } = await sb.from("nova_sections").update({ enabled: next }).eq("id", row.id);
      if (error) { alert(`更新失敗：${error.message}`); return; }
      enabled = next;
      sw.classList.toggle("on", enabled);
      sw.lastChild.textContent = enabled ? "顯示中" : "已隱藏";
    } },
    h("span", { class: "trk" }, h("span", { class: "dot" })), h("span", {}, enabled ? "顯示中" : "已隱藏"));

  const body = h("div", { class: "card-body", style: "display:none" });
  const msg = h("span", { class: "okmsg" });
  if (schema) {
    for (const f of schema.fields) body.append(fieldEl(f, draft));
    body.append(h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" },
      h("button", { class: "btn btn-brand", onclick: async (e) => {
        e.target.disabled = true;
        const { error } = await sb.from("nova_sections").update({ content: draft }).eq("id", row.id);
        e.target.disabled = false;
        if (error) { alert(`儲存失敗：${error.message}`); return; }
        msg.textContent = "已儲存草稿 ✓ 可按右上「預覽草稿」，滿意後再「發布更新」";
      } }, "儲存此區塊"),
      h("button", { class: "btn", onclick: async () => {
        if (!confirm("把此區塊重設為官網內建預設值？（清除所有覆寫，立即儲存）")) return;
        const { error } = await sb.from("nova_sections").update({ content: {} }).eq("id", row.id);
        if (error) { alert(error.message); return; }
        msg.textContent = "已重設 ✓ 重新整理後表單將顯示預設值";
      } }, "重設為預設值"),
      msg));
  } else {
    body.append(h("p", { class: "note" }, "此區塊沒有可編輯欄位（程式化視覺），僅提供顯示／隱藏。"));
  }

  const head = h("div", { class: "card-head" },
    h("button", { class: "tt", onclick: () => {
      const open = body.style.display === "none";
      ctx.closeAll();
      body.style.display = open ? "" : "none";
      card.classList.toggle("open", open);
    } }, h("span", { class: "arr" }, "▸"), h("span", {}, row.title), h("span", { class: "key mono" }, row.key)),
    ctx.canToggle ? h("span", {},
      h("button", { class: "btn btn-sm", onclick: () => ctx.move(row, -1) }, "↑"),
      h("button", { class: "btn btn-sm", onclick: () => ctx.move(row, 1) }, "↓")) : null,
    sw);
  card.append(head, body);
  card._close = () => { body.style.display = "none"; card.classList.remove("open"); };
  return card;
}

/* ---------- 名單 ---------- */
async function leadsView(canDelete) {
  const wrap = h("div", { class: "panel" });
  const { data } = await sb.from("nova_leads").select("*").order("created_at", { ascending: false }).limit(500);
  const rows = data ?? [];
  const exportCsv = () => {
    const head = ["時間", "姓名", "手機", "Email", "領域", "想聊的內容", "來源"];
    const esc = (s) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) => [new Date(r.created_at).toLocaleString("zh-TW"), r.name, r.phone, r.email, r.domain, r.message, r.source].map(esc).join(","));
    const blob = new Blob(["﻿" + [head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nova-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  wrap.append(h("div", { style: "display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap" },
    h("div", {}, h("h3", {}, "預約諮詢名單"), h("p", { class: "note" }, "官網表單送出即時進來（最新在前，最多 500 筆），不需重新發布。")),
    h("button", { class: "btn", disabled: rows.length ? null : "", onclick: exportCsv }, "匯出 CSV")));
  if (!rows.length) { wrap.append(h("p", { class: "note", style: "margin-top:14px" }, "尚無名單。")); return wrap; }
  const tb = h("tbody", {});
  for (const r of rows) {
    const tr = h("tr", {},
      h("td", {}, new Date(r.created_at).toLocaleString("zh-TW", { hour12: false })),
      h("td", { class: "b" }, r.name), h("td", { class: "mono" }, r.phone), h("td", { class: "mono" }, r.email),
      h("td", {}, r.domain || "—"), h("td", {}, r.message || "—"),
      h("td", {}, canDelete ? h("button", { class: "btn btn-sm btn-danger", onclick: async () => {
        if (!confirm("刪除這筆名單？")) return;
        const { error } = await sb.from("nova_leads").delete().eq("id", r.id);
        if (error) alert(error.message); else tr.remove();
      } }, "刪除") : null));
    tb.append(tr);
  }
  wrap.append(h("div", { style: "overflow-x:auto;margin-top:12px" }, h("table", {},
    h("thead", {}, h("tr", {}, ...["時間", "姓名", "手機", "Email", "領域", "想聊的內容", ""].map((x) => h("th", {}, x)))), tb)));
  return wrap;
}

/* ---------- 設定（owner） ---------- */
async function settingsView() {
  const { data } = await sb.from("nova_settings").select("value").eq("key", "deploy_hook").maybeSingle();
  const input = h("input", { class: "in", placeholder: "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…" });
  input.value = data?.value ?? "";
  const msg = h("p", { class: "okmsg", style: "margin-top:8px" });
  return h("div", { class: "panel" },
    h("h3", {}, "部署（Cloudflare Deploy Hook）"),
    h("p", { class: "note" }, "Cloudflare Pages 專案 → Settings → Builds & deployments → Deploy hooks → Create，把 URL 貼到這裡。之後「發布更新」會自動觸發官網重建（約 1–2 分鐘生效）。"),
    h("div", { style: "display:flex;gap:10px;margin-top:12px" }, input,
      h("button", { class: "btn btn-brand", onclick: async () => {
        const { error } = await sb.from("nova_settings").upsert({ key: "deploy_hook", value: input.value.trim() });
        msg.textContent = error ? `儲存失敗：${error.message}` : "已儲存 ✓";
      } }, "儲存")), msg);
}

/* ---------- 權限管理（owner） ---------- */
async function adminsView() {
  const wrap = h("div", { class: "panel" });
  const pwBox = h("div", {});
  const showPw = (email, pw, action) => {
    pwBox.textContent = "";
    pwBox.append(h("div", { class: "pw-box" },
      h("p", { style: "font-weight:700" }, `${email} — ${action}`),
      h("p", { style: "margin-top:6px" }, "臨時密碼：", h("span", { class: "pw" }, pw)),
      h("p", { class: "note", style: "margin-top:6px" }, "此密碼只顯示這一次（點密碼可全選複製）。密碼經雜湊儲存、無法回查，忘記就再按「重設密碼」。"),
      h("div", { style: "margin-top:8px" }, h("button", { class: "btn btn-sm", onclick: () => (pwBox.textContent = "") }, "我已記下，關閉"))));
  };
  const setPassword = async (email) => {
    const pw = genPw();
    const { data, error } = await sb.rpc("nova_set_password", { p_email: email, p_password: pw });
    if (error) { alert(error.message); return; }
    showPw(email, pw, data === "created" ? "已建立登入帳號" : "已重設密碼");
  };
  const list = h("div", { style: "margin-top:12px;display:grid;gap:8px" });
  const load = async () => {
    list.textContent = "";
    const { data: admins } = await sb.from("nova_admins").select("email,role").order("created_at");
    for (const a of admins ?? []) {
      const sel = h("select", { class: "in", style: "width:auto", onchange: async (e) => {
        const { error } = await sb.from("nova_admins").update({ role: e.target.value }).eq("email", a.email);
        if (error) { alert(error.message); load(); }
      } }, ...Object.entries(ROLE_LABEL).map(([v, t]) => h("option", { value: v }, t)));
      sel.value = a.role;
      list.append(h("div", { style: "display:flex;gap:10px;align-items:center;border:1px solid var(--line-soft);padding:9px 12px" },
        h("span", { class: "mono", style: "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis" }, a.email), sel,
        h("button", { class: "btn btn-sm", onclick: () => { if (confirm(`為 ${a.email} 產生新的登入密碼？（舊密碼立即失效）`)) setPassword(a.email); } }, "重設密碼"),
        h("button", { class: "btn btn-sm btn-danger", onclick: async () => {
          if (!confirm(`移除 ${a.email} 的後台權限？（立即生效）`)) return;
          const { error } = await sb.from("nova_admins").delete().eq("email", a.email);
          if (error) alert(error.message); else load();
        } }, "移除")));
    }
  };
  await load();
  const emailIn = h("input", { class: "in", placeholder: "new-user@example.com" });
  const roleIn = h("select", { class: "in", style: "width:auto" },
    h("option", { value: "editor" }, "操作人員"), h("option", { value: "admin" }, "管理員"), h("option", { value: "owner" }, "最高管理者"));
  wrap.append(
    h("h3", {}, "帳號與角色"),
    h("p", { class: "note" }, "最高管理者：全部權限＋帳號與系統設定；管理員：編輯＋顯示/隱藏＋發布；操作人員：僅編輯草稿與預覽。權限在資料庫層（RLS＋觸發器）強制，繞過介面也無法越權；移除白名單立即生效。"),
    pwBox, list,
    h("div", { style: "display:flex;gap:10px;margin-top:12px" }, emailIn, roleIn,
      h("button", { class: "btn", onclick: async () => {
        const email = emailIn.value.trim();
        if (!email.includes("@")) return;
        const { error } = await sb.from("nova_admins").insert({ email, role: roleIn.value });
        if (error) { alert(error.message); return; }
        emailIn.value = "";
        await setPassword(email);
        load();
      } }, "+ 加入")));
  return wrap;
}

/* ---------- 變更自己的密碼 ---------- */
function pwDialog() {
  const p1 = h("input", { class: "in", type: "password" });
  const p2 = h("input", { class: "in", type: "password" });
  const msg = h("p", { class: "note", style: "color:var(--danger)" });
  const modal = h("div", { class: "modal", onclick: (e) => { if (e.target === modal) modal.remove(); } },
    h("div", {},
      h("h3", { style: "font-family:var(--disp)" }, "變更我的密碼"),
      h("p", { class: "note", style: "margin-top:6px" }, "密碼採單向雜湊儲存，系統無法顯示現有密碼——直接設一組新的即可。"),
      h("div", { class: "field", style: "margin-top:14px" }, h("label", {}, "新密碼（至少 8 碼）"), p1),
      h("div", { class: "field", style: "margin-top:10px" }, h("label", {}, "再輸入一次"), p2),
      msg,
      h("div", { style: "display:flex;gap:10px;margin-top:16px" },
        h("button", { class: "btn btn-brand", onclick: async (e) => {
          if (p1.value.length < 8) { msg.textContent = "密碼至少 8 碼"; return; }
          if (p1.value !== p2.value) { msg.textContent = "兩次輸入不一致"; return; }
          e.target.disabled = true;
          const { error } = await sb.auth.updateUser({ password: p1.value });
          e.target.disabled = false;
          if (error) { msg.textContent = `更新失敗：${error.message}`; return; }
          alert("密碼已更新，下次登入請使用新密碼。");
          modal.remove();
        } }, "更新密碼"),
        h("button", { class: "btn", onclick: () => modal.remove() }, "取消"))));
  document.body.append(modal);
}

/* ---------- 主畫面 ---------- */
async function dashboard(session) {
  const email = session.user.email ?? "";
  const { data: me } = await sb.from("nova_admins").select("role").eq("email", email).maybeSingle();
  if (!me) {
    $app.textContent = "";
    $app.append(h("div", { class: "login-wrap" }, h("div", { style: "text-align:center" },
      h("p", { style: "font-weight:700;font-size:16px" }, "此帳號沒有管理權限"),
      h("p", { class: "note", style: "margin-top:6px" }, `${email} 不在管理員白名單內`),
      h("div", { style: "margin-top:16px" }, h("button", { class: "btn", onclick: () => sb.auth.signOut() }, "登出")))));
    return;
  }
  const role = me.role;
  const canPublish = role === "owner" || role === "admin";
  const isOwner = role === "owner";
  if (!SCHEMA) await buildSchema();

  const { data: pages } = await sb.from("nova_pages").select("*").order("sort");
  const page = pages?.[0];
  let view = "content";

  const title = h("h2", {}, "");
  const topmsg = h("span", { class: "topmsg" });
  const content = h("div", {});

  const renderView = async () => {
    title.textContent = view === "settings" ? "網站設定" : view === "admins" ? "權限管理" : view === "leads" ? "預約諮詢名單" : view === "design" ? "設計系統" : `${page?.title ?? ""}內容`;
    content.textContent = "載入中…";
    if (view === "design") { injectDsStyles(); content.textContent = ""; content.append(designSystemView()); return; }
    if (view === "leads") { content.textContent = ""; content.append(await leadsView(canPublish)); return; }
    if (view === "settings") { content.textContent = ""; content.append(await settingsView()); return; }
    if (view === "admins") { content.textContent = ""; content.append(await adminsView()); return; }
    // 內容編輯
    const { data: sections } = await sb.from("nova_sections").select("*").eq("page_id", page.id).order("sort");
    content.textContent = "";
    content.append(h("p", { class: "note", style: "margin-bottom:12px" },
      "工作流：儲存草稿 → 預覽草稿 → 發布更新（快照為正式版並重新建置官網）。欄位內容＝官網現值；「重設為預設值」會清除覆寫、回到程式內建文案。"));
    const cards = [];
    const ctx = {
      canToggle: canPublish,
      closeAll: () => cards.forEach((c) => c._close()),
      move: async (row, dir) => {
        const i = sections.findIndex((s) => s.id === row.id);
        const j = i + dir;
        if (j < 0 || j >= sections.length) return;
        const a = sections[i], b = sections[j];
        const r1 = await sb.from("nova_sections").update({ sort: b.sort }).eq("id", a.id);
        const r2 = await sb.from("nova_sections").update({ sort: a.sort }).eq("id", b.id);
        if (r1.error || r2.error) alert(`排序失敗：${(r1.error ?? r2.error).message}`);
        renderView();
      },
    };
    for (const s of sections ?? []) { const c = sectionCard(s, ctx); cards.push(c); content.append(c); }
  };

  const navBtn = (id, label) => h("button", { class: `navbtn ${view === id ? "on" : ""}`, onclick: (e) => {
    view = id;
    e.target.closest("nav").querySelectorAll(".navbtn").forEach((b) => b.classList.remove("on"));
    e.target.classList.add("on");
    renderView();
  } }, label);

  const publishBtn = canPublish ? h("button", { class: "btn btn-brand", onclick: async (e) => {
    if (!confirm("確定發布？草稿內容將快照為正式版，並觸發官網重新建置。")) return;
    e.target.disabled = true; topmsg.textContent = "";
    const { error } = await sb.rpc("nova_publish");
    if (error) { topmsg.textContent = `發布失敗：${error.message}`; e.target.disabled = false; return; }
    const { data } = await sb.from("nova_settings").select("value").eq("key", "deploy_hook").maybeSingle();
    const hook = data?.value;
    if (!hook) topmsg.textContent = "內容已快照為正式版，但尚未設定 Deploy Hook — 請到「網站設定」貼上 URL 後再按一次";
    else {
      try { await fetch(hook, { method: "POST", mode: "no-cors" }); topmsg.textContent = "已發布並觸發重新建置，約 1–2 分鐘後官網生效"; }
      catch { topmsg.textContent = "內容已快照，但觸發建置失敗 — 請確認 Deploy Hook URL"; }
    }
    e.target.disabled = false;
  } }, "發布更新") : null;

  $app.textContent = "";
  $app.append(h("div", { class: "shell" },
    h("aside", { class: "side" },
      h("p", { class: "kicker" }, "NOVA · 超星計畫 CMS"),
      h("nav", {},
        h("p", { class: "grp" }, "頁面"), navBtn("content", page?.title ?? "首頁"),
        h("p", { class: "grp" }, "資料"), navBtn("leads", "預約諮詢名單"),
        h("p", { class: "grp" }, "規範"), navBtn("design", "設計系統"),
        ...(isOwner ? [h("p", { class: "grp" }, "系統"), navBtn("settings", "網站設定"), navBtn("admins", "權限管理")] : [])),
      h("div", { class: "me" },
        h("p", { class: "mono", style: "font-size:11px;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis" }, email),
        h("p", { style: "font-size:11px;font-weight:700;color:var(--accent);margin-top:3px" }, ROLE_LABEL[role] ?? ""),
        h("div", { style: "display:flex;gap:12px;margin-top:8px" },
          h("button", { class: "btn btn-sm", onclick: pwDialog }, "變更密碼"),
          h("button", { class: "btn btn-sm", onclick: () => sb.auth.signOut() }, "登出")))),
    h("main", { class: "main" },
      h("div", { class: "tophead" }, title,
        h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, topmsg,
          h("a", { class: "btn", href: "../?preview=1", target: "_blank", rel: "noreferrer" }, "預覽草稿"),
          publishBtn)),
      content)));
  renderView();
}

/* ---------- 登入 ---------- */
function loginView() {
  const email = h("input", { class: "in", type: "email", required: "", autocomplete: "username" });
  const pw = h("input", { class: "in", type: "password", required: "", autocomplete: "current-password" });
  const err = h("p", { class: "note", style: "color:var(--danger);margin-top:10px" });
  const form = h("form", { class: "login-card", onsubmit: async (e) => {
    e.preventDefault();
    err.textContent = "";
    const btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = "登入中…";
    const { error } = await sb.auth.signInWithPassword({ email: email.value, password: pw.value });
    btn.disabled = false; btn.textContent = "登入";
    if (error) err.textContent = "登入失敗：帳號或密碼錯誤";
  } },
    h("p", { class: "kicker" }, "NOVA · 超星計畫 CMS"),
    h("h1", {}, "管理後台登入"),
    h("div", { class: "field", style: "margin-top:20px" }, h("label", {}, "Email"), email),
    h("div", { class: "field", style: "margin-top:12px" }, h("label", {}, "密碼"), pw),
    err,
    h("button", { class: "btn btn-brand", type: "submit", style: "width:100%;justify-content:center;margin-top:18px;padding:12px" }, "登入"));
  $app.textContent = "";
  $app.append(h("div", { class: "login-wrap" }, form));
}

/* ---------- 啟動 ---------- */
sb.auth.getSession().then(({ data }) => {
  if (data.session) dashboard(data.session); else loginView();
});
sb.auth.onAuthStateChange((_e, session) => {
  if (session) dashboard(session); else loginView();
});
