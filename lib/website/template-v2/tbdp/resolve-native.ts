import { TBDP_INTEGRATION_VERSION } from "@/lib/design-platform/integration/constants";
import { resolveDesignContext } from "@/lib/design-platform/integration/design-resolver";
import type { TbdpSectorId } from "@/lib/design-platform/sector-dna";
import {
  EXECUTIVE_ATLAS_MOTION,
  EXECUTIVE_ATLAS_RESPONSIVE_BASE,
  EXECUTIVE_ATLAS_RESPONSIVE_STRUCTURE,
  EXECUTIVE_ATLAS_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/corporate-business/executive-atlas";
import {
  EMBER_TABLE_MOTION,
  EMBER_TABLE_RESPONSIVE_BASE,
  EMBER_TABLE_RESPONSIVE_STRUCTURE,
  EMBER_TABLE_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/restaurant-premium/ember-table";
import {
  KINETIC_ATELIER_MOTION,
  KINETIC_ATELIER_RESPONSIVE_BASE,
  KINETIC_ATELIER_RESPONSIVE_STRUCTURE,
  KINETIC_ATELIER_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/creative-portfolio/kinetic-atelier";
import {
  STUDIO_VOLT_MOTION,
  STUDIO_VOLT_RESPONSIVE_BASE,
  STUDIO_VOLT_RESPONSIVE_STRUCTURE,
  STUDIO_VOLT_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/creative-agency-premium/studio-volt";
import {
  FOREST_TABLE_MOTION,
  FOREST_TABLE_RESPONSIVE_BASE,
  FOREST_TABLE_RESPONSIVE_STRUCTURE,
  FOREST_TABLE_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/restaurant-signature/forest-table";
import {
  MONOLITH_ESTATE_MOTION,
  MONOLITH_ESTATE_RESPONSIVE_BASE,
  MONOLITH_ESTATE_RESPONSIVE_STRUCTURE,
  MONOLITH_ESTATE_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/real-estate-prestige/monolith-estate";
import {
  PRESTIGE_ESTATES_MOTION,
  PRESTIGE_ESTATES_RESPONSIVE_BASE,
  PRESTIGE_ESTATES_RESPONSIVE_STRUCTURE,
  PRESTIGE_ESTATES_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/real-estate-premium/prestige-estates";
import {
  SERENITY_CLINICAL_MOTION,
  SERENITY_CLINICAL_RESPONSIVE_BASE,
  SERENITY_CLINICAL_RESPONSIVE_STRUCTURE,
  SERENITY_CLINICAL_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/medical-premium/serenity-clinical";
import {
  AZURE_HAVEN_MOTION,
  AZURE_HAVEN_RESPONSIVE_BASE,
  AZURE_HAVEN_RESPONSIVE_STRUCTURE,
  AZURE_HAVEN_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/hotel-resort-premium/azure-haven";
import {
  APEX_LEDGER_MOTION,
  APEX_LEDGER_RESPONSIVE_BASE,
  APEX_LEDGER_RESPONSIVE_STRUCTURE,
  APEX_LEDGER_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/finance-premium/apex-ledger";
import {
  HERITAGE_ACADEMY_MOTION,
  HERITAGE_ACADEMY_RESPONSIVE_BASE,
  HERITAGE_ACADEMY_RESPONSIVE_STRUCTURE,
  HERITAGE_ACADEMY_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/education-premium/heritage-academy";
import {
  ATELIER_COMMERCE_MOTION,
  ATELIER_COMMERCE_RESPONSIVE_BASE,
  ATELIER_COMMERCE_RESPONSIVE_STRUCTURE,
  ATELIER_COMMERCE_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/ecommerce-premium/atelier-commerce";
import {
  NEXUS_COMMAND_MOTION,
  NEXUS_COMMAND_RESPONSIVE_BASE,
  NEXUS_COMMAND_RESPONSIVE_STRUCTURE,
  NEXUS_COMMAND_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp/profiles/saas-enterprise/nexus-command";
import type {
  TbdpNativeResolveInput,
  TbdpNativeResolveResult,
} from "@/lib/website/template-v2/tbdp/types";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

function withRtlLanguageProfile(
  base: TemplateV2DesignTokens,
  languageDirection: "ltr" | "rtl",
): TemplateV2DesignTokens {
  if (languageDirection !== "rtl") return base;
  return {
    ...base,
    languageProfile: {
      ...base.languageProfile,
      directionAdaptation: true,
    },
  };
}

type NativeBinding = {
  tokens: TemplateV2DesignTokens;
  motion: TemplateV2MotionConfig;
  responsiveBase: Pick<TemplateV2ResponsiveRules, "breakpoints" | "containerMaxWidth">;
  responsiveStructure: Pick<TemplateV2ResponsiveRules, "regions" | "components">;
  motionPresetBinding?: string;
};

const NATIVE_BINDINGS: Record<string, NativeBinding> = {
  "restaurant-signature:forest-table": {
    tokens: FOREST_TABLE_V2_TOKENS,
    motion: FOREST_TABLE_MOTION,
    responsiveBase: FOREST_TABLE_RESPONSIVE_BASE,
    responsiveStructure: FOREST_TABLE_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "forest-table-reveal",
  },
  "saas-enterprise:nexus-command": {
    tokens: NEXUS_COMMAND_V2_TOKENS,
    motion: NEXUS_COMMAND_MOTION,
    responsiveBase: NEXUS_COMMAND_RESPONSIVE_BASE,
    responsiveStructure: NEXUS_COMMAND_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "nexus-grid-reveal",
  },
  "corporate-business:executive-atlas": {
    tokens: EXECUTIVE_ATLAS_V2_TOKENS,
    motion: EXECUTIVE_ATLAS_MOTION,
    responsiveBase: EXECUTIVE_ATLAS_RESPONSIVE_BASE,
    responsiveStructure: EXECUTIVE_ATLAS_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "atlas-reveal",
  },
  "restaurant-premium:ember-table": {
    tokens: EMBER_TABLE_V2_TOKENS,
    motion: EMBER_TABLE_MOTION,
    responsiveBase: EMBER_TABLE_RESPONSIVE_BASE,
    responsiveStructure: EMBER_TABLE_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "ember-table-reveal",
  },
  "real-estate-prestige:monolith-estate": {
    tokens: MONOLITH_ESTATE_V2_TOKENS,
    motion: MONOLITH_ESTATE_MOTION,
    responsiveBase: MONOLITH_ESTATE_RESPONSIVE_BASE,
    responsiveStructure: MONOLITH_ESTATE_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "monolith-reveal",
  },
  "real-estate-premium:prestige-estates": {
    tokens: PRESTIGE_ESTATES_V2_TOKENS,
    motion: PRESTIGE_ESTATES_MOTION,
    responsiveBase: PRESTIGE_ESTATES_RESPONSIVE_BASE,
    responsiveStructure: PRESTIGE_ESTATES_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "prestige-reveal",
  },
  "medical-premium:serenity-clinical": {
    tokens: SERENITY_CLINICAL_V2_TOKENS,
    motion: SERENITY_CLINICAL_MOTION,
    responsiveBase: SERENITY_CLINICAL_RESPONSIVE_BASE,
    responsiveStructure: SERENITY_CLINICAL_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "serenity-fade",
  },
  "creative-portfolio:kinetic-atelier": {
    tokens: KINETIC_ATELIER_V2_TOKENS,
    motion: KINETIC_ATELIER_MOTION,
    responsiveBase: KINETIC_ATELIER_RESPONSIVE_BASE,
    responsiveStructure: KINETIC_ATELIER_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "kinetic-spring-stagger",
  },
  "creative-agency-premium:studio-volt": {
    tokens: STUDIO_VOLT_V2_TOKENS,
    motion: STUDIO_VOLT_MOTION,
    responsiveBase: STUDIO_VOLT_RESPONSIVE_BASE,
    responsiveStructure: STUDIO_VOLT_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "kinetic-spring-stagger",
  },
  "ecommerce-premium:atelier-commerce": {
    tokens: ATELIER_COMMERCE_V2_TOKENS,
    motion: ATELIER_COMMERCE_MOTION,
    responsiveBase: ATELIER_COMMERCE_RESPONSIVE_BASE,
    responsiveStructure: ATELIER_COMMERCE_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "atelier-reveal",
  },
  "education-premium:heritage-academy": {
    tokens: HERITAGE_ACADEMY_V2_TOKENS,
    motion: HERITAGE_ACADEMY_MOTION,
    responsiveBase: HERITAGE_ACADEMY_RESPONSIVE_BASE,
    responsiveStructure: HERITAGE_ACADEMY_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "heritage-reveal",
  },
  "finance-premium:apex-ledger": {
    tokens: APEX_LEDGER_V2_TOKENS,
    motion: APEX_LEDGER_MOTION,
    responsiveBase: APEX_LEDGER_RESPONSIVE_BASE,
    responsiveStructure: APEX_LEDGER_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "ledger-reveal",
  },
  "hotel-resort-premium:azure-haven": {
    tokens: AZURE_HAVEN_V2_TOKENS,
    motion: AZURE_HAVEN_MOTION,
    responsiveBase: AZURE_HAVEN_RESPONSIVE_BASE,
    responsiveStructure: AZURE_HAVEN_RESPONSIVE_STRUCTURE,
    motionPresetBinding: "haven-reveal",
  },
};

/**
 * Resolves TBDP-native template manifests into full V2 runtime contracts.
 */
export function resolveTbdpNativePackage(input: TbdpNativeResolveInput): TbdpNativeResolveResult {
  const sectorDnaId = input.tokensManifest.sectorDnaId as TbdpSectorId;
  const templateIdentity = input.tokensManifest.templateIdentity;
  const bindingKey = `${input.packageId}:${templateIdentity}`;
  const binding = NATIVE_BINDINGS[bindingKey];

  if (!binding) {
    throw new Error(
      `TBDP native consumption is not configured for package "${input.packageId}" (identity: ${templateIdentity})`,
    );
  }

  const designContext = resolveDesignContext({
    sectorId: sectorDnaId,
    templateId: input.packageId,
    language: input.language ?? undefined,
    architectureVersion: "v2",
  });

  const experienceProfileIds = input.tokensManifest.experienceProfiles;
  const tokens = withRtlLanguageProfile(binding.tokens, designContext.language.direction);

  let motion = binding.motion;
  if (
    binding.motionPresetBinding &&
    input.motionManifest.presetBinding !== binding.motionPresetBinding
  ) {
    motion = { ...binding.motion, preset: input.motionManifest.presetBinding };
  }

  const responsive: TemplateV2ResponsiveRules = {
    ...binding.responsiveBase,
    ...binding.responsiveStructure,
    ...input.responsiveManifest.structure,
  };

  const meta = {
    enabled: true as const,
    packageId: input.packageId,
    sectorDnaId,
    experienceProfileIds,
    templateIdentity,
    presetBinding: input.motionManifest.presetBinding,
    contextHash: designContext.meta.contextHash,
    integrationVersion: TBDP_INTEGRATION_VERSION,
    consumptionVersion: input.tokensManifest.consumptionVersion ?? "1.0.0",
  };

  return { tokens, motion, responsive, meta, designContext };
}
