import type { TbdpExperienceMode } from "@/lib/design-platform/experience/core/types";

export type TbdpPerformanceRules = {
  maxConcurrentAnimations: number;
  preferTransformOpacity: boolean;
  animationBudgetMs: number;
  gpuOnlyProperties: string[];
  lazyInteractionThreshold: number;
  layoutShiftPrevention: boolean;
};

const MODE_BUDGETS: Record<TbdpExperienceMode, number> = {
  default: 16,
  reduced: 4,
  performance: 8,
};

export function resolvePerformanceRules(mode: TbdpExperienceMode): TbdpPerformanceRules {
  return {
    maxConcurrentAnimations: MODE_BUDGETS[mode],
    preferTransformOpacity: true,
    animationBudgetMs: mode === "performance" ? 8 : 16,
    gpuOnlyProperties: ["transform", "opacity", "filter"],
    lazyInteractionThreshold: mode === "performance" ? 100 : 50,
    layoutShiftPrevention: true,
  };
}

export const TBDP_PERFORMANCE_RULES = {
  noWidthHeightAnimation: true,
  noTopLeftAnimation: true,
  useWillChangeSparingly: true,
  intersectionObserverForReveal: true,
  debounceScrollHandlers: true,
} as const;

export function isGpuSafeProperty(property: string): boolean {
  return ["transform", "opacity", "filter"].includes(property);
}
