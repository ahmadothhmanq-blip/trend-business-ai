import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import { buildImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import {
  buildAccessibleAltText,
  buildImageIntelligence,
  composeImagePrompt,
} from "@/lib/ai-core/image-engine/intelligence";
import { planWebsiteImages } from "@/lib/ai-core/image-engine/plan";
import type {
  DesignPlanImageContext,
  ImageEnginePlanItem,
  ImagePurpose,
  StructuredImageRequirement,
} from "@/lib/ai-core/image-engine/types";
import type { AssetKind } from "@/lib/ai-core/assets/types";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import type {
  ImagePolicy,
  ImageSpecification,
  ImageSystemSpec,
} from "@/lib/ai-core/image-intelligence/iie-types";
import { computeCoverage } from "@/lib/ai-core/image-intelligence/validate-image";
import {
  applySemanticRelevanceToSpecifications,
  resolveSemanticVisualConcept,
} from "@/lib/ai-core/image-intelligence/semantic-relevance";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";

export type BuildImageSystemSpecParams = {
  policy: ImagePolicy;
  designSystemSpec?: DesignSystemSpec | null;
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  preferredStyle?: string | null;
  brandIdentity?: BrandIdentityBrief | null;
  structuredImageRequirements?: StructuredImageRequirement[];
  designPlanImageRequirements?: string[];
  designPlanContext?: DesignPlanImageContext;
  maxImages?: number;
  masterPlan?: MasterWebsitePlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
};

const PLACEMENT_BY_PURPOSE: Record<string, string> = {
  hero: "above-the-fold hero banner",
  product: "product showcase grid",
  service: "services section card",
  section: "content section supporting visual",
  background: "atmospheric background band",
  gallery: "gallery mosaic grid",
  brand: "brand atmosphere strip",
  testimonial: "testimonial portrait card",
};

/** Convert planned engine items into provider-agnostic ImageSpecifications. */
export function specificationsFromPlannedItems(
  planned: ImageEnginePlanItem[],
  params: {
    policy: ImagePolicy;
    designSystemSpec?: DesignSystemSpec | null;
    ctx: ReturnType<typeof buildImageIntelligence>;
    brandIdentity?: BrandIdentityBrief | null;
    strategy?: CoreProductStrategy;
    contentNotesById?: Map<string, string>;
  },
): ImageSpecification[] {
  return planned.map((item) => {
    const purpose = item.metadata.purpose;
    const art = buildImageArtDirection({
      purpose,
      ctx: params.ctx,
      brandIdentity: params.brandIdentity,
      sectionName: item.metadata.section,
    });

    const primary =
      params.designSystemSpec?.colorSystem.primary ?? params.ctx.colors.primary;
    const secondary =
      params.designSystemSpec?.colorSystem.secondary ?? params.ctx.colors.secondary;
    const accent =
      params.designSystemSpec?.colorSystem.accent ?? params.ctx.colors.accent;

    const contentNotes = params.contentNotesById?.get(item.id);

    const semantic = params.strategy
      ? resolveSemanticVisualConcept({
          industryId: params.policy.industryId,
          sectionLabel: item.metadata.section,
          sectionKey: item.sectionKey,
          contentNotes,
          structuredBrief: contentNotes,
          purpose,
          ctx: params.ctx,
          strategy: params.strategy,
          brandIdentity: params.brandIdentity,
        })
      : null;

    const subject =
      semantic?.subject ||
      item.metadata.artDirection?.split(",")[0]?.trim() ||
      params.policy.heroShotSeed.split(",")[0]?.trim() ||
      `${params.policy.industryId} ${purpose}`;

    const { alt, caption, seoDescription } = buildAccessibleAltText({
      ctx: params.ctx,
      purpose,
      sectionName: item.metadata.section,
      sectionKey: item.sectionKey,
      shotBrief: subject,
    });

    const seoKeywords = [
      ...params.policy.lockedKeywords,
      params.policy.industryId,
      purpose,
      item.metadata.section || "",
      params.ctx.projectName,
    ].filter(Boolean);

    return {
      id: item.id,
      purpose,
      role: item.role,
      sectionKey: item.sectionKey,
      sectionLabel: item.metadata.section,
      placement: PLACEMENT_BY_PURPOSE[purpose] || "section visual",
      subject,
      scene: semantic?.scene ||
        (item.metadata.section
          ? `${subject} in ${item.metadata.section} context`
          : `${subject} for ${params.ctx.industry} website`),
      composition: art.composition,
      lighting: art.lighting,
      cameraPerspective: art.cameraAngle,
      style: item.metadata.style,
      colorHarmony: `Harmonize with primary ${primary}, secondary ${secondary}${accent ? `, accent ${accent}` : ""}. ${params.policy.colorHarmonyNotes.join("; ")}`,
      storytellingRole:
        semantic?.storytellingRole ||
        params.policy.storytellingNotes[0] ||
        `Support ${purpose} narrative for ${params.ctx.projectName}`,
      sectionPurpose: semantic?.sectionPurpose,
      pagePurpose: semantic?.pagePurpose,
      visualConcept: semantic?.visualConcept,
      aspectRatio: item.aspectRatio || "16:9",
      required: purpose === "hero" || purpose === "product",
      accessibility: {
        altText: item.alt || alt,
        caption: item.caption || caption,
        decorative: purpose === "background",
        ariaLabel: purpose === "hero" ? `Hero image for ${params.ctx.projectName}` : undefined,
      },
      seo: {
        title: `${params.ctx.projectName} — ${purpose} photography`,
        description: item.seoDescription || seoDescription,
        keywords: seoKeywords,
      },
      providerPrompt: item.prompt,
      artDirectionSummary: art.summary,
    };
  });
}

/**
 * Build the authoritative ImageSystemSpec — structured image plan only (no generation).
 */
export function buildImageSystemSpec(
  params: BuildImageSystemSpecParams,
): ImageSystemSpec {
  const ctx = buildImageIntelligence({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: params.preferredStyle || params.policy.defaultImageStyle,
    brandIdentity: params.brandIdentity,
    structuredRequirements: params.structuredImageRequirements,
    masterPlan: params.masterPlan,
    businessProfile: params.businessProfile,
  });

  if (params.designPlanImageRequirements?.length) {
    ctx.imageRequirements = params.designPlanImageRequirements;
  }

  const planned = planWebsiteImages({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: params.preferredStyle || params.policy.defaultImageStyle,
    brandIdentity: params.brandIdentity,
    structuredRequirements: params.structuredImageRequirements,
    designPlanContext: params.designPlanContext,
    maxItems: Math.min(
      params.maxImages ?? params.policy.maxImageCount,
      params.policy.maxImageCount,
    ),
    masterPlan: params.masterPlan,
    businessProfile: params.businessProfile,
  });

  const contentNotesById = new Map<string, string>();
  for (const req of params.structuredImageRequirements ?? []) {
    const idHint = req.sectionKey || req.role;
    if (req.brief) {
      contentNotesById.set(`${req.role}`, req.brief);
      if (idHint) contentNotesById.set(String(idHint), req.brief);
    }
  }

  let specifications = specificationsFromPlannedItems(planned, {
    policy: params.policy,
    designSystemSpec: params.designSystemSpec,
    ctx,
    brandIdentity: params.brandIdentity,
    strategy: params.strategy,
    contentNotesById,
  });

  specifications = applySemanticRelevanceToSpecifications(
    specifications,
    {
      policy: params.policy,
      ctx,
      strategy: params.strategy,
      brandIdentity: params.brandIdentity,
      designSystemSpec: params.designSystemSpec,
    },
    contentNotesById,
  );

  const coverage = computeCoverage(specifications, params.policy.requiredPurposes);

  if (coverage.missingPurposes.length > 0) {
    const extras = buildMissingPurposeSpecs(
      coverage.missingPurposes,
      params,
      ctx,
      specifications.length,
    );
    specifications = [...specifications, ...extras];
  }

  const primary =
    params.designSystemSpec?.colorSystem.primary ?? ctx.colors.primary;
  const secondary =
    params.designSystemSpec?.colorSystem.secondary ?? ctx.colors.secondary;
  const accent =
    params.designSystemSpec?.colorSystem.accent ?? ctx.colors.accent;

  return {
    version: "1",
    industryId: params.policy.industryId,
    imageStyle: ctx.imageStyle,
    specifications,
    policy: {
      forbiddenSubjects: params.policy.forbiddenSubjects,
      photographyStyle: params.policy.photographyStyle,
      lightingStrategy: params.policy.lightingStrategy,
      cameraStrategy: params.policy.cameraStrategy,
    },
    colorHarmony: {
      primary,
      secondary,
      accent,
      notes: params.policy.colorHarmonyNotes.join("; "),
    },
    coverage: computeCoverage(specifications, params.policy.requiredPurposes),
  };
}

function buildMissingPurposeSpecs(
  missing: ImageSpecification["purpose"][],
  params: BuildImageSystemSpecParams,
  ctx: ReturnType<typeof buildImageIntelligence>,
  startIndex: number,
): ImageSpecification[] {
  return missing.map((purpose, i) => {
    const art = buildImageArtDirection({
      purpose,
      ctx,
      brandIdentity: params.brandIdentity,
    });
    const prompt = composeImagePrompt({
      purpose,
      ctx,
      artDirectionFragment: art.promptFragment,
      shotBrief:
        purpose === "hero"
          ? params.policy.heroShotSeed
          : params.policy.photographyStyle[i % params.policy.photographyStyle.length],
    });
    const { alt, seoDescription } = buildAccessibleAltText({
      ctx,
      purpose,
      shotBrief: params.policy.heroShotSeed,
    });
    const id = `iie-fill-${purpose}-${startIndex + i}`;
    return {
      id,
      purpose,
      role: purpose === "hero" ? "hero" : "section",
      placement: PLACEMENT_BY_PURPOSE[purpose] || "section visual",
      subject: params.policy.heroShotSeed.split(",")[0]?.trim() || purpose,
      scene: `${params.policy.industryId} ${purpose} scene`,
      composition: art.composition,
      lighting: art.lighting,
      cameraPerspective: art.cameraAngle,
      style: ctx.imageStyle,
      colorHarmony: params.policy.colorHarmonyNotes.join("; "),
      storytellingRole: params.policy.storytellingNotes[0] || purpose,
      aspectRatio: purpose === "hero" ? "16:9" : "3:2",
      required: true,
      accessibility: { altText: alt, decorative: false },
      seo: {
        description: seoDescription,
        keywords: [params.policy.industryId, purpose, ctx.projectName],
      },
      providerPrompt: prompt,
      artDirectionSummary: art.summary,
    };
  });
}

/** Map locked ImageSpecifications to engine plan items for generation. */
function purposeToAssetKind(purpose: ImagePurpose): AssetKind {
  switch (purpose) {
    case "hero":
      return "hero";
    case "product":
      return "product";
    case "service":
      return "service";
    case "background":
      return "background";
    case "gallery":
    case "testimonial":
      return "realistic";
    case "section":
      return "section";
    case "brand":
      return "brand";
    default:
      return "realistic";
  }
}

export function imageSpecificationsToPlanItems(
  specifications: ImageSpecification[],
): ImageEnginePlanItem[] {
  return specifications.map((spec) => ({
    id: spec.id,
    kind: purposeToAssetKind(spec.purpose),
    role: spec.role,
    name: `${spec.purpose}-${spec.sectionLabel || spec.id}`,
    prompt: spec.providerPrompt,
    alt: spec.accessibility.altText,
    caption: spec.accessibility.caption,
    seoDescription: spec.seo.description,
    aspectRatio: spec.aspectRatio,
    realistic: true,
    sectionKey: spec.sectionKey,
    metadata: {
      purpose: spec.purpose,
      section: spec.sectionLabel,
      style: spec.style,
      prompt: spec.providerPrompt,
      artDirection: spec.artDirectionSummary,
      visualConcept: spec.visualConcept,
      sectionPurpose: spec.sectionPurpose,
      pagePurpose: spec.pagePurpose,
    },
  }));
}
