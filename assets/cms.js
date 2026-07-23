/* NOVA CMS 資料層（Supabase）— 瀏覽器與 build 腳本共用（純 DOM API，linkedom 相容）
   - anon key 為公開金鑰（publishable），寫入權限由 nova_* RLS 白名單把關
   - 內容模型：HTML 內建文案＝預設值；CMS 只存「覆寫」，空值＝用預設 */

export const CMS_URL = "https://ixvvoqywxddpjuzqmetb.supabase.co";
export const CMS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnZvcXl3eGRkcGp1enFtZXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NTIxMDUsImV4cCI6MjA5OTMyODEwNX0.h7cP2QWVR49JEGYSoNMjbqY94bGbDXAX45WBLrpWiKk";
export const BUCKET = "nova";

/** 撈區塊（columns 指定草稿或已發布欄位）。失敗回空物件 → 前台用 HTML 內建預設。 */
async function fetchSections(pageSlug, columns, mapRow) {
  try {
    // 快取破壞：恆真過濾器夾帶時間戳，確保每次建置抓到最新（PostgREST 未知參數會 400）
    const url =
      `${CMS_URL}/rest/v1/nova_sections` +
      `?select=key,${columns},nova_pages!inner(slug)` +
      `&nova_pages.slug=eq.${encodeURIComponent(pageSlug)}` +
      `&key=not.eq.__b${Date.now()}`;
    const res = await fetch(url, {
      headers: { apikey: CMS_ANON_KEY, Authorization: `Bearer ${CMS_ANON_KEY}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const rows = await res.json();
    const map = {};
    for (const r of rows) map[r.key] = mapRow(r);
    return map;
  } catch {
    return {}; // 離線／逾時 → 用預設內容，不讓 build 失敗
  }
}

/** 正式站內容：讀「已發布」快照（build 時烘進靜態 HTML）。 */
export function getPublished(pageSlug = "home") {
  return fetchSections(pageSlug, "published_content,published_enabled,sort", (r) => ({
    content: r.published_content ?? {},
    enabled: r.published_enabled !== false,
    sort: r.sort ?? 0,
  }));
}

/** 草稿內容：?preview=1 即時預覽用。 */
export function getDraft(pageSlug = "home") {
  return fetchSections(pageSlug, "content,enabled,sort", (r) => ({
    content: r.content ?? {},
    enabled: r.enabled !== false,
    sort: r.sort ?? 0,
  }));
}

/** 留資表單送出：寫入 nova_leads（anon 只能新增、不能讀）。 */
export async function submitLead(lead) {
  try {
    const res = await fetch(`${CMS_URL}/rest/v1/nova_leads`, {
      method: "POST",
      headers: {
        apikey: CMS_ANON_KEY,
        Authorization: `Bearer ${CMS_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ===== 內容套用（annotation 驅動；build 與 preview 共用同一份邏輯 = 所見即所得） =====
   標記規約：
   - data-cms="sec.key"        文字節點（值非空才覆寫）
   - data-cms-src="sec.key"    圖片 src；帶 data-cms-hide-empty 時空值保持 hidden
   - data-cms-list="sec.key"   清單容器；第一個 [data-cms-item] 為模板，
                               子欄位 [data-cms-f="k"]（文字）/ [data-cms-fsrc="k"]（圖）
                               值為字串陣列時整個 item 文字＝字串
   - data-cms-sec="key"        區塊開關：未啟用 → build 移除 / preview 隱藏 */

function val(cms, path) {
  const dot = path.indexOf(".");
  const sec = cms[path.slice(0, dot)];
  if (!sec) return undefined;
  return sec.content?.[path.slice(dot + 1)];
}

export function applyContent(doc, cms, mode /* "build" | "preview" */) {
  // 區塊開關
  for (const el of doc.querySelectorAll("[data-cms-sec]")) {
    const s = cms[el.getAttribute("data-cms-sec")];
    if (s && s.enabled === false) {
      if (mode === "build") el.remove();
      else el.style.display = "none";
    } else if (mode === "preview") {
      el.style.display = "";
    }
  }
  // 文字
  for (const el of doc.querySelectorAll("[data-cms]")) {
    const v = val(cms, el.getAttribute("data-cms"));
    if (typeof v === "string" && v !== "") el.textContent = v;
  }
  // 圖片
  for (const el of doc.querySelectorAll("[data-cms-src]")) {
    const v = val(cms, el.getAttribute("data-cms-src"));
    if (typeof v === "string" && v !== "") {
      el.setAttribute("src", v);
      el.removeAttribute("hidden");
    } else if (el.hasAttribute("data-cms-hide-empty")) {
      el.setAttribute("hidden", "");
    }
  }
  // 清單（陣列整組取代；空陣列＝清空＝明確意圖）
  for (const box of doc.querySelectorAll("[data-cms-list]")) {
    const v = val(cms, box.getAttribute("data-cms-list"));
    if (!Array.isArray(v)) continue;
    const items = box.querySelectorAll(":scope > [data-cms-item], [data-cms-item]");
    const tpl = items[0];
    if (!tpl) continue;
    const parent = tpl.parentNode;
    const anchor = tpl.cloneNode(true); // 乾淨模板
    for (const it of items) it.remove();
    for (const row of v) {
      const node = anchor.cloneNode(true);
      if (typeof row === "string") {
        const slot = node.querySelector("[data-cms-f]") ?? node;
        slot.textContent = row;
      } else if (row && typeof row === "object") {
        for (const f of node.querySelectorAll("[data-cms-f]")) {
          const fv = row[f.getAttribute("data-cms-f")];
          if (typeof fv === "string" && fv !== "") f.textContent = fv;
        }
        for (const f of node.querySelectorAll("[data-cms-fsrc]")) {
          const fv = row[f.getAttribute("data-cms-fsrc")];
          if (typeof fv === "string" && fv !== "") { f.setAttribute("src", fv); f.removeAttribute("hidden"); }
        }
      }
      parent.appendChild(node);
    }
  }
}

/** 從（預設）DOM 萃取欄位現值 — 後台表單的預設值顯示與「重設」用，單一內容來源＝index.html */
export function extractDefaults(doc, sectionKeys) {
  const out = {};
  const put = (path, v) => {
    const dot = path.indexOf(".");
    const sec = path.slice(0, dot), k = path.slice(dot + 1);
    (out[sec] ??= {})[k] = v;
  };
  for (const el of doc.querySelectorAll("[data-cms]")) put(el.getAttribute("data-cms"), el.textContent.trim());
  for (const el of doc.querySelectorAll("[data-cms-src]")) put(el.getAttribute("data-cms-src"), el.getAttribute("src") ?? "");
  for (const box of doc.querySelectorAll("[data-cms-list]")) {
    const rows = [];
    for (const it of box.querySelectorAll("[data-cms-item]")) {
      const fs = it.querySelectorAll("[data-cms-f]");
      const fsrcs = it.querySelectorAll("[data-cms-fsrc]");
      if (fs.length === 0 && fsrcs.length === 0) rows.push(it.textContent.trim());
      else if (fs.length === 1 && fsrcs.length === 0 && !fs[0].getAttribute("data-cms-f")) rows.push(fs[0].textContent.trim());
      else {
        const row = {};
        for (const f of fs) row[f.getAttribute("data-cms-f")] = f.textContent.trim();
        for (const f of fsrcs) row[f.getAttribute("data-cms-fsrc")] = f.getAttribute("src") ?? "";
        rows.push(row);
      }
    }
    put(box.getAttribute("data-cms-list"), rows);
  }
  void sectionKeys;
  return out;
}
