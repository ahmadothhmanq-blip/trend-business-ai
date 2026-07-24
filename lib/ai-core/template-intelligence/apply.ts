import { getBrandPreset } from "@/lib/ai-core/brand-identity/presets";
import { injectProfessionalComponents } from "@/lib/ai-core/components/inject";
import { buildIndustryCopyPack } from "@/lib/ai-core/content/industry-copy";
import {
  buildProductionContentPack,
  type ProductionContentPack,
} from "@/lib/ai-core/content/production-content";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import {
  resolveComponentsForIndustryAndTemplate,
  resolveVerticalPaletteId,
  sanitizeCtaForIndustry,
} from "@/lib/ai-core/template-intelligence/industry-palettes";
import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";
import {
  buildTemplateVisualCss,
  resolveTemplateVisualPreset,
} from "@/lib/ai-core/template-intelligence/visual-preset";
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
  // Keep secondary content pages (models/inventory/blog) — layout re-skin keeps data routes
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
  const resolvedComponents = resolveComponentsForIndustryAndTemplate(
    template,
    industryId,
    haystack,
  );
  const paletteId = resolveVerticalPaletteId(industryId, haystack);

  meta.templateIntelligenceId = template.id;
  meta.templateIntelligenceCategory = template.category;
  meta.templateVisualPalette = paletteId;
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
 * Switch visual template after generation — preserves content, images, pages, data.
 * Changes layout scaffolds, theme tokens, components, and visual style only.
 */
export function applyTemplateIntelligenceRetheme(params: {
  project: GeneratedWebsiteProject;
  templateId: string;
}): RethemeResult {
  const template = getTemplateIntelligence(params.templateId);
  if (!template) {
    throw new Error(`Unknown template intelligence id: ${params.templateId}`);
  }

  const notes: string[] = [];
  const originalFiles = params.project.files || [];
  const preserved = originalFiles.filter((f) => shouldPreserveFile(f.path));
  notes.push(`Preserved ${preserved.length} content/data/image files`);

  const profile = params.project.businessProfile;
  const strategy = params.project.strategy;
  const businessIndustry =
    profile?.industry ||
    params.project.designSystem?.industryPattern ||
    undefined;
  const copyPack = buildIndustryCopyPack({
    industryId: businessIndustry,
    profile: profile || null,
    strategy: strategy || null,
  });
  copyPack.primaryCta = sanitizeCtaForIndustry(
    copyPack.primaryCta,
    copyPack.industryId,
  );
  copyPack.secondaryCta = sanitizeCtaForIndustry(
    copyPack.secondaryCta,
    copyPack.industryId,
  );
  const production = buildProductionContentPack(
    copyPack,
    profile?.projectName || params.project.title,
  );
  const preservedContent = extractPreservedHeroContent(
    params.project,
    production,
  );

  const brandName = profile?.projectName || params.project.title || "Brand";

  // Start from preserved files, then inject new visual components + home composition.
  let files = injectProfessionalComponents({
    files: preserved,
    componentIds: template.components.map(String),
    brandName,
    pageTitle: params.project.title,
    pageDescription: params.project.description,
    heroHeadline: preservedContent.heroHeadline,
    heroSubheadline: preservedContent.heroSubheadline,
    primaryCta: preservedContent.primaryCta,
    secondaryCta: preservedContent.secondaryCta,
    heroEyebrow: preservedContent.heroEyebrow,
    content: preservedContent.content,
    composePage: true,
  });
  notes.push(
    `Applied layout components: ${template.components.slice(0, 6).join(", ")}…`,
  );
  notes.push("Preserved existing headlines, CTAs, and section copy");

  // Restore preserved assets if inject stubbed site-images
  for (const file of preserved) {
    if (file.path.includes("site-images") || file.path.includes("site-videos")) {
      files = [
        ...files.filter((f) => f.path !== file.path),
        file,
      ];
    }
  }

  files = applyTokensToGlobals(files, template);
  const visualPreset = resolveTemplateVisualPreset(template);
  notes.push(`Applied theme tokens (${template.category} · ${template.designPreset})`);
  notes.push(
    `Visual preset: ${visualPreset.chrome.headerVariant} header · ${visualPreset.layout.sectionLayout} sections · ${visualPreset.buttons.primary} buttons`,
  );

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
    ],
    typography: [
      template.typography.display,
      template.typography.heading,
      template.typography.body,
    ],
    components: template.components.map(String),
    sections: template.components.map(String),
    settings: {
      ...params.project.settings,
      templateIntelligenceId: template.id,
      templateIntelligenceCategory: template.category,
      templateVisualPreset: visualPreset,
    } as GeneratedWebsiteProject["settings"],
  };

  notes.push(
    `Template switched to ${template.name} — content, images, and pages preserved`,
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
