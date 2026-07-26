#!/usr/bin/env node
/**
 * Batch-translate locale files via DeepSeek (uses DEEPSEEK_API_KEY from .env.local).
 * Only translates keys where locale value still equals English (preserves existing translations).
 *
 * Usage: node scripts/translate-locales-deepseek.mjs [locale...]
 * Env:   TRANSLATE_BATCH_SIZE=60  TRANSLATE_MIN_PCT=98  TRANSLATE_REMAINING_ONLY=1
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const BATCH_SIZE = Number(process.env.TRANSLATE_BATCH_SIZE) || 60;
const MIN_PCT = Number(process.env.TRANSLATE_MIN_PCT) || 98;
const MODEL = "deepseek-v4-flash";
const COMPLETION_MODE = MIN_PCT >= 100;
const REMAINING_ONLY = process.env.TRANSLATE_REMAINING_ONLY === "1";
const ONLY_ABOVE_PCT = Number(process.env.TRANSLATE_ONLY_ABOVE_PCT) || 0;

const LANG_MAP = {
  ar: "Arabic",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  tr: "Turkish",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  hi: "Hindi",
  id: "Indonesian",
  vi: "Vietnamese",
  th: "Thai",
  pl: "Polish",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  el: "Greek",
  cs: "Czech",
  ro: "Romanian",
  uk: "Ukrainian",
  ms: "Malay",
  bn: "Bengali",
  fa: "Persian",
  ur: "Urdu",
};

/** Priority sections — translated first for production UX. */
const PRIORITY_PREFIXES = [
  "products.",
  "dashboard.",
  "marketing.",
  "workspaces.",
  "errors.",
  "seoContent.",
  "common.",
  "nav.",
  "navDescriptions.",
  "auth.",
  "pages.",
  "footer.",
  "alerts.",
  "emptyStates.",
  "designStyles.",
  "tones.",
  "websiteTypes.",
  "websiteFeatures.",
  "quickActions.",
  "constants.",
  "contentStudio.",
  "pricing.",
  "settings.",
  "notifications.",
  "websiteColorStyles.",
  "websiteDesignStyles.",
];

const GLOSSARY = `
Preserve brand name: Trend Business AI (keep exactly as written).
Translate all other product and feature names professionally: Website Builder, App Builder, Video Studio, Content Studio, Brand Studio, Logo Maker, Image Generator, Landing Page Builder, Business Intelligence, Business Manager, Social Media Manager, Marketing AI.
For CRM, ERP, BI, SaaS, SEO, API, KPI, ROI, AI: use the standard professional term in the target language (localized full term is preferred; acronym may follow in parentheses).
Keep technical tokens unchanged: ZIP, JSON, PDF, CSV, placeholders like {name}, {count}.
`;

const COMPLETION_GLOSSARY = `
Complete translation pass — every output value MUST differ from the English input.
Keep only "Trend Business AI" unchanged as the company brand.
Translate everything else into natural, professional ${"{language}"} including Dashboard, Team, Contact, Home, Blog, Legal, and all product marketing copy.
For CRM/ERP/BI use proper localized business terminology (not English words unless unavoidable in that market).
`;

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim();
    }
  }
}

function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
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

function shouldSkipValue(value) {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;
  if (/^[\d\s%{}./:-]+$/.test(value)) return true;
  if (/^https?:\/\//.test(value)) return true;
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(value) && !value.includes(" ")) return true;
  return false;
}

function priorityRank(key) {
  const idx = PRIORITY_PREFIXES.findIndex((p) => key.startsWith(p));
  return idx === -1 ? PRIORITY_PREFIXES.length : idx;
}

function valuesEqual(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
}

function depthPct(enFlat, locFlat) {
  let same = 0;
  let total = 0;
  for (const [key, enValue] of Object.entries(enFlat)) {
    if (typeof enValue === "string") {
      if (shouldSkipValue(enValue)) continue;
      total++;
      if (locFlat[key] === enValue) same++;
    } else if (Array.isArray(enValue)) {
      const locVal = locFlat[key];
      if (!Array.isArray(locVal)) continue;
      for (let i = 0; i < enValue.length; i++) {
        if (shouldSkipValue(enValue[i])) continue;
        total++;
        if (locVal[i] === enValue[i]) same++;
      }
    }
  }
  const pct = total ? Math.round((100 * (total - same)) / total) : 100;
  return { pct, same, total };
}

function pause(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin */
  }
}

function saveLocale(filePath, flat) {
  const content = JSON.stringify(unflatten(flat), null, 2) + "\n";
  const tmp = `${filePath}.${process.pid}.tmp`;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.writeFileSync(tmp, content);
      fs.renameSync(tmp, filePath);
      return;
    } catch (err) {
      if (attempt === 7) throw err;
      pause(200 * (attempt + 1));
    } finally {
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  }
}

async function translateBatch(entries, language) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY missing");

  const payload = Object.fromEntries(entries);
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `You are a professional SaaS UI translator. Translate every value to ${language}. ` +
            "Return ONLY valid JSON with exactly the same keys as the input. " +
            "Keep placeholders like {name}, {count}, {product}, {date}, {code}, {industry} unchanged. " +
            (COMPLETION_MODE
              ? COMPLETION_GLOSSARY.replace("{language}", language)
              : GLOSSARY),
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty DeepSeek response");
  return JSON.parse(content);
}

async function translateWithRetry(entries, language, locale, label) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      return await translateBatch(entries, language);
    } catch (err) {
      const wait = 2000 * (attempt + 1);
      console.warn(`${locale} ${label} attempt ${attempt + 1} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error(`${locale} ${label} failed after retries`);
}

function collectPending(enFlat, flat) {
  const pending = [];

  for (const [key, enValue] of Object.entries(enFlat)) {
    const locValue = flat[key];

    if (typeof enValue === "string") {
      if (locValue !== enValue) continue;
      if (shouldSkipValue(enValue)) continue;
      pending.push({ key, value: enValue, type: "string" });
      continue;
    }

    if (Array.isArray(enValue) && Array.isArray(locValue) && valuesEqual(enValue, locValue)) {
      for (let i = 0; i < enValue.length; i++) {
        const part = enValue[i];
        if (typeof part !== "string" || shouldSkipValue(part)) continue;
        pending.push({ key: `${key}[${i}]`, value: part, type: "arrayItem", arrayKey: key, index: i });
      }
    }
  }

  pending.sort((a, b) => {
    const ra = priorityRank(a.key);
    const rb = priorityRank(b.key);
    if (ra !== rb) return ra - rb;
    return a.key.localeCompare(b.key);
  });

  return pending;
}

function applyTranslations(flat, chunk, translated) {
  let applied = 0;
  for (const item of chunk) {
    const val = translated[item.key];
    if (typeof val !== "string" || !val.trim()) continue;
    if (COMPLETION_MODE && val === item.value) continue;

    if (item.type === "arrayItem") {
      const arr = Array.isArray(flat[item.arrayKey]) ? [...flat[item.arrayKey]] : [];
      arr[item.index] = val;
      flat[item.arrayKey] = arr;
      applied++;
    } else {
      flat[item.key] = val;
      applied++;
    }
  }
  return applied;
}

loadEnv();

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8"));
const enFlat = flatten(en);

function resolveTargetLocales(argvLocales) {
  if (argvLocales.length) return argvLocales;
  return Object.keys(LANG_MAP).filter((locale) => {
    if (!ONLY_ABOVE_PCT) return true;
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const flat = flatten(JSON.parse(fs.readFileSync(filePath, "utf8")));
    return depthPct(enFlat, flat).pct > ONLY_ABOVE_PCT;
  });
}

const targetLocales = resolveTargetLocales(process.argv.slice(2));
const summary = [];
let localeIndex = 0;

for (const locale of targetLocales) {
  localeIndex++;
  const language = LANG_MAP[locale];
  if (!language) {
    console.warn(`Skip unknown locale: ${locale}`);
    summary.push({ locale, status: "skipped", reason: "unknown locale" });
    continue;
  }

  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const flat = flatten(data);

  let pending = collectPending(enFlat, flat);
  let { pct } = depthPct(enFlat, flat);

  if (REMAINING_ONLY) {
    if (pending.length === 0) {
      console.log(`[${localeIndex}/${targetLocales.length}] ${locale}: no remaining EN copies — skip`);
      summary.push({ locale, status: "ok", pct, updated: 0, englishCopies: 0 });
      continue;
    }
  } else if (pct >= MIN_PCT) {
    console.log(`[${localeIndex}/${targetLocales.length}] ${locale}: already ${pct}% — skip`);
    summary.push({ locale, status: "ok", pct, updated: 0 });
    continue;
  }

  console.log(`[${localeIndex}/${targetLocales.length}] ${locale}: ${pending.length} remaining EN copies (${pct}%)`);
  let totalUpdated = 0;
  let failedBatches = 0;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunk = pending.slice(i, i + BATCH_SIZE);
    const entries = chunk.map((item) => [item.key, item.value]);

    try {
      const translated = await translateWithRetry(entries, language, locale, `batch ${i}`);
      const applied = applyTranslations(flat, chunk, translated);
      totalUpdated += applied;
      saveLocale(filePath, flat);

      const progress = depthPct(enFlat, flat);
      console.log(`${locale}: ${progress.pct}% (${totalUpdated} updated, ${progress.same} EN left)`);

      if (progress.pct >= MIN_PCT) {
        console.log(`${locale}: reached ${MIN_PCT}% target`);
        break;
      }

      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      failedBatches++;
      console.warn(`${locale} batch ${i} permanently failed:`, err.message);
    }
  }

  // Second pass for anything still matching English
  pending = collectPending(enFlat, flat);
  if (pending.length > 0 && depthPct(enFlat, flat).pct < MIN_PCT) {
    console.log(`${locale}: second pass — ${pending.length} remaining`);
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);
      const entries = chunk.map((item) => [item.key, item.value]);
      try {
        const translated = await translateWithRetry(entries, language, locale, `retry ${i}`);
        totalUpdated += applyTranslations(flat, chunk, translated);
        saveLocale(filePath, flat);
        if (depthPct(enFlat, flat).pct >= MIN_PCT) break;
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        failedBatches++;
        console.warn(`${locale} retry ${i} permanently failed:`, err.message);
      }
    }
  }

  const final = depthPct(enFlat, flat);
  saveLocale(filePath, flat);
  console.log(
    `[${localeIndex}/${targetLocales.length}] ✓ ${locale}.json saved — ${final.pct}% | ${final.same} EN left | ${totalUpdated} updated`,
  );

  summary.push({
    locale,
    status: final.pct >= MIN_PCT ? "ok" : "incomplete",
    pct: final.pct,
    englishCopies: final.same,
    updated: totalUpdated,
    failedBatches,
  });
}

console.log("\n# Translation summary\n");
for (const row of summary) {
  console.log(
    `${row.locale}: ${row.pct ?? "—"}% | EN copies: ${row.englishCopies ?? "—"} | updated: ${row.updated ?? 0} | ${row.status}`,
  );
}

const failed = summary.filter((r) => r.status === "incomplete" || r.status === "skipped");
if (failed.length) process.exitCode = 1;
