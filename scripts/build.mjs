/* NOVA 官網建置：把 CMS「已發布」內容烘進靜態 HTML → dist/
   用法：node scripts/build.mjs
   - 內容來源：Supabase nova_sections.published_*（讀不到 → 全用 HTML 內建預設，build 不失敗）
   - 部署：Cloudflare Pages build command = `npm ci && npm run build`，output = dist */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseHTML } from "linkedom";
import { getPublished, applyContent } from "../assets/cms.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const html = readFileSync(join(root, "index.html"), "utf8");
const cms = await getPublished("home");
const sectionCount = Object.keys(cms).length;

const { document } = parseHTML(html);
applyContent(document, cms, "build");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "index.html"), document.toString());

// 靜態資產與後台原樣帶入
for (const dir of ["img", "assets", "admin"]) {
  if (existsSync(join(root, dir))) cpSync(join(root, dir), join(dist, dir), { recursive: true });
}

console.log(`✓ build 完成 → dist/（CMS 區塊 ${sectionCount} 筆${sectionCount === 0 ? "，全部使用內建預設" : ""}）`);
