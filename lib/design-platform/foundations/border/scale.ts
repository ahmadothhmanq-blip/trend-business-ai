import type { TbdpBorderTokens, TbdpDividerTokens } from "@/lib/design-platform/foundations/border/types";

export const TBDP_BORDER_TOKENS: TbdpBorderTokens = {
  width: {
    none: "0",
    hairline: "1px",
    thin: "1.5px",
    medium: "2px",
    thick: "3px",
  },
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  },
};

export const TBDP_DIVIDER_TOKENS: TbdpDividerTokens = {
  horizontal: "1px solid var(--tbdp-color-border-default)",
  vertical: "1px solid var(--tbdp-color-border-default)",
  inset: "1px solid var(--tbdp-color-border-subtle)",
};
