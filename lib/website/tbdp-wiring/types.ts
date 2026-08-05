import type { TbdpDesignContext } from "@/lib/design-platform/integration";
import type { WebsiteGenerationInput } from "@/lib/website/types";

/** Serializable TBDP context stored on project.settings. */
export type TbdpStoredDesignContext = {
  sectorDnaId: string;
  contextHash: string;
  integrationVersion: string;
  wiringVersion: string;
  componentIds: string[];
  layoutId: string;
  pageFlow: string[];
  typographyProfile: string;
  direction: "ltr" | "rtl";
  themeMode: string;
  experienceProfileId: string;
  motionPresets: string[];
  resolvedAt: string;
};

export type TbdpWiringInput = {
  prompt?: string;
  language?: string;
  industryId?: string;
  templateId?: string;
  websiteStructureTemplateId?: string;
  templateIntelligenceId?: string;
  components?: string[];
  theme?: string;
  goal?: "conversion" | "trust" | "engagement" | "information";
};

export type TbdpWiringResult = {
  enabled: boolean;
  designContext?: TbdpDesignContext;
  settingsPatch: Record<string, unknown>;
  briefMetadataPatch: Record<string, unknown>;
  suggestedComponents?: string[];
};

export type TbdpPreviewWiringInput = {
  language?: string | null;
  industryId?: string | null;
  templatePackageId?: string | null;
  settings?: Record<string, unknown> | null;
};

export type TbdpPreviewWiringResult = {
  designContext?: TbdpDesignContext;
  tbdpCssLayer?: string;
};

export type TbdpValidationResult = {
  valid: boolean;
  sectorDnaId?: string;
  errors: string[];
  warnings: string[];
};

export function toTbdpWiringInput(
  input: WebsiteGenerationInput | TbdpWiringInput,
): TbdpWiringInput {
  return {
    prompt: "prompt" in input ? input.prompt : undefined,
    language: input.language,
    industryId: "industryId" in input ? input.industryId : undefined,
    templateId:
      ("templateId" in input ? input.templateId : undefined) ??
      ("websiteStructureTemplateId" in input
        ? input.websiteStructureTemplateId
        : undefined),
    websiteStructureTemplateId:
      "websiteStructureTemplateId" in input
        ? input.websiteStructureTemplateId
        : undefined,
    templateIntelligenceId:
      "templateIntelligenceId" in input ? input.templateIntelligenceId : undefined,
    components: "components" in input ? input.components : undefined,
    theme: "theme" in input ? input.theme : undefined,
  };
}
