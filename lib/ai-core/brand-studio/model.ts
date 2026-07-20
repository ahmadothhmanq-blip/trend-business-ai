/**
 * Convert between plugin output, AI Core brief, and canonical BrandIdentityModel.
 */

import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  BrandAnalysis,
  BrandOutput,
  BrandPlanResult,
  BrandIdentityPluginInput,
} from "@/plugins/brand-identity/types";
import type { BrandIdentityBlueprint } from "@/types/brand-identity";
import { createId } from "@/lib/ai-core/brand-studio/ids";
import type {
  BrandIdentityModel,
  BrandKitTokens,
  BrandLogoConcept,
  BrandLogoVariant,
} from "@/lib/ai-core/brand-studio/types";

export function buildKitTokens(
  output: BrandOutput,
  analysis?: BrandAnalysis,
): BrandKitTokens {
  const primary = output.colorPalette[0]?.hex ?? "#D4AF37";
  const secondary = output.colorPalette[1]?.hex ?? "#1A1A2E";
  const accent = output.colorPalette[2]?.hex ?? primary;
  return {
    primary,
    secondary,
    accent,
    neutral: output.colorPalette.find((c) => /neutral|gray/i.test(c.role))?.hex ?? "#6B7280",
    surface: output.colorPalette.find((c) => /surface|background/i.test(c.role))?.hex ?? "#F8FAFC",
    background: output.colorPalette.find((c) => /background/i.test(c.role))?.hex ?? "#FFFFFF",
    foreground: output.colorPalette.find((c) => /text|foreground/i.test(c.role))?.hex ?? "#0F172A",
    headingFont: output.typography.primary,
    bodyFont: output.typography.secondary,
    voiceTone: output.voiceTone.tone,
    tagline: output.voiceTone.tagline,
  };
}

export function brandOutputToModel(params: {
  output: BrandOutput;
  input: BrandIdentityPluginInput;
  analysis?: BrandAnalysis;
  plan?: BrandPlanResult;
  templateId?: string;
  presetId?: string;
  logos?: BrandLogoConcept[];
  logoVariants?: BrandLogoVariant[];
}): BrandIdentityModel {
  const { output, input, analysis, plan } = params;
  const tokens = buildKitTokens(output, analysis);

  return {
    brandName: output.title || input.brandName,
    brandType: output.brandType || input.brandType,
    industry: analysis?.industry || input.industry,
    description: output.description || input.prompt,
    strategy: {
      mission: output.mission,
      vision: output.vision,
      values: output.values,
      positioning: analysis?.positioning || "",
      audience: analysis?.targetAudience || input.targetAudience,
      personality: analysis?.personality || input.brandPersonality,
      archetype: plan?.brandArchetype || "The Creator",
      differentiators: analysis?.differentiators || [],
      competitors: analysis?.competitors || [],
      emotionalAppeal: analysis?.emotionalAppeal || "",
      document: output.brandStrategy,
    },
    positioning: {
      statement: analysis?.positioning || output.mission,
      marketPosition: analysis?.positioning || "",
      valueProposition: output.voiceTone.elevatorPitch,
      tagline: output.voiceTone.tagline,
      elevatorPitch: output.voiceTone.elevatorPitch,
    },
    voice: {
      ...output.voiceTone,
      principles: output.values.slice(0, 4),
    },
    colors: output.colorPalette,
    typography: output.typography,
    logoDirection: {
      style: plan?.brandArchetype || "Modern wordmark",
      iconConcept: "",
      symbolism: [],
      usageGuidelines: output.logoGuidelines
        ? output.logoGuidelines.split("\n").filter((l) => l.trim().startsWith("-"))
        : [],
      clearSpace: "Minimum clear space equal to the height of the logomark on all sides.",
      doNot: ["Do not stretch, rotate, or recolor outside the approved palette."],
      guidelinesDocument: output.logoGuidelines,
    },
    logos: params.logos ?? [],
    logoVariants: params.logoVariants ?? [],
    assets: output.assets,
    files: output.files,
    tokens,
    qualityScore: 0,
    qualityIssues: [],
    templateId: params.templateId,
    presetId: params.presetId,
    generatedAt: new Date().toISOString(),
  };
}

export function modelToBlueprint(model: BrandIdentityModel, prompt: string): BrandIdentityBlueprint {
  return {
    title: model.brandName,
    description: model.description,
    brandType: model.brandType,
    mission: model.strategy.mission,
    vision: model.strategy.vision,
    values: model.strategy.values,
    voiceTone: model.voice,
    colorPalette: model.colors,
    typography: model.typography,
    logoGuidelines: model.logoDirection.guidelinesDocument,
    brandStory: model.files.find((f) => f.path.includes("brand-story"))?.content ?? "",
    brandStrategy: model.strategy.document,
    assets: model.assets,
    files: model.files,
    prompt,
    generatedAt: model.generatedAt,
    model: model,
    logos: model.logos,
    logoVariants: model.logoVariants,
    tokens: model.tokens,
    qualityScore: model.qualityScore,
    templateId: model.templateId,
  } as BrandIdentityBlueprint;
}

export function blueprintToModel(
  blueprint: BrandIdentityBlueprint,
  gen?: { brand_type?: string; industry?: string },
): BrandIdentityModel {
  const embedded = (blueprint as BrandIdentityBlueprint & { model?: BrandIdentityModel }).model;
  if (embedded?.brandName) return embedded;

  const output: BrandOutput = {
    title: blueprint.title,
    description: blueprint.description,
    brandType: blueprint.brandType,
    mission: blueprint.mission,
    vision: blueprint.vision,
    values: blueprint.values,
    voiceTone: blueprint.voiceTone,
    colorPalette: blueprint.colorPalette,
    typography: blueprint.typography,
    logoGuidelines: blueprint.logoGuidelines,
    brandStory: blueprint.brandStory,
    brandStrategy: blueprint.brandStrategy,
    assets: blueprint.assets,
    files: blueprint.files,
  };

  return brandOutputToModel({
    output,
    input: {
      prompt: blueprint.prompt,
      brandName: blueprint.title,
      brandType: gen?.brand_type || blueprint.brandType,
      industry: gen?.industry || "",
      targetAudience: "",
      brandPersonality: blueprint.voiceTone.tone,
      deliverables: [],
    },
    logos: (blueprint as BrandIdentityBlueprint & { logos?: BrandLogoConcept[] }).logos,
    logoVariants: (blueprint as BrandIdentityBlueprint & { logoVariants?: BrandLogoVariant[] }).logoVariants,
    templateId: (blueprint as BrandIdentityBlueprint & { templateId?: string }).templateId,
  });
}

export function briefToModelHints(brief: BrandIdentityBrief): Partial<BrandIdentityModel> {
  return {
    presetId: brief.presetId,
    colors: brief.colors.roles.map((r) => ({
      name: r.name,
      hex: r.hex,
      role: r.role,
      usage: r.usage,
    })),
    typography: {
      primary: brief.typography.headingFont,
      secondary: brief.typography.bodyFont,
      weight: "Bold 700",
      headingStyle: brief.typography.direction,
      bodyStyle: brief.typography.scaleNotes,
      notes: brief.typography.pairing,
    },
    logoDirection: {
      style: brief.logo.logoStyle,
      iconConcept: brief.logo.iconConcept,
      symbolism: brief.logo.symbolism,
      usageGuidelines: brief.logo.usageGuidelines,
      clearSpace: brief.logo.clearSpace,
      doNot: brief.logo.doNot,
      guidelinesDocument: brief.logo.usageGuidelines.join("\n"),
    },
    tokens: {
      primary: brief.colors.primary,
      secondary: brief.colors.secondary,
      accent: brief.colors.accent,
      neutral: brief.colors.neutral,
      surface: brief.colors.surface,
      background: brief.colors.background,
      foreground: brief.colors.foreground,
      headingFont: brief.typography.headingFont,
      bodyFont: brief.typography.bodyFont,
      voiceTone: brief.strategy.brandVoice.tone,
      tagline: brief.strategy.brandVoice.taglineDirection,
    },
  };
}

export function mergeModel(
  base: BrandIdentityModel,
  patch: Partial<BrandIdentityModel>,
): BrandIdentityModel {
  return {
    ...base,
    ...patch,
    strategy: { ...base.strategy, ...patch.strategy },
    positioning: { ...base.positioning, ...patch.positioning },
    voice: { ...base.voice, ...patch.voice },
    logoDirection: { ...base.logoDirection, ...patch.logoDirection },
    colors: patch.colors ?? base.colors,
    typography: patch.typography ?? base.typography,
    logos: patch.logos ?? base.logos,
    logoVariants: patch.logoVariants ?? base.logoVariants,
    assets: patch.assets ?? base.assets,
    files: patch.files ?? base.files,
    tokens: patch.tokens ?? base.tokens,
  };
}

export function newLogoConcept(name: string, description: string, svg: string): BrandLogoConcept {
  return { id: createId("logo"), name, description, svg };
}
