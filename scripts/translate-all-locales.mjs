#!/usr/bin/env node
/**
 * Translate all locale files where value still matches English.
 * Uses MyMemory API with persistent cache. Supports all 29 non-English locales.
 *
 * Usage: node scripts/translate-all-locales.mjs [locale...]
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const CACHE_PATH = path.join(process.cwd(), "scripts/.translation-cache.json");

const LANG_MAP = {
  ar: "ar",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  nl: "nl",
  tr: "tr",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja",
  ko: "ko",
  ru: "ru",
  hi: "hi",
  id: "id",
  vi: "vi",
  th: "th",
  pl: "pl",
  sv: "sv",
  no: "no",
  da: "da",
  fi: "fi",
  el: "el",
  cs: "cs",
  ro: "ro",
  uk: "uk",
  ms: "ms",
  bn: "bn",
  fa: "fa",
  ur: "ur",
};

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
  "errors.",
  "footer.",
  "seoContent.",
];

function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v, p, out);
    else if (Array.isArray(v)) out[p] = v;
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

function shouldSkipValue(value) {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;
  if (/^[\d\s%{}./:-]+$/.test(value)) return true;
  if (/^https?:\/\//.test(value)) return true;
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(value) && !value.includes(" ")) return true;
  return false;
}

function cachePathForLocale(locale) {
  return path.join(process.cwd(), `scripts/.translation-cache-${locale}.json`);
}

function loadCache(locale) {
  const paths = [cachePathForLocale(locale), CACHE_PATH];
  const merged = {};
  for (const filePath of paths) {
    try {
      Object.assign(merged, JSON.parse(fs.readFileSync(filePath, "utf8")));
    } catch {
      /* ignore */
    }
  }
  return merged;
}

function saveCacheEntry(locale, cacheKey, value) {
  const filePath = cachePathForLocale(locale);
  let current = {};
  try {
    current = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    /* fresh */
  }
  current[cacheKey] = value;
  fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
}

async function translateText(text, lang, locale, cache) {
  if (!text || text.length > 480) return text;
  const cacheKey = `${lang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  for (let attempt = 0; attempt < 6; attempt++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 6000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText ?? text;
    cache[cacheKey] = translated;
    saveCacheEntry(locale, cacheKey, translated);
    await new Promise((r) => setTimeout(r, 350));
    return translated;
  }
  throw new Error("HTTP 429");
}

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8"));
const enFlat = flatten(en);
const onlyLocales = process.argv.slice(2);
const targetLocales = onlyLocales.length
  ? onlyLocales
  : Object.keys(LANG_MAP);

let cache = {};

for (const locale of targetLocales) {
  if (!LANG_MAP[locale]) {
    console.warn(`Skip unknown locale: ${locale}`);
    continue;
  }
  cache = loadCache(locale);
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const flat = flatten(data);
  let translated = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const [key, enValue] of Object.entries(enFlat)) {
    if (!shouldTranslate(key)) continue;
    const current = flat[key];
    if (current === undefined) continue;

    if (Array.isArray(enValue) && Array.isArray(current)) {
      if (JSON.stringify(current) === JSON.stringify(enValue)) {
        const translatedBody = [];
        let bodyChanged = false;
        for (let i = 0; i < enValue.length; i++) {
          const part = enValue[i];
          if (shouldSkipValue(part)) {
            translatedBody.push(part);
            continue;
          }
          try {
            const next = await translateText(part, LANG_MAP[locale], locale, cache);
            translatedBody.push(next);
            if (next !== part) bodyChanged = true;
          } catch {
            translatedBody.push(part);
            skipped++;
          }
        }
        if (bodyChanged) {
          flat[key] = translatedBody;
          translated++;
        } else {
          unchanged++;
        }
      }
      continue;
    }

    if (typeof enValue !== "string" || typeof current !== "string") continue;
    if (current !== enValue) continue;
    if (shouldSkipValue(enValue)) continue;

    try {
      flat[key] = await translateText(enValue, LANG_MAP[locale], locale, cache);
      translated++;
      if (translated % 100 === 0) {
        console.log(`${locale}: ${translated} keys translated…`);
      }
    } catch (err) {
      skipped++;
      if (skipped <= 5) console.warn(`${locale} skip ${key}:`, err.message);
    }
  }

  const merged = unflatten(flat);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`${locale}.json: translated ${translated}, unchanged ${unchanged}, skipped ${skipped}`);
}
