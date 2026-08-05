import {
  WB_TEMPLATE_V2_DEFAULT_COMPOSER,
  WB_TEMPLATE_V2_SDK_VERSION,
  WB_TEMPLATE_V2_SPEC_VERSION,
} from "@/lib/website/template-v2/constants";
import type { TemplateV2ComponentDefinition } from "@/lib/website/template-v2/contracts/component-registry";
import type { TemplateV2PageFlow } from "@/lib/website/template-v2/contracts/flow";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2PresentationProfile } from "@/lib/website/template-v2/contracts/presentation";
import type { TemplateV2RawManifest } from "@/lib/website/template-v2/contracts/package";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

export type DefineTemplateV2Input = {
  id: string;
  version: string;
  name: string;
  description: string;
  presentation: TemplateV2PresentationProfile;
  tokens: TemplateV2DesignTokens;
  motion: TemplateV2MotionConfig;
  responsive: TemplateV2ResponsiveRules;
  components: TemplateV2ComponentDefinition[];
  flows: Record<string, TemplateV2PageFlow>;
  composer?: string;
};

export type DefinedTemplateV2Package = {
  specVersion: typeof WB_TEMPLATE_V2_SPEC_VERSION;
  manifest: TemplateV2RawManifest;
  files: {
    presentation: TemplateV2PresentationProfile;
    tokens: TemplateV2DesignTokens;
    motion: TemplateV2MotionConfig;
    responsive: TemplateV2ResponsiveRules;
    componentRegistry: { components: TemplateV2ComponentDefinition[] };
    flows: Record<string, TemplateV2PageFlow>;
  };
};

const V2_FILE_PATHS = {
  presentation: "presentation/presentation.json",
  tokens: "tokens/tokens.json",
  motion: "motion/motion.json",
  responsive: "responsive/responsive.json",
  componentRegistry: "components/registry.json",
} as const;

/**
 * Authoring helper — produces manifest + file payloads for a V2 package.
 * P0: skeleton only; does not write to disk or register packages.
 */
export function defineTemplateV2(input: DefineTemplateV2Input): DefinedTemplateV2Package {
  const composer = input.composer ?? WB_TEMPLATE_V2_DEFAULT_COMPOSER;
  const pageFlows: Record<string, string> = {};
  for (const [flowKey] of Object.entries(input.flows)) {
    pageFlows[flowKey] = `flows/${flowKey}.json`;
  }

  const manifest: TemplateV2RawManifest = {
    specVersion: WB_TEMPLATE_V2_SPEC_VERSION,
    id: input.id,
    version: input.version,
    name: input.name,
    description: input.description,
    architecture: {
      version: "v2",
      composer,
      sdkVersion: WB_TEMPLATE_V2_SDK_VERSION,
    },
    presentation: { file: V2_FILE_PATHS.presentation },
    tokens: { file: V2_FILE_PATHS.tokens },
    motion: { file: V2_FILE_PATHS.motion },
    responsive: { file: V2_FILE_PATHS.responsive },
    componentLibrary: {
      file: V2_FILE_PATHS.componentRegistry,
      root: "components",
    },
    pageFlows,
  };

  return {
    specVersion: WB_TEMPLATE_V2_SPEC_VERSION,
    manifest,
    files: {
      presentation: input.presentation,
      tokens: input.tokens,
      motion: input.motion,
      responsive: input.responsive,
      componentRegistry: { components: input.components },
      flows: input.flows,
    },
  };
}
