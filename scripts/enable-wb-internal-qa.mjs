/**
 * Enable Website Builder internal-qa flags in .env.local
 * Usage: node scripts/enable-wb-internal-qa.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

const FLAGS = [
  "WB_SITE_PLAN_V1=1",
  "WB_STRUCTURE_FIRST=1",
  "WB_VISUAL_SKIN_V1=1",
  "WB_PUBLISH_GATE=1",
  "WB_PRO_WORKSPACE=1",
  "NEXT_PUBLIC_WB_PRO_WORKSPACE=1",
  "WB_LOCALE_LLM=1",
];

const BLOCK = [
  "",
  "# --- Website Builder internal-qa (auto-generated) ---",
  ...FLAGS,
  "# --- end internal-qa ---",
  "",
].join("\n");

let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

for (const line of FLAGS) {
  const key = line.split("=")[0];
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, line);
  }
}

if (!content.includes("Website Builder internal-qa")) {
  content = content.trimEnd() + BLOCK;
}

writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`);
console.log(`Updated ${envPath}`);
console.log("Restart dev server: npm run dev");
