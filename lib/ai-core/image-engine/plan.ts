import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import { buildImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import {
  buildAccessibleAltText,
  buildImageIntelligence,
  composeImagePrompt,
  defaultAspectForPurpose,
  resolveShotBriefForRole,
  styleFromContext,
} from "@/lib/ai-core/image-engine/intelligence";
import {
  getSectionStrategy,
  inferSectionKey,
  type SectionKey,
} from "@/lib/ai-core/image-engine/section-strategies";
import type {
  DesignPlanImageContext,
  ImageEnginePlanItem,
  ImagePurpose,
  StructuredImageRequirement,
} from "@/lib/ai-core/image-engine/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";

/**
 * Plan professional AI images for every major website surface with
 * section-specific strategies — never reuse hero prompts for all sections.
 */
export function planWebsiteImages(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  preferredStyle?: string | null;
  brandIdentity?: BrandIdentityBrief | null;
  structuredRequirements?: StructuredImageRequirement[];
  designPlanContext?: DesignPlanImageContext;
  maxItems?: number;
  masterPlan?: MasterWebsitePlan | null;
}): ImageEnginePlanItem[] {
  const maxItems = params.maxItems ?? 14;
  const ctx = buildImageIntelligence({
    ...params,
    structuredRequirements: params.structuredRequirements,
    masterPlan: params.masterPlan,
  });
  const style = styleFromContext(ctx);
  const sections = Array.isArray(params.strategy.sectionPlan)
    ? params.strategy.sectionPlan
    : [];
  const designSections = params.designPlanContext?.sections ?? [];
  const usedBriefs = new Set<string>();
  const planned: ImageEnginePlanItem[] = [];
  let varietyIndex = 0;

  const push = (
    purpose: ImagePurpose,
    opts: {
      id: string;
      name: string;
      role: ImageEnginePlanItem["role"];
      kind?: ImageEnginePlanItem["kind"];
      sectionName?: string;
      sectionKey?: SectionKey;
      shotBrief?: string;
      contentNotes?: string;
    },
  ) => {
    const sectionKey =
      opts.sectionKey ||
      inferSectionKey(opts.sectionName || purpose);
    const shotBrief =
      opts.shotBrief ||
      resolveShotBriefForRole(ctx, purpose, sectionKey, varietyIndex, usedBriefs);
    if (shotBrief) {
      usedBriefs.add(shotBrief);
      varietyIndex += 1;
    }

    const art = buildImageArtDirection({
      purpose,
      ctx,
      brandIdentity: params.brandIdentity,
      sectionName: opts.sectionName || sectionKey,
    });
    const prompt = composeImagePrompt({
      purpose,
      ctx,
      sectionName: opts.sectionName,
      sectionKey,
      shotBrief,
      contentNotes: opts.contentNotes,
      artDirectionFragment: art.promptFragment,
      varietyIndex,
    });
    const accessibility = buildAccessibleAltText({
      ctx,
      purpose,
      sectionName: opts.sectionName,
      sectionKey,
      shotBrief,
    });
    const strategy = getSectionStrategy(sectionKey);

    planned.push({
      id: opts.id,
      kind: opts.kind ?? purposeToKind(purpose),
      role: opts.role,
      name: opts.name,
      prompt,
      alt: accessibility.alt,
      caption: accessibility.caption,
      seoDescription: accessibility.seoDescription,
      realistic: true,
      aspectRatio: defaultAspectForPurpose(purpose, sectionKey),
      sectionKey,
      metadata: {
        purpose,
        section: opts.sectionName || sectionKey,
        style,
        prompt,
        artDirection: art.summary,
      },
    });
  };

  // Hero — always first, wide cinematic.
  const heroSection = designSections.find((s) =>
    /hero/i.test(s.key || s.label),
  );
  push("hero", {
    id: "hero",
    name: "Hero image",
    role: "hero",
    sectionKey: "hero",
    sectionName: heroSection?.label || sections[0]?.name,
    shotBrief: resolveShotBriefForRole(ctx, "hero", "hero", 0, usedBriefs),
    contentNotes: sections[0]?.contentNotes || heroSection?.purpose,
  });

  // Core photographic roles with distinct section strategies.
  push("product", {
    id: "product",
    name: "Product visual",
    role: "product",
    sectionKey: "features",
    shotBrief: resolveShotBriefForRole(ctx, "product", "features", varietyIndex, usedBriefs),
  });

  push("service", {
    id: "service",
    name: "Service visual",
    role: "service",
    sectionKey: "services",
    shotBrief: resolveShotBriefForRole(ctx, "service", "services", varietyIndex, usedBriefs),
  });

  push("background", {
    id: "background",
    name: "Background atmosphere",
    role: "background",
    sectionKey: "cta",
    shotBrief: resolveShotBriefForRole(ctx, "background", "cta", varietyIndex, usedBriefs),
  });

  // Section images from design plan / strategy — each gets unique section key.
  const sectionSources =
    designSections.length > 0
      ? designSections
          .filter((s) => !/hero/i.test(s.key || s.label))
          .map((s) => ({
            name: s.label,
            key: s.key,
            contentNotes: s.purpose,
            assetRole: s.assetRole,
          }))
      : sections
          .filter((s) => !/hero/i.test(s.name))
          .map((s) => ({
            name: s.name,
            key: s.name,
            contentNotes: s.contentNotes,
            assetRole: undefined as string | undefined,
          }));

  const sectionKeysSeen = new Set<SectionKey>();
  const sectionCandidates = sectionSources.slice(0, 5);

  if (sectionCandidates.length) {
    sectionCandidates.forEach((section, index) => {
      const sectionKey = inferSectionKey(section.key || section.name);
      sectionKeysSeen.add(sectionKey);
      const purpose = sectionKeyToPurpose(sectionKey, section.assetRole);
      push(purpose, {
        id: `section-${sectionKey}-${index + 1}`,
        name: `${section.name} visual`,
        role: purposeToRole(purpose),
        sectionName: section.name,
        sectionKey,
        contentNotes: section.contentNotes,
        shotBrief: resolveShotBriefForRole(
          ctx,
          purpose,
          sectionKey,
          varietyIndex,
          usedBriefs,
        ),
      });
    });
  } else {
    const fallbackSections: SectionKey[] = ["about", "features", "contact"];
    fallbackSections.forEach((sectionKey, index) => {
      push("section", {
        id: `section-${sectionKey}-${index + 1}`,
        name: `${sectionKey} visual`,
        role: "section",
        sectionKey,
        shotBrief: resolveShotBriefForRole(
          ctx,
          "section",
          sectionKey,
          varietyIndex,
          usedBriefs,
        ),
      });
    });
  }

  // Gallery — diverse industry shots, never duplicate briefs.
  const galleryCount = 3;
  for (let i = 0; i < galleryCount; i += 1) {
    const galleryKey: SectionKey = i % 2 === 0 ? "gallery" : "portfolio";
    push("gallery", {
      id: `gallery-${i + 1}`,
      name: `Gallery image ${i + 1}`,
      role: "gallery",
      kind: "realistic",
      sectionKey: galleryKey,
      shotBrief: resolveShotBriefForRole(
        ctx,
        "gallery",
        galleryKey,
        varietyIndex + i,
        usedBriefs,
      ),
    });
  }

  // Testimonial portraits — distinct from team section.
  for (let i = 0; i < 2; i += 1) {
    push("testimonial", {
      id: `testimonial-${i + 1}`,
      name: `Testimonial portrait ${i + 1}`,
      role: "testimonial",
      kind: "realistic",
      sectionKey: "testimonials",
      shotBrief: resolveShotBriefForRole(
        ctx,
        "testimonial",
        "testimonials",
        varietyIndex + i,
        usedBriefs,
      ),
    });
  }

  // Optional footer background if room in budget.
  if (planned.length < maxItems) {
    push("background", {
      id: "footer-background",
      name: "Footer atmosphere",
      role: "background",
      sectionKey: "footer",
      shotBrief: resolveShotBriefForRole(
        ctx,
        "background",
        "footer",
        varietyIndex,
        usedBriefs,
      ),
    });
  }

  return dedupeSimilarPrompts(planned).slice(0, maxItems);
}

function sectionKeyToPurpose(
  sectionKey: SectionKey,
  assetRole?: string,
): ImagePurpose {
  if (assetRole) {
    const r = assetRole.toLowerCase();
    if (r === "hero") return "hero";
    if (r === "product") return "product";
    if (r === "service") return "service";
    if (r === "gallery") return "gallery";
    if (r === "testimonial") return "testimonial";
    if (r === "background") return "background";
  }
  switch (sectionKey) {
    case "services":
      return "service";
    case "gallery":
    case "portfolio":
      return "gallery";
    case "testimonials":
      return "testimonial";
    case "pricing":
    case "faq":
    case "cta":
    case "footer":
      return "background";
    default:
      return "section";
  }
}

function purposeToRole(
  purpose: ImagePurpose,
): ImageEnginePlanItem["role"] {
  return purpose as ImageEnginePlanItem["role"];
}

function purposeToKind(
  purpose: ImagePurpose,
): ImageEnginePlanItem["kind"] {
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

/** Remove near-duplicate prompts to increase visual variety. */
function dedupeSimilarPrompts(
  items: ImageEnginePlanItem[],
): ImageEnginePlanItem[] {
  const seen = new Set<string>();
  return items.map((item) => {
    const fingerprint = item.prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 5)
      .slice(0, 12)
      .join(" ");
    if (seen.has(fingerprint)) {
      const varied = {
        ...item,
        prompt: `${item.prompt} Unique angle variant ${item.id}, distinct composition.`,
      };
      return varied;
    }
    seen.add(fingerprint);
    return item;
  });
}
