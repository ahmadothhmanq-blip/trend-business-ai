import { resolveTbdpNativePackage } from "@/lib/website/template-v2/tbdp/resolve-native";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type {
  TbdpNativeResolveResult,
  TemplateV2TbdpNativeMotionManifest,
  TemplateV2TbdpNativeResponsiveManifest,
  TemplateV2TbdpNativeTokensManifest,
} from "@/lib/website/template-v2/tbdp/types";

export type ConsumeTbdpNativePackageInput = {
  bundle: TemplateV2PackageBundle;
  tokensRaw: TemplateV2TbdpNativeTokensManifest;
  motionRaw: TemplateV2TbdpNativeMotionManifest;
  responsiveRaw: TemplateV2TbdpNativeResponsiveManifest;
  language?: string | null;
};

export type ConsumedTbdpNativeBundle = TemplateV2PackageBundle & {
  tbdpNative: TbdpNativeResolveResult["meta"];
  tbdpDesignContext: TbdpNativeResolveResult["designContext"];
};

/**
 * Replaces local template design decisions with TBDP-resolved contracts.
 * Called at package load time when manifests declare tbdpNative: true.
 */
export function consumeTbdpNativePackage(
  input: ConsumeTbdpNativePackageInput,
): ConsumedTbdpNativeBundle {
  const resolved = resolveTbdpNativePackage({
    packageId: input.bundle.packageId,
    tokensManifest: input.tokensRaw,
    motionManifest: input.motionRaw,
    responsiveManifest: input.responsiveRaw,
    language: input.language,
  });

  return {
    ...input.bundle,
    tokens: resolved.tokens,
    motion: resolved.motion,
    responsive: resolved.responsive,
    tbdpNative: resolved.meta,
    tbdpDesignContext: resolved.designContext,
  };
}
