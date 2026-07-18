import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import {
  getDesignPreset,
  normalizeDesignPreset,
} from "@/lib/ai-core/design-system/presets";
import type {
  AiDesignSystem,
  DesignPresetId,
} from "@/lib/ai-core/design-system/types";

export type BuildAiDesignSystemInput = {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  /** Preferred preset from template / theme / explicit */
  preferredPreset?: string | DesignPresetId;
  templateSelection?: TemplateSelection;
  industryPattern?: string;
  layoutStyle?: string;
};

/**
 * Generate design decisions from Strategy (+ optional industry template).
 * Deterministic foundation — adapters may still refine via product AI.
 */
export function buildAiDesignSystemFromStrategy(
  input: BuildAiDesignSystemInput,
): AiDesignSystem {
  const preferred =
    input.preferredPreset ||
    input.templateSelection?.designPreset ||
    input.profile?.tone ||
    "modern";
  const presetId = normalizeDesignPreset(preferred);
  const base = getDesignPreset(presetId);

  const industryPattern =
    input.industryPattern ||
    input.templateSelection?.industryPattern ||
    input.profile?.industry ||
    "general";

  const layoutStyle =
    input.layoutStyle ||
    input.templateSelection?.layoutStyle ||
    `${base.style} layout aligned to ${input.strategy.positioning.slice(0, 80)}`;

  const sectionHints = input.strategy.sectionPlan
    .slice(0, 6)
    .map((s) => s.name);
  const componentPalette = Array.from(
    new Set([...base.componentStyle.palette, ...sectionHints]),
  );

  return {
    ...base,
    industryPattern,
    layoutStyle,
    componentStyle: {
      ...base.componentStyle,
      palette: componentPalette,
    },
    layoutRules: [
      ...base.layoutRules,
      `Support strategy pages: ${input.strategy.pages
        .slice(0, 5)
        .map((p) => p.name)
        .join(", ")}`,
      `Primary CTAs: ${input.strategy.ctas.slice(0, 3).join(", ") || "Get started"}`,
    ],
  };
}

/** Map AI Design System → CoreDesignSystem artifact shape. */
export function aiDesignSystemToCore(
  design: AiDesignSystem,
): CoreDesignSystem {
  return {
    style: design.style,
    stylePreset: design.preset,
    industryPattern: design.industryPattern,
    colors: design.colors,
    typography: design.typography,
    layoutRules: design.layoutRules,
    layoutStyle: design.layoutStyle,
    uiPatterns: design.uiPatterns,
    componentPalette: design.componentStyle.palette,
    spacingScale: design.spacing.scale,
    borderRadius: design.borderRadius,
    shadowStyle: design.shadowStyle,
    spacingSystem: design.spacing,
    uiStyle: design.uiStyle,
    componentStyle: design.componentStyle,
    animationStyle: design.animationStyle,
  };
}

/**
 * Merge product AI design output with Phase 7 decision foundation.
 */
export function mergeCoreDesignWithAiDecisions(
  core: CoreDesignSystem,
  ai: AiDesignSystem,
): CoreDesignSystem {
  return {
    ...core,
    style: ai.style || core.style,
    stylePreset: ai.preset || core.stylePreset,
    industryPattern: ai.industryPattern || core.industryPattern,
    colors: ai.colors,
    typography: ai.typography,
    layoutRules: ai.layoutRules.length ? ai.layoutRules : core.layoutRules,
    layoutStyle: ai.layoutStyle || core.layoutStyle,
    uiPatterns: ai.uiPatterns.length ? ai.uiPatterns : core.uiPatterns,
    componentPalette: ai.componentStyle.palette.length
      ? ai.componentStyle.palette
      : core.componentPalette,
    spacingScale: ai.spacing.scale.length ? ai.spacing.scale : core.spacingScale,
    borderRadius: ai.borderRadius || core.borderRadius,
    shadowStyle: ai.shadowStyle || core.shadowStyle,
    spacingSystem: ai.spacing,
    uiStyle: ai.uiStyle,
    componentStyle: ai.componentStyle,
    animationStyle: ai.animationStyle,
  };
}
