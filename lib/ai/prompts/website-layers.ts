type BriefInput = {
  prompt: string;
  projectType: string;
  projectKind: string;
  language: string;
  theme: string;
  features: string[];
};

export function businessIdeaPrompt(input: BriefInput) {
  return `You are a senior business strategist for a professional website design engine.

Analyze this brief and produce a Business Profile plus technical capability flags.

Brief: ${input.prompt}
Requested type: ${input.projectType}
Kind: ${input.projectKind}
Language: ${input.language}
Theme hint: ${input.theme}
Features: ${input.features.join(", ") || "None"}

Detect:
- industry (specific, e.g. "dental clinic", "B2B SaaS", "luxury real estate")
- targetAudience (who buys / converts)
- businessGoals (3–6 measurable outcomes)
- requiredSections (must-have page sections, e.g. Hero, Social Proof, Pricing, FAQ, Contact)
- offer, tone, geography, competitors, kpis, summary

Technical flags for Next.js:
- requiresAuth, requiresDatabase, requiresDashboard, isEcommerce, isSaas
- databaseProvider: "prisma" | "supabase" | "none"
- pages (suggested page names), features, designSystem (style keywords), technologies

Return ONLY JSON:
{
  "projectName": string,
  "projectType": string,
  "pages": string[],
  "features": string[],
  "designSystem": string[],
  "technologies": string[],
  "requiresAuth": boolean,
  "requiresDatabase": boolean,
  "requiresDashboard": boolean,
  "isEcommerce": boolean,
  "isSaas": boolean,
  "databaseProvider": string,
  "businessProfile": {
    "projectName": string,
    "industry": string,
    "targetAudience": string,
    "businessGoals": string[],
    "offer": string,
    "tone": string,
    "geography": string,
    "competitors": string[],
    "kpis": string[],
    "summary": string,
    "requiredSections": string[]
  }
}`;
}

export function websiteStrategyPrompt(
  input: BriefInput,
  analysis: unknown,
) {
  return `You are a conversion-focused web strategist. Build a complete Website Strategy.

Brief: ${input.prompt}
Theme: ${input.theme}
Language: ${input.language}
Analysis: ${JSON.stringify(analysis)}

Deliver:
1. Sitemap (3–6 pages)
2. Page strategy (purpose, key sections, primary CTA per page)
3. Content strategy (brand voice, messaging pillars, proof points, objection handlers, SEO topics)
4. Conversion funnel + CTAs

Honor businessProfile.requiredSections when planning sectionPlan.

Return ONLY JSON:
{
  "positioning": string,
  "sitemap": string[],
  "pages": [{ "name": string, "path": string, "purpose": string, "keySections": string[], "primaryCta": string }],
  "sectionPlan": [{ "id": string, "page": string, "name": string, "goal": string, "contentNotes": string }],
  "conversionFunnel": string[],
  "contentStructure": string[],
  "contentStrategy": {
    "brandVoice": string,
    "messagingPillars": string[],
    "proofPoints": string[],
    "objectionHandlers": string[],
    "seoTopics": string[]
  },
  "ctas": string[],
  "seoFocus": string[]
}`;
}

export function designEnginePrompt(
  input: BriefInput,
  analysis: unknown,
  strategy: unknown,
) {
  return `You are an AI Design Engine. Create a professional Design System.

Brief: ${input.prompt}
Theme hint: ${input.theme}
Analysis: ${JSON.stringify(analysis)}
Strategy: ${JSON.stringify(strategy)}

stylePreset MUST be exactly one of: "luxury" | "modern" | "corporate" | "minimal"
Map theme hints (Gold/Luxury → luxury, Startup/Modern → modern, Corporate → corporate, Minimal/Light → minimal).

Also set:
- industryPattern (clinic, saas, restaurant, real_estate, portfolio, ecommerce, agency, generic)
- layoutStyle (e.g. "full-bleed hero + asymmetric grids")
- uiPatterns (array of reusable UI patterns)
- colors as real hex
- typography: distinctive fonts (avoid Inter/Roboto/Arial as display)
- spacingScale, borderRadius, shadowStyle, componentPalette, layoutRules

Return ONLY JSON:
{
  "style": string,
  "stylePreset": "luxury" | "modern" | "corporate" | "minimal",
  "industryPattern": string,
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutral": "#hex",
    "surface": "#hex",
    "background": "#hex",
    "foreground": "#hex"
  },
  "typography": {
    "headingFont": string,
    "bodyFont": string,
    "scale": string[],
    "notes": string
  },
  "layoutRules": string[],
  "layoutStyle": string,
  "uiPatterns": string[],
  "componentPalette": string[],
  "spacingScale": string[],
  "borderRadius": string,
  "shadowStyle": string
}`;
}

export function assetPlanPrompt(
  strategy: unknown,
  design: unknown,
  business: unknown,
) {
  return `Plan visual assets for this website (hero, section, product/background, brand mark).

Business: ${JSON.stringify(business)}
Strategy: ${JSON.stringify(strategy)}
Design: ${JSON.stringify(design)}

Return ONLY JSON:
{
  "items": [
    {
      "id": string,
      "role": "hero" | "product" | "background" | "brand" | "icon" | "section",
      "name": string,
      "prompt": string,
      "alt": string
    }
  ]
}

Rules:
- Max 4 image assets (hero required; up to 2 section/product; 1 brand).
- Match design.stylePreset mood in prompts (luxury/modern/corporate/minimal).
- Icons should be role "icon" (SVG fallback).
- Prompts: detailed, no text overlays.`;
}
