import { aiOutputLanguageDirective, type GlsOutputSurface } from "@/lib/ai/prompts/shared";

function surfaceForService(service: string): GlsOutputSurface {
  const key = service.toLowerCase();
  if (key.includes("brand")) return "brand";
  if (key.includes("content") || key.includes("creative")) return "content";
  if (key.includes("marketing")) return "marketing";
  if (key.includes("business") || key.includes("audit") || key.includes("management")) return "business";
  if (key.includes("social")) return "social";
  return "generic";
}

export function creativeAnalyzePrompt(brief: string, language?: string) {
  return `Analyze this creative brief and return JSON with: product, scene, mood, platform, audience, format, objective.

Brief: ${brief}${aiOutputLanguageDirective(language, "content")}`;
}

export function businessAnalyzePrompt(brief: string, language?: string) {
  return `Analyze this business intelligence brief and return JSON with: market, geography, model, segment, competitors, decision.

Brief: ${brief}${aiOutputLanguageDirective(language, "business")}`;
}

export function managerAnalyzePrompt(brief: string, language?: string) {
  return `Analyze this business management brief and return JSON with: goal, timeline, team, constraints, deliverables, blockers.

Brief: ${brief}${aiOutputLanguageDirective(language, "business")}`;
}

export function auditAnalyzePrompt(brief: string, language?: string) {
  return `Analyze this audit brief and return JSON with: business, assets, goal, concerns, audience, auditScope.

Brief: ${brief}${aiOutputLanguageDirective(language, "business")}`;
}

export function socialAnalyzePrompt(brief: string, language?: string) {
  return `Analyze this social media brief and return JSON with: profile, audience, competitors, strengths, weaknesses, growthTarget.

Brief: ${brief}${aiOutputLanguageDirective(language, "social")}`;
}

export function servicePlanPrompt(
  service: string,
  brief: string,
  analysis: Record<string, unknown>,
  language?: string,
) {
  return `Create a structured ${service} generation plan as JSON with: objectives, deliverables, sections, styleGuide.

Brief: ${brief}
Analysis: ${JSON.stringify(analysis)}${aiOutputLanguageDirective(language, surfaceForService(service))}`;
}

export function serviceGeneratePrompt(
  service: string,
  brief: string,
  analysis: Record<string, unknown>,
  plan: Record<string, unknown>,
  language?: string,
) {
  return `Generate production-ready ${service} output as JSON with: title, summary, sections[{heading, content}], deliverables[].

Brief: ${brief}
Analysis: ${JSON.stringify(analysis)}
Plan: ${JSON.stringify(plan)}${aiOutputLanguageDirective(language, surfaceForService(service))}`;
}
