import type { TbdpSpacingTokens } from "@/lib/design-platform/foundations/spacing/types";

/** Base spacing unit — all scale values derive from rem multiples of this unit. */
const UNIT = "0.25rem";

export const TBDP_SPACING_TOKENS: TbdpSpacingTokens = {
  unit: UNIT,
  scale: {
    micro: "0.125rem",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },
  semantic: {
    component: {
      gapTight: "0.5rem",
      gapDefault: "0.75rem",
      gapRelaxed: "1rem",
      paddingInline: "1rem",
      paddingBlock: "0.75rem",
    },
    layout: {
      gutter: "1.5rem",
      margin: "1.25rem",
      gap: "2rem",
      stack: "1rem",
    },
    section: {
      sm: "3rem",
      md: "4rem",
      lg: "6rem",
      xl: "8rem",
    },
  },
};
