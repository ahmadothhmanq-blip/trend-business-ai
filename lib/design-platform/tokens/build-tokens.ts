import {
  TBDP_PACKAGE_ID,
  TBDP_PHASE,
  TBDP_SPEC_VERSION,
} from "@/lib/design-platform/constants";
import {
  TBDP_BORDER_TOKENS,
  TBDP_DIVIDER_TOKENS,
} from "@/lib/design-platform/foundations/border/scale";
import { TBDP_ELEVATION_TOKENS } from "@/lib/design-platform/foundations/elevation/layers";
import { TBDP_GRID_TOKENS } from "@/lib/design-platform/foundations/grid/breakpoints";
import { TBDP_ICON_TOKENS } from "@/lib/design-platform/foundations/icon/sizing";
import { TBDP_OPACITY_TOKENS } from "@/lib/design-platform/foundations/color/opacity";
import { resolveSemanticColors } from "@/lib/design-platform/foundations/color/semantic";
import { TBDP_RADIUS_TOKENS } from "@/lib/design-platform/foundations/radius/scale";
import { TBDP_SHADOW_TOKENS } from "@/lib/design-platform/foundations/shadow/elevation";
import { TBDP_SPACING_TOKENS } from "@/lib/design-platform/foundations/spacing/scale";
import { TBDP_TYPOGRAPHY_TOKENS } from "@/lib/design-platform/foundations/typography/profiles";
import type {
  TbdpBuildTokensOptions,
  TbdpDesignTokens,
} from "@/lib/design-platform/tokens/types";

/**
 * Assembles the centralized TBDP token tree from foundation modules.
 * No duplicated values — each foundation module is the single source.
 */
export function buildTbdpDesignTokens(
  options: TbdpBuildTokensOptions = {},
): TbdpDesignTokens {
  const mode = options.mode ?? "light";
  const typographyProfile = options.typographyProfile ?? "latin-ltr";

  return {
    meta: {
      packageId: TBDP_PACKAGE_ID,
      specVersion: TBDP_SPEC_VERSION,
      phase: TBDP_PHASE,
      generatedAt: new Date().toISOString(),
    },
    mode,
    typographyProfile,
    color: resolveSemanticColors(mode),
    opacity: TBDP_OPACITY_TOKENS,
    typography: TBDP_TYPOGRAPHY_TOKENS,
    spacing: TBDP_SPACING_TOKENS,
    grid: TBDP_GRID_TOKENS,
    radius: TBDP_RADIUS_TOKENS,
    shadow: TBDP_SHADOW_TOKENS,
    border: TBDP_BORDER_TOKENS,
    divider: TBDP_DIVIDER_TOKENS,
    icon: TBDP_ICON_TOKENS,
    elevation: TBDP_ELEVATION_TOKENS,
  };
}

/** Default light-mode token set for product consumption. */
export const TBDP_DEFAULT_TOKENS = buildTbdpDesignTokens();
