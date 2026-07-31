/**
 * Business Identity vs Website Design — template switches rebuild design only.
 *
 * Business Identity (immutable on template switch):
 * business type, industry, company name, logo, content, pages, products/services,
 * generated images, booking forms, contact info, SEO, AI copy.
 *
 * Website Design (fully replaced on template switch):
 * header, nav, hero layout, sections composition, cards, typography, colors, etc.
 */

import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { buildProductionContentPack } from "@/lib/ai-core/content/production-content";
import { getBrandPreset } from "@/lib/ai-core/brand-identity/presets";
import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { DesignSystem } from "@/plugins/website/layers/types";

const DESIGN_SETTING_KEYS = new Set([
  "templateIntelligenceId",
  "templateIntelligenceCategory",
  "templateVisualPreset",
  "websiteThemeId",
  "websiteStructureTemplateId",
]);

export type BusinessIdentitySnapshot = {
  businessProfile: GeneratedWebsiteProject["businessProfile"];
  strategy: GeneratedWebsiteProject["strategy"];
  content: string[];
  seo: string[];
  seoPackage: GeneratedWebsiteProject["seoPackage"];
  assetManifest: GeneratedWebsiteProject["assetManifest"];
  pages: GeneratedWebsiteProject["pages"];
  roadmap: GeneratedWebsiteProject["roadmap"];
  title: string;
  description: string;
  projectKind: GeneratedWebsiteProject["projectKind"];
  identitySettings: Record<string, unknown>;
  productionContent: ProductionContentPack;
};

/** Extract immutable business identity from a generated project. */
export function extractBusinessIdentity(
  project: GeneratedWebsiteProject,
  language?: string | null,
): BusinessIdentitySnapshot {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  const identitySettings: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!DESIGN_SETTING_KEYS.has(key)) {
      identitySettings[key] = value;
    }
  }

  return {
    businessProfile: project.businessProfile
      ? { ...project.businessProfile }
      : undefined,
    strategy: project.strategy ? { ...project.strategy } : undefined,
    content: [...(project.content ?? [])],
    seo: [...(project.seo ?? [])],
    seoPackage: project.seoPackage,
    assetManifest: project.assetManifest,
    pages: [...(project.pages ?? [])],
    roadmap: [...(project.roadmap ?? [])],
    title: project.title,
    description: project.description,
    projectKind: project.projectKind,
    identitySettings,
    productionContent: buildProductionContentFromProject(project, language),
  };
}

/** Re-attach business identity after a design rebuild. */
export function applyBusinessIdentityToProject(
  project: GeneratedWebsiteProject,
  identity: BusinessIdentitySnapshot,
  designSettings?: Record<string, unknown>,
): GeneratedWebsiteProject {
  return {
    ...project,
    businessProfile: identity.businessProfile ?? project.businessProfile,
    strategy: identity.strategy ?? project.strategy,
    content: identity.content.length ? identity.content : project.content,
    seo: identity.seo.length ? identity.seo : project.seo,
    seoPackage: identity.seoPackage ?? project.seoPackage,
    assetManifest: identity.assetManifest ?? project.assetManifest,
    pages: identity.pages.length ? identity.pages : project.pages,
    roadmap: identity.roadmap.length ? identity.roadmap : project.roadmap,
    title: identity.title || project.title,
    description: identity.description || project.description,
    projectKind: identity.projectKind || project.projectKind,
    settings: {
      ...identity.identitySettings,
      ...(designSettings ?? {}),
    } as GeneratedWebsiteProject["settings"],
  };
}

/**
 * Build section content from the existing project only — never generic industry templates.
 */
export function buildProductionContentFromProject(
  project: GeneratedWebsiteProject,
  language?: string | null,
): ProductionContentPack {
  const profile = project.businessProfile;
  const strategy = project.strategy;
  const blocks = (project.content ?? []).filter((c) => c?.trim());

  const industryId =
    profile?.industry ||
    project.designSystem?.industryPattern ||
    "business";

  const heroHeadline =
    project.title?.trim() ||
    profile?.projectName?.trim() ||
    blocks[0] ||
    "Brand";
  const heroSubheadline =
    project.description?.trim() ||
    profile?.summary?.trim() ||
    blocks[1] ||
    "";
  const primaryCta =
    strategy?.ctas?.[0] ||
    strategy?.pages?.[0]?.primaryCta ||
    "Get started";
  const secondaryCta = strategy?.ctas?.[1] || "Learn more";

  const serviceDescriptions =
    strategy?.sectionPlan
      ?.filter((s) => /service|menu|care|package|listing|product/i.test(s.name))
      .map((s) => s.contentNotes || s.goal)
      .filter(Boolean)
      .slice(0, 6) ||
    blocks.slice(2, 5);

  const contentBlocks =
    blocks.length > 2 ? blocks.slice(2) : blocks.slice(1);

  const pack = buildProductionContentPack(
    {
      industryId,
      heroHeadline,
      heroSubheadline,
      primaryCta,
      secondaryCta,
      serviceDescriptions:
        serviceDescriptions.length > 0
          ? serviceDescriptions
          : blocks.slice(2, 5).length
            ? blocks.slice(2, 5)
            : [heroSubheadline || profile?.offer || ""].filter(Boolean),
      trustLine:
        strategy?.contentStrategy?.proofPoints?.[0] ||
        profile?.summary ||
        heroSubheadline,
      contentBlocks:
        contentBlocks.length > 0
          ? contentBlocks
          : [heroSubheadline].filter(Boolean),
    },
    profile?.projectName || project.title,
    language,
  );

  if (strategy?.sectionPlan?.length) {
    const services = strategy.sectionPlan
      .filter((s) => /service|menu|care|package|offering/i.test(s.name))
      .slice(0, 6)
      .map((s, i) => ({
        title: s.name,
        body: s.contentNotes || s.goal || blocks[i + 2] || "",
        cta: primaryCta,
      }));
    if (services.length) pack.services = services;

    const features = strategy.sectionPlan
      .filter((s) => /feature|benefit|why|highlight/i.test(s.name))
      .slice(0, 6)
      .map((s, i) => ({
        title: s.name,
        body: s.contentNotes || s.goal || blocks[i + 3] || "",
      }));
    if (features.length) pack.features = features;

    const testimonials = strategy.sectionPlan
      .filter((s) => /testimonial|review|proof|trust/i.test(s.name))
      .slice(0, 4)
      .map((s, i) => ({
        quote: s.contentNotes || s.goal,
        name: `Client ${i + 1}`,
        role: profile?.industry?.replace(/-/g, " ") || "Customer",
      }));
    if (testimonials.length) pack.testimonials = testimonials;
  }

  if (blocks.length) {
    pack.heroHeadline = heroHeadline;
    pack.heroSubheadline = heroSubheadline;
    pack.primaryCta = primaryCta;
    pack.secondaryCta = secondaryCta;
    pack.brandTagline = heroSubheadline || pack.brandTagline;
  }

  return pack;
}

/** Patch only visual design fields on designSystem — preserve business industry pattern. */
export function patchDesignSystemVisualOnly(
  current: DesignSystem | undefined,
  template: TemplateIntelligenceDefinition,
): DesignSystem {
  const preset = getBrandPreset(template.brandPresetId);
  const colors = {
    primary: template.colors.primary,
    secondary: template.colors.secondary,
    accent: template.colors.accent,
    neutral: preset.colors.neutral,
    surface: template.colors.surface,
    background: template.colors.background,
    foreground: template.colors.foreground,
  };
  const typography = {
    headingFont: template.typography.heading,
    bodyFont: template.typography.body,
    scale: current?.typography?.scale || [
      "display",
      "h1",
      "h2",
      "body",
      "small",
    ],
    notes: `${template.typography.display} / ${template.typography.body}`,
  };

  if (!current) {
    return {
      style: template.designStyle,
      stylePreset: template.designPreset as DesignSystem["stylePreset"],
      industryPattern: "business",
      colors,
      typography,
      layoutRules: [
        `${template.layoutStructure} layout`,
        `${template.animations.label} motion`,
      ],
      layoutStyle: template.layoutStructure,
      uiPatterns: template.components.map(String),
      componentPalette: template.components.map(String),
      homeComponentOrder: template.components.map(String),
      spacingScale: [
        preset.spacing.sectionYMobile,
        preset.spacing.sectionY,
        preset.spacing.containerMax,
      ],
      borderRadius: "1rem",
      shadowStyle: "soft premium",
    };
  }

  return {
    ...current,
    style: template.designStyle,
    stylePreset: template.designPreset as DesignSystem["stylePreset"],
    colors: { ...current.colors, ...colors },
    typography: { ...current.typography, ...typography },
    layoutStyle: template.layoutStructure,
    componentPalette: template.components.map(String),
    homeComponentOrder: template.components.map(String),
    uiPatterns: Array.from(
      new Set([
        ...template.components.map(String),
        ...(current.uiPatterns || []),
      ]),
    ),
    layoutRules: [
      `${template.layoutStructure} layout`,
      `${template.animations.label} motion`,
    ],
  };
}
