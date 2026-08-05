import type {
  TbdpInputModality,
  TbdpInteractionBehavior,
  TbdpViewportTier,
} from "@/lib/design-platform/experience/core/types";
import { TBDP_GRID_TOKENS } from "@/lib/design-platform/foundations/grid";

export type TbdpResponsiveExperience = {
  viewport: TbdpViewportTier;
  inputModality: TbdpInputModality;
  columns: number;
  gutter: string;
  touchOptimized: boolean;
  adaptInteraction: (
    behavior: TbdpInteractionBehavior,
    modality: TbdpInputModality,
  ) => TbdpInteractionBehavior;
};

const VIEWPORT_COLUMNS: Record<TbdpViewportTier, number> = {
  mobile: TBDP_GRID_TOKENS.columns.mobile,
  tablet: TBDP_GRID_TOKENS.columns.tablet,
  laptop: TBDP_GRID_TOKENS.columns.desktop,
  desktop: TBDP_GRID_TOKENS.columns.desktop,
  "ultra-wide": TBDP_GRID_TOKENS.columns.desktop,
  foldable: TBDP_GRID_TOKENS.columns.tablet,
};

const VIEWPORT_GUTTER: Record<TbdpViewportTier, keyof typeof TBDP_GRID_TOKENS.gutters> = {
  mobile: "mobile",
  tablet: "tablet",
  laptop: "desktop",
  desktop: "desktop",
  "ultra-wide": "desktop",
  foldable: "tablet",
};

export function resolveResponsiveExperience(
  viewport: TbdpViewportTier,
  inputModality: TbdpInputModality,
): TbdpResponsiveExperience {
  const touchOptimized =
    inputModality === "touch" ||
    inputModality === "hybrid" ||
    viewport === "mobile" ||
    viewport === "foldable";

  return {
    viewport,
    inputModality,
    columns: VIEWPORT_COLUMNS[viewport],
    gutter: TBDP_GRID_TOKENS.gutters[VIEWPORT_GUTTER[viewport]],
    touchOptimized,
    adaptInteraction(behavior, modality) {
      if (modality === "keyboard" && behavior.trigger === "pointerenter") {
        return { ...behavior, trigger: "focus", response: "focus-ring" };
      }
      if (touchOptimized && behavior.id === "card-hover") {
        return { ...behavior, trigger: "pointerdown", response: "card-tap" };
      }
      return behavior;
    },
  };
}
