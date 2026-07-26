/**
 * Website Builder — design system & theme services (Phase 2).
 */

import type { VisualDesignTokens } from "@/lib/ai-core/visual-editor/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export type BuilderSpacingPreset = "compact" | "balanced" | "airy";

export type BuilderThemePreset = {
  id: string;
  label: string;
  description: string;
  tokens: Partial<VisualDesignTokens>;
};

export const BUILDER_SPACING_MAP: Record<BuilderSpacingPreset, string> = {
  compact: "4.5rem",
  balanced: "5.75rem",
  airy: "7.5rem",
};

export const BUILDER_THEME_PRESETS: BuilderThemePreset[] = [
  {
    id: "luxury-gold",
    label: "Luxury Gold",
    description: "Premium dark with gold accents",
    tokens: {
      primary: "#d4af37",
      secondary: "#1a1a1a",
      accent: "#c6a75e",
      background: "#0a0a0a",
      foreground: "#f5f5f5",
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      sectionY: "6rem",
    },
  },
  {
    id: "modern-minimal",
    label: "Modern Minimal",
    description: "Clean light SaaS aesthetic",
    tokens: {
      primary: "#2563eb",
      secondary: "#0f172a",
      accent: "#38bdf8",
      background: "#ffffff",
      foreground: "#0f172a",
      headingFont: "Inter",
      bodyFont: "Inter",
      sectionY: "5.75rem",
    },
  },
  {
    id: "bold-startup",
    label: "Bold Startup",
    description: "High-contrast conversion-focused",
    tokens: {
      primary: "#7c3aed",
      secondary: "#111827",
      accent: "#f59e0b",
      background: "#030712",
      foreground: "#f9fafb",
      headingFont: "Space Grotesk",
      bodyFont: "DM Sans",
      sectionY: "7.5rem",
    },
  },
];

export function spacingPresetFromSectionY(sectionY: string): BuilderSpacingPreset {
  if (sectionY.includes("4")) return "compact";
  if (sectionY.includes("7") || sectionY.includes("8")) return "airy";
  return "balanced";
}

export function resolveBuilderDesignTokens(
  project?: GeneratedWebsiteProject | null,
  visual?: VisualDesignTokens | null,
): VisualDesignTokens {
  const ds = project?.designSystem;
  const colors = ds?.colors;
  return {
    primary: visual?.primary || colors?.primary || "#d4af37",
    secondary: visual?.secondary || colors?.secondary || "#1a1a1a",
    accent: visual?.accent || colors?.accent || "#c6a75e",
    background: visual?.background || colors?.background || "#0a0a0a",
    foreground: visual?.foreground || colors?.neutral || "#f5f5f5",
    headingFont:
      visual?.headingFont ||
      ds?.typography?.headingFont ||
      "Playfair Display",
    bodyFont: visual?.bodyFont || ds?.typography?.bodyFont || "Source Sans 3",
    sectionY: visual?.sectionY || BUILDER_SPACING_MAP.balanced,
  };
}

export function mergeThemePreset(
  current: VisualDesignTokens,
  presetId: string,
): VisualDesignTokens {
  const preset = BUILDER_THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return current;
  return { ...current, ...preset.tokens };
}
