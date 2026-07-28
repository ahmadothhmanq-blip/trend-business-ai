import { generateCoreAssets } from "@/lib/ai-core/assets/generate";
import { getDefaultImageSettings } from "@/lib/ai-core/assets/settings";
import type { CoreAssetPlanItem } from "@/lib/ai-core/assets/types";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import { buildArtDirectionMap } from "@/lib/ai-core/image-engine/art-direction";
import { buildImageIntelligence } from "@/lib/ai-core/image-engine/intelligence";
import { planWebsiteImages } from "@/lib/ai-core/image-engine/plan";
import {
  getCachedPrompt,
  setCachedPrompt,
} from "@/lib/ai-core/image-engine/prompt-cache";
import {
  improvePromptForScore,
  PROMPT_QUALITY_THRESHOLD,
  scoreImagePrompt,
} from "@/lib/ai-core/image-engine/prompt-scoring";
import { preferAiImages } from "@/lib/ai-core/image-engine/prefer";
import { ensureRequiredPhotoAssets } from "@/lib/ai-core/image-engine/inject";
import {
  assertPublishableAssets,
  validateAssetManifest,
} from "@/lib/ai-core/image-engine/validate";
import { prepareVideoAssets } from "@/lib/ai-core/image-engine/video";
import type {
  DesignPlanImageContext,
  ImageEnginePlanItem,
  StructuredImageRequirement,
} from "@/lib/ai-core/image-engine/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type {
  CoreAssetManifest,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

type PromptEnrichment = {
  items?: Array<{
    id?: string;
    prompt?: string;
    alt?: string;
  }>;
};

/**
 * Advanced AI Assets Engine — art direction → plan → score → generate → validate → video prep.
 * No empty placeholders for photographic roles.
 */
export async function runAiImageEngine(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  brandIdentity?: BrandIdentityBrief | null;
  /** Override from approved Design Planning Phase. */
  preferredStyle?: string | null;
  /** Shot briefs from VisualDesignPlan.imageRequirements (legacy string form). */
  designPlanImageRequirements?: string[];
  /** Structured requirements from design plan / premium templates. */
  structuredImageRequirements?: StructuredImageRequirement[];
  /** Design plan section structure for layout-aware planning. */
  designPlanContext?: DesignPlanImageContext;
  maxImages?: number;
  userId?: string;
  generationKey?: string;
  websiteGenerationId?: string;
  aiRunId?: string;
  persist?: boolean;
  upload?: (args: {
    assetId: string;
    bytes: Buffer;
    contentType: string;
  }) => Promise<{ publicUrl: string; storagePath: string } | null>;
  onProgress?: (message: string) => void;
  masterPlan?: MasterWebsitePlan | null;
}): Promise<CoreAssetManifest> {
  const maxImages = params.maxImages ?? 14;
  const intel = buildImageIntelligence({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: params.preferredStyle,
    brandIdentity: params.brandIdentity,
    structuredRequirements: params.structuredImageRequirements,
    masterPlan: params.masterPlan,
  });
  if (params.designPlanImageRequirements?.length) {
    intel.imageRequirements = params.designPlanImageRequirements;
  }

  const artMap = buildArtDirectionMap({
    purposes: [
      "hero",
      "product",
      "service",
      "background",
      "gallery",
      "section",
      "testimonial",
    ],
    ctx: intel,
    brandIdentity: params.brandIdentity,
  });

  params.onProgress?.(
    `AI Assets Engine: art direction for ${intel.industry} · ${intel.brandStyle}…`,
  );
  params.onProgress?.(
    `AI Assets Engine: planning ${intel.imageStyle} imagery with section-specific strategies…`,
  );

  let planned = planWebsiteImages({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle:
      params.preferredStyle ||
      params.brandIdentity?.imageDirection ||
      intel.imageStyle,
    brandIdentity: params.brandIdentity,
    structuredRequirements: params.structuredImageRequirements,
    designPlanContext: params.designPlanContext,
    maxItems: maxImages,
    masterPlan: params.masterPlan,
  });

  planned = scoreAndImprovePlannedPrompts(planned, intel, params.onProgress);
  planned = await refinePromptsWithDeepSeek(planned, intel, params.onProgress);

  const defaultSettings = getDefaultImageSettings({
    style: intel.imageStyle,
    aspectRatio: "16:9",
  });

  const coreItems: CoreAssetPlanItem[] = planned.map((item) => ({
    id: item.id,
    kind: item.kind,
    role: item.role,
    name: item.name,
    prompt: item.prompt,
    alt: item.alt,
    realistic: item.realistic,
    aspectRatio: item.aspectRatio,
    metadata: {
      ...item.metadata,
      seoDescription: item.seoDescription,
      caption: item.caption,
    },
  }));

  params.onProgress?.(
    "AI Assets Engine: generating premium photographic assets (AI → premium stock fallback)…",
  );

  const raw = await generateCoreAssets({
    items: coreItems.map((item) => {
      const purpose = item.metadata?.purpose || item.role;
      const art = artMap[purpose as keyof typeof artMap];
      return {
        ...item,
        prompt: [
          "Award-winning commercial photography, premium lighting, ultra sharp.",
          item.prompt,
          art ? `Art direction: ${art.promptFragment}.` : "",
          `Style: ${intel.imageStyle}.`,
        ]
          .filter(Boolean)
          .join(" "),
        alt:
          item.alt?.trim() ||
          `${params.profile?.projectName || intel.projectName} ${item.role} photography`,
      };
    }),
    colors: {
      ...params.designSystem.colors,
      primary: intel.colors.primary,
      secondary: intel.colors.secondary,
    },
    industry:
      params.templateSelection?.industryId ||
      params.profile?.industry ||
      intel.industry,
    userId: params.userId,
    generationKey: params.generationKey,
    websiteGenerationId: params.websiteGenerationId,
    aiRunId: params.aiRunId,
    maxImages,
    imageSettings: defaultSettings,
    negativePrompt:
      "text, watermark, logo, UI mockup, blurry, low quality, distorted anatomy, placeholder, cartoon, clipart, generic stock smile, empty background, blank image",
    persist: params.persist,
    upload: params.upload,
    onProgress: params.onProgress,
  });

  const withMeta: CoreAssetManifest = {
    ...raw,
    engine: "ai-assets-engine",
    items: raw.items.map((item) => {
      const plan = planned.find((p) => p.id === item.id);
      const purpose = plan?.metadata.purpose ?? (item.role as "hero");
      return {
        ...item,
        metadata: {
          purpose,
          section: plan?.metadata.section,
          style: plan?.metadata.style ?? defaultSettings.style,
          prompt: plan?.prompt ?? item.prompt,
          artDirection: plan?.metadata.artDirection || artMap[purpose]?.summary,
          provider:
            item.status === "generated"
              ? item.metadata?.provider || raw.provider
              : item.status === "fallback"
                ? "fallback-svg"
                : undefined,
        },
      };
    }),
  };

  const preferred = preferAiImages(withMeta);
  const complete = ensureRequiredPhotoAssets(
    preferred,
    params.templateSelection?.industryId ||
      params.profile?.industry ||
      intel.industry,
  );

  params.onProgress?.("AI Assets Engine: validating visual coverage…");
  const qualityReport = validateAssetManifest(complete, {
    industry: intel.industry,
    brandStyle: intel.brandStyle,
    plannedPrompts: planned.map((p) => ({
      id: p.id,
      prompt: p.prompt,
      purpose: p.metadata.purpose,
      section: p.metadata.section,
    })),
  });
  assertPublishableAssets(complete);

  const videoPackage = prepareVideoAssets({
    ctx: intel,
    brandIdentity: params.brandIdentity,
    imageManifest: complete,
  });

  params.onProgress?.(qualityReport.summary);
  params.onProgress?.(videoPackage.summary);

  return {
    ...complete,
    engine: "ai-assets-engine",
    qualityReport,
    videoPackage,
  };
}

/** Score planned prompts and auto-improve any below threshold before LLM refinement. */
function scoreAndImprovePlannedPrompts(
  planned: ImageEnginePlanItem[],
  intel: ReturnType<typeof buildImageIntelligence>,
  onProgress?: (message: string) => void,
): ImageEnginePlanItem[] {
  let improved = 0;
  const result = planned.map((item) => {
    const score = scoreImagePrompt({
      prompt: item.prompt,
      purpose: item.metadata.purpose,
      ctx: intel,
      sectionName: item.metadata.section,
      shotBrief: item.metadata.artDirection,
    });

    if (score.passed) return item;

    const betterPrompt = improvePromptForScore({
      prompt: item.prompt,
      purpose: item.metadata.purpose,
      ctx: intel,
      sectionName: item.metadata.section,
      score,
    });
    improved += 1;
    return {
      ...item,
      prompt: betterPrompt,
      metadata: { ...item.metadata, prompt: betterPrompt },
    };
  });

  if (improved > 0) {
    onProgress?.(
      `AI Assets Engine: improved ${improved} prompt(s) below quality threshold (${PROMPT_QUALITY_THRESHOLD}/100)…`,
    );
  }

  return result;
}

async function refinePromptsWithDeepSeek(
  planned: ImageEnginePlanItem[],
  intel: ReturnType<typeof buildImageIntelligence>,
  onProgress?: (message: string) => void,
) {
  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) return planned;

  onProgress?.(
    "AI Assets Engine: refining prompts from brand + industry intelligence…",
  );

  const needsRefinement = planned.filter((item) => {
    const cached = getCachedPrompt([
      intel.industry,
      item.metadata.purpose,
      item.sectionKey || "",
      item.metadata.section || "",
      intel.imageStyle,
    ]);
    return !cached;
  });

  if (!needsRefinement.length) {
    return planned.map((item) => {
      const cached = getCachedPrompt([
        intel.industry,
        item.metadata.purpose,
        item.sectionKey || "",
        item.metadata.section || "",
        intel.imageStyle,
      ]);
      if (!cached) return item;
      return {
        ...item,
        prompt: cached.prompt,
        alt: cached.alt || item.alt,
        metadata: { ...item.metadata, prompt: cached.prompt },
      };
    });
  }

  try {
    const enrichment = await providerManager.generateJson<PromptEnrichment>(
      {
        system:
          "You write concise photorealistic commercial image prompts for premium agency websites. Each section must have a DISTINCT subject — never reuse hero wording for other sections. No text overlays, logos, or watermarks. Return JSON only.",
        prompt: `Business: ${intel.projectName}
Industry: ${intel.industry}
Business type: ${intel.businessType}
Offer: ${intel.offer}
Brand style: ${intel.brandStyle}
Brand image direction: ${intel.brandImageDirection || "n/a"}
Design system: ${intel.designStyle} / ${intel.designPreset}
Target audience: ${intel.targetAudience}
Image style: ${intel.imageStyle}
Industry image requirements: ${intel.imageRequirements.join("; ") || "n/a"}
Template: ${intel.templateLabel || "n/a"}

Planned assets (each must stay unique):
${JSON.stringify(
  needsRefinement.map((i) => ({
    id: i.id,
    purpose: i.metadata.purpose,
    section: i.metadata.section,
    sectionKey: i.sectionKey,
    role: i.role,
    name: i.name,
    prompt: i.prompt,
    artDirection: i.metadata.artDirection,
  })),
  null,
  2,
)}

Return JSON:
{
  "items": [
    { "id": "<same id>", "prompt": "<improved unique prompt>", "alt": "<accessible alt text>" }
  ]
}`,
        temperature: 0.4,
      },
      resolved,
    );

    if (!Array.isArray(enrichment.items) || !enrichment.items.length) {
      return planned;
    }

    const byId = new Map(
      enrichment.items
        .filter((row) => row && typeof row.id === "string")
        .map((row) => [String(row.id), row]),
    );

    return planned.map((item) => {
      const row = byId.get(item.id);
      if (!row?.prompt) {
        const cached = getCachedPrompt([
          intel.industry,
          item.metadata.purpose,
          item.sectionKey || "",
          item.metadata.section || "",
          intel.imageStyle,
        ]);
        if (cached) {
          return {
            ...item,
            prompt: cached.prompt,
            alt: cached.alt || item.alt,
            metadata: { ...item.metadata, prompt: cached.prompt },
          };
        }
        return item;
      }
      const prompt = String(row.prompt);
      const alt =
        typeof row.alt === "string" && row.alt.trim() ? row.alt : item.alt;
      setCachedPrompt(
        [
          intel.industry,
          item.metadata.purpose,
          item.sectionKey || "",
          item.metadata.section || "",
          intel.imageStyle,
        ],
        { prompt, alt },
      );
      return {
        ...item,
        prompt,
        alt,
        metadata: {
          ...item.metadata,
          prompt,
        },
      };
    });
  } catch {
    return planned;
  }
}
