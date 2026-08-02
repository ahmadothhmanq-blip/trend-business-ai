/**
 * TBGE Master Planner prompts — new TBGE-only prompts (does not modify legacy prompts).
 */

import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { TbgeBrief } from "@/lib/tbge/kernel/types";
import type { TbgeGenerationProfile, TbgeRunMode } from "@/lib/tbge/spec/types";

const PLAN_DRAFT_SCHEMA = `{
  "business": {
    "name": "string",
    "industry": "string",
    "industryId": "string",
    "audience": ["string"],
    "goals": ["string"],
    "tone": "string",
    "offer": "string",
    "geography": "string (optional)"
  },
  "locale": {
    "language": "string",
    "dir": "ltr | rtl (optional)",
    "rtl": "boolean (optional)",
    "htmlLang": "string (optional)"
  },
  "structure": {
    "kind": "website",
    "pages": [
      {
        "name": "string",
        "path": "string",
        "purpose": "string",
        "sections": ["string"],
        "primaryCta": "string (optional)"
      }
    ],
    "navigation": {
      "items": [{ "label": "string", "href": "string" }],
      "style": "string (optional)"
    },
    "footerSections": ["string (optional)"]
  },
  "design": {
    "templateId": "string",
    "templateIntelligenceId": "string (optional)",
    "premiumTemplateId": "string (optional)",
    "tokens": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "foreground": "#hex",
      "surface": "#hex (optional)",
      "neutral": "#hex (optional)"
    },
    "componentPalette": ["string"],
    "layoutProfile": "string (optional)",
    "imageStyle": "string (optional)",
    "headingFont": "string (optional)",
    "bodyFont": "string (optional)"
  },
  "capabilities": {
    "auth": false,
    "database": { "provider": "none | prisma | supabase", "entities": ["string (optional)"] },
    "dashboard": false,
    "ecommerce": false,
    "saas": false
  }
}`;

export function buildMasterPlannerSystemPrompt(adapter: TbgeProductAdapter): string {
  const directives = adapter.planningDirectives
    .map((d) => `- ${d.id}: ${d.instruction}`)
    .join("\n");

  return [
    "You are the TBGE Master Planner.",
    "Your ONLY job is to produce a JSON PlanDraft for deterministic assembly.",
    "Do NOT generate code, file contents, or component implementations.",
    "Respond with valid JSON only — no markdown fences, no commentary.",
    "",
    `Product: ${adapter.label} (${adapter.productId})`,
    "Product planning directives:",
    directives || "- Follow the user brief faithfully.",
    "",
    "Required JSON shape:",
    PLAN_DRAFT_SCHEMA,
  ].join("\n");
}

export function buildMasterPlannerUserPrompt(input: {
  brief: TbgeBrief;
  mode: TbgeRunMode;
  profile: TbgeGenerationProfile;
}): string {
  const lines = [
    `Mode: ${input.mode}`,
    `Profile: ${input.profile}`,
    `Language hint: ${input.brief.language ?? "infer from brief"}`,
    "",
    "User brief:",
    input.brief.prompt.trim(),
  ];

  if (input.brief.features?.length) {
    lines.push("", "Requested features:", input.brief.features.join(", "));
  }

  if (input.brief.theme) {
    lines.push("", `Theme preference: ${input.brief.theme}`);
  }

  lines.push(
    "",
    "Return a single JSON object matching the PlanDraft schema.",
    "Infer business name, industry, sitemap, design tokens, and capabilities from the brief.",
    "Keep capabilities conservative unless the brief explicitly requests auth, dashboard, ecommerce, or database.",
  );

  return lines.join("\n");
}
