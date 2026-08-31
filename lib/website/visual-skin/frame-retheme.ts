import { injectProfessionalComponents } from "@/lib/ai-core/components/inject";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import {
  extractBusinessIdentity,
  applyBusinessIdentityToProject,
} from "@/lib/ai-core/template-intelligence/business-identity";
import {
  resolveLocaleFromLanguage,
  applyLocaleToWebsiteFiles,
} from "@/lib/ai-core/website-design-platform/i18n";
import { getIndustryHomeComponentsForTheme } from "@/lib/website/builder/industry-home-compositions";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import {
  applyVisualSkinToDesignSystem,
} from "@/lib/website/visual-skin/apply";
import {
  buildVisualSkinLayerCss,
  applyVisualSkinToProjectFiles,
  patchGlobalsWithVisualSkin,
  stripConflictingTemplateVisualCss,
} from "@/lib/website/visual-skin/skin-css";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import {
  resolveVisualSkinThemeBridge,
} from "@/lib/website/visual-skin/theme-bridge";

const PRESERVE_PATH_PREFIXES = [
  "lib/site-images",
  "lib/site-videos",
  "public/",
  "content/",
  "data/",
];

function shouldPreserveFile(filePath: string): boolean {
  if (PRESERVE_PATH_PREFIXES.some((prefix) => filePath.startsWith(prefix))) {
    return true;
  }
  if (
    filePath.startsWith("app/") &&
    filePath !== "app/page.tsx" &&
    filePath !== "app/globals.css" &&
    filePath !== "app/layout.tsx"
  ) {
    return true;
  }
  return false;
}

function ensureGlobalsBase(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const idx = files.findIndex((f) => f.path === "app/globals.css");
  const base =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --color-primary: #000;\n  --color-background: #fff;\n  --color-foreground: #111;\n}\n";
  if (idx < 0) {
    return [
      ...files,
      { path: "app/globals.css", content: base, language: "css" },
    ];
  }
  return files;
}

/**
 * Full frame swap — exclusive Theme* library, page topology, section shell,
 * typography + colors from visual skin only (no conflicting TI visual CSS).
 */
export function applyVisualSkinFrameRetheme(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
): { project: GeneratedWebsiteProject; notes: string[] } {
  const skin = getVisualSkin(skinId);
  if (!skin) {
    return {
      project,
      notes: ["No published visual skin — frame retheme skipped"],
    };
  }
  const bridge = resolveVisualSkinThemeBridge(skinId);
  if (!bridge) {
    return {
      project,
      notes: [`Visual skin "${skinId}" has no theme bridge — skipped`],
    };
  }
  const templateIntelligenceId =
    project.settings?.templateIntelligenceId ??
    bridge.templateIntelligenceId ??
    "corporate-business";
  const template = getTemplateIntelligence(templateIntelligenceId);
  if (!template) {
    throw new Error(
      `Unknown template intelligence id: ${templateIntelligenceId}`,
    );
  }

  const notes: string[] = ["Visual skin frame retheme — full component + layout swap"];
  const locale = resolveLocaleFromLanguage(language);
  const identity = extractBusinessIdentity(project, language);
  const preserved = (project.files ?? []).filter((f) => shouldPreserveFile(f.path));
  notes.push(`Preserved ${preserved.length} business asset and route files`);

  const themeArch =
    getThemePageArchitecture(bridge.websiteThemeId ?? templateIntelligenceId) ??
    getThemePageArchitecture(templateIntelligenceId);

  const websiteThemeId = (bridge.websiteThemeId ??
    templateIntelligenceId) as WebsiteThemePresetId;

  const homeOrder = getIndustryHomeComponentsForTheme(
    templateIntelligenceId,
    websiteThemeId,
  );
  const pageTopology =
    bridge.pageTopology ?? themeArch?.pageTopology ?? "classic-stack";
  const productionContent = identity.productionContent;
  const brandName =
    identity.businessProfile?.projectName || identity.title || "Brand";

  let files = injectProfessionalComponents({
    files: preserved,
    componentIds: homeOrder.map(String),
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
    language,
    templateIntelligenceId,
    templateVisualCss: buildVisualSkinLayerCss(skin),
    sectionShellVariant: themeArch?.sectionShellVariant ?? null,
    websiteThemeId: bridge.websiteThemeId,
    pageTopology,
    floatingCta: themeArch?.floatingCta ?? false,
    forceDesignRebuild: true,
    visualSkinId: skin.id,
    heroLayoutMode: bridge.heroLayoutMode ?? null,
  });

  for (const file of preserved) {
    if (file.path.includes("site-images") || file.path.includes("site-videos")) {
      files = [...files.filter((f) => f.path !== file.path), file];
    }
  }

  files = ensureGlobalsBase(files);
  const globalsIdx = files.findIndex((f) => f.path === "app/globals.css");
  if (globalsIdx >= 0) {
    const cleaned = stripConflictingTemplateVisualCss(files[globalsIdx]!.content);
    files[globalsIdx] = {
      ...files[globalsIdx]!,
      content: patchGlobalsWithVisualSkin(cleaned, skin),
    };
  }

  files = applyLocaleToWebsiteFiles(files, locale);
  files = applyVisualSkinToProjectFiles(files, skin);

  notes.push(
    `Frame: ${bridge.websiteThemeId} · ${pageTopology} · ${homeOrder.slice(0, 4).join(", ")}…`,
  );

  const designSettings = {
    templateIntelligenceId,
    templateIntelligenceCategory: template.category,
    visualSkinId: skin.id,
    websiteThemeId: bridge.websiteThemeId,
  };

  let nextProject = applyBusinessIdentityToProject(
    {
      ...project,
      files,
      designSystem: applyVisualSkinToDesignSystem(project.designSystem, skin),
      colorPalette: [
        skin.tokens.primary,
        skin.tokens.secondary,
        skin.tokens.accent,
        skin.tokens.background,
        skin.tokens.foreground,
        skin.tokens.background,
      ],
      typography: [skin.typography.headingFont, skin.typography.bodyFont],
      components: homeOrder.map(String),
    },
    identity,
    designSettings,
  );

  nextProject = {
    ...nextProject,
    settings: {
      ...nextProject.settings,
      visualSkinId: skin.id,
      websiteThemeId: bridge.websiteThemeId,
      templateIntelligenceId,
    },
  };

  return { project: nextProject, notes };
}
