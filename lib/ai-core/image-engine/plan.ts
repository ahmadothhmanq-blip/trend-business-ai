import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import { buildImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import {
  buildImageIntelligence,
  composeImagePrompt,
  defaultAspectForPurpose,
  styleFromContext,
} from "@/lib/ai-core/image-engine/intelligence";
import type {
  ImageEnginePlanItem,
  ImagePurpose,
} from "@/lib/ai-core/image-engine/types";

/**
 * Plan professional AI images for every major website surface:
 * hero, product, service, background, gallery, section, testimonial.
 */
export function planWebsiteImages(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  preferredStyle?: string | null;
  brandIdentity?: BrandIdentityBrief | null;
  maxItems?: number;
}): ImageEnginePlanItem[] {
  const maxItems = params.maxItems ?? 14;
  const ctx = buildImageIntelligence(params);
  const style = styleFromContext(ctx);
  const reqs = ctx.imageRequirements;
  const sections = Array.isArray(params.strategy.sectionPlan)
    ? params.strategy.sectionPlan
    : [];

  const planned: ImageEnginePlanItem[] = [];

  const push = (
    purpose: ImagePurpose,
    opts: {
      id: string;
      name: string;
      role: ImageEnginePlanItem["role"];
      kind?: ImageEnginePlanItem["kind"];
      sectionName?: string;
      shotBrief?: string;
      contentNotes?: string;
      alt?: string;
    },
  ) => {
    const art = buildImageArtDirection({
      purpose,
      ctx,
      brandIdentity: params.brandIdentity,
      sectionName: opts.sectionName,
    });
    const prompt = composeImagePrompt({
      purpose,
      ctx,
      sectionName: opts.sectionName,
      shotBrief: opts.shotBrief,
      contentNotes: opts.contentNotes,
      artDirectionFragment: art.promptFragment,
    });
    planned.push({
      id: opts.id,
      kind: opts.kind ?? purposeToKind(purpose),
      role: opts.role,
      name: opts.name,
      prompt,
      alt: opts.alt ?? opts.name,
      realistic: true,
      aspectRatio: defaultAspectForPurpose(purpose),
      metadata: {
        purpose,
        section: opts.sectionName,
        style,
        prompt,
        artDirection: art.summary,
      },
    });
  };

  push("hero", {
    id: "hero",
    name: "Hero image",
    role: "hero",
    shotBrief: reqs[0],
    contentNotes: sections[0]?.contentNotes,
    alt: `${ctx.projectName} hero`,
  });

  push("product", {
    id: "product",
    name: "Product visual",
    role: "product",
    shotBrief: reqs[1] || reqs[0],
    alt: `${ctx.projectName} product`,
  });

  push("service", {
    id: "service",
    name: "Service visual",
    role: "service",
    shotBrief: reqs[2] || reqs[1] || reqs[0],
    alt: `${ctx.projectName} services`,
  });

  push("background", {
    id: "background",
    name: "Background atmosphere",
    role: "background",
    shotBrief: reqs.find((r) => /background|atmosphere|mood/i.test(r)),
    alt: "Background",
  });

  // Section images from Design Renderer / strategy plan (skip hero-like first).
  const sectionCandidates = sections
    .filter((s) => !/hero/i.test(s.name))
    .slice(0, 3);
  if (sectionCandidates.length) {
    sectionCandidates.forEach((section, index) => {
      push("section", {
        id: `section-${index + 1}`,
        name: `${section.name} visual`,
        role: "section",
        sectionName: section.name,
        shotBrief: reqs[index + 1] || reqs[0],
        contentNotes: section.contentNotes,
        alt: section.name,
      });
    });
  } else {
    for (let i = 0; i < 3; i += 1) {
      push("section", {
        id: `section-${i + 1}`,
        name: `Section visual ${i + 1}`,
        role: "section",
        shotBrief: reqs[i + 1] || reqs[0],
        alt: `${ctx.projectName} section ${i + 1}`,
      });
    }
  }

  // Gallery slots — agency-grade inventory.
  const galleryBriefs = reqs.filter((r) =>
    /gallery|collage|destination|lifestyle|package|tour|vehicle|inventory|car/i.test(
      r,
    ),
  );
  const galleryCount = Math.min(3, Math.max(galleryBriefs.length || 3, 3));
  for (let i = 0; i < galleryCount; i += 1) {
    push("gallery", {
      id: `gallery-${i + 1}`,
      name: `Gallery image ${i + 1}`,
      role: "gallery",
      kind: "realistic",
      shotBrief: galleryBriefs[i] || reqs[i] || reqs[0],
      alt: `${ctx.projectName} gallery ${i + 1}`,
    });
  }

  // Testimonial portraits — required for trust sections.
  for (let i = 0; i < 2; i += 1) {
    push("testimonial", {
      id: `testimonial-${i + 1}`,
      name: `Testimonial portrait ${i + 1}`,
      role: "testimonial",
      kind: "realistic",
      shotBrief: reqs.find((r) => /testimonial|trust|portrait|people/i.test(r)),
      alt: `${ctx.projectName} client portrait ${i + 1}`,
    });
  }

  return planned.slice(0, maxItems);
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
