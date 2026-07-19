import type { GeneratedProjectFile } from "@/lib/ai/types";
import { composeHomePage } from "@/lib/ai-core/components/compose";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import {
  getProfessionalScaffoldByPath,
  listProfessionalScaffoldPaths,
  MOTION_PATH,
  MOTION_SOURCE,
  SECTION_SHELL_PATH,
  SECTION_SHELL_SOURCE,
} from "@/lib/ai-core/components/scaffolds";

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
}): GeneratedProjectFile[] {
  const paths = new Set<string>([
    SECTION_SHELL_PATH,
    MOTION_PATH,
    ...(params.componentPaths ?? []),
    ...listProfessionalScaffoldPaths(params.componentIds ?? []),
  ]);

  const byPath = new Map(params.files.map((f) => [f.path, f]));

  byPath.set(SECTION_SHELL_PATH, {
    path: SECTION_SHELL_PATH,
    content: SECTION_SHELL_SOURCE,
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

  for (const path of paths) {
    const scaffold = getProfessionalScaffoldByPath(path);
    if (!scaffold) continue;
    byPath.set(path, {
      path,
      content: scaffold,
      language: path.endsWith(".tsx") ? "tsx" : "typescript",
    });
  }

  if (params.composePage !== false && params.componentIds?.length) {
    byPath.set("app/page.tsx", {
      path: "app/page.tsx",
      content: composeHomePage({
        componentIds: params.componentIds,
        heroHeadline: params.heroHeadline,
        heroSubheadline: params.heroSubheadline,
        primaryCta: params.primaryCta,
        secondaryCta: params.secondaryCta,
        heroEyebrow: params.heroEyebrow,
        brandName: params.brandName,
        title: params.pageTitle,
        description: params.pageDescription,
        content: params.content,
      }),
      language: "tsx",
    });
  }

  return Array.from(byPath.values());
}

/** True when a planned file should use library scaffold instead of AI generation. */
export function hasProfessionalScaffold(path: string): boolean {
  if (path === SECTION_SHELL_PATH || path === MOTION_PATH) return true;
  return Boolean(getProfessionalScaffoldByPath(path));
}
