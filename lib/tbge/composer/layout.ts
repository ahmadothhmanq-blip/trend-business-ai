/**
 * Responsive layout composition — deterministic breakpoints from spec profile.
 */

import type { ComposerDensity, ResponsiveLayoutSpec } from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

const PROFILE_LAYOUT: Record<
  GenerationSpec["profile"],
  { density: ComposerDensity; columns: number; gap: string; maxWidth: string }
> = {
  professional: { density: "comfortable", columns: 12, gap: "1.5rem", maxWidth: "1200px" },
  fast: { density: "compact", columns: 12, gap: "1rem", maxWidth: "1080px" },
  ultra: { density: "spacious", columns: 12, gap: "2rem", maxWidth: "1280px" },
};

export function composeResponsiveLayout(
  spec: GenerationSpec,
  options: { sectionCount?: number; stackDirection?: "column" | "row" } = {},
): ResponsiveLayoutSpec {
  const profileLayout = PROFILE_LAYOUT[spec.profile];
  const sectionCount = options.sectionCount ?? 1;
  const stackDirection =
    options.stackDirection ?? (sectionCount > 4 ? "column" : "column");

  return {
    breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
    container: {
      maxWidth: profileLayout.maxWidth,
      padding: profileLayout.density === "compact" ? "1rem" : "1.5rem",
    },
    grid: {
      columns: profileLayout.columns,
      gap: profileLayout.gap,
    },
    stackDirection,
  };
}

export function mergeLayoutOverrides(
  base: ResponsiveLayoutSpec,
  overrides?: Partial<ResponsiveLayoutSpec>,
): ResponsiveLayoutSpec {
  if (!overrides) return base;
  return {
    breakpoints: { ...base.breakpoints, ...overrides.breakpoints },
    container: { ...base.container, ...overrides.container },
    grid: { ...base.grid, ...overrides.grid },
    stackDirection: overrides.stackDirection ?? base.stackDirection,
  };
}
