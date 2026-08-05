import type { TemplateV2ManifestExtensions } from "@/lib/website/template-v2/contracts/architecture";
import type { TemplateV2ComponentRegistry } from "@/lib/website/template-v2/contracts/component-registry";
import type { TemplateV2PageFlow } from "@/lib/website/template-v2/contracts/flow";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2PresentationProfile } from "@/lib/website/template-v2/contracts/presentation";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";
import type { TbdpDesignContext } from "@/lib/design-platform/integration/core/types";
import type { TbdpNativeConsumptionMeta } from "@/lib/website/template-v2/tbdp/types";

/** Raw manifest JSON with optional V2 extension fields (not yet in engine strict schema). */
export type TemplateV2RawManifest = {
  specVersion: string;
  id: string;
  version: string;
  name: string;
  description: string;
} & TemplateV2ManifestExtensions;

export type TemplateV2ResponsiveRules = {
  breakpoints: Array<{ name: string; minWidth: number }>;
  containerMaxWidth?: string;
  regions?: Record<
    string,
    {
      collapseBelow?: string;
      collapseMode?: string;
      sticky?: boolean;
      position?: string;
    }
  >;
  components?: Record<string, { layout?: Record<string, string> }>;
};

/** Loaded V2 presentation bundle (P0 — no runtime composition). */
export type TemplateV2PackageBundle = {
  packageId: string;
  packageDirectory: string;
  architectureVersion: TemplateArchitectureVersion;
  manifest: TemplateV2RawManifest;
  presentation: TemplateV2PresentationProfile;
  tokens: TemplateV2DesignTokens;
  motion: TemplateV2MotionConfig;
  responsive: TemplateV2ResponsiveRules;
  componentRegistry: TemplateV2ComponentRegistry;
  flows: Record<string, TemplateV2PageFlow>;
  /** Present when package manifests declare tbdpNative: true. */
  tbdpNative?: TbdpNativeConsumptionMeta;
  tbdpDesignContext?: TbdpDesignContext;
};
