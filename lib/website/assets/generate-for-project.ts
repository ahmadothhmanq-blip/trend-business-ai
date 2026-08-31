import { websiteInputToBrief } from "@/lib/ai-core/adapters/website-builder";
import {
  deriveDesignSystem,
  deriveStrategyFromPages,
  profileFromProductAnalysis,
} from "@/lib/ai-core/adapters/derive-layers";
import { runAiImageEngine } from "@/lib/ai-core/image-engine";
import { getTemplateSelectionFromBrief } from "@/lib/ai-core/templates/apply";
import { buildWebsiteGenerationKey } from "@/lib/ai-core/website-builder/prompt-industry";
import type { CoreDesignSystem, CoreProductStrategy } from "@/lib/ai-core/layers/types";
import { resolveWebsiteGenerationProfile } from "@/lib/website/generation-flags";
import {
  resolveSiteImageStrategy,
  siteImageStrategyUsesGeneration,
} from "@/lib/website/site-plan/image-strategy";
import {
  getArchetypeForbiddenImageSubjects,
  resolveImageRoutingFromContext,
} from "@/lib/website/site-plan/resolve-image-routing";
import { isHeroDominantIndustry } from "@/lib/ai-core/image-engine/industry-slot-policy";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { StructuredImageRequirement } from "@/lib/ai-core/image-engine/types";
import type { SectionKey } from "@/lib/ai-core/image-engine/section-strategies";
import { uploadWebsiteAsset } from "@/lib/website/assets-storage";
import type {
  BusinessProfile,
  DesignSystem,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteStrategy,
} from "@/lib/website/types";

function hasPublishableAssets(project: GeneratedWebsiteProject): boolean {
  return Boolean(
    project.assetManifest?.items?.some(
      (item) => item.url && !item.url.startsWith("data:image/svg"),
    ),
  );
}

function resolveStrategy(
  project: GeneratedWebsiteProject,
  input: WebsiteGenerationInput,
): CoreProductStrategy {
  if (project.strategy) return project.strategy as WebsiteStrategy as CoreProductStrategy;
  if (input.previousStrategy) {
    return input.previousStrategy as WebsiteStrategy as CoreProductStrategy;
  }
  return deriveStrategyFromPages({
    positioning: project.description ?? project.title ?? input.prompt,
    pages: project.pages?.length ? project.pages : ["Home"],
    sections: project.sections,
    seoFocus: project.seo,
  });
}

function resolveDesignSystem(
  project: GeneratedWebsiteProject,
  input: WebsiteGenerationInput,
  industry: string,
): CoreDesignSystem {
  if (project.designSystem) {
    return project.designSystem as DesignSystem as CoreDesignSystem;
  }
  if (input.previousDesignSystem) {
    return input.previousDesignSystem as DesignSystem as CoreDesignSystem;
  }

  const designSystem = deriveDesignSystem({
    style: input.theme || "modern",
    colorStyle: input.designPreset || input.theme || "modern",
    components: project.components ?? input.components,
    industryPattern: industry,
  });

  const [primary, secondary, accent, background, foreground] =
    project.colorPalette ?? [];
  if (primary) designSystem.colors.primary = primary;
  if (secondary) designSystem.colors.secondary = secondary;
  if (accent) designSystem.colors.accent = accent;
  if (background) designSystem.colors.background = background;
  if (foreground) designSystem.colors.foreground = foreground;

  if (project.typography?.length) {
    designSystem.typography.headingFont = project.typography[0] ?? designSystem.typography.headingFont;
    designSystem.typography.bodyFont =
      project.typography[1] ?? project.typography[0] ?? designSystem.typography.bodyFont;
  }

  if (input.designSystem) {
    const hints = input.designSystem;
    if (hints.primary) designSystem.colors.primary = hints.primary;
    if (hints.secondary) designSystem.colors.secondary = hints.secondary;
    if (hints.accent) designSystem.colors.accent = hints.accent;
    if (hints.background) designSystem.colors.background = hints.background;
    if (hints.foreground) designSystem.colors.foreground = hints.foreground;
    if (hints.displayFont) designSystem.typography.headingFont = hints.displayFont;
    if (hints.bodyFont) designSystem.typography.bodyFont = hints.bodyFont;
  }

  return designSystem;
}

function resolveBusinessProfile(
  project: GeneratedWebsiteProject,
  input: WebsiteGenerationInput,
  routing: ReturnType<typeof resolveImageRoutingFromContext>,
): BusinessIntelligenceProfile {
  const core = profileFromProductAnalysis({
    projectName: project.title ?? "Website",
    industry: routing.industryLabel,
    summary: project.description ?? input.prompt,
    goals: project.roadmap,
    requiredSections: project.sections,
    offer: project.description ?? input.prompt,
  });

  return {
    industry: routing.industryLabel,
    subcategory: routing.industryLabel,
    audience: [core.targetAudience],
    tone: core.tone,
    visualStyle: ["Modern", "Premium", "Product-forward"],
    colorPalette: ["Neutral", "High contrast", "Tech retail"],
    typography: ["Modern", "Readable"],
    photographyStyle: routing.imageHints.length
      ? routing.imageHints
      : [`${routing.industryLabel} commercial photography`],
    forbiddenSubjects: [
      ...getArchetypeForbiddenImageSubjects(routing.archetypeId),
      ...(routing.routingIndustryId === "furniture"
        ? ["cars", "restaurant food", "fashion clothing", "smartphones", "generic office"]
        : []),
    ],
    heroMessaging: [`Premium ${routing.industryLabel}`],
    recommendedSections: core.requiredSections.length
      ? core.requiredSections
      : ["Hero", "Products", "Services", "Contact"],
    primaryCta: "Shop now",
    navigationStyle: "product-catalog",
    designSystemHints: {
      mood: core.tone,
      layoutApproach: "industry-specific retail hierarchy",
    },
    routingIndustryId: routing.routingIndustryId,
    confidence: 0.92,
    reason: `Resolved from site archetype ${routing.archetypeId}`,
  };
}

/**
 * Run the AI image engine when a project was built without the legacy assets layer
 * (e.g. TBGE-primary) but the user chose with-images.
 */
export async function generateAssetsForWebsiteProject(
  project: GeneratedWebsiteProject,
  input: WebsiteGenerationInput,
  options?: { onProgress?: (message: string) => void },
): Promise<GeneratedWebsiteProject> {
  const imageStrategy = resolveSiteImageStrategy(
    input.imageStrategyMode ?? project.sitePlan?.imageStrategy,
  );
  if (!siteImageStrategyUsesGeneration(imageStrategy)) {
    return project;
  }
  if (hasPublishableAssets(project)) {
    return project;
  }

  options?.onProgress?.(
    "Advanced AI Assets Engine: brand + design art direction → premium visuals…",
  );

  const tbgeIndustryId = (
    project as GeneratedWebsiteProject & {
      tbgeSpec?: { business?: { industryId?: string; industry?: string } };
    }
  ).tbgeSpec?.business?.industryId;

  const routing = resolveImageRoutingFromContext({
    prompt: input.prompt,
    title: project.title,
    description: project.description,
    industryId:
      input.industryId ??
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId ??
      tbgeIndustryId,
    businessIndustry:
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId ??
      tbgeIndustryId,
    sitePlanArchetype: project.settings?.sitePlanArchetype ?? project.sitePlan?.archetypeId,
    archetypeId: project.sitePlan?.archetypeId,
  });

  const strategy = resolveStrategy(project, input);
  const designSystem = resolveDesignSystem(project, input, routing.routingIndustryId);
  const coreProfile = profileFromProductAnalysis({
    projectName: project.title ?? "Website",
    industry: routing.industryLabel,
    summary: project.description ?? input.prompt,
    goals: project.roadmap,
    requiredSections: project.sections,
    offer: project.description ?? input.prompt,
  });
  const businessProfile = resolveBusinessProfile(project, input, routing);
  const brief = websiteInputToBrief(input);
  const templateSelection = getTemplateSelectionFromBrief(brief);
  const assetProfile = resolveWebsiteGenerationProfile(input);
  const generationKey = buildWebsiteGenerationKey({
    userId: input.userId,
    parentGenerationId: input.parentGenerationId,
    mode: input.mode ?? "generate",
    prompt: input.prompt,
  });

  const heroDominant = isHeroDominantIndustry(routing.routingIndustryId);
  const structuredImageRequirements = heroDominant
    ? [
        {
          role: "hero" as const,
          sectionKey: "hero" as SectionKey,
          brief: routing.imageHints[0] ?? "luxury vehicle exterior",
          style: "automotive hero photography",
          notes: `Industry: ${routing.industryLabel}`,
          required: true,
        },
        {
          role: "section" as const,
          sectionKey: "features" as SectionKey,
          brief: "dealership team consultation, professional service",
          style: "commercial business photography",
          notes: `Industry: ${routing.industryLabel}`,
          required: false,
        },
        {
          role: "testimonial" as const,
          sectionKey: "gallery" as SectionKey,
          brief: "customer portrait, natural light",
          style: "portrait photography",
          notes: `Industry: ${routing.industryLabel}`,
          required: false,
        },
      ]
    : routing.imageHints.map((hint, index) => {
        const sectionKeys: SectionKey[] = ["hero", "features", "gallery"];
        const req: StructuredImageRequirement = {
          role: index === 0 ? "hero" : "section",
          sectionKey: sectionKeys[index] ?? "features",
          brief: hint,
          style: "commercial product photography",
          notes: `Industry: ${routing.industryLabel}`,
          required: index === 0,
        };
        return req;
      });

  const manifest = await runAiImageEngine({
    strategy,
    designSystem,
    profile: coreProfile,
    templateSelection,
    brief,
    masterPlan: input.masterWebsitePlan ?? null,
    businessProfile,
    siteArchetypeId: routing.archetypeId,
    structuredImageRequirements,
    maxImages: heroDominant
      ? 3
      : assetProfile === "ultra"
        ? 6
        : assetProfile === "fast"
          ? 10
          : 14,
    userId: input.userId,
    generationKey,
    persist: Boolean(input.userId),
    generationProfile: assetProfile,
    onProgress: options?.onProgress,
    upload: input.userId
      ? async ({ assetId, bytes, contentType }) => {
          const uploaded = await uploadWebsiteAsset({
            userId: input.userId!,
            generationKey,
            assetId,
            bytes,
            contentType,
          });
          return uploaded
            ? {
                publicUrl: uploaded.publicUrl,
                storagePath: uploaded.storagePath,
              }
            : null;
        }
      : undefined,
  });

  return {
    ...project,
    assetManifest: manifest,
    strategy: project.strategy ?? (strategy as WebsiteStrategy),
    designSystem: project.designSystem ?? (designSystem as DesignSystem),
    businessProfile: {
      ...(project.businessProfile ?? {}),
      industry: routing.industryLabel,
      routingIndustryId: routing.routingIndustryId,
    } as BusinessProfile,
    settings: {
      ...(project.settings ?? {}),
      businessIndustry: routing.routingIndustryId,
    },
  };
}
