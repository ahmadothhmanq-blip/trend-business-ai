import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  contentAnalyzePrompt,
  contentPlanPrompt,
  contentGeneratePrompt,
  contentSeoPrompt,
  contentHeadlinesPrompt,
  contentImprovementsPrompt,
} from "@/lib/ai/prompts/content-studio";
import {
  contentAnalysisSchema,
  contentPlanSchema,
  contentSeoSchema,
  contentHeadlinesSchema,
  contentImprovementsSchema,
} from "@/plugins/content-studio/schemas";
import type {
  ContentAnalysis,
  ContentPlanResult,
  ContentOutput,
  ContentPluginInput,
  ContentSeoResult,
} from "@/plugins/content-studio/types";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";

async function analyzeContent(
  input: ContentPluginInput,
  ctx: GenerationContext,
): Promise<ContentAnalysis> {
  ctx.progress.emit("Analyzing content brief...");
  const analysis = await ctx.provider.generateJson<ContentAnalysis>({
    prompt: contentAnalyzePrompt(input),
    schema: contentAnalysisSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    title: analysis.title || "Untitled",
    contentType: analysis.contentType || input.contentType,
    targetAudience: analysis.targetAudience || input.audience,
    mainMessage: analysis.mainMessage || input.prompt,
    keyPoints: analysis.keyPoints?.length ? analysis.keyPoints : ["Key point"],
    suggestedStructure: analysis.suggestedStructure || "Introduction → Body → Conclusion",
    toneAnalysis: analysis.toneAnalysis || input.tone,
    competitiveAngle: analysis.competitiveAngle || "",
  };
}

async function planContent(
  input: ContentPluginInput,
  analysis: ContentAnalysis,
  ctx: GenerationContext,
): Promise<ContentPlanResult> {
  ctx.progress.emit("Planning content structure...");
  const plan = await ctx.provider.generateJson<ContentPlanResult>({
    prompt: contentPlanPrompt(input, analysis),
    schema: contentPlanSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    sections: plan.sections?.length
      ? plan.sections
      : [{ heading: analysis.title, purpose: "Main content", wordCount: 500, keyPoints: analysis.keyPoints }],
    totalWordCount: plan.totalWordCount || 500,
    seoStrategy: plan.seoStrategy || "",
    primaryKeyword: plan.primaryKeyword || "",
    secondaryKeywords: plan.secondaryKeywords || [],
    headlineVariants: plan.headlineVariants?.length ? plan.headlineVariants : [analysis.title],
  };
}

async function generateContent(
  input: ContentPluginInput,
  analysis: ContentAnalysis,
  plan: ContentPlanResult,
  ctx: GenerationContext,
): Promise<ContentOutput> {
  ctx.progress.emit("Writing content...");

  let body = "";
  try {
    body = ctx.provider.generateText
      ? await ctx.provider.generateText({
          prompt: contentGeneratePrompt(input, analysis, plan),
          temperature: getTemperature(input.creativityLevel),
        })
      : "";
    ctx.usage.add(ctx.provider.getLastUsage?.());
  } catch {
    body = `# ${analysis.title}\n\n${analysis.mainMessage}\n\n${analysis.keyPoints.map((p) => `- ${p}`).join("\n")}`;
  }

  let seo: ContentSeoResult | null = null;
  if (input.options.some((o) => ["seo", "meta", "keywords", "headings", "faq", "schema", "internal-links"].includes(o))) {
    ctx.progress.emit("Analyzing SEO...");
    try {
      seo = await ctx.provider.generateJson<ContentSeoResult>({
        prompt: contentSeoPrompt(body, input.seoKeywords, input.contentType),
        schema: contentSeoSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
    } catch { /* SEO is optional */ }
  }

  let headlines = plan.headlineVariants;
  if (input.options.includes("headlines")) {
    ctx.progress.emit("Generating headline variants...");
    try {
      const h = await ctx.provider.generateJson<{ headlines: string[] }>({
        prompt: contentHeadlinesPrompt(analysis.title, input.contentType, input.tone, input.audience),
        schema: contentHeadlinesSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
      if (h.headlines?.length) headlines = h.headlines;
    } catch { /* keep plan headlines */ }
  }

  let suggestions: string[] = [];
  let improvements: string[] = [];
  if (input.options.includes("readability") || input.options.includes("grammar")) {
    ctx.progress.emit("Reviewing content quality...");
    try {
      const review = await ctx.provider.generateJson<{ suggestions: string[]; improvements: string[] }>({
        prompt: contentImprovementsPrompt(body, input.contentType),
        schema: contentImprovementsSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());
      suggestions = review.suggestions || [];
      improvements = review.improvements || [];
    } catch { /* quality review is optional */ }
  }

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const summary = body.slice(0, 300).replace(/\n/g, " ").trim() + (body.length > 300 ? "..." : "");

  const files: { path: string; content: string; language: string }[] = [];

  const ext = getFileExtension(input.contentType);
  files.push({ path: `content${ext}`, content: body, language: ext === ".html" ? "html" : "markdown" });

  if (seo) {
    const seoDoc = [
      `# SEO Analysis: ${analysis.title}`,
      `\n## Score: ${seo.score}/100`,
      `\n## Readability: ${seo.readabilityScore}/100`,
      `\n## Word Count: ${seo.wordCount || wordCount}`,
      `\n## Meta Title\n${seo.metaTitle}`,
      `\n## Meta Description\n${seo.metaDescription}`,
      `\n## Keyword Density`,
      ...Object.entries(seo.keywordDensity).map(([k, v]) => `- \`${k}\`: ${v}%`),
      `\n## Heading Structure`,
      ...seo.headingStructure.map((h) => `- ${h}`),
      `\n## Internal Linking Suggestions`,
      ...seo.internalLinkingSuggestions.map((l) => `- ${l}`),
      seo.faqItems.length ? `\n## FAQ\n${seo.faqItems.map((f) => `**Q: ${f.question}**\n${f.answer}`).join("\n\n")}` : "",
      seo.schemaSuggestions.length ? `\n## Schema Suggestions\n${seo.schemaSuggestions.map((s) => `- ${s}`).join("\n")}` : "",
    ].filter(Boolean).join("\n");
    files.push({ path: "seo-analysis.md", content: seoDoc, language: "markdown" });
  }

  if (headlines.length > 1) {
    files.push({ path: "headline-variants.md", content: `# Headline Variants\n\n${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`, language: "markdown" });
  }

  if (suggestions.length || improvements.length) {
    const reviewDoc = [
      "# Content Review",
      suggestions.length ? `\n## Suggestions\n${suggestions.map((s) => `- ${s}`).join("\n")}` : "",
      improvements.length ? `\n## Improvements\n${improvements.map((im) => `- ${im}`).join("\n")}` : "",
    ].filter(Boolean).join("\n");
    files.push({ path: "content-review.md", content: reviewDoc, language: "markdown" });
  }

  return {
    title: analysis.title,
    contentTool: input.contentTool,
    contentType: input.contentType,
    body,
    headlines,
    seo,
    suggestions,
    improvements,
    summary,
    files,
  };
}

async function validateContent(output: ContentOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating content...");
  const issues: string[] = [];
  if (!output.title) issues.push("Missing title");
  if (!output.body || output.body.length < 50) issues.push("Content too short");
  return { valid: issues.length === 0, issues, reason: issues.length > 0 ? issues.join("; ") : undefined };
}

async function exportContent(output: ContentOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: { title: output.title, wordCount: output.body.split(/\s+/).length, files: output.files.length },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}.json`,
  };
}

function getTemperature(level: string): number {
  const map: Record<string, number> = { conservative: 0.3, balanced: 0.6, creative: 0.8, experimental: 1.0 };
  return map[level] ?? 0.6;
}

function getFileExtension(contentType: string): string {
  const htmlTypes = ["email-campaign", "newsletter", "landing-page", "sales-page"];
  return htmlTypes.includes(contentType) ? ".html" : ".md";
}

export const contentStudioPlugin: AIPlugin<ContentPluginInput, ContentAnalysis, ContentPlanResult, ContentOutput> = {
  id: "content-studio",
  name: "Content Studio",
  preferredProvider: getActiveProvider(),
  analyze: analyzeContent,
  plan: planContent,
  generate: generateContent,
  validate: validateContent,
  export: exportContent,
};

export * from "@/plugins/content-studio/types";
