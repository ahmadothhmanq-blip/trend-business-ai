import type { TbdpMotionPreset } from "@/lib/design-platform/experience/core/types";
import { xp } from "@/lib/design-platform/experience/core/tokens";

/** Official TBDP motion language — all presets are token-driven. */
export const TBDP_MOTION_CATALOG: TbdpMotionPreset[] = [
  // Page & section
  {
    id: "page-enter",
    category: "page",
    durationMs: 500,
    easing: xp.easing.enter,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "page-exit",
    category: "page",
    durationMs: 350,
    easing: xp.easing.exit,
    reducedFallback: "instant",
    gpuSafe: true,
  },
  {
    id: "section-reveal",
    category: "section",
    durationMs: 450,
    easing: xp.easing.spring,
    delayMs: 50,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  // Hero
  {
    id: "hero-headline",
    category: "hero",
    durationMs: 800,
    easing: xp.easing.spring,
    staggerMs: 80,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "hero-media",
    category: "hero",
    durationMs: 900,
    easing: xp.easing.enter,
    delayMs: 120,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  // Cards & grid
  {
    id: "card-lift",
    category: "card",
    durationMs: 250,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
  {
    id: "grid-stagger",
    category: "grid",
    durationMs: 400,
    easing: xp.easing.spring,
    staggerMs: 55,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  // Dialogs
  {
    id: "modal-enter",
    category: "modal",
    durationMs: 300,
    easing: xp.easing.spring,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "modal-exit",
    category: "modal",
    durationMs: 200,
    easing: xp.easing.exit,
    reducedFallback: "instant",
    gpuSafe: true,
  },
  {
    id: "drawer-slide",
    category: "drawer",
    durationMs: 350,
    easing: xp.easing.enter,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  // Toast & tooltip
  {
    id: "toast-enter",
    category: "toast",
    durationMs: 280,
    easing: xp.easing.spring,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "toast-exit",
    category: "toast",
    durationMs: 200,
    easing: xp.easing.exit,
    reducedFallback: "instant",
    gpuSafe: true,
  },
  {
    id: "tooltip-fade",
    category: "tooltip",
    durationMs: 150,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
  // Scroll
  {
    id: "scroll-reveal-up",
    category: "scroll-reveal",
    durationMs: 600,
    easing: xp.easing.spring,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "scroll-parallax-subtle",
    category: "scroll-parallax",
    durationMs: 0,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
  // Stagger
  {
    id: "stagger-children",
    category: "stagger",
    durationMs: 400,
    easing: xp.easing.spring,
    staggerMs: 45,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  // Micro
  {
    id: "hover-lift",
    category: "hover",
    durationMs: 200,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
  {
    id: "focus-ring",
    category: "focus",
    durationMs: 150,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
  {
    id: "success-pulse",
    category: "success",
    durationMs: 500,
    easing: xp.easing.bounce,
    reducedFallback: "fade",
    gpuSafe: true,
  },
  {
    id: "error-shake",
    category: "error",
    durationMs: 400,
    easing: xp.easing.standard,
    reducedFallback: "none",
    gpuSafe: true,
  },
];

export const TBDP_MOTION_COUNT = TBDP_MOTION_CATALOG.length;

export function getMotionByCategory(
  category: TbdpMotionPreset["category"],
): TbdpMotionPreset[] {
  return TBDP_MOTION_CATALOG.filter((p) => p.category === category);
}

export function getMotionPreset(id: string): TbdpMotionPreset | undefined {
  return TBDP_MOTION_CATALOG.find((p) => p.id === id);
}
