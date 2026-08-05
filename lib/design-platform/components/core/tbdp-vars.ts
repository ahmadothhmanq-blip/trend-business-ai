import { TBDP_CSS_VAR_PREFIX } from "@/lib/design-platform/constants";

/** Builds a TBDP CSS custom property reference. */
export function tbdpVar(...segments: string[]): string {
  return `var(--${TBDP_CSS_VAR_PREFIX}-${segments.join("-")})`;
}

/**
 * Central TBDP token variable map — components MUST reference these, never raw values.
 * Maps to Phase 1 emitted CSS variables.
 */
export const v = {
  color: {
    primary: tbdpVar("color", "primary"),
    secondary: tbdpVar("color", "secondary"),
    accent: tbdpVar("color", "accent"),
    success: tbdpVar("color", "success"),
    warning: tbdpVar("color", "warning"),
    danger: tbdpVar("color", "danger"),
    info: tbdpVar("color", "info"),
    surface: {
      base: tbdpVar("color", "surface", "base"),
      raised: tbdpVar("color", "surface", "raised"),
      overlay: tbdpVar("color", "surface", "overlay"),
      sunken: tbdpVar("color", "surface", "sunken"),
      inverse: tbdpVar("color", "surface", "inverse"),
    },
    background: {
      canvas: tbdpVar("color", "background", "canvas"),
      subtle: tbdpVar("color", "background", "subtle"),
      emphasis: tbdpVar("color", "background", "emphasis"),
      inverse: tbdpVar("color", "background", "inverse"),
    },
    text: {
      primary: tbdpVar("color", "text", "primary"),
      secondary: tbdpVar("color", "text", "secondary"),
      tertiary: tbdpVar("color", "text", "tertiary"),
      disabled: tbdpVar("color", "text", "disabled"),
      inverse: tbdpVar("color", "text", "inverse"),
      link: tbdpVar("color", "text", "link"),
      linkHover: tbdpVar("color", "text", "linkHover"),
    },
    border: {
      default: tbdpVar("color", "border", "default"),
      subtle: tbdpVar("color", "border", "subtle"),
      strong: tbdpVar("color", "border", "strong"),
      focus: tbdpVar("color", "border", "focus"),
      inverse: tbdpVar("color", "border", "inverse"),
    },
    overlay: {
      scrim: tbdpVar("color", "overlay", "scrim"),
      scrimStrong: tbdpVar("color", "overlay", "scrimStrong"),
      backdrop: tbdpVar("color", "overlay", "backdrop"),
      highlight: tbdpVar("color", "overlay", "highlight"),
    },
  },
  spacing: {
    micro: tbdpVar("spacing", "micro"),
    xs: tbdpVar("spacing", "xs"),
    sm: tbdpVar("spacing", "sm"),
    md: tbdpVar("spacing", "md"),
    lg: tbdpVar("spacing", "lg"),
    xl: tbdpVar("spacing", "xl"),
    "2xl": tbdpVar("spacing", "2xl"),
    "3xl": tbdpVar("spacing", "3xl"),
    "4xl": tbdpVar("spacing", "4xl"),
  },
  radius: {
    sharp: tbdpVar("radius", "sharp"),
    sm: tbdpVar("radius", "sm"),
    md: tbdpVar("radius", "md"),
    lg: tbdpVar("radius", "lg"),
    pill: tbdpVar("radius", "pill"),
    circle: tbdpVar("radius", "circle"),
  },
  shadow: {
    "0": tbdpVar("shadow", "0"),
    "1": tbdpVar("shadow", "1"),
    "2": tbdpVar("shadow", "2"),
    "3": tbdpVar("shadow", "3"),
    "4": tbdpVar("shadow", "4"),
    "5": tbdpVar("shadow", "5"),
  },
  font: {
    display: tbdpVar("font-display"),
    body: tbdpVar("font-body"),
    mono: tbdpVar("font-mono"),
  },
  container: {
    sm: tbdpVar("container", "sm"),
    md: tbdpVar("container", "md"),
    lg: tbdpVar("container", "lg"),
    xl: tbdpVar("container", "xl"),
    "2xl": tbdpVar("container", "2xl"),
    full: tbdpVar("container", "full"),
  },
} as const;
