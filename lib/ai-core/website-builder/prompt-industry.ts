/**
 * Deterministic industry + language detection from user prompts.
 * Runs before LLM classification to prevent mislabels (e.g. Furniture → Travel).
 */

import type { IndustryId } from "@/lib/ai-core/templates/types";

/** Lightweight labels for client-safe prompt inference (avoids importing full industry profiles). */
const INDUSTRY_LABELS: Record<IndustryId, string> = {
  tourism: "Tourism",
  restaurant: "Restaurant",
  ecommerce: "E-commerce",
  saas: "SaaS",
  gaming: "Gaming & Esports",
  technology: "Technology",
  furniture: "Furniture",
  "real-estate": "Real Estate",
  automotive: "Automotive",
  agency: "Agency",
  clinic: "Medical",
  education: "Education",
  law: "Law",
  blog: "Blog",
  "landing-page": "Landing Page",
  business: "Business",
};

export type PromptIndustryMatch = {
  industryId: IndustryId;
  label: string;
  confidence: number;
  reason: string;
};

type Rule = {
  id: IndustryId;
  patterns: RegExp[];
  /** When any of these match, this rule is skipped (prevents cross-vertical bleed). */
  blockWhen?: RegExp[];
};

const RULES: Rule[] = [
  {
    id: "gaming",
    patterns: [
      /\bgaming\b/i,
      /\besports?\b/i,
      /\be-sports\b/i,
      /\bgame\s*studio\b/i,
      /\bvideo\s*games?\b/i,
      /\bgame\s*developer\b/i,
      /\bgame\s*publisher\b/i,
      /\bindie\s*game\b/i,
      /\bpc\s*gaming\b/i,
      /\bgaming\s*company\b/i,
      /\btwitch\b/i,
      /\bstreamer\b/i,
      /\blan\s*(center|party)\b/i,
      /ألعاب/,
      /العاب/,
      /جيمينج/,
      /ألعاب\s*فيديو/,
      /استوديو\s*ألعاب/,
      /شركة\s*ألعاب/,
      /رياضات\s*إلكترونية/,
    ],
    blockWhen: [/\brestaurant\b/i, /مطعم/, /\bdining\b/i],
  },
  {
    id: "furniture",
    patterns: [
      /\bfurniture\b/i,
      /\bsofa[s]?\b/i,
      /\bbedroom[s]?\b/i,
      /\bliving\s*room/i,
      /\bshowroom\b/i,
      /\bupholster/i,
      /\bhome\s*furnish/i,
      /\bأثاث\b/,
      /\bكنب\b/,
      /\bغرفة\s*نوم\b/,
      /\bغرف\s*معيشة\b/,
      /\bمفروشات\b/,
    ],
    blockWhen: [/\btravel\b/i, /\btouris/i, /\bhotel\b/i],
  },
  {
    id: "restaurant",
    patterns: [
      /\brestaurant\b/i,
      /\bdining\b/i,
      /\bbistro\b/i,
      /\bcafe\b/i,
      /\bchef\b/i,
      /\bمطعم\b/,
      /\bمأكولات\b/,
    ],
    blockWhen: [
      /\bgaming\b/i,
      /\besports?\b/i,
      /\bgame\s*studio\b/i,
      /ألعاب/,
      /العاب/,
      /جيمينج/,
      /شركة\s*ألعاب/,
    ],
  },
  {
    id: "technology",
    patterns: [
      /\bcomputer\s*compan/i,
      /\bcomputers?\b/i,
      /\bit\s*services?\b/i,
      /\btech(nology)?\s*compan/i,
      /\bsoftware\s*house\b/i,
      /\bserver\s*room\b/i,
      /\bhardware\b/i,
      /\bnetworking\b/i,
      /\bشركة\s*حاسوب/i,
      /\bتكنولوجيا\b/i,
      /\bحواسيب\b/i,
    ],
    blockWhen: [/\brestaurant\b/i, /\bfurniture\b/i],
  },
  {
    id: "real-estate",
    patterns: [
      /\breal\s*estate\b/i,
      /\brealtor\b/i,
      /\bproperty\s*listing/i,
      /\bعقار/i,
      /\bعقارات\b/,
    ],
  },
  {
    id: "clinic",
    patterns: [
      /\bclinic\b/i,
      /\bhealthcare\b/i,
      /\bmedical\b/i,
      /\bdental\b/i,
      /\bdentist\b/i,
      /\bhospital\b/i,
      /\blaborator/i,
      /\bphysician\b/i,
      /\bdoctor\b/i,
      /\bعيادة\b/,
      /\bصحة\b/,
      /\bطبي\b/,
    ],
  },
  {
    id: "law",
    patterns: [
      /\blaw\s*firm\b/i,
      /\blawyer\b/i,
      /\battorney\b/i,
      /\blegal\b/i,
      /\blitigation\b/i,
      /\bimmigration\s*law\b/i,
      /\bfamily\s*law\b/i,
      /\bcorporate\s*law\b/i,
      /\bsolicitor\b/i,
    ],
    blockWhen: [/\blegal\s*pad\b/i],
  },
  {
    id: "blog",
    patterns: [
      /\bblog\b/i,
      /\barticle[s]?\b/i,
      /\bmagazine\b/i,
      /\beditorial\b/i,
      /\bnewsletter\b/i,
      /\bpersonal\s*blog\b/i,
      /\btechnology\s*blog\b/i,
      /\bnews\s*site\b/i,
    ],
    blockWhen: [/\bnews\s*agency\b/i],
  },
  {
    id: "landing-page",
    patterns: [
      /\blanding\s*page\b/i,
      /\bproduct\s*launch\b/i,
      /\blead\s*gen(eration)?\b/i,
      /\bwaitlist\b/i,
      /\bcampaign\s*page\b/i,
      /\bstartup\s*landing\b/i,
      /\bsaas\s*landing\b/i,
    ],
  },
  {
    id: "automotive",
    patterns: [
      /\bautomotive\b/i,
      /\bdealership\b/i,
      /\bvehicle[s]?\b/i,
      /\bcar\s*dealer/i,
      /\bسيارات\b/,
      /\bمعرض\s*سيارات\b/,
    ],
    blockWhen: [/\bsoftware\b/i, /\bcomputer\b/i, /\bsaas\b/i],
  },
  {
    id: "saas",
    patterns: [
      /\bsaas\b/i,
      /\bsubscription\s*software\b/i,
      /\bb2b\s*platform\b/i,
      /\bfree\s*trial\b/i,
    ],
    blockWhen: [/\bcomputer\s*compan/i, /\bfurniture\b/i],
  },
  {
    id: "tourism",
    patterns: [
      /\btourism\b/i,
      /\btravel\b/i,
      /\btravel\s*agency\b/i,
      /\btravel\s*and\s*tourism\b/i,
      /\btour\s*operator\b/i,
      /\btour\s*packages?\b/i,
      /\bdestination[s]?\b/i,
      /\bvacation\b/i,
      /\bhotel\b/i,
      /\bresort\b/i,
      /\bitinerary\b/i,
      /\bcruise\b/i,
      /\badventure\s*trip\b/i,
      /\bسفر\b/,
      /\bسياحة\b/,
    ],
    blockWhen: [/\bfurniture\b/i, /\bأثاث\b/i, /\bsofa\b/i],
  },
  {
    id: "ecommerce",
    patterns: [/\be-?commerce\b/i, /\bonline\s*store\b/i, /\bshopify\b/i],
  },
  {
    id: "education",
    patterns: [
      /\bschool\b/i,
      /\buniversity\b/i,
      /\bacademy\b/i,
      /\beducation\b/i,
      /\bتعليم\b/,
    ],
  },
  {
    id: "agency",
    patterns: [
      /\bcreative\s*agency\b/i,
      /\bdesign\s*studio\b/i,
      /\bmarketing\s*agency\b/i,
    ],
  },
];

function ruleMatches(rule: Rule, text: string): boolean {
  if (rule.blockWhen?.some((p) => p.test(text))) return false;
  return rule.patterns.some((p) => p.test(text));
}

/**
 * Keyword-first industry detection — high confidence, no LLM required.
 */
export function detectIndustryFromPrompt(
  prompt: string,
): PromptIndustryMatch | null {
  const text = prompt.trim();
  if (!text) return null;

  for (const rule of RULES) {
    if (!ruleMatches(rule, text)) continue;
    const label = INDUSTRY_LABELS[rule.id];
    return {
      industryId: rule.id,
      label,
      confidence: 0.92,
      reason: `Prompt keywords matched ${label}.`,
    };
  }
  return null;
}

const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

/**
 * Detect whether the user prompt is primarily Arabic.
 */
export function isArabicPrompt(prompt: string): boolean {
  const arabic = (prompt.match(new RegExp(ARABIC_SCRIPT.source, "g")) || [])
    .length;
  const latin = (prompt.match(/[a-zA-Z]/g) || []).length;
  if (arabic === 0) return false;
  return arabic >= Math.max(8, latin * 0.25);
}

/**
 * Detect output language from prompt text (no manual picker required).
 */
export function detectLanguageFromPrompt(prompt: string): string {
  if (isArabicPrompt(prompt)) return "Arabic";
  const lower = prompt.toLowerCase();
  if (
    /\b(bilingual|dual[\s-]language|two languages|arabic and english|english and arabic)\b/i.test(
      prompt,
    ) ||
    /عربي.*إنجليزي|إنجليزي.*عربي/.test(prompt)
  ) {
    return "Bilingual";
  }
  if (/\b(español|spanish|en español|sitio web en español)\b/i.test(lower)) {
    return "Spanish";
  }
  if (/\b(français|french|en français)\b/i.test(lower)) return "French";
  if (/\b(deutsch|german|auf deutsch)\b/i.test(lower)) return "German";
  if (/\b(português|portuguese|em português)\b/i.test(lower)) {
    return "Portuguese";
  }
  if (/\b(italiano|italian|in italiano|sito web in italiano)\b/i.test(lower)) {
    return "Italian";
  }
  return "English";
}

/**
 * Resolve output language from prompt + optional explicit override (API/editor).
 * Arabic prompts always produce Arabic unless explicitly Bilingual.
 */
export function resolveWebsiteOutputLanguage(
  prompt: string,
  explicitLanguage?: string | null,
): string {
  const explicit = (explicitLanguage || "").trim();
  if (explicit.toLowerCase() === "bilingual") return "Bilingual";
  if (explicit) return explicit;
  return detectLanguageFromPrompt(prompt);
}

/**
 * Unique asset namespace per generation — prevents image reuse across projects.
 */
export function buildWebsiteGenerationKey(params: {
  userId?: string | null;
  parentGenerationId?: string | null;
  mode?: string | null;
  prompt?: string;
}): string {
  if (
    params.mode === "continue" ||
    params.mode === "regenerate" ||
    params.mode === "retry"
  ) {
    if (params.parentGenerationId) return params.parentGenerationId;
  }
  const stamp = Date.now().toString(36);
  const user = params.userId?.slice(0, 8) || "anon";
  const promptHash = simpleHash(params.prompt || stamp);
  return `wb-${user}-${stamp}-${promptHash}`;
}

function simpleHash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).slice(0, 8);
}
