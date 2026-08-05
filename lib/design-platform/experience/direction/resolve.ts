import type { TbdpExperienceDirection, TbdpMotionPreset } from "@/lib/design-platform/experience/core/types";

export type TbdpDirectionExperience = {
  direction: TbdpExperienceDirection;
  drawerSide: "start" | "end";
  navigationAlign: "start" | "end";
  carouselDirection: "forward" | "reverse";
  timelineFlow: "ltr" | "rtl";
  motionAxis: "x" | "y";
  applyToMotion: (preset: TbdpMotionPreset) => TbdpMotionPreset;
};

export function resolveDirectionExperience(
  direction: TbdpExperienceDirection,
): TbdpDirectionExperience {
  const isRtl = direction === "rtl";

  return {
    direction,
    drawerSide: isRtl ? "start" : "end",
    navigationAlign: isRtl ? "end" : "start",
    carouselDirection: isRtl ? "reverse" : "forward",
    timelineFlow: direction,
    motionAxis: isRtl ? "x" : "y",
    applyToMotion(preset) {
      if (!isRtl) return preset;
      if (preset.id === "drawer-slide") {
        return { ...preset, id: `${preset.id}-rtl` };
      }
      if (preset.category === "scroll-reveal" || preset.category === "hero") {
        return { ...preset, easing: preset.easing };
      }
      return preset;
    },
  };
}

export const TBDP_RTL_MOTION_OVERRIDES: Record<string, string> = {
  "drawer-slide-rtl": "tbdp-xp-slide-start",
  "scroll-reveal-up": "tbdp-xp-rise-rtl",
};

export const TBDP_SPACING_BEHAVIOR = {
  logicalProperties: true,
  marginInline: true,
  paddingInline: true,
  borderInline: true,
} as const;
