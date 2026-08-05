import type { TbdpGridTokens } from "@/lib/design-platform/foundations/grid/types";

export const TBDP_GRID_TOKENS: TbdpGridTokens = {
  breakpoints: {
    mobile: { minWidth: "0px", maxWidth: "639px" },
    tablet: { minWidth: "640px", maxWidth: "1023px" },
    desktop: { minWidth: "1024px" },
  },
  containers: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
    full: "100%",
  },
  columns: {
    mobile: 4,
    tablet: 8,
    desktop: 12,
  },
  gutters: {
    mobile: "1rem",
    tablet: "1.25rem",
    desktop: "1.5rem",
  },
  safeAreas: {
    top: "env(safe-area-inset-top, 0px)",
    right: "env(safe-area-inset-right, 0px)",
    bottom: "env(safe-area-inset-bottom, 0px)",
    left: "env(safe-area-inset-left, 0px)",
  },
  maxWidths: {
    content: "72rem",
    prose: "42rem",
    wide: "90rem",
  },
};
