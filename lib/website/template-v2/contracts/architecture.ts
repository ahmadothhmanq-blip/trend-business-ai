import type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";

export type TemplateV2ArchitectureBlock = {
  version: TemplateArchitectureVersion;
  composer?: string;
  sdkVersion?: string;
};

export type TemplateV2ManifestExtensions = {
  architecture?: TemplateV2ArchitectureBlock;
  presentation?: { file: string };
  tokens?: { file: string };
  motion?: { file: string };
  /** V2 responsive rules file — used when V1 inline `responsive` coexists in manifest. */
  responsiveConfig?: { file: string };
  responsive?: { file: string };
  componentLibrary?: { file: string; root?: string };
  pageFlows?: Record<string, string>;
};
