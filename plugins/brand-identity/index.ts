import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  brandAnalyzePrompt,
  brandPlanPrompt,
  brandStrategyPrompt,
  brandStoryPrompt,
  logoGuidelinesPrompt,
  brandAssetPrompt,
} from "@/lib/ai/prompts/brand-identity";
import {
  brandAnalysisSchema,
  brandPlanSchema,
  brandAssetSchema,
} from "@/plugins/brand-identity/schemas";
import type {
  BrandAnalysis,
  BrandPlanResult,
  BrandOutput,
  BrandIdentityPluginInput,
  BrandAsset,
  BrandVoiceTone,
  BrandTypographySystem,
} from "@/plugins/brand-identity/types";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";

const defaultVoice: BrandVoiceTone = {
  tone: "Professional",
  doExamples: [],
  dontExamples: [],
  tagline: "",
  elevatorPitch: "",
};

const defaultTypo: BrandTypographySystem = {
  primary: "Inter",
  secondary: "Playfair Display",
  weight: "Bold 700",
  headingStyle: "",
  bodyStyle: "",
  notes: "",
};

async function analyzeBrand(
  input: BrandIdentityPluginInput,
  ctx: GenerationContext,
): Promise<BrandAnalysis> {
  ctx.progress.emit("Analyzing brand requirements...");

  const analysis = await ctx.provider.generateJson<BrandAnalysis>({
    prompt: brandAnalyzePrompt(input),
    schema: brandAnalysisSchema,
  });

  return {
    ...analysis,
    brandName: analysis.brandName || input.brandName || "Brand",
    industry: analysis.industry || input.industry || "General",
    positioning: analysis.positioning || "",
    targetAudience: analysis.targetAudience || input.targetAudience || "General",
    competitors: analysis.competitors?.length ? analysis.competitors : [],
    differentiators: analysis.differentiators?.length ? analysis.differentiators : [],
    personality: analysis.personality || input.brandPersonality || "Professional",
    coreValues: analysis.coreValues?.length ? analysis.coreValues : ["Quality"],
    emotionalAppeal: analysis.emotionalAppeal || "",
  };
}

async function planBrand(
  input: BrandIdentityPluginInput,
  analysis: BrandAnalysis,
  ctx: GenerationContext,
): Promise<BrandPlanResult> {
  ctx.progress.emit("Designing brand identity system...");

  const plan = await ctx.provider.generateJson<BrandPlanResult>({
    prompt: brandPlanPrompt(input, analysis),
    schema: brandPlanSchema,
  });

  return {
    mission: plan.mission || "",
    vision: plan.vision || "",
    values: plan.values?.length ? plan.values : analysis.coreValues,
    voiceTone: plan.voiceTone?.tone ? plan.voiceTone : { ...defaultVoice, tone: analysis.personality },
    colorPalette: plan.colorPalette?.length
      ? plan.colorPalette
      : [{ name: "Primary", hex: "#D4AF37", role: "Brand primary", usage: "Main brand color" }],
    typography: plan.typography?.primary ? plan.typography : defaultTypo,
    deliverables: plan.deliverables ?? input.deliverables,
    brandArchetype: plan.brandArchetype || "The Creator",
  };
}

async function generateBrand(
  input: BrandIdentityPluginInput,
  analysis: BrandAnalysis,
  plan: BrandPlanResult,
  ctx: GenerationContext,
): Promise<BrandOutput> {
  const files: { path: string; content: string; language: string }[] = [];
  const assets: BrandAsset[] = [];

  // Brand Strategy
  let brandStrategy = "";
  if (input.deliverables.includes("brand-strategy") || input.deliverables.includes("voice-tone")) {
    ctx.progress.emit("Writing brand strategy...");
    try {
      brandStrategy = ctx.provider.generateText
        ? await ctx.provider.generateText({ prompt: brandStrategyPrompt(analysis, plan) })
        : "";
    } catch { /* fallback to empty */ }
    if (brandStrategy) files.push({ path: "brand-strategy.md", content: brandStrategy, language: "markdown" });
  }

  // Brand Story
  let brandStory = "";
  if (input.deliverables.includes("brand-story") || input.deliverables.includes("storytelling")) {
    ctx.progress.emit("Crafting brand story...");
    try {
      brandStory = ctx.provider.generateText
        ? await ctx.provider.generateText({ prompt: brandStoryPrompt(analysis, plan) })
        : "";
    } catch { /* fallback */ }
    if (brandStory) files.push({ path: "brand-story.md", content: brandStory, language: "markdown" });
  }

  // Logo Guidelines
  let logoGuidelines = "";
  if (input.deliverables.includes("logo-guidelines")) {
    ctx.progress.emit("Writing logo usage guidelines...");
    try {
      logoGuidelines = ctx.provider.generateText
        ? await ctx.provider.generateText({ prompt: logoGuidelinesPrompt(analysis, plan) })
        : "";
    } catch { /* fallback */ }
    if (logoGuidelines) files.push({ path: "logo-guidelines.md", content: logoGuidelines, language: "markdown" });
  }

  // Generate requested assets
  const assetTypes = input.deliverables.filter((d) =>
    ["business-card", "letterhead", "email-signature", "social-kit", "email-template"].includes(d),
  );

  for (const assetType of assetTypes) {
    ctx.progress.emit(`Creating ${assetType.replace(/-/g, " ")}...`);
    try {
      const asset = await ctx.provider.generateJson<BrandAsset>({
        prompt: brandAssetPrompt(assetType, analysis, plan),
        schema: brandAssetSchema,
      });
      assets.push({
        name: asset.name || assetType,
        category: asset.category || "Assets",
        description: asset.description || "",
        content: asset.content || "",
        format: asset.format || "markdown",
      });

      const ext = asset.format === "svg" ? "svg" : asset.format === "html" ? "html" : "md";
      if (asset.content) {
        files.push({
          path: `assets/${assetType}.${ext}`,
          content: asset.content,
          language: asset.format === "svg" ? "svg" : asset.format === "html" ? "html" : "markdown",
        });
      }
    } catch {
      assets.push({ name: assetType, category: "Assets", description: "Generation failed", content: "", format: "markdown" });
    }
  }

  // Color palette file
  if (input.deliverables.includes("color-palette")) {
    ctx.progress.emit("Documenting color system...");
    const colorDoc = plan.colorPalette.map((c) =>
      `### ${c.name}\n- Hex: \`${c.hex}\`\n- Role: ${c.role}\n- Usage: ${c.usage}`,
    ).join("\n\n");
    files.push({
      path: "color-system.md",
      content: `# ${analysis.brandName} Color System\n\n${colorDoc}`,
      language: "markdown",
    });
  }

  // Typography file
  if (input.deliverables.includes("typography")) {
    ctx.progress.emit("Documenting typography system...");
    const typoDoc = [
      `# ${analysis.brandName} Typography System`,
      `\n## Primary: ${plan.typography.primary}`,
      `Weight: ${plan.typography.weight}`,
      `Heading Style: ${plan.typography.headingStyle}`,
      `\n## Secondary: ${plan.typography.secondary}`,
      `Body Style: ${plan.typography.bodyStyle}`,
      plan.typography.notes ? `\n## Notes\n${plan.typography.notes}` : "",
    ].filter(Boolean).join("\n");
    files.push({ path: "typography-system.md", content: typoDoc, language: "markdown" });
  }

  // Voice & Tone file
  if (input.deliverables.includes("voice-tone")) {
    ctx.progress.emit("Documenting voice and tone...");
    const vt = plan.voiceTone;
    const vtDoc = [
      `# ${analysis.brandName} Voice & Tone Guide`,
      `\n## Tone: ${vt.tone}`,
      `\n## Tagline\n> ${vt.tagline}`,
      `\n## Elevator Pitch\n${vt.elevatorPitch}`,
      vt.doExamples.length ? `\n## Do\n${vt.doExamples.map((e) => `- ${e}`).join("\n")}` : "",
      vt.dontExamples.length ? `\n## Don't\n${vt.dontExamples.map((e) => `- ${e}`).join("\n")}` : "",
    ].filter(Boolean).join("\n");
    files.push({ path: "voice-tone-guide.md", content: vtDoc, language: "markdown" });
  }

  ctx.progress.emit("Compiling brand identity...");

  return {
    title: analysis.brandName,
    description: `${plan.brandArchetype} brand identity for ${analysis.brandName} — ${analysis.personality}`,
    brandType: input.brandType,
    mission: plan.mission,
    vision: plan.vision,
    values: plan.values,
    voiceTone: plan.voiceTone,
    colorPalette: plan.colorPalette,
    typography: plan.typography,
    logoGuidelines,
    brandStory,
    brandStrategy,
    assets,
    files,
  };
}

async function validateBrand(output: BrandOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating brand identity...");
  const issues: string[] = [];

  if (!output.title) issues.push("Missing brand title");
  if (!output.mission && !output.vision) issues.push("Missing mission and vision");
  if (!output.colorPalette?.length) issues.push("Missing color palette");
  if (!output.values?.length) issues.push("Missing brand values");

  return { valid: issues.length === 0, issues, reason: issues.length > 0 ? issues.join("; ") : undefined };
}

async function exportBrand(output: BrandOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: {
      title: output.title,
      filesCount: output.files.length,
      assetsCount: output.assets.length,
    },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}-brand-identity.json`,
  };
}

export const brandIdentityPlugin: AIPlugin<
  BrandIdentityPluginInput,
  BrandAnalysis,
  BrandPlanResult,
  BrandOutput
> = {
  id: "brand-identity",
  name: "Brand Identity Builder",
  preferredProvider: getActiveProvider(),
  analyze: analyzeBrand,
  plan: planBrand,
  generate: generateBrand,
  validate: validateBrand,
  export: exportBrand,
};

export * from "@/plugins/brand-identity/types";
