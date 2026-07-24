#!/usr/bin/env node
/** Apply cached MyMemory translations to locale JSON files */
import fs from "node:fs";
import path from "node:path";

const CACHE = JSON.parse(fs.readFileSync("scripts/.translation-cache.json", "utf8"));
const LOCALES_DIR = path.join(process.cwd(), "locales");

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const locale of ["ar", "es", "fr", "de"]) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let n = 0;
  for (const [key, value] of Object.entries(CACHE)) {
    if (!key.startsWith(`${locale}::`)) continue;
    const dotPath = key.slice(locale.length + 2);
    setByPath(data, dotPath, value);
    n++;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`${locale}.json: applied ${n} cached translations`);
}
