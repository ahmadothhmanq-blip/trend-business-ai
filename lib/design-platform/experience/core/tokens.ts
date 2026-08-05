import { tbdpVar } from "@/lib/design-platform/components/core";

/**
 * Experience-layer token references — maps to Phase 1 TBDP variables only.
 */
export const xp = {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
    page: "500ms",
    hero: "800ms",
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    enter: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  distance: {
    sm: tbdpVar("spacing", "sm"),
    md: tbdpVar("spacing", "md"),
    lg: tbdpVar("spacing", "lg"),
    xl: tbdpVar("spacing", "xl"),
  },
  opacity: {
    hidden: "0",
    visible: "1",
    dim: tbdpVar("opacity", "medium"),
  },
  shadow: {
    lift: tbdpVar("shadow", "2"),
    float: tbdpVar("shadow", "3"),
  },
  zIndex: {
    tooltip: "600",
    toast: "500",
    modal: "400",
    drawer: "400",
    dropdown: "100",
  },
} as const;
