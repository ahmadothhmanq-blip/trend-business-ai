import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import {
  imageStyleFragment,
  resolveImageEngineStyle,
} from "@/lib/ai-core/image-engine/styles";
import {
  aspectForSection,
  buildSectionPromptSeed,
  designToneFragment,
  imageQualityGuardrails,
  inferSectionKey,
  resolveIndustryVisualBrief,
  type SectionKey,
} from "@/lib/ai-core/image-engine/section-strategies";
import type {
  ImageIntelligenceContext,
  ImagePurpose,
  StructuredImageRequirement,
} from "@/lib/ai-core/image-engine/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

/**
 * Build image intelligence context from Industry Intelligence,
 * Brand Identity, Premium Design System, Smart Templates, and Design Renderer.
 */
export function buildImageIntelligence(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  preferredStyle?: string | null;
  brandIdentity?: BrandIdentityBrief | null;
  structuredRequirements?: StructuredImageRequirement[];
  masterPlan?: MasterWebsitePlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
}): ImageIntelligenceContext {
  const master = params.masterPlan;
  const businessProfile = params.businessProfile ?? null;
  const intel = params.templateSelection?.industryIntelligence;
  const premium = params.designSystem.premium;
  const premiumTpl = params.templateSelection?.designConfiguration
    ?.premiumTemplate as
    | {
        brandStyle?: string;
        designStyle?: string;
        imageRequirements?: Array<
          { role?: string; brief?: string } | string
        >;
      }
    | undefined;
  const audience =
    params.profile?.targetAudience ||
    params.strategy.contentStrategy?.brandVoice ||
    "discerning customers";

  const premiumStructured: StructuredImageRequirement[] = Array.isArray(
    premiumTpl?.imageRequirements,
  )
    ? premiumTpl.imageRequirements
        .map((row) => {
          if (typeof row === "string") {
            return { role: "section" as const, brief: row };
          }
          const role = normalizeRole(row.role);
          return {
            role,
            brief: typeof row.brief === "string" ? row.brief : "",
            sectionKey: roleToSectionKey(role),
          };
        })
        .filter((r) => r.brief)
    : [];

  const premiumImageReqs = premiumStructured.map((r) => r.brief);

  const brand = params.brandIdentity;
  const imageStyle = resolveImageEngineStyle({
    preferred:
      params.preferredStyle ||
      brand?.imageDirection ||
      premiumTpl?.brandStyle,
    premiumStyleId: brand?.premiumStyleId || premium?.styleId,
    designStyle: params.designSystem.style,
    designPreset:
      params.designSystem.stylePreset ||
      params.templateSelection?.designPreset,
    industryDesignStyle: premiumTpl?.designStyle || intel?.designStyle,
  });

  const structuredRequirements =
    params.structuredRequirements?.length
      ? params.structuredRequirements
      : premiumStructured.length > 0
        ? premiumStructured
        : undefined;

  const lockedImageKeywords =
    master?.locked.images && master.imageKeywords.length
      ? master.imageKeywords
      : null;

  return {
    businessType:
      businessProfile?.industry ||
      master?.businessType ||
      params.profile?.industry ||
      intel?.label ||
      "business",
    industry:
      businessProfile?.routingIndustryId ||
      (master?.industry && String(master.industry)) ||
      params.profile?.industry ||
      intel?.industryPattern ||
      params.designSystem.industryPattern ||
      "general",
    brandStyle:
      master?.style ||
      brand?.strategy.brandStyle ||
      premiumTpl?.brandStyle ||
      premium?.label ||
      params.designSystem.style ||
      intel?.designStyle ||
      "premium",
    designStyle:
      master?.imageStyle ||
      premiumTpl?.designStyle ||
      intel?.designStyle ||
      params.designSystem.style,
    designPreset:
      String(params.designSystem.stylePreset || "") ||
      params.templateSelection?.designPreset ||
      "modern",
    targetAudience: brand?.strategy.targetAudience || audience,
    offer: params.profile?.offer || params.strategy.positioning,
    projectName:
      brand?.brandName || params.profile?.projectName || "Brand",
    imageStyle,
    imageRequirements:
      lockedImageKeywords ??
      (businessProfile?.photographyStyle.length
        ? businessProfile.photographyStyle
        : premiumImageReqs.length > 0
          ? premiumImageReqs
          : (intel?.imageRequirements ?? [])),
    structuredRequirements,
    brandImageDirection: brand?.imageDirection,
    templateLabel: params.templateSelection?.label,
    premiumStyleId: brand?.premiumStyleId || premium?.styleId,
    colors: {
      primary: brand?.colors.primary || params.designSystem.colors.primary,
      secondary: brand?.colors.secondary || params.designSystem.colors.secondary,
      accent: brand?.colors.accent || params.designSystem.colors.accent,
    },
    businessProfile,
  };
}

function normalizeRole(
  role?: string,
): StructuredImageRequirement["role"] {
  const r = (role || "section").toLowerCase();
  if (
    r === "hero" ||
    r === "product" ||
    r === "service" ||
    r === "section" ||
    r === "background" ||
    r === "gallery" ||
    r === "testimonial"
  ) {
    return r;
  }
  return "section";
}

function roleToSectionKey(
  role: StructuredImageRequirement["role"],
): SectionKey | undefined {
  switch (role) {
    case "hero":
      return "hero";
    case "product":
      return "features";
    case "service":
      return "services";
    case "gallery":
      return "gallery";
    case "testimonial":
      return "testimonials";
    case "background":
      return "cta";
    default:
      return undefined;
  }
}

/** Resolve role-matched shot brief from structured requirements — never pick template images by existence alone. */
export function resolveShotBriefForRole(
  ctx: ImageIntelligenceContext,
  role: ImagePurpose,
  sectionKey?: SectionKey,
  varietyIndex = 0,
  usedBriefs?: Set<string>,
  sectionLabel?: string,
  contentNotes?: string,
): string | undefined {
  if (contentNotes?.trim() && !usedBriefs?.has(contentNotes)) {
    return contentNotes;
  }

  const structured = ctx.structuredRequirements;
  if (structured?.length) {
    const labelHay = (sectionLabel || "").toLowerCase();
    const bySection = structured.find((r) => {
      if (sectionKey && r.sectionKey === sectionKey) return true;
      if (labelHay && r.brief.toLowerCase().includes(labelHay.slice(0, 12))) {
        return true;
      }
      return labelHay.length > 0 && labelHay.includes((r.role || "").toLowerCase());
    });
    if (bySection?.brief && !usedBriefs?.has(bySection.brief)) {
      return bySection.brief;
    }

    const match = structured.find(
      (r) =>
        r.role === role ||
        (sectionKey && r.sectionKey === sectionKey),
    );
    if (match?.brief && !usedBriefs?.has(match.brief)) {
      return match.brief;
    }
  }

  // Do not fall back to generic template image requirement pools when structured briefs exist.
  if (structured?.length) {
    return resolveIndustryVisualBrief(
      ctx.industry,
      sectionKey || roleToSectionKey(role) || inferSectionKey(role),
      varietyIndex,
      usedBriefs,
      ctx.businessProfile ?? undefined,
    );
  }

  const indexMatch = ctx.imageRequirements[varietyIndex];
  if (indexMatch && !usedBriefs?.has(indexMatch)) {
    return indexMatch;
  }

  if (sectionKey) {
    return resolveIndustryVisualBrief(
      ctx.industry,
      sectionKey,
      varietyIndex,
      usedBriefs,
      ctx.businessProfile ?? undefined,
    );
  }

  return resolveIndustryVisualBrief(
    ctx.industry,
    roleToSectionKey(role) || inferSectionKey(role),
    varietyIndex,
    usedBriefs,
    ctx.businessProfile ?? undefined,
  );
}

/** Compose SEO-friendly alt text for accessibility. */
export function buildAccessibleAltText(params: {
  ctx: ImageIntelligenceContext;
  purpose: ImagePurpose;
  sectionName?: string;
  sectionKey?: SectionKey;
  shotBrief?: string;
}): { alt: string; caption?: string; seoDescription: string } {
  const sectionKey =
    params.sectionKey ||
    inferSectionKey(params.sectionName || params.purpose);
  const sectionLabel = params.sectionName || sectionKey;
  const subject =
    params.shotBrief?.split(",")[0]?.trim() ||
    `${params.ctx.industry} ${params.purpose}`;

  const alt = `${params.ctx.projectName} — ${subject} for ${sectionLabel}`.slice(
    0,
    125,
  );
  const seoDescription = [
    `Professional ${params.ctx.industry} photography for ${params.ctx.projectName}.`,
    `${sectionLabel}: ${subject}.`,
    `Premium ${params.ctx.brandStyle} visual for ${params.ctx.targetAudience}.`,
  ].join(" ");

  const caption =
    params.purpose === "testimonial" || sectionKey === "team"
      ? `${params.ctx.projectName} team and client photography`
      : undefined;

  return { alt, caption, seoDescription };
}

/** Compose a full generation prompt for a purpose + optional shot brief. */
export function composeImagePrompt(params: {
  purpose: ImagePurpose;
  ctx: ImageIntelligenceContext;
  sectionName?: string;
  sectionKey?: SectionKey;
  shotBrief?: string;
  contentNotes?: string;
  artDirectionFragment?: string;
  varietyIndex?: number;
}): string {
  const sectionKey =
    params.sectionKey ||
    inferSectionKey(params.sectionName || params.purpose);
  const styleFrag = imageStyleFragment(params.ctx.imageStyle);
  const toneFrag = designToneFragment(
    params.ctx.designStyle,
    params.ctx.designPreset,
    params.ctx.brandStyle,
  );
  const shotBrief =
    params.shotBrief ||
    resolveIndustryVisualBrief(
      params.ctx.industry,
      sectionKey,
      params.varietyIndex ?? 0,
      undefined,
      params.ctx.businessProfile ?? undefined,
    );

  const forbiddenFragment =
    params.ctx.businessProfile?.forbiddenSubjects.length
      ? `Never show: ${params.ctx.businessProfile.forbiddenSubjects.slice(0, 8).join(", ")}.`
      : "";

  const sectionSeed = buildSectionPromptSeed(
    sectionKey,
    params.ctx.projectName,
    params.ctx.industry,
    shotBrief,
  );

  return [
    sectionSeed,
    `Business type: ${params.ctx.businessType}.`,
    `Offer: ${params.ctx.offer}.`,
    `Brand personality: ${params.ctx.brandStyle}.`,
    `Design tone: ${toneFrag}.`,
    `Visual style: ${styleFrag}.`,
    params.ctx.brandImageDirection
      ? `Brand image direction: ${params.ctx.brandImageDirection}.`
      : "",
    params.artDirectionFragment
      ? `Art direction: ${params.artDirectionFragment}.`
      : "",
    params.contentNotes
      ? `Section narrative: ${params.contentNotes}.`
      : "",
    params.ctx.templateLabel
      ? `Template: ${params.ctx.templateLabel}.`
      : "",
    forbiddenFragment,
    `Color palette mood: ${params.ctx.colors.primary}, ${params.ctx.colors.secondary}${params.ctx.colors.accent ? `, ${params.ctx.colors.accent}` : ""}.`,
    `Target audience: ${params.ctx.targetAudience}.`,
    imageQualityGuardrails(),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function defaultAspectForPurpose(
  purpose: ImagePurpose,
  sectionKey?: SectionKey,
): import("@/lib/ai-core/assets/settings").ImageAspectRatio {
  if (sectionKey) {
    return aspectForSection(sectionKey);
  }
  switch (purpose) {
    case "hero":
    case "background":
      return "16:9";
    case "gallery":
    case "section":
      return "3:2";
    case "product":
    case "service":
      return "1:1";
    case "testimonial":
      return "1:1";
    default:
      return "16:9";
  }
}

export function styleFromContext(ctx: ImageIntelligenceContext): ImageStylePreset {
  return ctx.imageStyle;
}
