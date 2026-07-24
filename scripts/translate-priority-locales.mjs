#!/usr/bin/env node
/**
 * Translate English placeholder strings in ar, es, fr, de using MyMemory API.
 * Only translates leaves where value === English counterpart.
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const CACHE_PATH = path.join(process.cwd(), "scripts/.translation-cache.json");
const TARGETS = ["ar", "es", "fr", "de"];
const PREFIXES = [
  "common.",
  "nav.",
  "navDescriptions.",
  "alerts.",
  "emptyStates.",
  "designStyles.",
  "tones.",
  "websiteTypes.",
  "websiteFeatures.",
  "quickActions.",
  "products.",
  "workspaces.",
  "constants.",
  "contentStudio.",
  "pages.",
  "marketing.",
  "auth.",
  "dashboard.",
];

const LANG_MAP = { ar: "ar", es: "es", fr: "fr", de: "de" };

function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

function unflatten(flat) {
  const root = {};
  for (const [dotPath, value] of Object.entries(flat)) {
    const parts = dotPath.split(".");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return root;
}

function shouldTranslate(key) {
  return PREFIXES.some((p) => key === p.slice(0, -1) || key.startsWith(p));
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function translateText(text, lang) {
  if (!text || text.length > 450) return text;
  const cacheKey = `${lang}::${text}`;
  const cache = loadCache();
  if (cache[cacheKey]) return cache[cacheKey];

  for (let attempt = 0; attempt < 5; attempt++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 8000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText ?? text;
    cache[cacheKey] = translated;
    saveCache(cache);
    await new Promise((r) => setTimeout(r, 800));
    return translated;
  }
  throw new Error("HTTP 429");
}

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8"));
const enFlat = flatten(en);
const onlyLocales = process.argv.slice(2);
const targetLocales = onlyLocales.length ? onlyLocales : TARGETS;

for (const locale of targetLocales) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const flat = flatten(data);
  let translated = 0;
  let skipped = 0;

  for (const [key, enValue] of Object.entries(enFlat)) {
    if (typeof enValue !== "string") continue;
    if (!shouldTranslate(key)) continue;
    const current = flat[key];
    if (current === undefined) continue;
    if (current !== enValue) continue;
    if (!enValue.trim() || /^[\d\s%{}./:-]+$/.test(enValue)) continue;

    try {
      flat[key] = await translateText(enValue, LANG_MAP[locale]);
      translated++;
      if (translated % 50 === 0) console.log(`${locale}: ${translated} translated…`);
    } catch (err) {
      skipped++;
      if (skipped <= 3) console.warn(`${locale} skip ${key}:`, err.message);
    }
  }

  const merged = unflatten(flat);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`${locale}.json: translated ${translated}, skipped ${skipped}`);
}
