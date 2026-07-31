/**
 * Build an approved Visual Design Plan before any website code is generated.
 */

import { brandIdentityPlanSeeds } from "@/lib/ai-core/brand-identity/apply";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import { getDesignPreset } from "@/lib/ai-core/design-system/presets";
import { buildPremiumDesignSystem } from "@/lib/ai-core/design-system/premium";
import type {
  DesignPlanImageRequirement,
  DesignPlanSection,
  VisualDesignPlan,
} from "@/lib/ai-core/design-plan/types";
import {
  buildVisualIdentityLabel,
  hashSeed,
  pickUniqueHeroTreatment,
  pickUniqueSectionLayout,
  uniquifySectionOrder,
} from "@/lib/ai-core/design-plan/uniqueness";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateDNAProfile } from "@/lib/ai-core/template-intelligence/template-dna";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

function slugKey(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return base || `section-${index + 1}`;
}

function kindHintFromLabel(label: string): string {
  const l = label.toLowerCase();
  if (/hero/.test(l)) return "hero";
  if (/feature storytelling|narrative|chapter/.test(l)) return "feature-story";
  if (/interactive product|product stage|showroom/.test(l)) {
    return "interactive-product";
  }
  if (/case stud/.test(l)) return "case-studies";
  if (/brand trust|credibility|logo/.test(l)) return "brand-trust";
  if (/timeline|process|journey/.test(l)) return "timeline";
  if (/comparison|compare|versus|\bvs\b/.test(l)) return "comparison";
  if (/video|film|watch/.test(l)) return "video";
  if (/gallery experience|atmosphere gallery/.test(l)) return "gallery-experience";
  if (/destin|tour|package|listing|inventory|product|menu|collection/.test(l)) {
    return "interactive-product";
  }
  if (/service|care|offer/.test(l)) return "services";
  if (/feature|why|benefit|bento|capabilit/.test(l)) return "feature-story";
  if (/galler|atmosphere|visual|portfolio|work/.test(l)) {
    return "gallery-experience";
  }
  if (/testimonial|review|proof|trust/.test(l)) return "brand-trust";
  if (/pric|plan|tier/.test(l)) return "pricing";
  if (/team|doctor|staff|expert/.test(l)) return "team";
  if (/faq|question/.test(l)) return "faq";
  if (/book|reserv|appoint|demo/.test(l)) return "booking";
  if (/contact|inquiry/.test(l)) return "contact";
  if (/map|location/.test(l)) return "maps";
  if (/cta|get started/.test(l)) return "cta";
  return "feature-story";
}

function assetRoleForKind(
  kind: string,
): DesignPlanSection["assetRole"] {
  if (kind === "hero") return "hero";
  if (
    kind === "product-showcase" ||
    kind === "interactive-product"
  ) {
    return "product";
  }
  if (kind === "services") return "service";
  if (kind === "gallery" || kind === "gallery-experience" || kind === "video") {
    return "gallery";
  }
  if (
    kind === "testimonials" ||
    kind === "features" ||
    kind === "feature-story" ||
    kind === "case-studies" ||
    kind === "brand-trust" ||
    kind === "timeline" ||
    kind === "comparison"
  ) {
    return "section";
  }
  return undefined;
}

const NAV_COMPONENTS = new Set<DesignRendererComponentId>([
  "SiteHeader",
  "SiteHeaderTransparent",
  "NavModern",
]);
const FOOTER_COMPONENTS = new Set<DesignRendererComponentId>([
  "SiteFooter",
  "SiteFooterMinimal",
  "SiteFooterEditorial",
]);

function bodyComponentsFromDna(
  dna: TemplateDNAProfile,
): DesignRendererComponentId[] {
  return dna.components.filter(
    (c) => !NAV_COMPONENTS.has(c) && !FOOTER_COMPONENTS.has(c),
  );
}

/** Map Template DNA section order → explicit component ids (true templates, not themes). */
function buildSectionsFromTemplateDna(
  dna: TemplateDNAProfile,
): DesignPlanSection[] {
  const body = bodyComponentsFromDna(dna);
  return dna.sectionOrder.map((label, index) => {
    const kindHint = kindHintFromLabel(label);
    const componentId = body[index] ?? body[body.length - 1];
    return {
      key: slugKey(label, index),
      label,
      purpose: `Deliver ${label.toLowerCase()} · ${dna.componentProfile}`,
      priority: index,
      kindHint,
      componentId,
      assetRole: assetRoleForKind(kindHint),
    };
  });
}

function buildSections(
  intelligence: DesignIntelligenceBrief,
  strategy?: CoreProductStrategy | null,
  seed = 0,
): DesignPlanSection[] {
  const labels =
    intelligence.sectionStructure?.length
      ? intelligence.sectionStructure
      : strategy?.contentStructure?.length
        ? strategy.contentStructure
        : [
            "Hero",
            "Services",
            "Social proof",
            "CTA",
            "Contact",
          ];

  const mapped: DesignPlanSection[] = labels.map((label, index) => {
    const kindHint = kindHintFromLabel(label);
    return {
      key: slugKey(label, index),
      label,
      purpose: `Deliver ${label.toLowerCase()} with premium hierarchy and clear next step`,
      priority: index,
      kindHint,
      assetRole: assetRoleForKind(kindHint),
    };
  });

  // Ensure hero exists
  if (!mapped.some((s) => s.kindHint === "hero")) {
    mapped.unshift({
      key: "hero",
      label: "Signature hero",
      purpose: "Establish brand atmosphere and primary conversion action",
      priority: 0,
      kindHint: "hero",
      assetRole: "hero",
    });
  }

  return uniquifySectionOrder(mapped, seed).map((s, index) => ({
    ...s,
    priority: index,
  }));
}

function buildImageRequirements(
  sections: DesignPlanSection[],
  imageStyle: string,
): DesignPlanImageRequirement[] {
  const reqs: DesignPlanImageRequirement[] = [
    {
      role: "hero",
      purpose: "Dominant full-bleed or editorial hero photography",
      style: `${imageStyle}; cinematic premium lighting; no text overlays in frame`,
      required: true,
      notes: "Must feel agency-shot, never stock-generic or SVG placeholder",
    },
  ];

  const roles = new Set(
    sections.map((s) => s.assetRole).filter(Boolean) as Array<
      NonNullable<DesignPlanSection["assetRole"]>
    >,
  );

  for (const section of sections) {
    const role = section.assetRole;
    if (!role || role === "hero") continue;
    const sectionKey = section.key.toLowerCase();
    reqs.push({
      role,
      purpose: `${role} imagery for "${section.label}" — ${section.purpose}`,
      style: imageStyle,
      required: role === "product" || role === "gallery" || role === "section",
      notes: `Section-specific shot for ${sectionKey}; match section narrative; never reuse hero prompt`,
    });
  }

  for (const role of roles) {
    if (role === "hero") continue;
    if (!reqs.some((r) => r.role === role)) {
      reqs.push({
        role,
        purpose: `${role} imagery supporting section narrative`,
        style: imageStyle,
        required: role === "product" || role === "gallery" || role === "section",
        notes: `Match brand mood; industry-true; role=${role}`,
      });
    }
  }

  for (const role of ["product", "service", "gallery", "section"] as const) {
    if (!reqs.some((r) => r.role === role)) {
      reqs.push({
        role,
        purpose: `${role} imagery for agency-grade section coverage`,
        style: imageStyle,
        required: true,
        notes: `Required photographic role=${role}; no placeholders`,
      });
    }
  }

  if (!reqs.some((r) => r.role === "testimonial")) {
    reqs.push({
      role: "testimonial",
      purpose: "Portrait / lifestyle visuals for social proof",
      style: `${imageStyle}; natural portrait lighting; authentic`,
      required: true,
      notes: "Match brand mood; never generic avatar placeholders",
    });
  }

  reqs.push({
    role: "background",
    purpose: "Atmospheric background or texture plane",
    style: `${imageStyle}; soft depth; subtle`,
    required: true,
    notes: "Premium depth plane — photographic, not flat fill",
  });

  return reqs;
}

export type BuildVisualDesignPlanInput = {
  intelligence: DesignIntelligenceBrief;
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  prompt?: string | null;
  /** Brand Identity Intelligence — seeds colors, type, image, component style. */
  brandIdentity?: BrandIdentityBrief | null;
  /** Template DNA — locks section order and component mapping. */
  templateDna?: TemplateDNAProfile | null;
  /** DIE-locked DesignSystemSpec — seeds colors, type, spacing when present. */
  designSpec?: DesignSystemSpec | null;
};

/**
 * Create a complete visual design plan (colors, type, sections, images, unique identity).
 */
export function buildVisualDesignPlan(
  input: BuildVisualDesignPlanInput,
): VisualDesignPlan {
  const intelligence = input.intelligence;
  const brandName =
    input.profile?.projectName?.trim() ||
    input.strategy?.positioning?.split(/[.|—-]/)[0]?.trim() ||
    "Brand";

  const seed = hashSeed([
    brandName,
    input.industryId,
    input.profile?.offer,
    input.profile?.targetAudience,
    input.strategy?.positioning,
    input.prompt,
    intelligence.premiumStyleId,
  ]);

  const uniquenessSeed = `u${seed.toString(16)}`;
  const dna = input.templateDna;
  const heroTreatment = dna
    ? dna.heroProfile
    : pickUniqueHeroTreatment(
        seed,
        intelligence.allowedHeroVariants?.length
          ? intelligence.allowedHeroVariants
          : [intelligence.heroTreatment],
      );
  const sectionLayout = dna
    ? dna.gridSystem
    : pickUniqueSectionLayout(
        seed,
        intelligence.allowedSectionLayouts?.length
          ? intelligence.allowedSectionLayouts
          : [intelligence.sectionLayout || intelligence.layoutStyle],
      );

  const preset = getDesignPreset(intelligence.enginePreset);
  const brand = input.brandIdentity;
  const brandSeeds = brand ? brandIdentityPlanSeeds(brand) : null;
  const premium = buildPremiumDesignSystem({
    preferredStyle:
      brandSeeds?.preferredStyle || intelligence.premiumStyleId,
    industryId:
      input.industryId || intelligence.industryKey || undefined,
    industryLabel: input.profile?.industry,
    designStyle: intelligence.visualStyle,
    brandTone: brandSeeds?.brandTone || input.profile?.tone,
    layoutStyle: intelligence.layoutStyle || sectionLayout,
    layoutVariationId: intelligence.layoutVariationId,
    heroTreatment,
    sectionLayout,
    seedPrimary: brandSeeds?.seedPrimary || preset.colors.primary,
    seedSecondary: brandSeeds?.seedSecondary || preset.colors.secondary,
    seedAccent: brandSeeds?.seedAccent || preset.colors.accent,
  });

  const sections = dna
    ? buildSectionsFromTemplateDna(dna)
    : buildSections(intelligence, input.strategy, seed);
  const imageRequirements = buildImageRequirements(
    sections,
    brandSeeds?.imageStyle || intelligence.imageStyle,
  );

  const visualIdentity = buildVisualIdentityLabel({
    brandName,
    premiumStyleId: intelligence.premiumStyleId,
    seed,
  });

  const antiPatterns = [
    "Never use generic template grids with identical section order for every brand",
    "Never ship SVG gradient placeholders as hero photography",
    "Never use Lorem ipsum or 'Our Services' as the only differentiation",
    "Never place multiple competing CTAs in the first viewport",
    "Never use inset card heroes when full-bleed/editorial is planned",
  ];

  const artDirection = [
    ...(brand?.artDirectionNotes ?? []),
    ...intelligence.artDirectionNotes,
    `Layout variation: ${intelligence.layoutVariationId}`,
    `Hero treatment: ${heroTreatment}`,
    `Section composition: ${sectionLayout}`,
    `Cards: ${intelligence.cardStyle} · Nav: ${intelligence.navigationStyle}`,
    `Visual identity: ${visualIdentity}`,
    brand
      ? `Brand preset: ${brand.presetId} · ${brand.typography.pairing}`
      : null,
    intelligence.colorDirection,
    intelligence.typographyDirection,
  ].filter(Boolean) as string[];

  const summary = `Approved design plan for ${brandName}: ${brand?.presetId || "brand"} · ${intelligence.layoutVariationId} · ${intelligence.premiumStyleId} · ${heroTreatment} · ${sections.length} sections · ${imageRequirements.filter((i) => i.required).length} required images.`;

  const spec = input.designSpec;
  const colorSystem = spec
    ? { ...spec.colorSystem }
    : {
        primary: premium.colors.primary,
        secondary: premium.colors.secondary,
        accent: premium.colors.accent,
        neutral: premium.colors.neutral,
        surface: premium.colors.surface,
        background: premium.colors.background,
        foreground: premium.colors.foreground,
        direction: intelligence.colorDirection,
      };
  const typographySystem = spec
    ? { ...spec.typographySystem }
    : {
        displayFont: premium.typography.displayFont,
        headingFont: premium.typography.headingFont,
        bodyFont: premium.typography.bodyFont,
        direction: intelligence.typographyDirection,
        scaleNotes: premium.typography.notes,
      };

  return {
    id: `design-plan-${uniquenessSeed}`,
    status: "approved",
    approvedAt: new Date().toISOString(),
    brandName,
    industryId: String(
      input.industryId || intelligence.industryKey || "business",
    ),
    visualIdentity,
    uniquenessSeed,
    websiteStyle: {
      premiumStyleId: intelligence.premiumStyleId,
      enginePreset: intelligence.enginePreset,
      layoutStyle: intelligence.layoutStyle || sectionLayout,
      layoutVariationId: intelligence.layoutVariationId,
      heroTreatment,
      sectionLayout,
      cardStyle: intelligence.cardStyle,
      navigationStyle: intelligence.navigationStyle,
      animationStyle: intelligence.animationDirection,
      componentStyle: intelligence.componentStyle,
      density: spec?.spacing.density ?? premium.layout.density,
    },
    colorSystem,
    typographySystem,
    spacingNotes: spec?.spacing.notes ?? intelligence.spacingDirection,
    sectionStructure: sections,
    imageRequirements,
    artDirection,
    antiPatterns,
    intelligence,
    brandIdentity: brand || undefined,
    summary,
  };
}
