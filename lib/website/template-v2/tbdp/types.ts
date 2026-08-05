import type { TbdpDesignContext } from "@/lib/design-platform/integration/core/types";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Manifest shape stored in template package tokens.json when TBDP-native. */
export type TemplateV2TbdpNativeTokensManifest = {
  tbdpNative: true;
  sectorDnaId: string;
  experienceProfiles: string[];
  templateIdentity: string;
  consumptionVersion?: string;
};

/** Manifest shape stored in template package motion.json when TBDP-native. */
export type TemplateV2TbdpNativeMotionManifest = {
  tbdpNative: true;
  sectorDnaId: string;
  experienceProfiles: string[];
  presetBinding: string;
};

/** Manifest shape stored in template package responsive.json when TBDP-native. */
export type TemplateV2TbdpNativeResponsiveManifest = {
  tbdpNative: true;
  sectorDnaId: string;
  experienceProfiles?: string[];
  structure?: Pick<TemplateV2ResponsiveRules, "regions" | "components">;
};

export type TbdpNativeConsumptionMeta = {
  enabled: true;
  packageId: string;
  sectorDnaId: string;
  experienceProfileIds: string[];
  templateIdentity: string;
  presetBinding?: string;
  contextHash: string;
  integrationVersion: string;
  consumptionVersion: string;
};

export type TbdpNativeResolveInput = {
  packageId: string;
  tokensManifest: TemplateV2TbdpNativeTokensManifest;
  motionManifest: TemplateV2TbdpNativeMotionManifest;
  responsiveManifest: TemplateV2TbdpNativeResponsiveManifest;
  language?: string | null;
};

export type TbdpNativeResolveResult = {
  tokens: TemplateV2DesignTokens;
  motion: TemplateV2MotionConfig;
  responsive: TemplateV2ResponsiveRules;
  meta: TbdpNativeConsumptionMeta;
  designContext: TbdpDesignContext;
};

export function isTbdpNativeTokensManifest(
  value: unknown,
): value is TemplateV2TbdpNativeTokensManifest {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TemplateV2TbdpNativeTokensManifest).tbdpNative === true
  );
}

export function isTbdpNativeMotionManifest(
  value: unknown,
): value is TemplateV2TbdpNativeMotionManifest {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TemplateV2TbdpNativeMotionManifest).tbdpNative === true
  );
}

export function isTbdpNativeResponsiveManifest(
  value: unknown,
): value is TemplateV2TbdpNativeResponsiveManifest {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TemplateV2TbdpNativeResponsiveManifest).tbdpNative === true
  );
}
