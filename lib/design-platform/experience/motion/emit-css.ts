import { TBDP_EXPERIENCE_PREFIX } from "@/lib/design-platform/experience/constants";
import { xp } from "@/lib/design-platform/experience/core/tokens";
import type { TbdpMotionPreset } from "@/lib/design-platform/experience/core/types";

/** CSS keyframe definitions — GPU-safe (transform + opacity only). */
export const TBDP_MOTION_KEYFRAMES: Record<string, string> = {
  "xp-fade-in": `
@keyframes tbdp-xp-fade-in {
  from { opacity: ${xp.opacity.hidden}; }
  to { opacity: ${xp.opacity.visible}; }
}`,
  "xp-fade-out": `
@keyframes tbdp-xp-fade-out {
  from { opacity: ${xp.opacity.visible}; }
  to { opacity: ${xp.opacity.hidden}; }
}`,
  "xp-rise": `
@keyframes tbdp-xp-rise {
  from { opacity: ${xp.opacity.hidden}; transform: translateY(${xp.distance.lg}); }
  to { opacity: ${xp.opacity.visible}; transform: translateY(0); }
}`,
  "xp-rise-rtl": `
@keyframes tbdp-xp-rise-rtl {
  from { opacity: ${xp.opacity.hidden}; transform: translateX(${xp.distance.lg}); }
  to { opacity: ${xp.opacity.visible}; transform: translateX(0); }
}`,
  "xp-scale-in": `
@keyframes tbdp-xp-scale-in {
  from { opacity: ${xp.opacity.hidden}; transform: scale(0.96); }
  to { opacity: ${xp.opacity.visible}; transform: scale(1); }
}`,
  "xp-slide-end": `
@keyframes tbdp-xp-slide-end {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}`,
  "xp-slide-start": `
@keyframes tbdp-xp-slide-start {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}`,
  "xp-shake": `
@keyframes tbdp-xp-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(calc(${xp.distance.sm} * -1)); }
  40%, 80% { transform: translateX(${xp.distance.sm}); }
}`,
  "xp-pulse": `
@keyframes tbdp-xp-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}`,
  "xp-lift": `
@keyframes tbdp-xp-lift {
  to { transform: translateY(calc(${xp.distance.sm} * -1)); box-shadow: ${xp.shadow.lift}; }
}`,
};

const PRESET_TO_KEYFRAME: Record<string, string> = {
  "page-enter": "tbdp-xp-rise",
  "page-exit": "tbdp-xp-fade-out",
  "section-reveal": "tbdp-xp-rise",
  "hero-headline": "tbdp-xp-rise",
  "hero-media": "tbdp-xp-scale-in",
  "card-lift": "tbdp-xp-lift",
  "grid-stagger": "tbdp-xp-rise",
  "modal-enter": "tbdp-xp-scale-in",
  "modal-exit": "tbdp-xp-fade-out",
  "drawer-slide": "tbdp-xp-slide-end",
  "toast-enter": "tbdp-xp-rise",
  "toast-exit": "tbdp-xp-fade-out",
  "tooltip-fade": "tbdp-xp-fade-in",
  "scroll-reveal-up": "tbdp-xp-rise",
  "stagger-children": "tbdp-xp-rise",
  "hover-lift": "tbdp-xp-lift",
  "focus-ring": "tbdp-xp-fade-in",
  "success-pulse": "tbdp-xp-pulse",
  "error-shake": "tbdp-xp-shake",
};

export function motionPresetToAnimation(preset: TbdpMotionPreset): string {
  const name = PRESET_TO_KEYFRAME[preset.id] ?? "tbdp-xp-fade-in";
  const duration = `${preset.durationMs}ms`;
  const delay = preset.delayMs ? `${preset.delayMs}ms` : "0ms";
  return `${name} ${duration} ${preset.easing} ${delay} both`;
}

export function emitTbdpMotionCss(): string {
  const lines = [
    `/* TBDP Phase 3 — Motion System · ${TBDP_EXPERIENCE_PREFIX} */`,
    ...Object.values(TBDP_MOTION_KEYFRAMES),
    "",
    "@media (prefers-reduced-motion: reduce) {",
    `  [data-${TBDP_EXPERIENCE_PREFIX}-motion] { animation: none !important; transition: none !important; }`,
    "}",
    "",
    `[data-${TBDP_EXPERIENCE_PREFIX}-motion] { will-change: transform, opacity; }`,
  ];

  for (const preset of Object.keys(PRESET_TO_KEYFRAME)) {
    const keyframe = PRESET_TO_KEYFRAME[preset];
    lines.push(
      `[data-${TBDP_EXPERIENCE_PREFIX}-motion="${preset}"] { animation-name: ${keyframe}; }`,
    );
  }

  return lines.join("\n");
}
