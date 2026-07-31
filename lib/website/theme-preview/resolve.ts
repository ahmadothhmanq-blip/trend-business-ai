import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import { getComposeUiFallbacks } from "@/lib/ai-core/content/content-language";
import {
  applyIndustryPreviewProfile,
  resolveIndustryPreviewProfile,
} from "@/lib/website/builder/industry-preview-profiles";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import { getWebsiteThemeEntry } from "@/lib/website/builder/theme-catalog";
import {
  isThemeScopedComponent,
  resolveThemeIdFromComponent,
} from "@/lib/website/builder/theme-component-registry";
import type { StaticPreviewInput } from "@/lib/website/preview-input";
import type {
  ThemePreviewColors,
  ThemePreviewContent,
  ThemePreviewContext,
} from "@/lib/website/theme-preview/types";
import { pickColor } from "@/lib/website/theme-preview/utils";

function resolveColors(input: StaticPreviewInput): ThemePreviewColors {
  const template = input.templateIntelligenceId
    ? getTemplateIntelligence(input.templateIntelligenceId)
    : null;
  const colors = template?.colors;
  return {
    primary: colors?.primary || pickColor(input.colorPalette, 0, "#0F172A"),
    secondary: colors?.secondary || pickColor(input.colorPalette, 1, "#334155"),
    accent: colors?.accent || pickColor(input.colorPalette, 2, "#2563EB"),
    background: colors?.background || pickColor(input.colorPalette, 5, "#F8FAFC"),
    foreground: colors?.foreground || pickColor(input.colorPalette, 6, "#0F172A"),
    surface: colors?.surface || pickColor(input.colorPalette, 4, "#FFFFFF"),
  };
}

function resolveTypography(input: StaticPreviewInput) {
  const template = input.templateIntelligenceId
    ? getTemplateIntelligence(input.templateIntelligenceId)
    : null;
  const typography = (input.typography ?? []).map((t) => t.trim()).filter(Boolean);
  return {
    display: template?.typography.display || typography[0] || "Georgia, serif",
    heading: template?.typography.heading || typography[0] || "Georgia, serif",
    body: template?.typography.body || typography[1] || "system-ui, sans-serif",
  };
}

/** Resolve theme preview context from blueprint preview input. */
export function resolveThemePreviewContext(
  input: StaticPreviewInput,
): ThemePreviewContext | null {
  const themeComponents = (input.components ?? []).filter(isThemeScopedComponent);
  const websiteThemeId = input.websiteThemeId?.trim() || null;

  let themeId: WebsiteThemePresetId | null = null;
  let componentIds: string[] = [];

  if (themeComponents.length > 0) {
    componentIds = themeComponents;
    themeId =
      resolveThemeIdFromComponent(themeComponents[0]!) ||
      (websiteThemeId as WebsiteThemePresetId | null);
  } else if (websiteThemeId) {
    const entry = getWebsiteThemeEntry(websiteThemeId);
    themeId = (entry?.id as WebsiteThemePresetId) ?? null;
  }

  if (!themeId && input.templateIntelligenceId) {
    const arch = getThemePageArchitecture(input.templateIntelligenceId);
    if (arch) {
      themeId = arch.themeId;
      if (!componentIds.length) componentIds = arch.components.map(String);
    }
  }

  if (!themeId && websiteThemeId) {
    const arch = getThemePageArchitecture(websiteThemeId);
    if (arch) {
      themeId = arch.themeId;
      if (!componentIds.length) componentIds = arch.components.map(String);
    }
  }

  if (!themeId) return null;

  let architecture = input.templateIntelligenceId
    ? getThemePageArchitecture(input.templateIntelligenceId)
    : null;
  if (!architecture) {
    architecture = getThemePageArchitecture(themeId) ?? null;
  }
  if (!architecture) return null;

  if (!componentIds.length) {
    componentIds = architecture.components.map(String);
  }

  return {
    themeId,
    architecture,
    componentIds,
    colors: resolveColors(input),
    typography: resolveTypography(input),
    templateIntelligenceId: input.templateIntelligenceId?.trim() || null,
  };
}

function slugifyPageName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildThemePreviewContent(
  input: StaticPreviewInput,
): ThemePreviewContent {
  const ui = getComposeUiFallbacks(input.language);
  const title = input.title?.trim() || "Website Preview";
  const description =
    input.description?.trim() || "AI-generated website product preview.";
  const content = (input.content ?? []).map((c) => c.trim()).filter(Boolean);
  const brandName = title.split("—")[0]?.trim() || title;
  const tiId = input.templateIntelligenceId?.trim() || null;

  const pageNames = (input.pages ?? []).map((p) => p.trim()).filter(Boolean);
  const pageSlugs = pageNames.map((name, index) => ({
    name,
    slug: slugifyPageName(name) || `page-${index + 1}`,
  }));

  const base = {
    title,
    description,
    brandName,
    heroHeadline: title,
    heroSubheadline: description,
    heroEyebrow: ui.heroEyebrow,
    primaryCta: input.primaryCta?.trim() || ui.primaryCta,
    secondaryCta: ui.secondaryCta,
    heroImageUrl: input.heroImageUrl,
    content,
    navLinks: [
      { href: "#services", label: ui.navServices },
      { href: "#features", label: ui.navFeatures },
      { href: "#pricing", label: ui.navPricing },
      { href: "#contact", label: ui.navContact },
    ],
    language: input.language,
  };

  const profile = resolveIndustryPreviewProfile(tiId);
  if (!profile) {
    return { ...base, heroLayout: null };
  }

  const enriched = applyIndustryPreviewProfile(base, profile, pageSlugs);
  return {
    ...enriched,
    heroLayout: profile.heroLayout,
  };
}

export function themePreviewCacheSignature(input: StaticPreviewInput): string | null {
  const ctx = resolveThemePreviewContext(input);
  if (!ctx) return null;
  const components = ctx.componentIds.join(",");
  return `${ctx.themeId}|${ctx.templateIntelligenceId || ""}|${components}|scaffold-ssr`;
}
