import type { TbdpColorMode } from "@/lib/design-platform/foundations/color/types";
import type { TbdpTypographyProfileId } from "@/lib/design-platform/foundations/typography/types";
import type {
  TbdpBorderTokens,
  TbdpDividerTokens,
} from "@/lib/design-platform/foundations/border/types";
import type { TbdpElevationTokens } from "@/lib/design-platform/foundations/elevation/types";
import type { TbdpGridTokens } from "@/lib/design-platform/foundations/grid/types";
import type { TbdpIconTokens } from "@/lib/design-platform/foundations/icon/types";
import type { TbdpOpacityTokens } from "@/lib/design-platform/foundations/color/types";
import type { TbdpRadiusTokens } from "@/lib/design-platform/foundations/radius/types";
import type { TbdpSemanticColorGroup } from "@/lib/design-platform/foundations/color/types";
import type { TbdpShadowTokens } from "@/lib/design-platform/foundations/shadow/types";
import type { TbdpSpacingTokens } from "@/lib/design-platform/foundations/spacing/types";
import type { TbdpTypographyTokens } from "@/lib/design-platform/foundations/typography/types";

export type TbdpTokenMeta = {
  packageId: string;
  specVersion: string;
  phase: string;
  generatedAt: string;
};

export type TbdpDesignTokens = {
  meta: TbdpTokenMeta;
  mode: TbdpColorMode;
  typographyProfile: TbdpTypographyProfileId;
  color: TbdpSemanticColorGroup;
  opacity: TbdpOpacityTokens;
  typography: TbdpTypographyTokens;
  spacing: TbdpSpacingTokens;
  grid: TbdpGridTokens;
  radius: TbdpRadiusTokens;
  shadow: TbdpShadowTokens;
  border: TbdpBorderTokens;
  divider: TbdpDividerTokens;
  icon: TbdpIconTokens;
  elevation: TbdpElevationTokens;
};

export type TbdpBuildTokensOptions = {
  mode?: TbdpColorMode;
  typographyProfile?: TbdpTypographyProfileId;
};
