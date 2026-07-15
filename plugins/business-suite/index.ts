import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  businessAnalyzePrompt,
  businessPlanPrompt,
  businessGeneratePrompt,
  businessScorecardPrompt,
  businessRisksPrompt,
  businessActionPlanPrompt,
} from "@/lib/ai/prompts/business-suite";
import {
  businessAnalysisSchema,
  businessPlanSchema,
  businessScorecardSchema,
  businessRisksSchema,
  businessActionPlanSchema,
} from "@/plugins/business-suite/schemas";
import type {
  BusinessAnalysis,
  BusinessPlanResult,
  BusinessOutput,
  BusinessPluginInput,
  BusinessScorecardResult,
  BusinessRiskResult,
  BusinessOpportunityResult,
  BusinessActionItemResult,
} from "@/plugins/business-suite/types";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";

async function analyzeBusinessBrief(
  input: BusinessPluginInput,
  ctx: GenerationContext,
): Promise<BusinessAnalysis> {
  ctx.progress.emit("Analyzing business brief...");
  const analysis = await ctx.provider.generateJson<BusinessAnalysis>({
    prompt: businessAnalyzePrompt(input),
    schema: businessAnalysisSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    title: analysis.title || "Business Analysis",
    businessContext: analysis.businessContext || input.prompt,
    industryInsights: analysis.industryInsights || "",
    mainChallenges: analysis.mainChallenges?.length ? analysis.mainChallenges : ["Challenge identified"],
    keyQuestions: analysis.keyQuestions?.length ? analysis.keyQuestions : ["Key question"],
    analysisScope: analysis.analysisScope || "Full analysis",
    urgencyLevel: analysis.urgencyLevel || "medium",
  };
}

async function planBusinessDocument(
  input: BusinessPluginInput,
  analysis: BusinessAnalysis,
  ctx: GenerationContext,
): Promise<BusinessPlanResult> {
  ctx.progress.emit("Planning document structure...");
  const plan = await ctx.provider.generateJson<BusinessPlanResult>({
    prompt: businessPlanPrompt(input, analysis),
    schema: businessPlanSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    sections: plan.sections?.length
      ? plan.sections
      : [{ heading: analysis.title, purpose: "Main analysis", keyPoints: analysis.mainChallenges }],
    scorecardMetrics: plan.scorecardMetrics || [],
    riskCategories: plan.riskCategories || [],
    opportunityAreas: plan.opportunityAreas || [],
  };
}

async function generateBusinessDocument(
  input: BusinessPluginInput,
  analysis: BusinessAnalysis,
  plan: BusinessPlanResult,
  ctx: GenerationContext,
): Promise<BusinessOutput> {
  ctx.progress.emit("Writing business document...");

  let body = "";
  try {
    body = ctx.provider.generateText
      ? await ctx.provider.generateText({ prompt: businessGeneratePrompt(input, analysis, plan) })
      : "";
    ctx.usage.add(ctx.provider.getLastUsage?.());
  } catch {
    body = `# ${analysis.title}\n\n${analysis.businessContext}\n\n## Key Challenges\n${analysis.mainChallenges.map((c) => `- ${c}`).join("\n")}`;
  }

  const sections = extractSections(body);
  const executiveSummary = body.slice(0, 500).replace(/\n/g, " ").trim() + (body.length > 500 ? "..." : "");

  let scorecard: BusinessScorecardResult | null = null;
  if (input.options.some((o) => ["scoring", "kpis", "analysis"].includes(o))) {
    ctx.progress.emit("Scoring business metrics...");
    try {
      scorecard = await ctx.provider.generateJson<BusinessScorecardResult>({
        prompt: businessScorecardPrompt(body, input.businessType, input.industry),
        schema: businessScorecardSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
    } catch { /* scoring is optional */ }
  }

  let risks: BusinessRiskResult[] = [];
  let opportunities: BusinessOpportunityResult[] = [];
  if (input.options.some((o) => ["risk-assessment", "analysis", "scoring", "action-plan"].includes(o))) {
    ctx.progress.emit("Assessing risks and opportunities...");
    try {
      const result = await ctx.provider.generateJson<{
        risks: BusinessRiskResult[];
        opportunities: BusinessOpportunityResult[];
      }>({
        prompt: businessRisksPrompt(body, input.businessType),
        schema: businessRisksSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
      risks = result.risks || [];
      opportunities = result.opportunities || [];
    } catch { /* optional */ }
  }

  let actionPlan: BusinessActionItemResult[] = [];
  let recommendations: string[] = [];
  let improvements: string[] = [];
  if (input.options.some((o) => ["action-plan", "recommendations", "next-steps"].includes(o))) {
    ctx.progress.emit("Building action plan...");
    try {
      const risksStr = risks.map((r) => `${r.category}: ${r.description} (${r.severity})`).join("; ");
      const oppsStr = opportunities.map((o) => `${o.title}: ${o.description}`).join("; ");
      const result = await ctx.provider.generateJson<{
        actionPlan: BusinessActionItemResult[];
        recommendations: string[];
        improvements: string[];
      }>({
        prompt: businessActionPlanPrompt(body, risksStr, oppsStr),
        schema: businessActionPlanSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
      actionPlan = result.actionPlan || [];
      recommendations = result.recommendations || [];
      improvements = result.improvements || [];
    } catch { /* optional */ }
  }

  const files: { path: string; content: string; language: string }[] = [];
  files.push({ path: "document.md", content: body, language: "markdown" });

  if (scorecard) {
    const scorecardDoc = [
      `# Business Scorecard: ${analysis.title}`,
      `\n| Metric | Score |`,
      `|--------|-------|`,
      `| Overall | ${scorecard.overall}/100 |`,
      `| Viability | ${scorecard.viability}/100 |`,
      `| Market Fit | ${scorecard.marketFit}/100 |`,
      `| Financial Health | ${scorecard.financialHealth}/100 |`,
      `| Competitive Position | ${scorecard.competitivePosition}/100 |`,
      `| Growth Potential | ${scorecard.growthPotential}/100 |`,
      `| Risk Level | ${scorecard.riskLevel}/100 |`,
    ].join("\n");
    files.push({ path: "scorecard.md", content: scorecardDoc, language: "markdown" });
  }

  if (risks.length) {
    const risksDoc = [
      `# Risk Assessment`,
      ...risks.map((r) => `\n## ${r.category} (${r.severity.toUpperCase()})\n${r.description}\n\n**Mitigation:** ${r.mitigation}`),
    ].join("\n");
    files.push({ path: "risk-assessment.md", content: risksDoc, language: "markdown" });
  }

  if (actionPlan.length) {
    const actionDoc = [
      `# Action Plan`,
      `\n| Priority | Action | Owner | Deadline |`,
      `|----------|--------|-------|----------|`,
      ...actionPlan.map((a) => `| ${a.priority.toUpperCase()} | ${a.action} | ${a.owner} | ${a.deadline} |`),
    ].join("\n");
    files.push({ path: "action-plan.md", content: actionDoc, language: "markdown" });
  }

  return {
    title: analysis.title,
    businessTool: input.businessTool,
    businessType: input.businessType,
    executiveSummary,
    body,
    sections,
    scorecard,
    risks,
    opportunities,
    actionPlan,
    recommendations,
    improvements,
    files,
  };
}

function extractSections(markdown: string): { heading: string; content: string }[] {
  const lines = markdown.split("\n");
  const sections: { heading: string; content: string }[] = [];
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s+(.+)/);
    if (match) {
      if (currentHeading) sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
      currentHeading = match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentHeading) sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
  return sections;
}

async function validateBusinessOutput(output: BusinessOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating business document...");
  const issues: string[] = [];
  if (!output.title) issues.push("Missing title");
  if (!output.body || output.body.length < 100) issues.push("Document too short");
  return { valid: issues.length === 0, issues, reason: issues.length > 0 ? issues.join("; ") : undefined };
}

async function exportBusinessDocument(output: BusinessOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: { title: output.title, sections: output.sections.length, files: output.files.length },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}.json`,
  };
}

export const businessSuitePlugin: AIPlugin<BusinessPluginInput, BusinessAnalysis, BusinessPlanResult, BusinessOutput> = {
  id: "business-suite",
  name: "Business Suite",
  preferredProvider: getActiveProvider(),
  analyze: analyzeBusinessBrief,
  plan: planBusinessDocument,
  generate: generateBusinessDocument,
  validate: validateBusinessOutput,
  export: exportBusinessDocument,
};

export * from "@/plugins/business-suite/types";
