import { TBDP_EXPERIENCE_PREFIX } from "@/lib/design-platform/experience/constants";
import { emitTbdpMotionCss } from "@/lib/design-platform/experience/motion/emit-css";
import { tbdpVar } from "@/lib/design-platform/components/core";

/**
 * Emits complete TBDP Phase 3 experience CSS (motion + interaction utilities).
 * All values reference Phase 1 TBDP tokens.
 */
export function emitTbdpExperienceCss(): string {
  const p = TBDP_EXPERIENCE_PREFIX;
  return [
    emitTbdpMotionCss(),
    "",
    `/* TBDP Experience — interaction utilities */`,
    `[data-${p}] { --tbdp-xp-focus: ${tbdpVar("color", "border", "focus")}; }`,
    `[data-${p}-feedback="loading"] { cursor: wait; }`,
    `[data-${p}-feedback="error"] { border-color: ${tbdpVar("color", "danger")}; }`,
    `[data-${p}-feedback="success"] { border-color: ${tbdpVar("color", "success")}; }`,
    `[data-${p}-touch="true"] { min-height: ${tbdpVar("spacing", "2xl")}; min-width: ${tbdpVar("spacing", "2xl")}; }`,
    `[data-${p}-gpu] { transform: translateZ(0); backface-visibility: hidden; }`,
    `[data-${p}-contain] { content-visibility: auto; contain-intrinsic-size: auto 500px; }`,
    "",
    `@media (prefers-reduced-motion: reduce) {`,
    `  [data-${p}], [data-${p}-motion] { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`,
    `}`,
  ].join("\n");
}

/** Returns data attributes for applying a motion preset to an element. */
export function motionDataAttributes(presetId: string): Record<string, string> {
  return {
    [`data-${TBDP_EXPERIENCE_PREFIX}-motion`]: presetId,
  };
}

/** Returns data attributes for feedback experience state. */
export function feedbackDataAttributes(state: string): Record<string, string> {
  return {
    [`data-${TBDP_EXPERIENCE_PREFIX}-feedback`]: state,
  };
}
