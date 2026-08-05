import { TBDP_SHADOW_TOKENS } from "@/lib/design-platform/foundations/shadow/elevation";
import type { TbdpElevationTokens } from "@/lib/design-platform/foundations/elevation/types";

export const TBDP_ELEVATION_TOKENS: TbdpElevationTokens = {
  layers: {
    base: { zIndex: 0, shadow: TBDP_SHADOW_TOKENS["0"] },
    raised: { zIndex: 10, shadow: TBDP_SHADOW_TOKENS["1"] },
    dropdown: { zIndex: 100, shadow: TBDP_SHADOW_TOKENS["2"] },
    sticky: { zIndex: 200, shadow: TBDP_SHADOW_TOKENS["2"] },
    popover: { zIndex: 300, shadow: TBDP_SHADOW_TOKENS["3"] },
    modal: { zIndex: 400, shadow: TBDP_SHADOW_TOKENS["4"] },
    toast: { zIndex: 500, shadow: TBDP_SHADOW_TOKENS["3"] },
    tooltip: { zIndex: 600, shadow: TBDP_SHADOW_TOKENS["2"] },
  },
  hierarchy: {
    description: "Visual depth ordering from base content to tooltips.",
    order: [
      "base",
      "raised",
      "dropdown",
      "sticky",
      "popover",
      "modal",
      "toast",
      "tooltip",
    ],
  },
};
