import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";

/**
 * Merge optimized blueprint design decisions into the V2 package bundle.
 * Preserves package structure; overrides tokens, motion, and responsive rules.
 */
export function applyBlueprintToBundle(
  bundle: TemplateV2PackageBundle,
  blueprint: WebsiteBlueprint,
): TemplateV2PackageBundle {
  const colors = blueprint.colorPalette.colors;
  const tokens: TemplateV2DesignTokens = {
    ...bundle.tokens,
    colors: {
      ...bundle.tokens.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      foreground: colors.foreground,
      muted: colors.muted,
      surface: colors.surface,
      signal: colors.signal,
    },
    typography: {
      ...bundle.tokens.typography,
      display: blueprint.typographyProfile.display,
      body: blueprint.typographyProfile.body,
    },
    languageProfile: blueprint.accessibilityProfile.rtlSupport
      ? {
          ...bundle.tokens.languageProfile,
          directionAdaptation: true,
          rtlTypography: {
            display:
              blueprint.typographyProfile.rtlDisplay ?? "Noto Sans Arabic",
            body: blueprint.typographyProfile.rtlBody ?? "Noto Sans Arabic",
          },
        }
      : bundle.tokens.languageProfile,
  };

  const motion: TemplateV2MotionConfig = {
    ...bundle.motion,
    preset: blueprint.motionStrategy.preset,
    reducedMotion: blueprint.motionStrategy.reducedMotionFallback,
    entrances: {
      ...bundle.motion.entrances,
      hero: {
        type: blueprint.motionStrategy.heroEntrance,
        durationMs:
          blueprint.motionStrategy.intensity === "expressive" ? 680 : 520,
      },
      section: {
        type: blueprint.motionStrategy.sectionEntrance,
        durationMs:
          blueprint.motionStrategy.intensity === "none" ? 0 : 480,
      },
    },
  };

  return {
    ...bundle,
    tokens,
    motion,
    responsive: {
      ...bundle.responsive,
      containerMaxWidth: blueprint.containerWidths.default,
    },
  };
}

/** CSS variables emitted from blueprint for layout rhythm and containers. */
export function buildBlueprintDesignCss(blueprint: WebsiteBlueprint): string {
  const gutterMap = {
    tight: "1rem",
    standard: "1.5rem",
    relaxed: "2.5rem",
  } as const;

  return [
    "/* V2 Website Blueprint — design director output */",
    ":root {",
    `  --bp-blueprint-id: "${blueprint.meta.blueprintId}";`,
    `  --bp-container-narrow: ${blueprint.containerWidths.narrow};`,
    `  --bp-container-default: ${blueprint.containerWidths.default};`,
    `  --bp-container-wide: ${blueprint.containerWidths.wide};`,
    `  --bp-grid-columns: ${blueprint.gridStrategy.columns};`,
    `  --bp-grid-gutter: ${gutterMap[blueprint.gridStrategy.gutter]};`,
    `  --bp-grid-rhythm: ${blueprint.gridStrategy.rhythm};`,
    `  --bp-motion-intensity: ${blueprint.motionStrategy.intensity};`,
    `  --bp-cta-emphasis: ${blueprint.ctaStrategy.emphasis};`,
    `  --container-max: ${blueprint.containerWidths.default};`,
    "}",
    blueprint.containerWidths.fullBleed
      ? '[data-v2-layout="full-bleed"] main { max-width: none; }'
      : "",
    blueprint.accessibilityProfile.motionSafe
      ? "@media (prefers-reduced-motion: reduce) { .v2-motion, [data-v2-motion] { animation: none !important; } }"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
