import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { VisualSkin } from "@/lib/website/visual-skin/types";
import {
  MOTION_PATH,
  MOTION_SOURCE,
  SECTION_SHELL_PATH,
  resolveSectionShellSource,
} from "@/lib/ai-core/components/scaffolds";
import { buildVisualSkinLayoutCss } from "@/lib/website/visual-skin/layout-presets";
import { resolveSkinSectionShellVariant } from "@/lib/website/visual-skin/resolve-section-shell";
import {
  isThemeSectionShellTheme,
  resolveThemeSectionShellSource,
} from "@/lib/ai-core/components/scaffolds/themes";
import { resolveVisualSkinThemeBridge } from "@/lib/website/visual-skin/theme-bridge";

export const VISUAL_SKIN_CSS_MARKER = "/* tb-visual-skin */";

function setCssVar(css: string, name: string, value: string): string {
  const re = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
  if (re.test(css)) return css.replace(re, `$1${value}$3`);
  if (css.includes(":root")) {
    return css.replace(/:root\s*\{/, `:root {\n  --${name}: ${value};`);
  }
  return `${css}\n:root { --${name}: ${value}; }\n`;
}

function quoteFont(font: string): string {
  const first = font.split(",")[0]?.trim() ?? font;
  return first.includes(" ") ? `"${first}"` : first;
}

export function skinToV2DesignTokens(skin: VisualSkin): TemplateV2DesignTokens {
  const r = skin.tokens.radius;
  const signal = skin.tokens.signal ?? skin.tokens.accent;
  return {
    colors: {
      primary: skin.tokens.primary,
      secondary: skin.tokens.secondary,
      accent: skin.tokens.accent,
      background: skin.tokens.background,
      foreground: skin.tokens.foreground,
      surface: skin.tokens.surface ?? skin.tokens.background,
      muted: skin.tokens.muted ?? skin.tokens.secondary,
      signal,
      grid: `color-mix(in srgb, ${signal} 8%, transparent)`,
      ink: skin.tokens.background,
    },
    typography: {
      display: skin.typography.headingFont,
      body: skin.typography.bodyFont,
    },
    radius: {
      sm: r,
      md: r,
      lg: r,
      xl: r,
    },
    shadows: skin.shadows,
    languageProfile: skin.rtlTypography
      ? {
          directionAdaptation: true,
          rtlTypography: skin.rtlTypography,
        }
      : undefined,
  };
}

export function applySkinToBundle(
  bundle: TemplateV2PackageBundle,
  skin: VisualSkin,
): TemplateV2PackageBundle {
  const overrides = skinToV2DesignTokens(skin);
  return {
    ...bundle,
    tokens: {
      ...bundle.tokens,
      colors: { ...bundle.tokens.colors, ...overrides.colors },
      typography: { ...bundle.tokens.typography, ...overrides.typography },
      radius: { ...bundle.tokens.radius, ...overrides.radius },
      shadows: { ...bundle.tokens.shadows, ...overrides.shadows },
      languageProfile:
        overrides.languageProfile ?? bundle.tokens.languageProfile,
    },
  };
}

/** Full-site skin layer — colors, type, images, RTL; does not touch structure. */
export function buildVisualSkinLayerCss(skin: VisualSkin): string {
  const img = skin.imageTreatment;
  const motionMs =
    skin.motionIntensity === "expressive"
      ? "520ms"
      : skin.motionIntensity === "subtle"
        ? "280ms"
        : "380ms";

  return `${VISUAL_SKIN_CSS_MARKER}
${buildVisualSkinLayoutCss(skin)}
:root {
  --tb-skin-id: "${skin.id}";
  --tb-img-radius: ${img.radius};
  --tb-img-aspect: ${img.aspectRatio};
  --tb-img-frame: ${img.frame};
  --tb-img-shadow: ${img.shadow};
  --tb-motion-duration: ${motionMs};
}
img,
[data-slot-image] img,
.slot-image,
.df-hero-media img,
.ti-hero-media,
.ti-gallery-cell,
[class*="aspect-"] img {
  border-radius: var(--tb-img-radius) !important;
  box-shadow: var(--tb-img-shadow);
  border: var(--tb-img-frame);
  object-fit: cover;
}
[class*="hero"] img,
[data-section="hero"] img {
  aspect-ratio: var(--tb-img-aspect);
}
button,
a[class*="btn"],
.df-btn,
.ti-btn-primary {
  border-radius: var(--radius-md, ${skin.tokens.radius});
  transition: transform var(--tb-motion-duration) ease, box-shadow var(--tb-motion-duration) ease;
}
[dir="rtl"] {
  letter-spacing: 0.01em;
}
[dir="rtl"] img {
  border-radius: var(--tb-img-radius) !important;
}
section[data-v2-section-rhythm],
.df-section,
section[id] {
  transition: background-color var(--tb-motion-duration) ease;
}
`;
}

function patchLayoutHtmlWithSkin(html: string, skinId: string): string {
  if (!/<html[\s>]/i.test(html)) return html;
  if (/data-tb-skin=/i.test(html)) {
    return html.replace(
      /data-tb-skin=["'][^"']*["']/i,
      `data-tb-skin="${skinId}"`,
    );
  }
  return html.replace(/<html([^>]*)>/i, `<html$1 data-tb-skin="${skinId}">`);
}

function upsertProjectFile(
  files: GeneratedProjectFile[],
  path: string,
  content: string,
  language: GeneratedProjectFile["language"] = "tsx",
): GeneratedProjectFile[] {
  const idx = files.findIndex((f) => f.path === path);
  const file: GeneratedProjectFile = { path, content, language };
  if (idx < 0) return [...files, file];
  const next = [...files];
  next[idx] = file;
  return next;
}

export function stripConflictingTemplateVisualCss(css: string): string {
  return css.replace(/\/\* Template Visual Preset[\s\S]*?(?=\n\/\*|$)/g, "").trim();
}

export function patchGlobalsWithVisualSkin(css: string, skin: VisualSkin): string {
  let next = stripConflictingTemplateVisualCss(css);
  const display = quoteFont(skin.typography.headingFont);
  const body = quoteFont(skin.typography.bodyFont);

  next = setCssVar(next, "color-primary", skin.tokens.primary);
  next = setCssVar(next, "color-secondary", skin.tokens.secondary);
  next = setCssVar(next, "color-accent", skin.tokens.accent);
  next = setCssVar(next, "color-background", skin.tokens.background);
  next = setCssVar(next, "color-foreground", skin.tokens.foreground);
  next = setCssVar(next, "color-surface", skin.tokens.background);
  next = setCssVar(next, "color-primary-foreground", "#ffffff");
  next = setCssVar(next, "font-display", `${display}, ui-sans-serif, system-ui, sans-serif`);
  next = setCssVar(next, "font-body", `${body}, ui-sans-serif, system-ui, sans-serif`);
  next = setCssVar(next, "radius-md", skin.tokens.radius);

  for (const [key, value] of Object.entries(skin.shadows)) {
    next = setCssVar(next, `shadow-${key}`, value);
  }

  const layer = buildVisualSkinLayerCss(skin);
  if (next.includes(VISUAL_SKIN_CSS_MARKER)) {
    next = next.replace(
      /\/\* tb-visual-skin \*\/[\s\S]*?(?=\n\/\*[^*]|\n*$)/,
      layer.trim(),
    );
  } else {
    next = `${next.trim()}\n\n${layer}`;
  }

  return next;
}

export function applyVisualSkinToProjectFiles(
  files: GeneratedProjectFile[],
  skin: VisualSkin,
): GeneratedProjectFile[] {
  let next = [...files];
  const shellVariant = resolveSkinSectionShellVariant(skin);
  const bridge = resolveVisualSkinThemeBridge(skin.id);
  const shellContent =
    bridge && isThemeSectionShellTheme(bridge.websiteThemeId)
      ? resolveThemeSectionShellSource(bridge.websiteThemeId)
      : resolveSectionShellSource(shellVariant);

  next = upsertProjectFile(
    next,
    SECTION_SHELL_PATH,
    shellContent,
    "tsx",
  );
  next = upsertProjectFile(next, MOTION_PATH, MOTION_SOURCE, "tsx");

  const layoutIdx = next.findIndex(
    (f) => f.path === "app/layout.tsx" || f.path.endsWith("/app/layout.tsx"),
  );
  if (layoutIdx >= 0) {
    const layout = next[layoutIdx]!;
    next[layoutIdx] = {
      ...layout,
      content: patchLayoutHtmlWithSkin(layout.content, skin.id),
    };
  }

  const idx = next.findIndex(
    (f) => f.path === "app/globals.css" || f.path.endsWith("/globals.css"),
  );
  if (idx < 0) return next;

  next[idx] = {
    ...next[idx]!,
    content: patchGlobalsWithVisualSkin(next[idx]!.content, skin),
  };
  return next;
}

export function resolveProjectTemplatePackageId(
  settings?: Record<string, unknown> | null,
): string | null {
  if (!settings) return null;
  const raw =
    (typeof settings.templatePackageId === "string" && settings.templatePackageId) ||
    (typeof settings.websiteStructureTemplateId === "string" &&
      settings.websiteStructureTemplateId) ||
    (typeof settings.templatePackageId === "string" && settings.templatePackageId) ||
    "";
  return raw.trim() || null;
}

export function projectHasV2Globals(files: GeneratedProjectFile[]): boolean {
  const globals = files.find((f) => f.path.endsWith("globals.css"));
  return Boolean(
    globals?.content.includes("Template Architecture V2") ||
      globals?.content.includes("--v2-package"),
  );
}
