import { getBrandPreset } from "@/lib/ai-core/brand-identity/presets";
import { injectProfessionalComponents } from "@/lib/ai-core/components/inject";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import {
  applyBusinessIdentityToProject,
  extractBusinessIdentity,
  patchDesignSystemVisualOnly,
} from "@/lib/ai-core/template-intelligence/business-identity";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import {
  resolveComponentsForIndustryAndTemplate,
  resolveVerticalPaletteId,
} from "@/lib/ai-core/template-intelligence/industry-palettes";
import {
  resolveTemplateDNA,
} from "@/lib/ai-core/template-intelligence/template-dna";
import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";
import {
  buildTemplateVisualCss,
  resolveTemplateVisualPreset,
} from "@/lib/ai-core/template-intelligence/visual-preset";
import {
  resolveLocaleFromLanguage,
  applyLocaleToWebsiteFiles,
} from "@/lib/ai-core/website-design-platform/i18n";
import { resolveThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { DesignSystem } from "@/plugins/website/layers/types";

const PRESERVE_PATH_PREFIXES = [
  "lib/site-images",
  "lib/site-videos",
  "public/",
  "content/",
  "data/",
];

function setCssVar(css: string, name: string, value: string): string {
  const re = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
  if (re.test(css)) return css.replace(re, `$1${value}$3`);
  if (css.includes(":root")) {
    return css.replace(/:root\s*\{/, `:root {\n  --${name}: ${value};`);
  }
  return `${css}\n:root { --${name}: ${value}; }\n`;
}

function applyTokensToGlobals(
  files: GeneratedProjectFile[],
  template: TemplateIntelligenceDefinition,
): GeneratedProjectFile[] {
  const preset = getBrandPreset(template.brandPresetId);
  const idx = files.findIndex(
    (f) => f.path === "app/globals.css" || f.path.endsWith("/globals.css"),
  );
  if (idx < 0) return files;
  let css = files[idx]!.content;
  css = setCssVar(css, "color-primary", template.colors.primary);
  css = setCssVar(css, "color-secondary", template.colors.secondary);
  css = setCssVar(css, "color-accent", template.colors.accent);
  css = setCssVar(css, "color-background", template.colors.background);
  css = setCssVar(css, "color-foreground", template.colors.foreground);
  css = setCssVar(css, "color-surface", template.colors.surface);
  css = setCssVar(
    css,
    "font-display",
    `"${template.typography.display}", Georgia, serif`,
  );
  css = setCssVar(
    css,
    "font-heading",
    `"${template.typography.heading}", Georgia, serif`,
  );
  css = setCssVar(
    css,
    "font-body",
    `"${template.typography.body}", system-ui, sans-serif`,
  );
  css = setCssVar(css, "section-y", preset.spacing.sectionY);
  css = setCssVar(css, "section-y-mobile", preset.spacing.sectionYMobile);
  css = setCssVar(css, "container-max", preset.spacing.containerMax);
  css = setCssVar(css, "ease-premium", "cubic-bezier(0.22, 1, 0.36, 1)");

  if (!css.includes("Template Intelligence")) {
    css += `

/* Template Intelligence — ${template.id} · ${template.category} */
:root {
  --ti-template: "${template.id}";
  --ti-category: "${template.category}";
  --ti-animation: "${template.animations.id}";
}
`;
  }

  const visualBlock = buildTemplateVisualCss(template);
  if (!css.includes("Template Visual Preset")) {
    css += `\n${visualBlock}\n`;
  } else {
    css = css.replace(
      /\/\* Template Visual Preset[\s\S]*?(?=\n\/\*|$)/,
      visualBlock.trim(),
    );
  }

  const next = [...files];
  next[idx] = { ...next[idx]!, content: css };
  return next;
}

function patchDesignSystem(
  current: DesignSystem | undefined,
  template: TemplateIntelligenceDefinition,
): DesignSystem {
  const preset = getBrandPreset(template.brandPresetId);
  const base = current;
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
    scale: base?.typography?.scale || ["display", "h1", "h2", "body", "small"],
    notes: `${template.typography.display} / ${template.typography.body} · ${template.category}`,
  };

  if (!base) {
    return {
      style: template.designStyle,
      stylePreset: template.designPreset,
      industryPattern:
        template.industry === "multi" ? "business" : template.industry,
      colors,
      typography,
      layoutRules: [
        `${template.layoutStructure} layout`,
        `${template.animations.label} motion`,
      ],
      layoutStyle: template.layoutStructure,
      uiPatterns: template.components.map(String),
      componentPalette: template.components.map(String),
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
    ...base,
    style: template.designStyle,
    stylePreset: template.designPreset,
    industryPattern:
      base.industryPattern && base.industryPattern !== "business"
        ? base.industryPattern
        : template.industry === "multi"
          ? base.industryPattern || "business"
          : template.industry,
    colors: { ...base.colors, ...colors },
    typography: { ...base.typography, ...typography },
    layoutStyle: template.layoutStructure,
    componentPalette: template.components.map(String),
    uiPatterns: Array.from(
      new Set([...(base.uiPatterns || []), ...template.components.map(String)]),
    ),
  };
}

function shouldPreserveFile(path: string): boolean {
  if (PRESERVE_PATH_PREFIXES.some((p) => path.startsWith(p) || path.includes(p))) {
    return true;
  }
  // Keep secondary content pages (models/inventory/blog) — business routes unchanged
  if (
    path.startsWith("app/") &&
    path !== "app/page.tsx" &&
    path !== "app/globals.css" &&
    path !== "app/layout.tsx" &&
    !path.includes("/components/")
  ) {
    return true;
  }
  return false;
}

function extractPreservedHeroContent(
  project: GeneratedWebsiteProject,
  fallback: ProductionContentPack,
): {
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  heroEyebrow: string;
  content: ProductionContentPack;
} {
  const strategy = project.strategy;
  const profile = project.businessProfile;
  const primaryCta =
    strategy?.ctas?.[0] ||
    strategy?.pages?.[0]?.primaryCta ||
    fallback.primaryCta;
  const secondaryCta =
    strategy?.ctas?.[1] || fallback.secondaryCta;

  const heroHeadline =
    project.title?.trim() ||
    profile?.projectName?.trim() ||
    fallback.heroHeadline;
  const heroSubheadline =
    project.description?.trim() ||
    profile?.summary?.trim() ||
    fallback.heroSubheadline;
  const heroEyebrow =
    profile?.industry?.replace(/-/g, " ") ||
    fallback.heroEyebrow;

  const merged: ProductionContentPack = {
    ...fallback,
    heroHeadline,
    heroSubheadline,
    primaryCta,
    secondaryCta,
    heroEyebrow,
    brandTagline: heroSubheadline || fallback.brandTagline,
  };

  if (project.content?.length) {
    const blocks = project.content.filter((c) => c?.trim());
    if (blocks[0] && blocks[0] !== heroHeadline) {
      merged.heroSubheadline = blocks[0];
    }
    merged.services = merged.services.map((svc, i) => {
      const body = blocks[i + 1];
      return body ? { ...svc, body } : svc;
    });
    merged.features = merged.features.map((feat, i) => {
      const body = blocks[i + 2];
      return body ? { ...feat, body } : feat;
    });
  }

  return {
    heroHeadline,
    heroSubheadline,
    primaryCta,
    secondaryCta,
    heroEyebrow,
    content: merged,
  };
}

/**
 * Apply Template Intelligence selection onto a Core brief (pre-generation).
 */
export function applyTemplateIntelligenceToBrief(
  brief: CoreBrief,
  template: TemplateIntelligenceDefinition,
): CoreBrief {
  const meta = { ...(brief.metadata || {}) };
  const industryId =
    (typeof meta.industryId === "string" && meta.industryId) ||
    (typeof meta.industry === "string" && meta.industry) ||
    undefined;
  const haystack = [brief.prompt, brief.theme, industryId].filter(Boolean).join(" ");
  const templateDna = resolveTemplateDNA(template);
  const resolvedComponents = templateDna.components.length
    ? [...templateDna.components]
    : resolveComponentsForIndustryAndTemplate(template, industryId, haystack);
  const paletteId = resolveVerticalPaletteId(industryId, haystack);

  meta.templateIntelligenceId = template.id;
  meta.templateIntelligenceCategory = template.category;
  meta.templateVisualPalette = paletteId;
  meta.templateDna = templateDna;
  if (industryId) meta.industryId = industryId;
  meta.designPreset = template.designPreset;
  meta.brandStyle = template.designStyle;
  meta.designStyle = template.designStyle;
  meta.preferredStyle = template.category.toLowerCase();
  if (template.premiumTemplateId) {
    meta.premiumTemplateId = template.premiumTemplateId;
    meta.templateId = template.premiumTemplateId;
  }
  meta.designSystemHints = {
    primary: template.colors.primary,
    secondary: template.colors.secondary,
    accent: template.colors.accent,
    background: template.colors.background,
    foreground: template.colors.foreground,
    displayFont: template.typography.display,
    bodyFont: template.typography.body,
  };
  meta.preferredComponents = resolvedComponents;
  meta.templateAnimations = template.animations;
  meta.layoutStyle = template.layoutStructure;
  meta.templateSectionOrder = templateDna.sectionOrder;
  meta.templateHeroProfile = templateDna.heroProfile;
  meta.templateNavigationProfile = templateDna.navigationProfile;

  const themeBits = [
    template.colors.primary,
    template.designStyle,
    template.category,
  ].join(" ");

  return {
    ...brief,
    theme: brief.theme ? `${brief.theme} ${themeBits}` : themeBits,
    metadata: meta,
  };
}

export type RethemeResult = {
  project: GeneratedWebsiteProject;
  template: TemplateIntelligenceDefinition;
  notes: string[];
};

/**
 * Switch website design template — full visual rebuild, 100% business identity preserved.
 * Replaces header, hero layout, navigation, sections, cards, footer, typography, colors, etc.
 */
export function applyTemplateIntelligenceRetheme(params: {
  project: GeneratedWebsiteProject;
  templateId: string;
  language?: string | null;
}): RethemeResult {
  const template = getTemplateIntelligence(params.templateId);
  if (!template) {
    throw new Error(`Unknown template intelligence id: ${params.templateId}`);
  }

  const notes: string[] = [];
  const locale = resolveLocaleFromLanguage(params.language);
  const identity = extractBusinessIdentity(params.project, params.language);
  notes.push("Business identity locked (content, SEO, images, pages, strategy)");

  const originalFiles = params.project.files || [];
  const preserved = originalFiles.filter((f) => shouldPreserveFile(f.path));
  notes.push(`Preserved ${preserved.length} business asset and route files`);

  const profile = identity.businessProfile;
  const businessIndustry =
    profile?.industry ||
    params.project.designSystem?.industryPattern ||
    undefined;

  const templateDna = resolveTemplateDNA(template);
  const themeArch = resolveThemePageArchitecture(template.id);
  const architectureComponents = themeArch?.components.length
    ? [...themeArch.components]
    : null;
  const resolvedComponents = architectureComponents?.length
    ? architectureComponents
    : templateDna.components.length
      ? [...templateDna.components]
      : resolveComponentsForIndustryAndTemplate(
          template,
          businessIndustry,
          params.project.description || params.project.title,
        );
  const homeOrder = architectureComponents?.length
    ? architectureComponents
    : templateDna.components.length
      ? [...templateDna.components]
      : resolvedComponents;

  const productionContent = identity.productionContent;
  const brandName = profile?.projectName || identity.title || "Brand";

  let files = injectProfessionalComponents({
    files: preserved,
    componentIds: resolvedComponents.map(String),
    homeComponentOrder: homeOrder.map(String),
    brandName,
    pageTitle: identity.title,
    pageDescription: identity.description,
    heroHeadline: productionContent.heroHeadline,
    heroSubheadline: productionContent.heroSubheadline,
    primaryCta: productionContent.primaryCta,
    secondaryCta: productionContent.secondaryCta,
    heroEyebrow: productionContent.heroEyebrow,
    content: productionContent,
    composePage: true,
    language: params.language,
    templateIntelligenceId: template.id,
    templateVisualCss: buildTemplateVisualCss(template),
    sectionShellVariant: themeArch?.sectionShellVariant ?? null,
    websiteThemeId: themeArch?.themeId ?? null,
    pageTopology: themeArch?.pageTopology ?? null,
    floatingCta: themeArch?.floatingCta ?? false,
    forceDesignRebuild: true,
  });
  notes.push(
    themeArch
      ? `Rebuilt theme architecture: ${themeArch.pageTopology} · ${resolvedComponents.slice(0, 5).join(", ")}…`
      : `Rebuilt website design: ${resolvedComponents.slice(0, 6).join(", ")}…`,
  );

  for (const file of preserved) {
    if (file.path.includes("site-images") || file.path.includes("site-videos")) {
      files = [...files.filter((f) => f.path !== file.path), file];
    }
  }

  files = applyTokensToGlobals(files, template);
  files = applyLocaleToWebsiteFiles(files, locale);
  if (locale.rtl) {
    notes.push("Applied Arabic/RTL locale to layout and styles");
  }

  const visualPreset = resolveTemplateVisualPreset(template);
  notes.push(
    themeArch
      ? `Architecture: ${themeArch.pageTopology} · ${themeArch.sectionShellVariant} sections · ${themeArch.animationLanguage}`
      : `Design: ${template.name} · ${visualPreset.chrome.headerVariant} header · ${visualPreset.layout.sectionLayout} sections`,
  );

  const designSystem = patchDesignSystemVisualOnly(
    params.project.designSystem,
    template,
  );

  const designSettings = {
    templateIntelligenceId: template.id,
    templateIntelligenceCategory: template.category,
    templateVisualPreset: visualPreset,
  };

  const project = applyBusinessIdentityToProject(
    {
      ...params.project,
      files,
      designSystem,
      colorPalette: [
        template.colors.primary,
        template.colors.secondary,
        template.colors.accent,
        template.colors.background,
        template.colors.foreground,
        template.colors.surface,
      ],
      typography: [
        template.typography.display,
        template.typography.heading,
        template.typography.body,
      ],
      components: resolvedComponents.map(String),
      sections: templateDna.sectionOrder.length
        ? [...templateDna.sectionOrder]
        : resolvedComponents.map(String),
    },
    identity,
    designSettings,
  );

  notes.push(
    `Template redesign complete — same business, new professional design (${template.name})`,
  );

  return { project, template, notes };
}

/**
 * Switch template on an existing project without regenerating files or calling AI.
 * Updates design tokens (globals.css), designSystem, visual preset metadata, and preview input.
 */
export function applyTemplateVisualSwitch(params: {
  project: GeneratedWebsiteProject;
  templateId: string;
}): RethemeResult {
  const template = getTemplateIntelligence(params.templateId);
  if (!template) {
    throw new Error(`Unknown template intelligence id: ${params.templateId}`);
  }

  const notes: string[] = [];
  const businessIndustry =
    params.project.businessProfile?.industry ||
    params.project.designSystem?.industryPattern ||
    undefined;
  const resolvedComponents = resolveComponentsForIndustryAndTemplate(
    template,
    businessIndustry,
    params.project.description || params.project.title,
  );
  const visualPreset = resolveTemplateVisualPreset(template);
  const files = applyTokensToGlobals(params.project.files || [], template);
  notes.push("Updated design tokens in app/globals.css");

  const designSystem = patchDesignSystem(params.project.designSystem, template);

  const project: GeneratedWebsiteProject = {
    ...params.project,
    files,
    designSystem,
    colorPalette: [
      template.colors.primary,
      template.colors.secondary,
      template.colors.accent,
      template.colors.background,
      template.colors.foreground,
      template.colors.surface,
    ],
    typography: [
      template.typography.display,
      template.typography.heading,
      template.typography.body,
    ],
    components: resolvedComponents.map(String),
    settings: {
      ...params.project.settings,
      templateIntelligenceId: template.id,
      templateIntelligenceCategory: template.category,
      templateVisualPreset: visualPreset,
    } as GeneratedWebsiteProject["settings"],
  };

  notes.push(
    `Template switched to ${template.name} — existing pages and components preserved`,
  );

  return { project, template, notes };
}

export function resolveTemplateIntelligenceId(
  value: unknown,
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return getTemplateIntelligence(value.trim())?.id ?? null;
}
