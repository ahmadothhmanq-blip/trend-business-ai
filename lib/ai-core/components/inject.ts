import type { GeneratedProjectFile } from "@/lib/ai/types";
import { composeHomePage } from "@/lib/ai-core/components/compose";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/ai-core/content/content-language";
import {
  getProfessionalScaffoldByPath,
  listProfessionalScaffoldPaths,
  MOTION_PATH,
  MOTION_SOURCE,
  SECTION_SHELL_PATH,
  resolveSectionShellSource,
  type SectionShellVariant,
} from "@/lib/ai-core/components/scaffolds";
import {
  resolveThemeSectionShellSource,
  isThemeSectionShellTheme,
} from "@/lib/ai-core/components/scaffolds/themes";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";

const SITE_IMAGES_STUB = `export const HERO_IMAGE = null as string | null;
export const PRODUCT_IMAGE = null as string | null;
export const SERVICE_IMAGE = null as string | null;
export const BACKGROUND_IMAGE = null as string | null;
export const BRAND_IMAGE = null as string | null;
export const SECTION_IMAGES = [] as readonly string[];
export const GALLERY_IMAGES = [] as readonly string[];
export const TESTIMONIAL_IMAGES = [] as readonly string[];
export const SITE_IMAGES: Array<{ id: string; role: string; url: string | null }> = [];
export function imageByRole(_role: string): string | null { return null; }
export function siteImagePool(): string[] { return []; }
export function resolveSiteImage(preferred?: string | null, index = 0): string | null {
  if (preferred) return preferred;
  const pool = siteImagePool();
  return pool[index % Math.max(pool.length, 1)] ?? null;
}
`;

/**
 * Inject Professional Components Library scaffolds into the generated project.
 * Replaces LLM-invented section files when a premium scaffold exists.
 * Optionally composes app/page.tsx from the selected component palette.
 */
export function injectProfessionalComponents(params: {
  files: GeneratedProjectFile[];
  componentPaths?: string[];
  componentIds?: string[];
  homeComponentOrder?: string[];
  brandName?: string;
  pageTitle?: string;
  pageDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  heroEyebrow?: string;
  content?: ProductionContentPack | null;
  composePage?: boolean;
  language?: string | null;
  templateIntelligenceId?: string | null;
  templateVisualCss?: string | null;
  /** Section shell variant — each theme uses a different section wrapper. */
  sectionShellVariant?: SectionShellVariant | null;
  /** Curated theme id — enables exclusive theme component library + section shell. */
  websiteThemeId?: WebsiteThemePresetId | string | null;
  pageTopology?: import("@/lib/website/builder/theme-architecture").ThemePageTopology | null;
  floatingCta?: boolean;
  /** When true, rebuild home page design even for localized LLM copy projects. */
  forceDesignRebuild?: boolean;
  /** Visual skin id — adds page-level skin class hooks. */
  visualSkinId?: string | null;
  /** Hero layoutMode for theme-scoped hero scaffolds. */
  heroLayoutMode?: string | null;
}): GeneratedProjectFile[] {
  const paths = new Set<string>([
    SECTION_SHELL_PATH,
    MOTION_PATH,
    ...(params.componentPaths ?? []),
    ...listProfessionalScaffoldPaths([
      ...(params.componentIds ?? []),
      ...(params.homeComponentOrder ?? []),
    ]),
  ]);

  const byPath = new Map(params.files.map((f) => [f.path, f]));
  const localizedCopy =
    usesLlmLocalizedWebsiteCopy(params.language) && !params.forceDesignRebuild;

  byPath.set(SECTION_SHELL_PATH, {
    path: SECTION_SHELL_PATH,
    content: isThemeSectionShellTheme(params.websiteThemeId)
      ? resolveThemeSectionShellSource(params.websiteThemeId)
      : resolveSectionShellSource(params.sectionShellVariant ?? "default"),
    language: "tsx",
  });

  byPath.set(MOTION_PATH, {
    path: MOTION_PATH,
    content: MOTION_SOURCE,
    language: "tsx",
  });

  if (!byPath.has("lib/site-images.ts")) {
    byPath.set("lib/site-images.ts", {
      path: "lib/site-images.ts",
      content: SITE_IMAGES_STUB,
      language: "typescript",
    });
  }

  // Non-English: keep LLM-authored copy — never inject English scaffolds or compose home.
  if (localizedCopy) {
    return Array.from(byPath.values());
  }

  for (const path of paths) {
    const scaffold = getProfessionalScaffoldByPath(path);
    if (!scaffold) continue;
    byPath.set(path, {
      path,
      content: scaffold,
      language: path.endsWith(".tsx") ? "tsx" : "typescript",
    });
  }

  if (params.composePage !== false && (params.componentIds?.length || params.homeComponentOrder?.length)) {
    byPath.set("app/page.tsx", {
      path: "app/page.tsx",
      content: composeHomePage({
        componentIds: params.componentIds ?? params.homeComponentOrder ?? [],
        homeComponentOrder: params.homeComponentOrder,
        heroHeadline: params.heroHeadline,
        heroSubheadline: params.heroSubheadline,
        primaryCta: params.primaryCta,
        secondaryCta: params.secondaryCta,
        heroEyebrow: params.heroEyebrow,
        brandName: params.brandName,
        title: params.pageTitle,
        description: params.pageDescription,
        content: params.content,
        language: params.language,
        templateId: params.templateIntelligenceId,
        websiteThemeId: params.websiteThemeId,
        pageTopology: params.pageTopology,
        floatingCta: params.floatingCta,
        forceDesignRebuild: params.forceDesignRebuild,
        visualSkinId: params.visualSkinId,
        heroLayoutMode: params.heroLayoutMode,
      }),
      language: "tsx",
    });
  }

  if (params.templateVisualCss?.trim()) {
    const globals = byPath.get("app/globals.css");
    const base = globals?.content ?? "";
    if (!base.includes("Template Visual Preset")) {
      byPath.set("app/globals.css", {
        path: "app/globals.css",
        content: `${base}\n${params.templateVisualCss.trim()}\n`,
        language: "css",
      });
    }
  }

  return Array.from(byPath.values());
}

/** True when a planned file should use library scaffold instead of AI generation. */
export function hasProfessionalScaffold(path: string): boolean {
  if (path === SECTION_SHELL_PATH || path === MOTION_PATH) return true;
  return Boolean(getProfessionalScaffoldByPath(path));
}
