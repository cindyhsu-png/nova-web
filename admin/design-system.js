/* NOVA 超星計畫 設計系統（Design System / Guideline）
   對標 XP CMS 設計系統頁的文件深度：原則 → Token → 元件（活實品＋用法＋禁忌）→ 動態 → 影像 → AI 延伸指南
   本檔即設計語彙的「單一事實來源」：人與 AI 延伸任何新畫面前先讀此檔。
   實品（specimen）皆為真實樣式渲染，非截圖 — Token 改動時此頁同步反映。內容自 v2 首頁七區實作歸納。 */

const ORANGE = "#ff8a32", ORANGE2 = "#ffb066", INK0 = "#f2eee9", INK1 = "#a39a90", INK2 = "#655d55";
const LINE = "rgba(236,224,210,.13)", LINESOFT = "rgba(236,224,210,.07)";
const CROSS = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M5 0v10M0 5h10' stroke='%23ff8a32' stroke-width='1'/%3E%3C/svg%3E")`;

const COLOR_TOKENS = [
  { hex: "#08070a", name: "surface/bg", usage: "全站唯一主底色（深黑帶紫調）。NOVA 沒有白底區 — 深黑就是敘事主場。" },
  { hex: "rgba(13,10,8,.55)", name: "surface/panel", usage: "hairline 面板底（半透深褐）。面板層次靠 1px 線，不靠底色跳階。" },
  { hex: "#f2eee9", name: "ink-0", usage: "主標題、重點文字（暖白，非純白）。" },
  { hex: "#a39a90", name: "ink-1", usage: "標準內文、說明文字。" },
  { hex: "#655d55", name: "ink-2", usage: "弱化資訊：mono 標籤、編號、註腳、HUD。" },
  { hex: "#ff8a32", name: "brand/orange", usage: "恆星橘＝訊號色：CTA、強調字、hover 發光、進度、eyebrow 編號。只做點綴，面積 <5%。" },
  { hex: "#ffb066", name: "brand/orange-2", usage: "亮橘：漸層另一端、發光暈、rail 漸層收尾。" },
  { hex: "#160a02", name: "on-brand", usage: "金色 CTA 上的深色文字（不可用純黑）。" },
  { hex: "rgba(236,224,210,.13)", name: "line", usage: "標準 hairline（互動元素框、輸入框、章）。" },
  { hex: "rgba(236,224,210,.06)", name: "line-soft", usage: "弱 hairline（面板框、格線、分隔）。" },
];

const DOMAIN_COLORS = [
  { hex: "#E0724A", name: "d-mkt", label: "行銷" },
  { hex: "#B36FD1", name: "d-des", label: "設計" },
  { hex: "#4AA6E0", name: "d-med", label: "自媒體" },
  { hex: "#2EBFA0", name: "d-prod", label: "產品設計" },
  { hex: "#8B7CFF", name: "d-eng", label: "工程設計" },
];

const TYPE_SCALE = [
  ["Section H2", "clamp(1.95rem, 4.3vw, 3.3rem) · 600 · lh 1.12 · -0.01em", "Chakra Petch＋Noto Sans TC；強調字用 .ac（橘＋斜體）"],
  ["旗艦標（服務流程）", "clamp(1.7rem, 3.3vw, 2.9rem) · 600", "同上，pin 區大標"],
  ["面板標題", "clamp(1.5rem, 2.8vw, 2.2rem) · 600", "Tab 班名、領域卡標題（防斷字 text-wrap:balance）"],
  ["卡片標題", "1.02–1.28rem · 600", "mile 卡、lvg 階段、成果卡"],
  ["Body", "0.95–1.16rem · 400 · lh 1.7–1.78", "內文一律 Noto Sans TC、ink-1"],
  ["Small", "0.85–0.93rem · lh 1.6", "卡片描述、清單項"],
  ["Mono 標籤", "10–12.5px · JetBrains Mono · tracking 0.1–0.34em · 大寫", "eyebrow、HUD、章、週次、數據標籤"],
];

const PANEL_MATRIX = [
  ["hairline 面板", "1px line-soft ＋ panel 底", "標準內容容器：適合誰、課表、效益、表單（＋角落十字）"],
  ["1px 拼格卡", "gap:1px、line-soft 當格線", "數據並列（01 三大數據）、三論點卡 — 卡縫即格線"],
  ["mile 卡", "1px line ＋ 玻璃微糊", "服務流程橫捲卡；頂部可加照片帶＋mono 玻璃章"],
  ["lvg 色軌卡", "左側 2px 領域色軌＋色底", "12 週課表 Level 分組 — 色濃度依 --o 遞增"],
  ["結論卡", "1px 橘框（.3）＋暖底漸層", "終點結果、最終主張 — 一個區塊最多一張"],
  ["虛線佔位框", "1px dashed line", "作品 IMAGE SLOT、待補素材版位"],
  ["玻璃章", "rgba(10,8,6,.55)＋blur(6–9px)", "照片上的 mono 標籤、sticky tabbar — 全站僅這兩處用毛玻璃"],
];

const BG_ASSETS = [
  { file: "../img/bg-warp.jpg", show: "img/bg-warp.jpg", size: "2.4 MB", use: "星空放射背景（Hero 3D 場景 scene.background，經暖色 multiply 調和）。" },
  { file: "../img/nova_logo.svg", show: "img/nova_logo.svg", size: "7 KB", use: "主 wordmark（Hero 大標）。白色向量，深底直用。" },
  { file: "../img/logo_nova_small.png", show: "img/logo_nova_small.png", size: "1 KB", use: "側欄小 logo（30px 寬）。" },
  { file: "../img/favicon.png", show: "img/favicon.png", size: "356 KB", use: "品牌星標原檔；網站實際載入 favicon-128 / favicon-180 輕量版。" },
  { file: "../img/img_001.jpg", show: "img/img_001.jpg", size: "415 KB", use: "諮詢場景照（服務流程 01 卡）。上暗色漸層保文字可讀。" },
  { file: "../img/img_002.jpg", show: "img/img_002.jpg", size: "309 KB", use: "課堂場景照（服務流程 04 卡）。同上。" },
  { file: "../img/portrait_mentor.jpg", show: "img/portrait_mentor.jpg", size: "589 KB", use: "教練示意人像（Hero 引言 micro-avatar；AI 生成，待換實照）。" },
  { file: "../img/portrait_consult.jpg", show: "img/portrait_consult.jpg", size: "578 KB", use: "顧問示意人像（07 表單顧問卡；AI 生成，待換實照）。" },
];

/* ---------- 版面小工具（模板） ---------- */
const h2 = (t) => `<h3 class="ds-h2"><span class="ds-h2line"></span>${t}</h3>`;
const sub = (t) => `<h4 class="ds-sub">${t}</h4>`;
const p = (t) => `<p class="ds-p">${t}</p>`;
const spec = (inner, pad = true) => `<div class="ds-spec"${pad ? "" : ' style="padding:0"'}>${inner}</div>`;
const code = (t) => `<pre class="ds-code">${t.replace(/</g, "&lt;")}</pre>`;
const dodont = (dos, donts) => `
  <div class="ds-dd">
    <div class="ds-do"><p>✓ Do</p><ul>${dos.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    <div class="ds-dont"><p>✕ Don't</p><ul>${donts.map((x) => `<li>${x}</li>`).join("")}</ul></div>
  </div>`;

export function designSystemView() {
  const el = document.createElement("div");
  el.className = "ds-wrap";
  el.innerHTML = `
  <p class="kicker">NOVA DESIGN SYSTEM v1.0</p>
  <h2 class="ds-title">設計語彙指南</h2>
  <p class="ds-p" style="max-width:760px">本頁是超星計畫官網視覺語言的單一事實來源（源碼：admin/design-system.js）。
  任何人或 AI 延伸新頁面、新區塊前先讀完此頁 — 所有實品皆為真實樣式渲染，複製 Token 與寫法即可保持一致性。</p>

  ${h2("一、設計原則（先讀）")}
  <div class="ds-grid2">
    ${[
      ["深黑電影感 × 儀器語言", "全站唯一底色 #08070a。四角 mono HUD、registration「+」十字、tabular 數據是品牌骨架 — 像一台精密儀器，不是一張海報。"],
      ["Hairline 是核心視覺語言", "面板層次靠 1px 線（line / line-soft），不靠底色跳階。1px 拼格（gap:1px 透出格線）是卡片群的標準做法。"],
      ["恆星橘是訊號不是塗料", "#ff8a32 只出現在：CTA、強調字（.ac 斜體）、hover 發光、進度、eyebrow 編號。面積 <5%；大面積金色只在 CTA 填色。"],
      ["領域五色只在領域語境", "行銷橘紅／設計紫／自媒體藍／產品青／工程紫藍，只用於徽章 hover、選單色軌、Tab、課表 — 全站主 accent 永遠是橘，嚴禁彩虹化。"],
      ["直角工程感", "全站 border-radius: 0（例外僅二：總監柱狀卡 10px、mock 介面畫中畫）。方正＝藍圖感。"],
      ["動態克制、無 Emoji", "進場動畫只跑一次（IO once）、位移 ≤30px；常駐動態僅微幅（grain、脈動、自轉）。裝飾一律 stroke SVG 或 ▸◆●✓✕ 文字符號。"],
    ].map(([t, d]) => `<div class="ds-card"><p class="ds-card-t">${t}</p><p class="ds-card-d">${d}</p></div>`).join("")}
  </div>

  ${h2("二、色彩 Tokens")}
  <div class="ds-rows">
    ${COLOR_TOKENS.map((c) => `
      <div class="ds-row">
        <span class="ds-swatch" style="background:${c.hex}"></span>
        <span class="ds-hex mono">${c.hex}</span>
        <span class="ds-name mono">${c.name}</span>
        <span class="ds-usage">${c.usage}</span>
      </div>`).join("")}
  </div>
  ${sub("領域五色（只在領域語境使用）")}
  <div class="ds-rows">
    ${DOMAIN_COLORS.map((c) => `
      <div class="ds-row">
        <span class="ds-swatch" style="background:${c.hex}"></span>
        <span class="ds-hex mono">${c.hex}</span>
        <span class="ds-name mono">--${c.name}</span>
        <span class="ds-usage">${c.label} — 徽章 hover 發光、選單色軌、Tab 底線、課表色軌、標籤 dot</span>
      </div>`).join("")}
  </div>
  ${code(`濃度階一律用 color-mix 由 --o 變數控制（0.4 → 0.6 → 0.8 → 1.0）：
背景：color-mix(in srgb, var(--dc) calc(var(--o)*26%), rgba(13,10,8,.7))
色軌：color-mix(in srgb, var(--dc) calc(var(--o)*100%), transparent)
元件掛 style="--dc:var(--d-mkt)" 即整組換色 — 不寫死 hex`)}
  ${sub("文字三階（深底唯一合法階梯）")}
  ${spec(`
    <p style="color:${INK0};font-size:15px;font-weight:700">ink-0 #f2eee9 — 主標題與重點</p>
    <p style="color:${INK1};font-size:14px;margin-top:6px">ink-1 #a39a90 — 標準內文</p>
    <p style="color:${INK2};font-size:13px;margin-top:6px">ink-2 #655d55 — mono 標籤、編號、註腳</p>`)}
  ${dodont(
    ["文字只用 ink 三階；再弱就用 mono 縮小＋加字距", "強調字用 .ac（橘＋斜體），或 color-mix 領域色", "金色 CTA 上一律 #160a02 深字"],
    ["自創灰階或用純白 #fff", "橘色當內文色大面積使用", "深底用純黑陰影文字"]
  )}

  ${h2("三、字體排印")}
  ${p("三字體制：標題＝Chakra Petch（配 Noto Sans TC fallback，科技 HUD 感）；數據與標籤＝JetBrains Mono（一律 tabular-nums）；內文＝Noto Sans TC。全站禁用襯線字。")}
  ${spec(`
    <p style="font-family:'Chakra Petch','Noto Sans TC',sans-serif;font-weight:600;font-size:26px;color:${INK0};letter-spacing:-.01em">選一個你想深耕的領域，做出<span style="color:${ORANGE};font-style:italic">能上場</span>的作品</p>
    <p class="ds-note">Section 大標 — Chakra Petch 600；強調字 .ac ＝ 橘 ＋ 斜體</p>
    <p class="mono" style="margin-top:14px;font-size:11px;letter-spacing:.26em;color:${INK2};text-transform:uppercase"><span style="color:${ORANGE};font-weight:500">03</span>　五領域專案班 — FIVE AI DOMAINS</p>
    <p class="ds-note">eyebrow — JetBrains Mono、tracking 0.26em、大寫、編號橘色</p>
    <p class="mono" style="margin-top:14px;font-size:22px;font-weight:600;color:${INK0};font-variant-numeric:tabular-nums">+97.6<span style="color:${ORANGE};font-size:12px"> %</span>　1:5　W8–12</p>
    <p class="ds-note">數據一律 mono ＋ tabular-nums（等寬不跳動）；單位縮小掛橘</p>`)}
  ${sub("字級階（Type Scale）")}
  <div class="ds-rows">
    ${TYPE_SCALE.map(([l, c, n]) => `
      <div class="ds-row">
        <span class="ds-tname">${l}</span>
        <span class="ds-tcls mono">${c}</span>
        <span class="ds-usage">${n}</span>
      </div>`).join("")}
  </div>

  ${h2("四、版面與間距")}
  <div class="ds-list">
    <p>· <b>容器</b>：<code>.wrap</code> — max-width 1180、padding <code>clamp(20px, 5vw, 64px)</code>。左側固定 66px 側欄 rail（桌面）。</p>
    <p>· <b>Section 節奏</b>：<code>padding: clamp(112px, 16vh, 206px) 0</code>；每個 section 頂部 1px line-soft ＋ 左右 registration 十字（繪圖版語言）。</p>
    <p>· <b>標頭骨架</b>：eyebrow（線段＋編號）→ 大標 → <code>.sec-lead</code> 導言（max-width 54ch）→ 內容。</p>
    <p>· <b>卡片網格</b>：拼格卡 <code>gap:1px; background:line-soft</code>；一般卡 gap 10–18px；行動版一律收單欄。</p>
    <p>· <b>圓角</b>：0。例外：總監柱狀卡 10px、mock 畫中畫內部。</p>
    <p>· <b>RWD 斷點</b>：900px 主分界（選單直轉橫、雙欄收單欄）、760／680 次級收合。</p>
  </div>

  ${h2("五、元件規範（實品＋寫法）")}

  ${sub("5.1 Eyebrow（區塊小標）— 線段＋橘編號＋mono 大寫")}
  ${spec(`<p class="mono" style="display:flex;align-items:center;gap:13px;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:${INK2}"><span style="width:30px;height:1px;background:linear-gradient(90deg,${ORANGE},transparent)"></span><span style="color:${ORANGE};font-weight:500">01</span> 為什麼是現在 — WHY NOW</p>`)}
  ${code(`.sec-eyebrow：mono 11px tracking .26em 大寫 ink-2；前綴 30px 漸層線段；編號 span.n 橘色`)}

  ${sub("5.2 CTA 家族（三階；一個畫面最多一顆金色）")}
  ${spec(`
    <div style="display:flex;flex-wrap:wrap;gap:22px;align-items:center">
      <a style="position:relative;display:inline-flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:.16em;color:#160a02;padding:15px 30px;border:1px solid rgba(255,190,120,.8);background:linear-gradient(180deg,rgba(15,9,4,.3) 0%,transparent 55%),radial-gradient(130% 170% at 50% 135%,${ORANGE} 0%,${ORANGE2} 52%,rgba(255,176,102,.4) 100%);box-shadow:0 0 24px -6px rgba(255,138,50,.42);cursor:pointer;font-weight:700">
        一・金色填滿 →
        <i style="position:absolute;left:-4px;top:-4px;width:9px;height:9px;background:${CROSS} no-repeat;background-size:9px"></i>
        <i style="position:absolute;right:-4px;bottom:-4px;width:9px;height:9px;background:${CROSS} no-repeat;background-size:9px"></i>
      </a>
      <a class="mono" style="display:inline-flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${INK1};padding:11px 2px;border-bottom:1px solid ${LINE};cursor:pointer">二・MONO 底線連結 →</a>
      <button class="mono" style="border:1px solid ${LINE};background:transparent;color:${INK1};font-size:12px;letter-spacing:.1em;padding:9px 16px;cursor:pointer">三・HAIRLINE 按鈕</button>
    </div>`)}
  ${p("一「金色填滿」＝上黑下金漸層＋noise 質感＋四角十字＋靜態微光，文字 #160a02 — 保留給轉換點（Hero、預約表單送出）。二「mono 底線」＝卡片內的安靜行動（查看 12 週學習地圖），hover 轉領域色。三「hairline」＝工具列動作（後台、次要操作）。hover 統一：上浮 -2px ＋ 提亮，300–400ms。")}
  ${dodont(
    ["金色 CTA 一個畫面最多一顆", "卡片內用 mono 底線款，不與主 CTA 搶", "hover 只做上浮＋提亮，禁彈跳"],
    ["呼吸／脈動發光的 CTA（已定案移除，over-design）", "圓角按鈕", "改漸層方向或色票"]
  )}

  ${sub("5.3 面板家族（七式）— 先查表再選卡")}
  <div class="ds-rows">
    ${PANEL_MATRIX.map(([n, b, u]) => `
      <div class="ds-row">
        <span class="ds-tname">${n}</span>
        <span class="ds-tcls mono">${b}</span>
        <span class="ds-usage">${u}</span>
      </div>`).join("")}
  </div>

  ${sub("5.3a hairline 面板 — 標準內容容器（含角落十字）")}
  ${spec(`
    <div style="position:relative;border:1px solid ${LINESOFT};background:rgba(13,10,8,.55);padding:20px;max-width:420px">
      <p class="mono" style="display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${INK2};margin-bottom:12px"><span style="width:22px;height:1px;background:linear-gradient(90deg,${ORANGE},transparent)"></span>面板小標（tw-k）</p>
      <p style="color:${INK1};font-size:13.5px;line-height:1.7">內容。面板框 line-soft、底 rgba(13,10,8,.55)；左上與右下角掛 8px 十字（cross-dim）。</p>
      <i style="position:absolute;left:7px;top:7px;width:8px;height:8px;background:${CROSS} no-repeat;background-size:8px;opacity:.5"></i>
      <i style="position:absolute;right:7px;bottom:7px;width:8px;height:8px;background:${CROSS} no-repeat;background-size:8px;opacity:.5"></i>
    </div>`)}

  ${sub("5.3b lvg 色軌卡 — 領域色濃度階（12 週課表）")}
  ${spec(`
    <div style="display:grid;grid-template-columns:74px 1fr;border:1px solid ${LINESOFT};background:rgba(13,10,8,.5);max-width:520px">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:18px 8px;background:color-mix(in srgb,#E0724A 13%,rgba(10,8,6,.6));border-right:2px solid color-mix(in srgb,#E0724A 60%,transparent)">
        <span class="mono" style="font-size:12px;letter-spacing:.12em;color:${INK0};border:1px solid color-mix(in srgb,#E0724A 70%,transparent);padding:4px 9px">L1</span>
        <span style="font-family:'Chakra Petch',sans-serif;font-weight:600;color:#E0724A;font-variant-numeric:tabular-nums">W2–4</span>
      </div>
      <div style="padding:16px 20px">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><b style="color:${INK0};font-size:15px">內容與素材自動化</b><span class="mono" style="font-size:10.5px;color:#E0724A">階段產出 — 文案矩陣</span></div>
        <p style="margin-top:6px;color:${INK1};font-size:12.5px;line-height:1.6">左側 2px 色軌＋色底；濃度隨 Level 遞增（--o 0.4→1.0）。</p>
      </div>
    </div>`)}
  ${code(`結構：grid [色軌側欄 | 主欄]；side 背景 color-mix(--dc, --o*22%)、右框 2px color-mix(--dc, --o*100%)
總覽條 lv-bar 同語言：四段 flex(1:3:3:5)＝週數比例、頂部 2px 色線`)}

  ${sub("5.3c 結論卡＋虛線佔位框")}
  ${spec(`
    <div style="display:grid;gap:12px;max-width:520px">
      <div style="border:1px solid rgba(255,138,50,.3);background:linear-gradient(158deg,rgba(40,24,10,.5),rgba(16,10,6,.4));padding:16px 20px">
        <span class="mono" style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${ORANGE}">終點結果</span>
        <p style="margin-top:8px;color:${INK0};font-size:13.5px;line-height:1.65">橘框結論卡 — 一個區塊最多一張，收束用。</p>
      </div>
      <figure style="position:relative;aspect-ratio:16/6;margin:0;border:1px dashed ${LINE};background:linear-gradient(160deg,rgba(24,19,14,.7),rgba(12,9,7,.6));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
        <svg viewBox="0 0 24 24" fill="none" stroke="${INK2}" stroke-width="1.5" style="width:26px;height:26px"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="9" cy="10" r="1.8"/><path d="M3 17l5-4 4 3 4-4 5 5"/></svg>
        <figcaption class="mono" style="font-size:10.5px;letter-spacing:.1em;color:${INK1}">作品截圖說明</figcaption>
        <span class="mono" style="font-size:9px;letter-spacing:.2em;color:${INK2}">IMAGE SLOT</span>
      </figure>
    </div>`)}

  ${sub("5.4 標籤家族（Tag／Chip／章）")}
  ${spec(`
    <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
      <div>
        <span class="mono" style="display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.08em;color:${INK1};border:1px solid ${LINE};padding:8px 12px"><span style="width:5px;height:5px;background:#E0724A"></span>能力標籤</span>
        <p class="ds-note">方塊點 chip（dot 用領域色）</p>
      </div>
      <div>
        <span style="display:inline-flex;align-items:center;gap:9px;border:1px solid ${LINE};padding:10px 14px;font-size:13px;color:${INK0}"><span style="color:#2EBFA0;font-size:11px">✓</span>適合誰 chip</span>
        <p class="ds-note">✓ 前綴 chip（fit-chips）</p>
      </div>
      <div>
        <span style="font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:13px;color:#8B7CFF">關鍵字</span><span class="mono" style="color:${INK2};font-size:12px"> → </span><span style="color:${INK1};font-size:12.5px">一句突破說明</span>
        <p class="ds-note">卡點對照（sk：領域色關鍵字 → 說明）</p>
      </div>
      <div>
        <span class="mono" style="font-size:9px;letter-spacing:.2em;color:${INK0};background:rgba(10,8,6,.55);border:1px solid ${LINE};padding:4px 8px;backdrop-filter:blur(6px)">1:1 CONSULT</span>
        <p class="ds-note">照片上的 mono 玻璃章（mile-ph）</p>
      </div>
    </div>`)}

  ${sub("5.5 數據（Stat）＋ 前後對比條（imp bars）")}
  ${spec(`
    <div style="display:flex;gap:1px;background:${LINESOFT};border:1px solid ${LINESOFT};max-width:520px;margin-bottom:16px">
      ${["+97.6|%|AI 人才需求 · 5 年成長", "×4.3|倍|高於整體招募市場", "+38|%|AI 工作機會 · 年增"].map((s) => {
        const [n, u, l] = s.split("|");
        return `<div style="flex:1;background:rgba(13,10,8,.6);padding:16px 14px"><div style="font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:22px;color:${INK0};font-variant-numeric:tabular-nums">${n}<span style="color:${ORANGE};font-size:11px;margin-left:2px">${u}</span></div><div class="mono" style="font-size:9px;letter-spacing:.12em;color:${INK2};margin-top:8px">${l}</div></div>`;
      }).join("")}
    </div>
    <div style="max-width:420px">
      <span style="font-size:12.5px;color:${INK1}">市場與受眾研究</span>
      <div style="margin-top:6px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px"><span style="height:14px;width:100%;background:${LINE}"></span><i class="mono" style="font-style:normal;font-size:10px;color:${INK2}">3 天</i></div>
      <div style="margin-top:4px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px"><span style="height:14px;width:6%;background:color-mix(in srgb,#E0724A 78%,transparent)"></span><i class="mono" style="font-style:normal;font-size:10px;color:${INK0}">3 小時</i></div>
    </div>`)}
  ${code(`數據卡：1px 拼格＋Chakra Petch tabular 大數字＋橘色單位＋mono 標籤
對比條：灰條（傳統）在上、色條（AI）在下，標籤獨立 auto 欄防溢出；進場由左長到右（impGrow .85s，切 tab 重放）
上方必附圖例（imp-legend：灰塊「傳統學習」/ 色塊「AI 學習」）`)}

  ${sub("5.6 Registration 十字（.cx）— 品牌簽名細節")}
  ${p("四角「+」十字是儀器語言的簽名：CTA 四角（橘 9px）、面板左上右下（dim 8px）、section 頂線兩端（dim 9px）、頁面 frame 四角（dim 12px）。橘=互動/作用中，dim=結構標記。新元件優先沿用此語言而非新造裝飾。")}

  ${sub("5.7 照片規範（人像／場景）")}
  ${spec(`
    <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
      <div>
        <span style="position:relative;display:grid;place-items:center;width:46px;height:46px;font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:15px;color:${ORANGE};background:linear-gradient(135deg,rgba(255,138,50,.2),rgba(255,138,50,.04));border:1px solid ${LINE};overflow:hidden">教<img src="../img/portrait_mentor.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;filter:saturate(.82) contrast(1.05) brightness(.96)" alt=""></span>
        <p class="ds-note">micro-avatar：方形＋字母 fallback</p>
      </div>
      <div style="min-width:200px;flex:1;max-width:300px">
        <div style="position:relative;height:80px;overflow:hidden;border:1px solid ${LINE}">
          <img src="../img/img_001.jpg" style="width:100%;height:100%;object-fit:cover;object-position:center 28%;filter:saturate(.82) contrast(1.05) brightness(.92)" alt="">
          <span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,7,10,.05),rgba(10,8,6,.55))"></span>
          <span class="mono" style="position:absolute;left:10px;bottom:8px;font-size:9px;letter-spacing:.2em;color:${INK0};background:rgba(10,8,6,.55);border:1px solid ${LINE};padding:3px 7px">1:1 CONSULT</span>
        </div>
        <p class="ds-note">照片帶：品牌濾鏡＋暗漸層＋mono 玻璃章</p>
      </div>
    </div>`)}
  ${code(`品牌濾鏡（全站統一）：filter: saturate(.82) contrast(1.05) brightness(.96)
人像 object-position: center 30%；一律方形直角＋1px line 框；img 失敗時字母 fallback 墊底
選材：亞洲人物、深色環境暖光、紀實感（諮詢/課堂/工作場景），拒絕棚拍假笑股照`)}

  ${h2("六、動態規範（Motion）")}
  <div class="ds-list">
    <p>· <b>緩動 Token</b>：<code>cubic-bezier(.22, .61, .36, 1)</code>（--ease）— 全站唯一進場緩動。禁 back／elastic／bounce。</p>
    <p>· <b>進場（reveal）</b>：opacity 0→1、y 30→0；0.9–1s；IntersectionObserver 一次性；群組 stagger 0.07s（.d1–.d6）。大標可用 mask reveal（clip-path 升起 1.15s）。JS 失效有 3s 失效保險強制顯示。</p>
    <p>· <b>Hover</b>：CTA 上浮 -2px＋提亮（400ms）；卡片邊框轉亮／微上浮；照片濾鏡復原（500ms）。</p>
    <p>· <b>常駐動態</b>：grain 噪點 2.6s steps(4)；核心光暈脈動 6.5s；柱狀 gallery 自轉 42s（hover 暫停）；3D 徽章慢速繞行＋hover 領域色發光。同屏常駐 ≤3 處。</p>
    <p>· <b>數字進場</b>：01 區 shuffle 洗牌（各位數滾動亂數後左→右鎖定，~0.9s）；效益條 impGrow 由左長到右（.85s，切 tab 重放）；計數 countUp ease-out 1.3s。</p>
    <p>· <b>GSAP／Lenis</b>：GSAP 只用於 02 服務流程 pin/scrub 與 Hero→02 過場；Lenis 慣性捲動（duration 1.05）。一般區塊用 CSS reveal 即可。</p>
    <p>· <b>鐵律</b>：respect <code>prefers-reduced-motion</code>（動畫全靜置、數字直接顯示終值）；進場不重播；RAF 動畫一律配 setTimeout 保險落定終值。</p>
  </div>

  ${h2("七、影像與圖標")}
  ${sub("7.1 素材庫（點「下載」取得原檔；檔案在 img/，路徑即網址）")}
  <div class="ds-assets">
    ${BG_ASSETS.map((a) => `
      <div class="ds-asset">
        <div class="ds-asset-head">
          <span class="mono" style="font-size:12px;font-weight:700;color:${INK0}">${a.show}</span>
          <span class="mono" style="font-size:10.5px;color:${INK2}">${a.size}</span>
          <a href="${a.file}" download class="ds-dl">下載</a>
        </div>
        ${/\.(png|jpg|svg)$/.test(a.file) ? `<div class="ds-asset-img"><img src="${a.file}" loading="lazy" alt=""></div>` : ""}
        <p class="ds-asset-use">${a.use}</p>
      </div>`).join("")}
  </div>

  ${sub("7.2 程式生成背景（無檔案，直接抄配方）")}
  ${spec(`
    <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
      <div>
        <div style="height:80px;border:1px solid ${LINESOFT};background:#08070a"><div style="height:100%;background:radial-gradient(68% 48% at 50% -6%, rgba(255,238,214,.2), transparent 60%), radial-gradient(120% 95% at 50% 4%, rgba(255,140,50,.12), transparent 60%)"></div></div>
        <p class="ds-note">頂部暖橘聚光（示意加倍濃度）</p>
      </div>
      <div>
        <div style="height:80px;border:1px solid ${LINESOFT};background:#08070a;opacity:.4;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;)"></div>
        <p class="ds-note">grain 噪點（示意加倍；正式 opacity .09＋2.6s steps 位移）</p>
      </div>
    </div>`)}
  ${code(`頂部聚光（body::before 標配）：
  radial-gradient(68% 48% at 50% -6%, rgba(255,238,214,.06), transparent 60%),
  radial-gradient(120% 95% at 50% 4%, rgba(255,140,50,.03), transparent 60%)
grain：inline SVG feTurbulence（baseFrequency .9、180×180）＋ opacity .09 ＋ grainShift 2.6s steps(4)
暗角 vignette：inset 0 0 240px 40px rgba(0,0,0,.58)（fixed 蓋全頁）
星空：img/bg-warp.jpg 經 multiply rgb(196,166,128) 暖化＋中心壓暗（scene background）`)}
  <div class="ds-list" style="margin-top:14px">
    <p>· <b>圖標</b>：inline stroke SVG（stroke-width 1.5–1.75、round cap），16–30px。<b style="color:#f08a8a">全站禁用 emoji</b> — 條列用 ▸◆●、狀態用 ✓✕。</p>
    <p>· <b>3D 徽章</b>：六角深色金屬（非金幣）、guilloché 防偽紋＋浮雕 icon、hover 才顯領域色發光 — 程式生成（Three.js），規格見 scripts 區源碼。</p>
    <p>· <b>佔位圖政策</b>：AI 生成示意照過渡（HTML 註解標 TODO），正式上線前換品牌實拍（CMS 後台可直接換）。</p>
  </div>

  ${h2("八、AI 延伸指南（做新畫面的標準流程）")}
  <div class="ds-list">
    <p>1. <b>底色只有一種</b>：#08070a 深黑。新區塊靠 hairline 與留白做層次，不引入新底色。</p>
    <p>2. <b>套標頭骨架</b>：eyebrow（5.1，編號遞增）→ 大標（.ac 強調一處）→ sec-lead 導言 → 內容。</p>
    <p>3. <b>選面板</b>：查 5.3 決策表 — 內容是什麼類型，就用對應那張卡，不自創新卡。</p>
    <p>4. <b>直角＋hairline＋十字</b>：容器 .wrap；面板掛角落十字；領域內容掛 --dc 變數換色。</p>
    <p>5. <b>CTA 按層級取用</b>（5.2 三階）：金色一顆、卡內用 mono 底線款。</p>
    <p>6. <b>進場包 reveal</b>（六）：新動態先問「刪掉會不會更好」；必配 reduced-motion 與失效保險。</p>
    <p>7. <b>接 CMS</b>：文字掛 <code>data-cms="區塊.欄位"</code>、圖掛 <code>data-cms-src</code>、清單掛 <code>data-cms-list</code>＋<code>data-cms-item</code>＋<code>data-cms-f</code>；區塊開關掛 <code>data-cms-sec</code>；nova_sections 補一筆 — 後台表單自動生成。</p>
    <p>8. <b>自我檢查</b>：色彩只用第二章 Token？字級在字級階上？面板在 5.3 家族內？RWD 三斷點收合？無 emoji？</p>
  </div>

  <p class="ds-foot">v1.0 · 2026-07 · 以 v2 首頁七區實作歸納（面板七式＋標籤家族＋領域色 color-mix 系統＋照片規範）· 變更此頁請同步更新官網實作 — 此頁實品即真實樣式，兩者不可分離</p>
  `;
  return el;
}

/* 設計系統頁專用樣式（一次注入） */
export function injectDsStyles() {
  if (document.getElementById("ds-styles")) return;
  const s = document.createElement("style");
  s.id = "ds-styles";
  s.textContent = `
.ds-wrap{max-width:900px;border:1px solid var(--line-soft);background:var(--panel);padding:30px}
.ds-title{font-family:var(--disp);font-size:22px;margin-top:8px;color:var(--ink-0)}
.ds-h2{margin-top:44px;display:flex;align-items:center;gap:10px;border-top:1px solid var(--line-soft);padding-top:36px;font-family:var(--disp);font-size:16px;color:var(--ink-0)}
.ds-h2:first-of-type{margin-top:28px}
.ds-h2line{display:inline-block;width:24px;height:1px;background:var(--accent)}
.ds-sub{margin-top:24px;font-size:13.5px;font-weight:700;color:var(--ink-0)}
.ds-p{margin-top:8px;font-size:13px;line-height:1.75;color:var(--ink-1)}
.ds-note{margin-top:7px;font-family:var(--mono);font-size:10px;letter-spacing:.05em;color:var(--ink-2)}
.ds-grid2{margin-top:12px;display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
.ds-card{border:1px solid var(--line-soft);padding:14px 16px}
.ds-card-t{font-size:13px;font-weight:700;color:var(--ink-0)}
.ds-card-d{margin-top:6px;font-size:12px;line-height:1.65;color:var(--ink-1)}
.ds-rows{margin-top:10px;display:grid;gap:6px}
.ds-row{display:flex;align-items:center;gap:14px;border:1px solid var(--line-soft);padding:9px 14px;flex-wrap:wrap}
.ds-swatch{width:34px;height:34px;flex:none;border:1px solid var(--line)}
.ds-hex{width:150px;flex:none;font-size:11px;font-weight:700;color:var(--ink-0)}
.ds-name{width:120px;flex:none;font-size:10.5px;color:var(--accent)}
.ds-usage{min-width:0;flex:1;font-size:12px;line-height:1.6;color:var(--ink-1)}
.ds-tname{width:130px;flex:none;font-size:12px;font-weight:700;color:var(--ink-0)}
.ds-tcls{width:250px;flex:none;font-size:10.5px;color:var(--accent)}
.ds-spec{margin-top:10px;border:1px solid var(--line);background:#08070a;padding:20px}
.ds-code{margin-top:8px;overflow-x:auto;border:1px solid var(--line-soft);background:rgba(0,0,0,.4);padding:12px;font-family:var(--mono);font-size:11px;line-height:1.7;color:var(--accent-2);white-space:pre-wrap}
.ds-dd{margin-top:10px;display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.ds-do,.ds-dont{border:1px solid rgba(255,138,50,.3);padding:12px 14px}
.ds-dont{border-color:rgba(240,138,138,.3)}
.ds-do>p{font-size:11.5px;font-weight:700;color:var(--accent)}
.ds-dont>p{font-size:11.5px;font-weight:700;color:var(--danger)}
.ds-do ul,.ds-dont ul{margin-top:8px;list-style:none;display:grid;gap:6px}
.ds-do li,.ds-dont li{position:relative;padding-left:14px;font-size:12px;line-height:1.6;color:var(--ink-1)}
.ds-do li::before{content:"▸";position:absolute;left:0;color:var(--accent)}
.ds-dont li::before{content:"▸";position:absolute;left:0;color:var(--danger)}
.ds-list{margin-top:10px;display:grid;gap:8px}
.ds-list p{font-size:12.5px;line-height:1.75;color:var(--ink-1)}
.ds-list b{color:var(--ink-0)}
.ds-list code,.ds-p code{font-family:var(--mono);font-size:11px;color:var(--accent-2)}
.ds-assets{margin-top:10px;display:grid;gap:10px}
.ds-asset{border:1px solid var(--line-soft)}
.ds-asset-head{display:flex;align-items:center;gap:12px;padding:9px 14px}
.ds-asset-head .mono:first-child{min-width:0;flex:1}
.ds-dl{flex:none;border:1px solid rgba(255,138,50,.5);color:var(--accent);font-size:11px;font-weight:700;padding:4px 12px;text-decoration:none;transition:background .25s}
.ds-dl:hover{background:rgba(255,138,50,.1)}
.ds-asset-img{border-top:1px solid var(--line-soft);background:#000;padding:10px 14px}
.ds-asset-img img{display:block;margin:0 auto;max-height:90px;max-width:100%;width:auto;object-fit:contain}
.ds-asset-use{border-top:1px solid var(--line-soft);padding:8px 14px;font-size:11.5px;line-height:1.6;color:var(--ink-2)}
.ds-foot{margin-top:40px;border-top:1px solid var(--line-soft);padding-top:16px;font-size:11px;line-height:1.7;color:var(--ink-2)}
`;
  document.head.append(s);
}
