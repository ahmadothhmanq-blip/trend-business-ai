export function creativeAnalyzePrompt(brief: string) {
  return `Analyze this creative brief and return JSON with: product, scene, mood, platform, audience, format, objective.

Brief: ${brief}`;
}

export function businessAnalyzePrompt(brief: string) {
  return `Analyze this business intelligence brief and return JSON with: market, geography, model, segment, competitors, decision.

Brief: ${brief}`;
}

export function managerAnalyzePrompt(brief: string) {
  return `Analyze this business management brief and return JSON with: goal, timeline, team, constraints, deliverables, blockers.

Brief: ${brief}`;
}

export function auditAnalyzePrompt(brief: string) {
  return `Analyze this audit brief and return JSON with: business, assets, goal, concerns, audience, auditScope.

Brief: ${brief}`;
}

export function socialAnalyzePrompt(brief: string) {
  return `Analyze this social media brief and return JSON with: profile, audience, competitors, strengths, weaknesses, growthTarget.

Brief: ${brief}`;
}

export function servicePlanPrompt(
  service: string,
  brief: string,
  analysis: Record<string, unknown>,
) {
  return `Create a structured ${service} generation plan as JSON with: objectives, deliverables, sections, styleGuide.

Brief: ${brief}
Analysis: ${JSON.stringify(analysis)}`;
}

export function serviceGeneratePrompt(
  service: string,
  brief: string,
  analysis: Record<string, unknown>,
  plan: Record<string, unknown>,
) {
  return `Generate production-ready ${service} output as JSON with: title, summary, sections[{heading, content}], deliverables[].

Brief: ${brief}
Analysis: ${JSON.stringify(analysis)}
Plan: ${JSON.stringify(plan)}`;
}
