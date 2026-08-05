import type { TbdpExperienceMode } from "@/lib/design-platform/experience/core/types";
import { TBDP_ICON_TOKENS } from "@/lib/design-platform/foundations/icon";
import { tbdpVar } from "@/lib/design-platform/components/core";

export type TbdpAccessibilityExperience = {
  reducedMotion: boolean;
  focusVisible: boolean;
  minTouchTarget: string;
  keyboardNav: boolean;
  screenReaderAnnouncements: boolean;
  contrastEnhancement: boolean;
};

export function resolveAccessibilityExperience(options: {
  mode: TbdpExperienceMode;
  prefersReducedMotion?: boolean;
}): TbdpAccessibilityExperience {
  const reduced = options.mode === "reduced" || options.prefersReducedMotion === true;
  return {
    reducedMotion: reduced,
    focusVisible: true,
    minTouchTarget: TBDP_ICON_TOKENS.spacing.touchTarget,
    keyboardNav: true,
    screenReaderAnnouncements: true,
    contrastEnhancement: reduced,
  };
}

export const TBDP_FOCUS_MANAGEMENT = {
  trapSelector: '[data-tbdp-xp-focus-trap="true"]',
  restoreFocus: true,
  initialFocus: "first-tabbable",
} as const;

export const TBDP_KEYBOARD_NAV = {
  rovingTabindex: true,
  arrowKeyNavigation: true,
  escapeCloses: true,
  homeEndNavigation: true,
} as const;

export const TBDP_ARIA_BEHAVIORS = {
  liveRegionPolite: "polite",
  liveRegionAssertive: "assertive",
  modalAriaModal: true,
  expandedState: true,
} as const;

export const TBDP_CONTRAST_BEHAVIORS = {
  focusRingColor: tbdpVar("color", "border", "focus"),
  highContrastBorder: tbdpVar("color", "border", "strong"),
} as const;
