type BriefInput = {
  prompt: string;
  projectType: string;
  projectKind: string;
  language: string;
  theme: string;
  features: string[];
};

export function businessIdeaPrompt(input: BriefInput) {
  return `You are a business strategist. Analyze this website brief and create a Business Profile.

Brief: ${input.prompt}
Requested type: ${input.projectType}
Kind: ${input.projectKind}
Language: ${input.language}
Theme hint: ${input.theme}
Features: ${input.features.join(", ") || "None"}

Also detect technical capability flags for a Next.js site:
- requiresAuth, requiresDatabase, requiresDashboard, isEcommerce, isSaas
- databaseProvider: "prisma" | "supabase" | "none"
- pages (suggested page names), features, designSystem (style keywords), technologies

Return ONLY JSON matching:
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
    "summary": string
  }
}`;
}

export function websiteStrategyPrompt(
  input: BriefInput,
  analysis: unknown,
) {
  return `You are a conversion-focused web strategist. Create a Website Strategy from this business analysis.

Brief: ${input.prompt}
Theme: ${input.theme}
Language: ${input.language}
Analysis: ${JSON.stringify(analysis)}

Produce a lean MVP sitemap (3–6 pages max), section plan, conversion funnel, and CTAs.
Return ONLY JSON:
{
  "positioning": string,
  "sitemap": string[],
  "pages": [{ "name": string, "path": string, "purpose": string, "keySections": string[], "primaryCta": string }],
  "sectionPlan": [{ "id": string, "page": string, "name": string, "goal": string, "contentNotes": string }],
  "conversionFunnel": string[],
  "contentStructure": string[],
  "ctas": string[],
  "seoFocus": string[]
}`;
}

export function designEnginePrompt(
  input: BriefInput,
  analysis: unknown,
  strategy: unknown,
) {
  return `You are an AI Design Engine. Create a professional Design System for this website.

Brief: ${input.prompt}
Theme hint: ${input.theme}
Analysis: ${JSON.stringify(analysis)}
Strategy: ${JSON.stringify(strategy)}

Pick an industry pattern (clinic, saas, restaurant, real_estate, portfolio, ecommerce, agency, generic).
Use real hex colors. Prefer distinctive, brand-appropriate typography (not Inter/Roboto/Arial as display).

Return ONLY JSON:
{
  "style": string,
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
- Icons should be role "icon" with a simple geometric prompt (will render as SVG fallback).
- Prompts must be detailed, photoreal or brand-illustration appropriate, no text overlays.`;
}
