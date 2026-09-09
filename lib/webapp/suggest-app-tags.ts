/**
 * One-Prompt description insight — app type, industry, complexity, build time, tags.
 * AI-first with description-driven heuristics as fallback. Process-local cache.
 * Output language follows Arabic description / preferred language (not English-only).
 */

import { createHash } from "node:crypto";

export type AppComplexity = "Low" | "Medium" | "High";

export type AppDescriptionInsight = {
  appType: string;
  industry: string;
  /** Display label — localized (e.g. Low / منخفض). */
  complexity: string;
  estimatedBuildTime: string;
  tags: string[];
};

export type AnalyzeAppDescriptionResult = AppDescriptionInsight & {
  cached: boolean;
  source: "ai" | "heuristic" | "cache";
};

export type AnalyzeAppDescriptionOptions = {
  /** Preferred UI/generation language (e.g. "Arabic", "English"). */
  language?: string | null;
};

/** @deprecated Prefer AnalyzeAppDescriptionResult */
export type SuggestAppTagsResult = {
  tags: string[];
  cached: boolean;
  source: "ai" | "heuristic" | "cache";
};

const MAX_TAGS = 3;
const MIN_DESCRIPTION_CHARS = 12;
const SERVER_CACHE_MAX = 200;

const APP_TYPE_OPTIONS = [
  "CRM",
  "ERP",
  "Dashboard",
  "SaaS",
  "Booking System",
  "POS",
  "LMS",
  "HR",
  "Inventory",
  "E-commerce Admin",
  "Marketplace",
  "Portal",
  "Custom Web App",
] as const;

type InsightOutputLanguage = "English" | "Arabic";

const BUILD_TIME_BY_COMPLEXITY: Record<
  InsightOutputLanguage,
  Record<AppComplexity, string>
> = {
  English: {
    Low: "~4–6 min",
    Medium: "~8–12 min",
    High: "~15–25 min",
  },
  Arabic: {
    Low: "~٤–٦ دقائق",
    Medium: "~٨–١٢ دقيقة",
    High: "~١٥–٢٥ دقيقة",
  },
};

const COMPLEXITY_LABEL: Record<InsightOutputLanguage, Record<AppComplexity, string>> = {
  English: { Low: "Low", Medium: "Medium", High: "High" },
  Arabic: { Low: "منخفض", Medium: "متوسط", High: "مرتفع" },
};

const APP_TYPE_LABEL: Record<string, Record<InsightOutputLanguage, string>> = {
  CRM: { English: "CRM", Arabic: "إدارة علاقات العملاء" },
  ERP: { English: "ERP", Arabic: "تخطيط موارد المؤسسة" },
  Dashboard: { English: "Dashboard", Arabic: "لوحة تحكم" },
  SaaS: { English: "SaaS", Arabic: "برمجيات سحابية" },
  "Booking System": { English: "Booking System", Arabic: "نظام حجوزات" },
  POS: { English: "POS", Arabic: "نقطة بيع" },
  LMS: { English: "LMS", Arabic: "نظام تعليم" },
  HR: { English: "HR", Arabic: "موارد بشرية" },
  Inventory: { English: "Inventory", Arabic: "مخزون" },
  "E-commerce Admin": { English: "E-commerce Admin", Arabic: "إدارة متجر إلكتروني" },
  Marketplace: { English: "Marketplace", Arabic: "سوق إلكتروني" },
  Portal: { English: "Portal", Arabic: "بوابة" },
  "Custom Web App": { English: "Custom Web App", Arabic: "تطبيق ويب مخصص" },
};

const INDUSTRY_LABEL: Record<string, Record<InsightOutputLanguage, string>> = {
  Healthcare: { English: "Healthcare", Arabic: "رعاية صحية" },
  Logistics: { English: "Logistics", Arabic: "خدمات لوجستية" },
  "Real Estate": { English: "Real Estate", Arabic: "عقارات" },
  Hospitality: { English: "Hospitality", Arabic: "ضيافة" },
  Fitness: { English: "Fitness", Arabic: "لياقة بدنية" },
  Education: { English: "Education", Arabic: "تعليم" },
  Retail: { English: "Retail", Arabic: "تجزئة" },
  Finance: { English: "Finance", Arabic: "مالية" },
  "Professional Services": {
    English: "Professional Services",
    Arabic: "خدمات مهنية",
  },
  Technology: { English: "Technology", Arabic: "تقنية" },
  "General Business": { English: "General Business", Arabic: "أعمال عامة" },
};

const TAG_LABEL: Record<string, Record<InsightOutputLanguage, string>> = {
  Marketplace: { English: "Marketplace", Arabic: "سوق" },
  Booking: { English: "Booking", Arabic: "حجوزات" },
  Dashboard: { English: "Dashboard", Arabic: "لوحة تحكم" },
  CRM: { English: "CRM", Arabic: "إدارة عملاء" },
  "E-commerce": { English: "E-commerce", Arabic: "تجارة إلكترونية" },
  Inventory: { English: "Inventory", Arabic: "مخزون" },
  SaaS: { English: "SaaS", Arabic: "سحابي" },
  LMS: { English: "LMS", Arabic: "تعليم" },
  HR: { English: "HR", Arabic: "موارد بشرية" },
  Logistics: { English: "Logistics", Arabic: "لوجستيات" },
  Healthcare: { English: "Healthcare", Arabic: "صحة" },
  "Real Estate": { English: "Real Estate", Arabic: "عقارات" },
  Portal: { English: "Portal", Arabic: "بوابة" },
  Operations: { English: "Operations", Arabic: "عمليات" },
};

const serverCache = new Map<string, AppDescriptionInsight>();

export function resolveInsightOutputLanguage(
  description: string,
  preferredLanguage?: string | null,
): InsightOutputLanguage {
  if (/\p{Script=Arabic}/u.test(description)) return "Arabic";
  const pref = (preferredLanguage ?? "").trim().toLowerCase();
  if (pref === "ar" || pref.includes("arabic") || pref.includes("عربي")) {
    return "Arabic";
  }
  return "English";
}

function cacheKey(description: string, language: InsightOutputLanguage): string {
  return createHash("sha256")
    .update(`${language}\n${description.trim().toLowerCase().replace(/\s+/g, " ")}`)
    .digest("hex");
}

function remember(key: string, insight: AppDescriptionInsight): void {
  if (serverCache.size >= SERVER_CACHE_MAX) {
    const first = serverCache.keys().next().value;
    if (first) serverCache.delete(first);
  }
  serverCache.set(key, insight);
}

function localizeKnown(
  value: string,
  table: Record<string, Record<InsightOutputLanguage, string>>,
  language: InsightOutputLanguage,
): string {
  const direct = table[value]?.[language];
  if (direct) return direct;
  const match = Object.entries(table).find(
    ([key, labels]) =>
      key.toLowerCase() === value.toLowerCase() ||
      labels.English.toLowerCase() === value.toLowerCase() ||
      labels.Arabic === value,
  );
  return match?.[1][language] ?? value;
}

export function normalizeAppTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const cleaned = item
      .replace(/[^\p{L}\p{N}\s&/+-]/gu, "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 28);
    if (cleaned.length < 2) continue;
    const hasLatin = /[A-Za-z]/.test(cleaned);
    const label = hasLatin
      ? cleaned
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : cleaned;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

function titleCaseLabel(value: string, max = 40): string {
  const cleaned = value
    .replace(/[^\p{L}\p{N}\s&/+-]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
  if (!cleaned) return "";
  if (!/[A-Za-z]/.test(cleaned)) return cleaned;
  return cleaned
    .split(" ")
    .map((part) => {
      if (/^[A-Z0-9]{2,5}$/.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function normalizeComplexity(value: unknown): AppComplexity | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  if (cleaned === "low" || cleaned === "منخفض" || cleaned === "بسيط") return "Low";
  if (
    cleaned === "medium" ||
    cleaned === "med" ||
    cleaned === "متوسط" ||
    cleaned === "متوسطه" ||
    cleaned === "متوسطة"
  ) {
    return "Medium";
  }
  if (cleaned === "high" || cleaned === "مرتفع" || cleaned === "عالي" || cleaned === "عالية") {
    return "High";
  }
  return null;
}

function normalizeAppType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = titleCaseLabel(value, 40);
  if (!cleaned) return null;
  const match = APP_TYPE_OPTIONS.find((option) => {
    const labels = APP_TYPE_LABEL[option];
    return (
      option.toLowerCase() === cleaned.toLowerCase() ||
      labels?.English.toLowerCase() === cleaned.toLowerCase() ||
      labels?.Arabic === cleaned
    );
  });
  return match ?? cleaned;
}

function normalizeIndustry(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return titleCaseLabel(value, 36) || null;
}

function buildTimeFor(
  complexity: AppComplexity,
  language: InsightOutputLanguage,
  raw?: unknown,
): string {
  if (typeof raw === "string") {
    const cleaned = raw.trim().slice(0, 32);
    if (cleaned.length >= 3) return cleaned;
  }
  return BUILD_TIME_BY_COMPLEXITY[language][complexity];
}

function localizeInsight(
  canonical: {
    appType: string;
    industry: string;
    complexity: AppComplexity;
    tags: string[];
  },
  language: InsightOutputLanguage,
  estimatedBuildTime?: string,
): AppDescriptionInsight {
  return {
    appType: localizeKnown(canonical.appType, APP_TYPE_LABEL, language),
    industry: localizeKnown(canonical.industry, INDUSTRY_LABEL, language),
    complexity: COMPLEXITY_LABEL[language][canonical.complexity],
    estimatedBuildTime:
      estimatedBuildTime?.trim() ||
      BUILD_TIME_BY_COMPLEXITY[language][canonical.complexity],
    tags: canonical.tags.map((tag) => localizeKnown(tag, TAG_LABEL, language)),
  };
}

export function emptyAppDescriptionInsight(): AppDescriptionInsight {
  return {
    appType: "",
    industry: "",
    complexity: "",
    estimatedBuildTime: "",
    tags: [],
  };
}

/** Deterministic fallback when the model is unavailable — still description-driven. */
export function heuristicAppTags(
  description: string,
  options?: AnalyzeAppDescriptionOptions,
): string[] {
  return heuristicAppDescriptionInsight(description, options).tags;
}

export function heuristicAppDescriptionInsight(
  description: string,
  options?: AnalyzeAppDescriptionOptions,
): AppDescriptionInsight {
  const language = resolveInsightOutputLanguage(description, options?.language);
  const text = description.toLowerCase();
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

  const typeScores: Array<{ type: string; weight: number }> = [
    {
      type: "Marketplace",
      weight:
        /\b(marketplace|two-sided|sellers?|buyers?|vendors?)\b/.test(text) ||
        /سوق|بائعين|مشترين|منصة\s*بيع/.test(description)
          ? 4
          : 0,
    },
    {
      type: "Booking System",
      weight:
        /\b(book(ing|ings)?|appointment|reservation|calendar|schedule)\b/.test(text) ||
        /حجز|حجوزات|مواعيد|جدولة|تقويم/.test(description)
          ? 4
          : 0,
    },
    {
      type: "Dashboard",
      weight:
        /\b(dashboard|analytics|kpi|metrics|reporting)\b/.test(text) ||
        /لوحة\s*تحكم|تحليلات|مؤشرات|تقارير/.test(description)
          ? 4
          : 0,
    },
    {
      type: "CRM",
      weight:
        /\b(crm|leads?|pipeline|contacts?|deals?)\b/.test(text) ||
        /عملاء|علاقات\s*العملاء|صفقات|عملاء\s*محتمل/.test(description)
          ? 4
          : 0,
    },
    {
      type: "E-commerce Admin",
      weight:
        /\b(e-?commerce|shop|store|cart|checkout|products?)\b/.test(text) ||
        /متجر|تجارة\s*إلكترونية|سلة|منتجات/.test(description)
          ? 4
          : 0,
    },
    {
      type: "Inventory",
      weight:
        /\b(inventory|warehouse|stock|sku)\b/.test(text) ||
        /مخزون|مستودع|مخازن/.test(description)
          ? 4
          : 0,
    },
    {
      type: "SaaS",
      weight:
        /\b(saas|subscription|billing|tenants?)\b/.test(text) ||
        /اشتراك|سحاب|فوترة/.test(description)
          ? 4
          : 0,
    },
    {
      type: "LMS",
      weight:
        /\b(lms|courses?|lessons?|learning|students?)\b/.test(text) ||
        /دورات|تعليم|طلاب|دروس/.test(description)
          ? 4
          : 0,
    },
    {
      type: "HR",
      weight:
        /\b(hr|payroll|employees?|leave|attendance)\b/.test(text) ||
        /موارد\s*بشرية|موظفين|رواتب|حضور/.test(description)
          ? 4
          : 0,
    },
    {
      type: "ERP",
      weight:
        /\b(erp|finance module|operations suite)\b/.test(text) ||
        /تخطيط\s*موارد|نظام\s*مؤسسي/.test(description)
          ? 4
          : 0,
    },
    {
      type: "POS",
      weight:
        /\b(pos|point\s+of\s+sale|checkout counter|receipts?)\b/.test(text) ||
        /نقطة\s*بيع|كاشير|فواتير\s*بيع/.test(description)
          ? 4
          : 0,
    },
    {
      type: "Portal",
      weight:
        /\b(portal|client\s+area|member)\b/.test(text) ||
        /بوابة|منطقة\s*عملاء|أعضاء/.test(description)
          ? 3
          : 0,
    },
  ];

  const appType =
    typeScores
      .filter((row) => row.weight > 0)
      .sort((a, b) => b.weight - a.weight)[0]?.type ?? "Custom Web App";

  const industryScores: Array<{ industry: string; weight: number }> = [
    {
      industry: "Healthcare",
      weight:
        /\b(clinic|patient|healthcare|medical|dental|hospital)\b/.test(text) ||
        /عيادة|مستشفى|مرضى|صحة|طبي/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Logistics",
      weight:
        /\b(logistics|shipping|fleet|drivers?|delivery)\b/.test(text) ||
        /شحن|توصيل|سائق|أسطول|لوجست/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Real Estate",
      weight:
        /\b(real\s*estate|property|listings?|rentals?)\b/.test(text) ||
        /عقارات|عقار|إيجار|شقق/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Hospitality",
      weight:
        /\b(restaurant|hotel|spa|dining|hospitality|chef)\b/.test(text) ||
        /مطعم|فندق|ضيافة|مقهى|طاه/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Fitness",
      weight:
        /\b(fitness|gym|studio|pilates|workout)\b/.test(text) ||
        /نادي|لياقة|جيم|تمارين/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Education",
      weight:
        /\b(school|university|course|learning|student|tutor)\b/.test(text) ||
        /مدرسة|جامعة|تعليم|طالب|دورة/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Retail",
      weight:
        /\b(retail|store|shop|merchandise)\b/.test(text) ||
        /تجزئة|متجر|محل/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Finance",
      weight:
        /\b(fintech|banking|payments?|invoice|accounting)\b/.test(text) ||
        /مالية|بنك|مدفوعات|فواتير|محاسبة/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Professional Services",
      weight:
        /\b(freelancer|agency|consulting|law|legal)\b/.test(text) ||
        /مستقل|وكالة|استشارات|قانون/.test(description)
          ? 3
          : 0,
    },
    {
      industry: "Technology",
      weight:
        /\b(saas|software|ai|platform|startup)\b/.test(text) ||
        /تقنية|برمجيات|ذكاء\s*اصطناعي|منصة|ناشئة/.test(description)
          ? 2
          : 0,
    },
  ];

  const industry =
    industryScores
      .filter((row) => row.weight > 0)
      .sort((a, b) => b.weight - a.weight)[0]?.industry ?? "General Business";

  const complexitySignals =
    (/\b(multi-tenant|marketplace|roles?|permissions?|payments?|realtime|real-time|integrations?|api|workflow)\b/.test(
      text,
    ) ||
    /صلاحيات|مدفوعات|تكامل|سير\s*عمل|متعدد\s*المستأجرين|سوق/.test(description)
      ? 1
      : 0) +
    (/\b(inventory|billing|subscriptions?|analytics|notifications?|calendar)\b/.test(text) ||
    /مخزون|اشتراكات|تحليلات|إشعارات|تقويم/.test(description)
      ? 1
      : 0) +
    (wordCount > 45 ? 1 : 0) +
    (wordCount > 80 ? 1 : 0);

  const complexity: AppComplexity =
    complexitySignals >= 3 ? "High" : complexitySignals >= 1 ? "Medium" : "Low";

  const tagPool: Array<{ tag: string; weight: number }> = [
    {
      tag: "Marketplace",
      weight: /\bmarketplace\b/.test(text) || /سوق/.test(description) ? 3 : 0,
    },
    {
      tag: "Booking",
      weight:
        /\b(book(ing|ings)?|appointment|reservation)\b/.test(text) ||
        /حجز|مواعيد/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "Dashboard",
      weight:
        /\b(dashboard|analytics|kpi)\b/.test(text) || /لوحة\s*تحكم|تحليلات/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "CRM",
      weight: /\b(crm|leads?|pipeline)\b/.test(text) || /عملاء|صفقات/.test(description) ? 3 : 0,
    },
    {
      tag: "E-commerce",
      weight:
        /\b(e-?commerce|shop|cart)\b/.test(text) || /متجر|تجارة\s*إلكترونية/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "Inventory",
      weight: /\b(inventory|warehouse|stock)\b/.test(text) || /مخزون|مستودع/.test(description) ? 3 : 0,
    },
    {
      tag: "SaaS",
      weight: /\b(saas|subscription)\b/.test(text) || /اشتراك|سحاب/.test(description) ? 3 : 0,
    },
    {
      tag: "LMS",
      weight: /\b(lms|courses?|learning)\b/.test(text) || /دورات|تعليم/.test(description) ? 3 : 0,
    },
    {
      tag: "HR",
      weight: /\b(hr|payroll|employees?)\b/.test(text) || /موارد\s*بشرية|موظفين|رواتب/.test(description) ? 3 : 0,
    },
    {
      tag: "Logistics",
      weight:
        /\b(logistics|shipping|fleet|delivery)\b/.test(text) || /شحن|توصيل|لوجست/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "Healthcare",
      weight:
        /\b(clinic|patient|healthcare|medical)\b/.test(text) || /عيادة|مرضى|صحة/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "Real Estate",
      weight:
        /\b(real\s*estate|property|listings?)\b/.test(text) || /عقارات|عقار/.test(description)
          ? 3
          : 0,
    },
    {
      tag: "Portal",
      weight: /\b(portal|client\s+area|member)\b/.test(text) || /بوابة|عملاء/.test(description) ? 2 : 0,
    },
    {
      tag: "Operations",
      weight: /\b(operations|ops|workflow)\b/.test(text) || /عمليات|سير\s*عمل/.test(description) ? 2 : 0,
    },
    { tag: industry, weight: industry !== "General Business" ? 1 : 0 },
  ];

  let tags = normalizeAppTags(
    tagPool
      .filter((row) => row.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .map((row) => row.tag),
  );

  if (tags.length === 0) {
    const tokens = description
      .split(/[^\p{L}\p{N}]+/u)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && t.length <= 14)
      .slice(0, 8);
    tags = normalizeAppTags(tokens.slice(0, MAX_TAGS));
  }

  return localizeInsight({ appType, industry, complexity, tags }, language);
}

export function isDescriptionReadyForTags(description: string): boolean {
  return description.trim().replace(/\s+/g, " ").length >= MIN_DESCRIPTION_CHARS;
}

export function normalizeAppDescriptionInsight(
  raw: Partial<AppDescriptionInsight> | null | undefined,
  fallbackDescription: string,
  options?: AnalyzeAppDescriptionOptions,
): AppDescriptionInsight {
  const language = resolveInsightOutputLanguage(
    fallbackDescription,
    options?.language,
  );
  const heuristic = heuristicAppDescriptionInsight(fallbackDescription, options);
  const complexity =
    normalizeComplexity(raw?.complexity) ??
    normalizeComplexity(heuristic.complexity) ??
    "Medium";
  const tags = normalizeAppTags(raw?.tags);
  const appType =
    normalizeAppType(raw?.appType) ??
    normalizeAppType(heuristic.appType) ??
    "Custom Web App";
  const industry =
    normalizeIndustry(raw?.industry) ??
    normalizeIndustry(heuristic.industry) ??
    "General Business";

  if (tags.length === 0) {
    return {
      ...heuristic,
      appType: localizeKnown(appType, APP_TYPE_LABEL, language),
      industry: localizeKnown(industry, INDUSTRY_LABEL, language),
      complexity: COMPLEXITY_LABEL[language][complexity],
      estimatedBuildTime: buildTimeFor(
        complexity,
        language,
        raw?.estimatedBuildTime,
      ),
    };
  }

  return localizeInsight(
    {
      appType,
      industry,
      complexity,
      tags,
    },
    language,
    buildTimeFor(complexity, language, raw?.estimatedBuildTime),
  );
}

export async function analyzeAppDescription(
  description: string,
  options?: AnalyzeAppDescriptionOptions,
): Promise<AnalyzeAppDescriptionResult> {
  const trimmed = description.trim().replace(/\s+/g, " ");
  const language = resolveInsightOutputLanguage(trimmed, options?.language);
  if (!isDescriptionReadyForTags(trimmed)) {
    return {
      ...emptyAppDescriptionInsight(),
      cached: false,
      source: "heuristic",
    };
  }

  const key = cacheKey(trimmed, language);
  const hit = serverCache.get(key);
  if (hit) {
    return { ...hit, cached: true, source: "cache" };
  }

  try {
    const { providerManager } = await import("@/lib/ai/provider-manager");
    const { getDefaultTextProvider } = await import("@/lib/ai/provider-config");
    const providerName = providerManager.resolve(getDefaultTextProvider());
    if (!providerName) {
      const insight = heuristicAppDescriptionInsight(trimmed, options);
      remember(key, insight);
      return { ...insight, cached: false, source: "heuristic" };
    }

    const outputLanguageName = language === "Arabic" ? "Arabic" : "English";
    const parsed = await providerManager.generateJson<{
      appType?: unknown;
      industry?: unknown;
      complexity?: unknown;
      estimatedBuildTime?: unknown;
      tags?: unknown;
    }>(
      {
        system:
          "You analyze software product ideas for an app builder. Reply with JSON only.",
        prompt: `Analyze this app description and return:
{
  "appType": "short product type label",
  "industry": "short industry label (1–3 words)",
  "complexity": "Low | Medium | High",
  "estimatedBuildTime": "short estimate",
  "tags": ["up to ${MAX_TAGS} concise tags"]
}

Rules:
- Base every field only on the description
- Write appType, industry, tags, and estimatedBuildTime in ${outputLanguageName}
- complexity must stay exactly one of: Low, Medium, High (English keys only)
- Prefer types like: ${APP_TYPE_OPTIONS.join(", ")}
- Low = simple CRUD/portal; Medium = multi-module ops; High = marketplace/multi-role/payments/integrations
- estimatedBuildTime examples: ${BUILD_TIME_BY_COMPLEXITY[language].Low}, ${BUILD_TIME_BY_COMPLEXITY[language].Medium}, ${BUILD_TIME_BY_COMPLEXITY[language].High}
- Max ${MAX_TAGS} tags, no hashtags, no sentences
- JSON only

Description:
"""${trimmed.slice(0, 2000)}"""`,
        temperature: 0.2,
      },
      providerName,
    );

    const insight = normalizeAppDescriptionInsight(parsed, trimmed, options);
    remember(key, insight);
    return { ...insight, cached: false, source: "ai" };
  } catch {
    const insight = heuristicAppDescriptionInsight(trimmed, options);
    remember(key, insight);
    return { ...insight, cached: false, source: "heuristic" };
  }
}

/** Back-compat wrapper used by earlier tag-only callers. */
export async function suggestAppTagsFromDescription(
  description: string,
  options?: AnalyzeAppDescriptionOptions,
): Promise<SuggestAppTagsResult> {
  const result = await analyzeAppDescription(description, options);
  return {
    tags: result.tags,
    cached: result.cached,
    source: result.source,
  };
}

/** Test helper — clear process-local cache. */
export function clearSuggestAppTagsCache(): void {
  serverCache.clear();
}

export function clearAnalyzeAppDescriptionCache(): void {
  serverCache.clear();
}
