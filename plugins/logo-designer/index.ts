import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  logoAnalyzePrompt,
  logoPlanPrompt,
  logoGeneratePrompt,
  logoVariationPrompt,
  logoGuidelinesPrompt,
} from "@/lib/ai/prompts/logo";
import {
  logoAnalysisSchema,
  logoPlanSchema,
  logoConceptSchema,
  logoVariationSchema,
} from "@/plugins/logo-designer/schemas";
import type {
  LogoAnalysis,
  LogoPlanResult,
  LogoOutput,
  LogoPluginInput,
  LogoVariation,
} from "@/plugins/logo-designer/types";
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

async function analyzeLogo(
  input: LogoPluginInput,
  ctx: GenerationContext,
): Promise<LogoAnalysis> {
  ctx.progress.emit("Analyzing brand and logo requirements...");

  const analysis = await ctx.provider.generateJson<LogoAnalysis>({
    prompt: logoAnalyzePrompt(input),
    schema: logoAnalysisSchema,
  });

  return {
    ...analysis,
    brandName: analysis.brandName || input.brandName || "Brand",
    industry: analysis.industry || input.industry || "General",
    style: analysis.style || input.logoStyle,
    mood: analysis.mood || "Professional",
    personality: analysis.personality || input.personality || "Professional",
    colorDirection: analysis.colorDirection || input.colorPalette,
    typographyDirection: analysis.typographyDirection || input.typography || "Auto",
    conceptSuggestions: analysis.conceptSuggestions?.length ? analysis.conceptSuggestions : ["Primary concept"],
    targetAudience: analysis.targetAudience || "General audience",
    brandValues: analysis.brandValues?.length ? analysis.brandValues : ["Quality"],
  };
}

async function planLogo(
  input: LogoPluginInput,
  analysis: LogoAnalysis,
  ctx: GenerationContext,
): Promise<LogoPlanResult> {
  ctx.progress.emit("Planning logo concepts and color palette...");

  const plan = await ctx.provider.generateJson<LogoPlanResult>({
    prompt: logoPlanPrompt(input, analysis),
    schema: logoPlanSchema,
  });

  return {
    concepts: plan.concepts?.length
      ? plan.concepts
      : [{ name: "Primary", description: "Main concept", approach: analysis.style, iconDescription: "", layoutDescription: "", colorUsage: "" }],
    colorPalette: plan.colorPalette?.length
      ? plan.colorPalette
      : [{ name: "Primary", hex: "#D4AF37", role: "Brand primary" }, { name: "Dark", hex: "#1A1A1A", role: "Background" }],
    typography: plan.typography ?? { primary: "Inter", secondary: "Playfair Display", weight: "Bold 700" },
    deliverables: plan.deliverables ?? input.options,
    svgApproach: plan.svgApproach ?? "Clean vector paths",
  };
}

async function generateLogo(
  input: LogoPluginInput,
  analysis: LogoAnalysis,
  plan: LogoPlanResult,
  ctx: GenerationContext,
): Promise<LogoOutput> {
  ctx.progress.emit("Generating logo concepts...");

  const concepts: { name: string; description: string; svgCode: string }[] = [];

  for (const concept of plan.concepts.slice(0, 3)) {
    ctx.progress.emit(`Designing "${concept.name}" concept...`);
    try {
      const result = await ctx.provider.generateJson<{ name: string; description: string; svgCode: string }>({
        prompt: logoGeneratePrompt(input, analysis, concept, plan.colorPalette),
        schema: logoConceptSchema,
      });
      concepts.push({
        name: result.name || concept.name,
        description: result.description || concept.description,
        svgCode: sanitizeSvg(result.svgCode),
      });
    } catch {
      concepts.push({ name: concept.name, description: concept.description, svgCode: "" });
    }
  }

  const variationNames = input.options
    .filter((o) => ["dark-version", "light-version", "icon-only", "horizontal", "favicon", "social-avatar", "watermark"].includes(o))
    .map((o) => {
      const map: Record<string, string> = {
        "dark-version": "Dark Version",
        "light-version": "Light Version",
        "icon-only": "Icon Only",
        horizontal: "Horizontal Layout",
        favicon: "Favicon",
        "social-avatar": "Social Avatar",
        watermark: "Watermark",
      };
      return map[o] ?? o;
    });

  const primarySvg = concepts[0]?.svgCode ?? "";
  const variations: LogoVariation[] = [];

  if (primarySvg && variationNames.length > 0) {
    ctx.progress.emit("Creating logo variations...");
    for (const varName of variationNames.slice(0, 4)) {
      ctx.progress.emit(`Creating ${varName}...`);
      try {
        const result = await ctx.provider.generateJson<LogoVariation>({
          prompt: logoVariationPrompt(analysis.brandName, primarySvg, varName, plan.colorPalette),
          schema: logoVariationSchema,
        });
        variations.push({
          name: result.name || varName,
          description: result.description || "",
          useCase: result.useCase || "",
          svgCode: sanitizeSvg(result.svgCode),
        });
      } catch {
        variations.push({ name: varName, description: `${varName} variation`, useCase: "", svgCode: "" });
      }
    }
  }

  ctx.progress.emit("Writing brand guidelines...");
  let guidelines = "";
  try {
    const typographyInfo = {
      primary: plan.typography.primary,
      secondary: plan.typography.secondary,
      notes: plan.typography.weight,
    };
    const guidelinesText = ctx.provider.generateText
      ? await ctx.provider.generateText({
          prompt: logoGuidelinesPrompt(analysis.brandName, analysis, plan.colorPalette, typographyInfo, variations),
        })
      : "";
    guidelines = guidelinesText || "";
  } catch {
    guidelines = "";
  }

  const files: { path: string; content: string; language: string }[] = [];

  concepts.forEach((c) => {
    if (c.svgCode) {
      files.push({
        path: `logos/${c.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
        content: c.svgCode,
        language: "svg",
      });
    }
  });

  variations.forEach((v) => {
    if (v.svgCode) {
      files.push({
        path: `logos/variations/${v.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
        content: v.svgCode,
        language: "svg",
      });
    }
  });

  if (guidelines) {
    files.push({ path: "brand-guidelines.md", content: guidelines, language: "markdown" });
  }

  return {
    title: analysis.brandName,
    description: `${analysis.style} logo for ${analysis.brandName} — ${analysis.mood}, ${analysis.personality}`,
    logoStyle: input.logoStyle,
    concepts,
    colorPalette: plan.colorPalette,
    typography: {
      primary: plan.typography.primary,
      secondary: plan.typography.secondary,
      notes: plan.typography.weight,
    },
    variations,
    guidelines,
    files,
  };
}

async function validateLogo(output: LogoOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating logo output...");

  const issues: string[] = [];

  if (!output.title) issues.push("Missing logo title");
  if (!output.concepts.length) issues.push("No logo concepts generated");

  const hasAnySvg = output.concepts.some((c) => c.svgCode?.includes("<svg"));
  if (!hasAnySvg) issues.push("No valid SVG code in any concept");

  if (!output.colorPalette?.length) issues.push("Missing color palette");

  return {
    valid: issues.length === 0,
    issues,
    reason: issues.length > 0 ? issues.join("; ") : undefined,
  };
}

async function exportLogo(output: LogoOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: {
      title: output.title,
      concepts: output.concepts.length,
      variations: output.variations.length,
      files: output.files.length,
    },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}-logo.json`,
  };
}

export const logoDesignerPlugin: AIPlugin<
  LogoPluginInput,
  LogoAnalysis,
  LogoPlanResult,
  LogoOutput
> = {
  id: "logo-designer",
  name: "Logo Designer",
  preferredProvider: getActiveProvider(),
  analyze: analyzeLogo,
  plan: planLogo,
  generate: generateLogo,
  validate: validateLogo,
  export: exportLogo,
};

export * from "@/plugins/logo-designer/types";
