import type { Tbge2PipelineStage } from "@/lib/ai-core/generation-engine/core/types";

export type Tbge2LifecyclePhase = {
  stage: Tbge2PipelineStage;
  label: string;
  description: string;
  usesLlm: boolean;
};

/** Official TBGE2 planning lifecycle. */
export const TBGE2_PLANNING_LIFECYCLE: readonly Tbge2LifecyclePhase[] = [
  {
    stage: "intent",
    label: "Intent Analyzer",
    description: "Detect user goal: website, landing page, portfolio, restaurant, medical, SaaS, etc.",
    usesLlm: false,
  },
  {
    stage: "business",
    label: "Business Analyzer",
    description: "Extract industry, audience, country, language, brand style, business goals",
    usesLlm: false,
  },
  {
    stage: "requirements",
    label: "Requirements Analyzer",
    description: "Detect booking, payments, CRM, blog, gallery, multi-language, forms, auth, etc.",
    usesLlm: false,
  },
  {
    stage: "website",
    label: "Website Planner",
    description: "Decide website type, page count, navigation, CTAs, conversion strategy",
    usesLlm: false,
  },
  {
    stage: "pages",
    label: "Page Planner",
    description: "Generate Home, About, Services, Pricing, FAQ, Blog, Contact, or custom pages",
    usesLlm: false,
  },
  {
    stage: "sections",
    label: "Section Planner",
    description: "Generate Hero, Features, Testimonials, Gallery, Pricing, FAQ, CTA, Footer per page",
    usesLlm: false,
  },
  {
    stage: "content",
    label: "Content Planner",
    description: "Define content blocks, tone, length, SEO priority, localization strategy",
    usesLlm: false,
  },
  {
    stage: "llm_request",
    label: "LLM Request Builder",
    description: "Build structured prompts — LLM never receives raw user prompts",
    usesLlm: false,
  },
  {
    stage: "structured_output",
    label: "Structured Output",
    description: "LLM returns JSON only — never HTML, React, or CSS",
    usesLlm: true,
  },
  {
    stage: "validate",
    label: "Validation",
    description: "Validate pages, sections, business logic, required fields, language, industry",
    usesLlm: false,
  },
] as const;

export function getLifecyclePhase(stage: Tbge2PipelineStage): Tbge2LifecyclePhase | undefined {
  return TBGE2_PLANNING_LIFECYCLE.find((p) => p.stage === stage);
}

export function planToSettingsPatch(meta: { planHash: string; platformVersion: string }): Record<string, string> {
  return {
    tbge2PlanHash: meta.planHash,
    tbge2PlatformVersion: meta.platformVersion,
  };
}
