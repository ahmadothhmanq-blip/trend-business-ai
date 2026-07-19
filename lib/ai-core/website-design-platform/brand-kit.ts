/**
 * Phase 8 — Brand Kit attachment for Website Builder.
 */

import type { BrandKitAttachment } from "@/lib/ai-core/website-design-platform/types";
import type { DesignSystem } from "@/plugins/website/layers/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function brandKitFromIdentityRow(row: {
  id: string;
  brand_name?: string | null;
  project_name?: string | null;
  blueprint?: unknown;
}): BrandKitAttachment | null {
  const bp = (row.blueprint || {}) as Record<string, unknown>;
  const paletteRaw = bp.colorPalette;
  const palette: string[] = Array.isArray(paletteRaw)
    ? paletteRaw.map((c) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object") {
          const row = c as { hex?: string; value?: string };
          return row.hex || row.value || "";
        }
        return "";
      }).filter(Boolean)
    : [];
  const typography = (bp.typography || {}) as Record<string, string>;
  const logo =
    (typeof bp.logoUrl === "string" && bp.logoUrl) ||
    (typeof bp.logo === "string" && bp.logo) ||
    null;

  return {
    brandIdentityId: row.id,
    name: row.brand_name || row.project_name || "Brand Kit",
    primary: palette[0] || undefined,
    secondary: palette[1] || undefined,
    accent: palette[2] || undefined,
    logoUrl: logo,
    displayFont:
      typography.display ||
      typography.headingFont ||
      typography.heading ||
      undefined,
    bodyFont: typography.body || typography.bodyFont || undefined,
  };
}

export function applyBrandKitToDesignSystem(
  current: DesignSystem | undefined,
  kit: BrandKitAttachment,
): DesignSystem {
  const base = current;
  const colors = {
    primary: kit.primary || base?.colors.primary || "#111111",
    secondary: kit.secondary || base?.colors.secondary || "#666666",
    accent: kit.accent || base?.colors.accent || "#C9A227",
    neutral: base?.colors.neutral || "#888888",
    surface: base?.colors.surface || "#FAFAFA",
    background: base?.colors.background || "#FFFFFF",
    foreground: base?.colors.foreground || "#111111",
  };

  if (!base) {
    return {
      style: "Brand Kit",
      stylePreset: "premium-brand",
      industryPattern: "business",
      colors,
      typography: {
        headingFont: kit.displayFont || "Georgia",
        bodyFont: kit.bodyFont || "system-ui",
        scale: ["display", "h1", "h2", "body", "small"],
        notes: `Brand kit ${kit.name}`,
      },
      layoutRules: ["Brand kit tokens locked"],
      layoutStyle: "corporate-trust",
      uiPatterns: [],
      componentPalette: [],
      spacingScale: ["3rem", "5rem", "72rem"],
      borderRadius: "1rem",
      shadowStyle: "soft",
    };
  }

  return {
    ...base,
    colors: { ...base.colors, ...colors },
    typography: {
      ...base.typography,
      headingFont: kit.displayFont || base.typography.headingFont,
      bodyFont: kit.bodyFont || base.typography.bodyFont,
      notes: `Brand kit ${kit.name}`,
    },
  };
}

export function applyBrandKitTokensToFiles(
  files: GeneratedProjectFile[],
  kit: BrandKitAttachment,
): GeneratedProjectFile[] {
  const idx = files.findIndex(
    (f) => f.path === "app/globals.css" || f.path.endsWith("/globals.css"),
  );
  if (idx < 0) return files;
  let css = files[idx]!.content;

  const setVar = (name: string, value?: string) => {
    if (!value) return;
    const re = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
    if (re.test(css)) css = css.replace(re, `$1${value}$3`);
    else if (css.includes(":root")) {
      css = css.replace(/:root\s*\{/, `:root {\n  --${name}: ${value};`);
    }
  };

  setVar("color-primary", kit.primary);
  setVar("color-secondary", kit.secondary);
  setVar("color-accent", kit.accent);
  if (kit.displayFont) {
    setVar("font-display", `"${kit.displayFont}", Georgia, serif`);
    setVar("font-heading", `"${kit.displayFont}", Georgia, serif`);
  }
  if (kit.bodyFont) {
    setVar("font-body", `"${kit.bodyFont}", system-ui, sans-serif`);
  }

  if (!css.includes("Brand Kit Integration")) {
    css += `\n/* Brand Kit Integration — ${kit.brandIdentityId} */\n`;
  }

  const next = [...files];
  next[idx] = { ...next[idx]!, content: css };
  return next;
}
