import { z } from "zod";
import { WB_TEMPLATE_V2_ARCHITECTURE_VERSIONS } from "@/lib/website/template-v2/constants";

const kebabId = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");

const relativePath = z
  .string()
  .min(1)
  .refine((value) => !value.includes(".."), "must not contain ..")
  .refine((value) => !value.startsWith("/"), "must be package-relative");

export const templateV2ArchitectureBlockSchema = z.object({
  version: z.enum(WB_TEMPLATE_V2_ARCHITECTURE_VERSIONS),
  composer: z.string().min(1).optional(),
  sdkVersion: z.string().min(1).optional(),
});

export const templateV2ManifestExtensionsSchema = z.object({
  architecture: templateV2ArchitectureBlockSchema.optional(),
  presentation: z.object({ file: relativePath }).optional(),
  tokens: z.object({ file: relativePath }).optional(),
  motion: z.object({ file: relativePath }).optional(),
  responsive: z.object({ file: relativePath }).optional(),
  responsiveConfig: z.object({ file: relativePath }).optional(),
  componentLibrary: z
    .object({
      file: relativePath,
      root: relativePath.optional(),
    })
    .optional(),
  pageFlows: z.record(z.string(), relativePath).optional(),
});

export const templateV2PresentationRegionSchema = z.object({
  role: z.enum(["header", "main", "sidebar", "footer", "overlay", "utility"]),
  sticky: z.boolean().optional(),
  collapseBelow: z.enum(["sm", "md", "lg", "xl"]).optional(),
});

export const templateV2PresentationProfileSchema = z.object({
  packageId: kebabId,
  templateIntelligenceHint: z.string().min(1).optional(),
  layout: z.object({
    defaultLayoutId: kebabId,
    regions: z.record(z.string(), templateV2PresentationRegionSchema),
  }),
  navigation: z.object({
    componentId: z.string().min(1),
    variant: z.string().min(1).optional(),
  }),
  hero: z.object({
    componentId: z.string().min(1),
    region: z.string().min(1),
  }),
  footer: z.object({
    componentId: z.string().min(1),
    region: z.string().min(1),
  }),
  homeFlow: z.object({
    regions: z.record(z.string(), z.array(z.string().min(1))),
  }),
  sectionShell: z
    .object({
      strategy: z.enum(["none", "package", "shared-primitive"]),
      componentId: z.string().min(1).optional(),
    })
    .optional(),
  aiGeneration: z
    .object({
      contentProfile: z.string().min(1).optional(),
      suggestedPages: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

/** TBDP-native manifest — design values resolved at load time from TBDP. */
export const templateV2TbdpNativeTokensManifestSchema = z.object({
  tbdpNative: z.literal(true),
  sectorDnaId: z.string().min(1),
  experienceProfiles: z.array(z.string().min(1)).min(1),
  templateIdentity: z.string().min(1),
  consumptionVersion: z.string().min(1).optional(),
});

export const templateV2DesignTokensSchema = z.object({
  colors: z.record(z.string(), z.string().min(1)),
  typography: z.object({
    display: z.string().min(1),
    body: z.string().min(1),
    scale: z.record(z.string(), z.string().min(1)).optional(),
  }),
  languageProfile: z
    .object({
      directionAdaptation: z.boolean().optional(),
      rtlTypography: z
        .object({
          display: z.string().min(1),
          body: z.string().min(1),
        })
        .optional(),
      ltrTypography: z
        .object({
          display: z.string().min(1).optional(),
          body: z.string().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
  spacing: z
    .object({
      unit: z.string().min(1).optional(),
      scale: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  radius: z.record(z.string(), z.string().min(1)).optional(),
  shadows: z.record(z.string(), z.string().min(1)).optional(),
  borders: z.record(z.string(), z.string().min(1)).optional(),
});

export const templateV2TokensInputSchema = z.union([
  templateV2DesignTokensSchema,
  templateV2TbdpNativeTokensManifestSchema,
]);

export const templateV2TbdpNativeMotionManifestSchema = z.object({
  tbdpNative: z.literal(true),
  sectorDnaId: z.string().min(1),
  experienceProfiles: z.array(z.string().min(1)).min(1),
  presetBinding: z.string().min(1),
});

export const templateV2MotionConfigSchema = z.object({
  preset: z.string().min(1),
  reducedMotion: z.enum(["instant", "fade", "inherit"]).optional(),
  entrances: z
    .record(
      z.string(),
      z.object({
        type: z.string().min(1),
        durationMs: z.number().nonnegative().optional(),
        staggerMs: z.number().nonnegative().optional(),
        intensity: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
  microInteractions: z
    .record(z.string(), z.record(z.string(), z.string().min(1)))
    .optional(),
  imports: z.array(z.string().min(1)).optional(),
});

export const templateV2MotionInputSchema = z.union([
  templateV2MotionConfigSchema,
  templateV2TbdpNativeMotionManifestSchema,
]);

export const templateV2TbdpNativeResponsiveManifestSchema = z.object({
  tbdpNative: z.literal(true),
  sectorDnaId: z.string().min(1),
  experienceProfiles: z.array(z.string().min(1)).optional(),
  structure: z
    .object({
      regions: z
        .record(
          z.string(),
          z.object({
            collapseBelow: z.string().min(1).optional(),
            collapseMode: z.string().min(1).optional(),
            sticky: z.boolean().optional(),
            position: z.string().min(1).optional(),
          }),
        )
        .optional(),
      components: z
        .record(z.string(), z.object({ layout: z.record(z.string(), z.string().min(1)).optional() }))
        .optional(),
    })
    .optional(),
});

export const templateV2PageFlowSchema = z.object({
  pageId: kebabId,
  layoutId: kebabId,
  regions: z.record(z.string(), z.array(z.string().min(1))),
});

export const templateV2ComponentDefinitionSchema = z.object({
  id: z.string().min(1),
  role: z.enum([
    "navigation",
    "hero",
    "footer",
    "features",
    "services",
    "gallery",
    "story",
    "testimonials",
    "pricing",
    "faq",
    "cta",
    "contact",
    "process",
    "trust",
    "cases",
    "integrations",
    "blog",
    "timeline",
    "portfolio",
    "custom",
  ]),
  scaffold: relativePath,
  propsSchema: relativePath.optional(),
  slots: z.array(z.string().min(1)).optional(),
  defaultProps: z.record(z.string(), z.unknown()).optional(),
});

export const templateV2ComponentRegistrySchema = z.object({
  components: z.array(templateV2ComponentDefinitionSchema).min(1),
});

export const templateV2ResponsiveRulesSchema = z.object({
  breakpoints: z
    .array(
      z.object({
        name: z.string().min(1),
        minWidth: z.number().positive(),
      }),
    )
    .min(1),
  containerMaxWidth: z.string().min(1).optional(),
  regions: z
    .record(
      z.string(),
      z.object({
        collapseBelow: z.string().min(1).optional(),
        collapseMode: z.string().min(1).optional(),
        sticky: z.boolean().optional(),
        position: z.string().min(1).optional(),
      }),
    )
    .optional(),
  components: z
    .record(z.string(), z.object({ layout: z.record(z.string(), z.string().min(1)).optional() }))
    .optional(),
});

export const templateV2ResponsiveInputSchema = z.union([
  templateV2ResponsiveRulesSchema,
  templateV2TbdpNativeResponsiveManifestSchema,
]);
