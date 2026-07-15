import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  imageAnalyzePrompt,
  imagePlanPrompt,
  imageConceptPrompt,
  imagePromptLibraryPrompt,
} from "@/lib/ai/prompts/image-generator";
import {
  imageAnalysisSchema,
  imagePlanSchema,
  imageConceptSchema,
  imagePromptLibrarySchema,
} from "@/plugins/image-generator/schemas";
import type {
  ImageAnalysis,
  ImagePlanResult,
  ImageOutput,
  ImagePluginInput,
  ImageVariation,
} from "@/plugins/image-generator/types";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";

function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== "string") return "";
  let clean = svg.trim();
  const svgStart = clean.indexOf("<svg");
  if (svgStart > 0) clean = clean.slice(svgStart);
  const svgEnd = clean.lastIndexOf("</svg>");
  if (svgEnd >= 0) clean = clean.slice(0, svgEnd + 6);
  return clean;
}

async function analyzeImage(
  input: ImagePluginInput,
  ctx: GenerationContext,
): Promise<ImageAnalysis> {
  ctx.progress.emit("Analyzing image requirements...");

  const analysis = await ctx.provider.generateJson<ImageAnalysis>({
    prompt: imageAnalyzePrompt(input),
    schema: imageAnalysisSchema,
  });

  return {
    ...analysis,
    subject: analysis.subject || input.prompt.slice(0, 80),
    imageType: analysis.imageType || input.imageType,
    style: analysis.style || input.style,
    mood: analysis.mood || input.mood,
    colorDirection: analysis.colorDirection || "Auto",
    compositionNotes: analysis.compositionNotes || "",
    targetUse: analysis.targetUse || input.imageType,
    technicalRequirements: analysis.technicalRequirements?.length ? analysis.technicalRequirements : ["High quality"],
  };
}

async function planImage(
  input: ImagePluginInput,
  analysis: ImageAnalysis,
  ctx: GenerationContext,
): Promise<ImagePlanResult> {
  ctx.progress.emit("Planning image concepts...");

  const plan = await ctx.provider.generateJson<ImagePlanResult>({
    prompt: imagePlanPrompt(input, analysis),
    schema: imagePlanSchema,
  });

  return {
    concepts: plan.concepts?.length
      ? plan.concepts
      : [{ name: "Primary", description: analysis.subject, compositionNotes: "", colorPalette: ["#D4AF37", "#1A1A1A", "#FFFFFF"], lightingDirection: "Natural" }],
    colorDirection: plan.colorDirection || analysis.colorDirection,
    moodBoard: plan.moodBoard?.length ? plan.moodBoard : [analysis.mood],
    outputFormats: plan.outputFormats?.length ? plan.outputFormats : ["svg", "png"],
    compositionApproach: plan.compositionApproach || "",
  };
}

async function generateImage(
  input: ImagePluginInput,
  analysis: ImageAnalysis,
  plan: ImagePlanResult,
  ctx: GenerationContext,
): Promise<ImageOutput> {
  ctx.progress.emit("Generating image concepts...");

  const concepts: ImageVariation[] = [];
  const conceptPlans = plan.concepts.slice(0, Math.min(input.batchCount, 4));

  // Sequential generation avoids provider usage races and blank parallel failures.
  for (const concept of conceptPlans) {
    ctx.progress.emit(`Creating "${concept.name}"...`);
    try {
      const result = await ctx.provider.generateJson<ImageVariation>({
        prompt: imageConceptPrompt(input, analysis, concept),
        schema: imageConceptSchema,
      });
      concepts.push({
        name: result.name || concept.name,
        description: result.description || concept.description,
        prompt: result.prompt || "",
        negativePrompt: result.negativePrompt || input.negativePrompt || "",
        aspectRatio: result.aspectRatio || input.aspectRatio,
        style: result.style || analysis.style,
        svgConcept: sanitizeSvg(result.svgConcept),
      });
    } catch {
      concepts.push({
        name: concept.name,
        description: concept.description,
        prompt: "",
        negativePrompt: "",
        aspectRatio: input.aspectRatio,
        style: analysis.style,
        svgConcept: "",
      });
    }
  }

  ctx.progress.emit("Building prompt library...");
  let promptLibrary: { name: string; prompt: string; negativePrompt: string; style: string }[] = [];
  try {
    const libResult = await ctx.provider.generateJson<{ prompts: typeof promptLibrary }>({
      prompt: imagePromptLibraryPrompt(analysis, input),
      schema: imagePromptLibrarySchema,
    });
    promptLibrary = libResult.prompts ?? [];
  } catch { /* fallback to empty */ }

  const files: { path: string; content: string; language: string }[] = [];

  concepts.forEach((c) => {
    if (c.svgConcept) {
      files.push({
        path: `concepts/${c.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
        content: c.svgConcept,
        language: "svg",
      });
    }
  });

  if (promptLibrary.length > 0) {
    const promptDoc = promptLibrary.map((p) =>
      `## ${p.name}\n\n**Prompt:**\n\`\`\`\n${p.prompt}\n\`\`\`\n\n**Negative:**\n\`\`\`\n${p.negativePrompt}\n\`\`\`\n\n**Style:** ${p.style}`,
    ).join("\n\n---\n\n");
    files.push({
      path: "prompt-library.md",
      content: `# ${analysis.subject} — Prompt Library\n\n${promptDoc}`,
      language: "markdown",
    });
  }

  const specDoc = [
    `# Image Specification: ${analysis.subject}`,
    `\n## Type: ${analysis.imageType}`,
    `## Style: ${analysis.style}`,
    `## Mood: ${analysis.mood}`,
    `## Aspect Ratio: ${input.aspectRatio}`,
    `## Color Direction: ${plan.colorDirection}`,
    plan.moodBoard.length ? `\n## Mood Board Keywords\n${plan.moodBoard.map((m) => `- ${m}`).join("\n")}` : "",
    `\n## Composition\n${plan.compositionApproach}`,
    `\n## ${concepts.length} Concept Variations`,
    ...concepts.map((c, i) => `\n### ${i + 1}. ${c.name}\n${c.description}`),
  ].filter(Boolean).join("\n");
  files.push({ path: "image-spec.md", content: specDoc, language: "markdown" });

  return {
    title: analysis.subject.slice(0, 80),
    description: `${analysis.style} ${analysis.imageType} — ${analysis.mood}`,
    imageType: input.imageType,
    style: analysis.style,
    concepts,
    colorDirection: plan.colorDirection,
    moodBoard: plan.moodBoard,
    promptLibrary,
    files,
  };
}

async function validateImage(output: ImageOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating output...");
  const issues: string[] = [];

  if (!output.title) issues.push("Missing title");
  if (!output.concepts.length) issues.push("No concepts generated");
  if (!output.concepts.some((c) => Boolean(c.svgConcept?.trim()))) {
    issues.push("No valid SVG concepts generated");
  }

  return { valid: issues.length === 0, issues, reason: issues.length > 0 ? issues.join("; ") : undefined };
}

async function exportImage(output: ImageOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: {
      title: output.title,
      concepts: output.concepts.length,
      prompts: output.promptLibrary.length,
      files: output.files.length,
    },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}-images.json`,
  };
}

export const imageGeneratorPlugin: AIPlugin<
  ImagePluginInput,
  ImageAnalysis,
  ImagePlanResult,
  ImageOutput
> = {
  id: "image-generator",
  name: "Image Generator",
  preferredProvider: getActiveProvider(),
  analyze: analyzeImage,
  plan: planImage,
  generate: generateImage,
  validate: validateImage,
  export: exportImage,
};

export * from "@/plugins/image-generator/types";
