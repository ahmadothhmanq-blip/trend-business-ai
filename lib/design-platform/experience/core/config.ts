import {
  TBDP_EXPERIENCE_PHASE,
  TBDP_EXPERIENCE_VERSION,
} from "@/lib/design-platform/experience/constants";
import { TBDP_MOTION_CATALOG } from "@/lib/design-platform/experience/motion/catalog";
import { TBDP_INTERACTION_CATALOG } from "@/lib/design-platform/experience/interaction/catalog";
import { TBDP_FEEDBACK_CATALOG } from "@/lib/design-platform/experience/feedback/catalog";
import { resolveAccessibilityExperience } from "@/lib/design-platform/experience/accessibility/resolve";
import { resolvePerformanceRules } from "@/lib/design-platform/experience/performance/rules";
import { resolveResponsiveExperience } from "@/lib/design-platform/experience/responsive/resolve";
import { resolveDirectionExperience } from "@/lib/design-platform/experience/direction/resolve";
import type {
  TbdpExperienceConfig,
  TbdpExperienceDirection,
  TbdpExperienceMode,
  TbdpInputModality,
  TbdpViewportTier,
} from "@/lib/design-platform/experience/core/types";

export type BuildTbdpExperienceOptions = {
  mode?: TbdpExperienceMode;
  direction?: TbdpExperienceDirection;
  viewport?: TbdpViewportTier;
  inputModality?: TbdpInputModality;
  prefersReducedMotion?: boolean;
};

/**
 * Assembles the complete TBDP experience configuration from all subsystems.
 */
export function buildTbdpExperience(
  options: BuildTbdpExperienceOptions = {},
): TbdpExperienceConfig {
  const prefersReducedMotion = options.prefersReducedMotion ?? false;
  const mode: TbdpExperienceMode =
    options.mode ?? (prefersReducedMotion ? "reduced" : "default");
  const direction = options.direction ?? "ltr";
  const viewport = options.viewport ?? "desktop";
  const inputModality = options.inputModality ?? "hybrid";

  const directionXp = resolveDirectionExperience(direction);
  const responsiveXp = resolveResponsiveExperience(viewport, inputModality);
  const a11y = resolveAccessibilityExperience({ mode, prefersReducedMotion });
  const perf = resolvePerformanceRules(mode);

  const motionEnabled = mode !== "reduced" && !prefersReducedMotion;

  const presets = Object.fromEntries(
    TBDP_MOTION_CATALOG.map((p) => [
      p.id,
      motionEnabled
        ? directionXp.applyToMotion(p)
        : { ...p, durationMs: p.reducedFallback === "instant" ? 0 : Math.min(p.durationMs, 200) },
    ]),
  );

  return {
    meta: {
      phase: TBDP_EXPERIENCE_PHASE,
      version: TBDP_EXPERIENCE_VERSION,
      generatedAt: new Date().toISOString(),
    },
    mode,
    direction,
    viewport,
    inputModality,
    motion: {
      enabled: motionEnabled,
      presets,
    },
    interaction: {
      behaviors: TBDP_INTERACTION_CATALOG.map((b) =>
        responsiveXp.adaptInteraction(b, inputModality),
      ),
    },
    feedback: {
      states: Object.fromEntries(
        TBDP_FEEDBACK_CATALOG.map((f) => [f.id, f.experience]),
      ) as TbdpExperienceConfig["feedback"]["states"],
    },
    accessibility: a11y,
    performance: {
      ...perf,
      lazyInteractions: viewport === "mobile" || mode === "performance",
    },
  };
}

export const TBDP_DEFAULT_EXPERIENCE = buildTbdpExperience();
