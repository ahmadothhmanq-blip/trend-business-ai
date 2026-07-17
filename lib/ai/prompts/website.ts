import {
  COMPLEXITY_GUIDE,
  FILE_GENERATION_RULES,
  PRODUCTION_ARCHITECTURE_GUIDE,
} from "@/lib/ai/prompts/shared";

type WebsiteAnalyzeInput = {
  prompt: string;
  projectType: string;
  projectKind: string;
  language: string;
  theme: string;
  features: string[];
};

export function websiteAnalyzePrompt(input: WebsiteAnalyzeInput) {
  return `Analyze this project request for a production Next.js application.

Prompt: ${input.prompt}
Requested type: ${input.projectType}
Detected kind: ${input.projectKind}
Language: ${input.language}
Theme: ${input.theme}
Requested features: ${input.features.join(", ") || "None"}

Detect capability flags:
- requiresAuth: login/register/session needed
- requiresDatabase: persistent data, CRUD, Prisma or Supabase
- requiresDashboard: admin or analytics dashboard
- isEcommerce: products, cart, checkout, orders
- isSaas: subscription app with pricing, billing, team
- databaseProvider: "prisma", "supabase", or "none"

Return only structured JSON.`;
}

export function websiteBlueprintPrompt(
  input: WebsiteAnalyzeInput,
  analysis: unknown,
) {
  return `Create a focused MVP blueprint for a Next.js 16 App Router project (shippable under 18 files).

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}

${PRODUCTION_ARCHITECTURE_GUIDE}

Keep pages, sections, and components lean — prefer one home page plus 1-2 feature pages.
Define SEO, responsive sections, reusable components, and realistic content.
Return only JSON.`;
}

export function websitePlanPrompt(
  input: WebsiteAnalyzeInput,
  analysis: unknown,
  blueprint: unknown,
) {
  return `Build a dynamic MVP file plan for a Next.js 16 App Router project.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}
Blueprint: ${JSON.stringify(blueprint)}

${COMPLEXITY_GUIDE}
${PRODUCTION_ARCHITECTURE_GUIDE}

HARD RULES:
- estimatedFileCount MUST be <= 18 (including configs already provided by scaffold).
- Plan at most 8 AI-authored app files beyond static scaffold configs (package.json, tsconfig, next/tailwind/postcss, globals.css, lib/utils.ts).
- Prefer a shippable MVP over a large incomplete tree. Do NOT plan full production module trees.

Capability budgets (when flags are true — pick the MINIMUM files):
- requiresAuth: one login page + one session/auth helper (max 2 files). No full auth suite.
- requiresDashboard: one dashboard page + optional sidebar/nav component (max 2 files).
- requiresDatabase: one lib/db helper OR one API route — not a full schema + CRUD suite.
- isEcommerce: one products page OR one cart component — not cart+checkout+orders+admin.
- isSaas: one pricing section/page — not billing + team + subscription modules.

Every file must include: path, purpose, language, category (layout | lib | types | hooks | components | pages | api | configs)
- Reuse components/ui and lib/utils — never duplicate primitives.
- Do not plan unused files or file contents.
- Return only JSON.`;
}

export function websiteFilePrompt(args: {
  input: WebsiteAnalyzeInput;
  analysis: unknown;
  blueprint: unknown;
  dynamicPlan: Record<string, unknown>;
  filePlan: {
    path: string;
    purpose: string;
    language: string;
    category: string;
  };
  projectTree: unknown;
  existingFiles: unknown;
  validationReason?: string;
}) {
  const validationNote = args.validationReason
    ? `\nPrevious attempt failed validation:\n${args.validationReason}\nFix all issues and regenerate this file correctly.`
    : "";

  return `Generate exactly one production-ready file for this Next.js 16 App Router project.

Current file path: ${args.filePlan.path}
Current file purpose: ${args.filePlan.purpose}
Current file language: ${args.filePlan.language}
Current file category: ${args.filePlan.category}

Original prompt: ${args.input.prompt}
Analysis: ${JSON.stringify(args.analysis)}
Blueprint: ${JSON.stringify(args.blueprint)}
Dynamic project plan: ${JSON.stringify(args.dynamicPlan)}
Project tree: ${JSON.stringify(args.projectTree)}
Existing generated files: ${JSON.stringify(args.existingFiles)}
${validationNote}

${PRODUCTION_ARCHITECTURE_GUIDE}
${FILE_GENERATION_RULES}`;
}

export function brandAnalyzePrompt(brief: string) {
  return `Analyze this brand design brief and return structured JSON with: brandName, industry, audience, personality, competitors, visualStyle, deliverables.

Brief: ${brief}`;
}

export function contentAnalyzePrompt(brief: string) {
  return `Analyze this content brief and return structured JSON with: topic, audience, channel, tone, format, goals, keywords.

Brief: ${brief}`;
}

export function marketingAnalyzePrompt(brief: string) {
  return `Analyze this marketing campaign brief and return structured JSON with: offer, audience, platform, budget, conversionGoal, objections, brandTone.

Brief: ${brief}`;
}
