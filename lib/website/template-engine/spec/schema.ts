import { z } from "zod";
import {
  WB_TEMPLATE_CATEGORIES,
  WB_TEMPLATE_COMPONENT_CATEGORIES,
  WB_TEMPLATE_COMPONENT_ORDERING,
  WB_TEMPLATE_LAYOUT_KINDS,
  WB_TEMPLATE_PACKAGE_SPEC_VERSION,
  WB_TEMPLATE_REGION_ALIGNMENT,
  WB_TEMPLATE_REGION_ROLES,
  WB_TEMPLATE_REGION_WIDTH,
  WB_TEMPLATE_UPDATE_CHANNELS,
} from "@/lib/website/template-engine/spec/constants";

const kebabId = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");

const semver = z
  .string()
  .min(1)
  .regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.]+)?$/i, "must be semver");

const relativePath = z
  .string()
  .min(1)
  .refine((value) => !value.includes(".."), "must not contain ..")
  .refine((value) => !value.startsWith("/"), "must be package-relative");

const fileRefSchema = z.object({
  file: relativePath,
});

const authorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  url: z.string().url().optional(),
  organization: z.string().min(1).optional(),
});

const metadataSchema = z.object({
  category: z.enum(WB_TEMPLATE_CATEGORIES),
  tags: z.array(z.string().min(1)).default([]),
  author: authorSchema,
  license: z.string().min(1).optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

const mediaSchema = z.object({
  thumbnail: relativePath,
  preview: relativePath,
  gallery: z.array(relativePath).optional(),
});

const compatibilitySchema = z.object({
  engineVersion: z.string().min(1),
  specVersion: z.string().min(1),
  features: z.array(z.string().min(1)).optional(),
});

const dependencySchema = z.object({
  id: kebabId,
  version: z.string().min(1),
  optional: z.boolean().optional(),
  source: z.string().min(1).optional(),
});

const dependenciesSchema = z.object({
  packages: z.array(dependencySchema).optional(),
  componentLibraries: z.array(dependencySchema).optional(),
});

const updateSchema = z.object({
  channel: z.enum(WB_TEMPLATE_UPDATE_CHANNELS).optional(),
  releasedAt: z.string().min(1),
  changelog: relativePath.optional(),
  migrationGuide: relativePath.optional(),
  previousVersion: semver.optional(),
});

const responsiveSchema = z.object({
  breakpoints: z
    .array(
      z.object({
        name: z.string().min(1),
        minWidth: z.number().positive(),
      }),
    )
    .min(1),
  containerMaxWidth: z.string().min(1).optional(),
  fluidTypography: z.boolean().optional(),
});

const layoutRefSchema = z.object({
  id: kebabId,
  file: relativePath,
  kind: z.enum(WB_TEMPLATE_LAYOUT_KINDS),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const regionRefSchema = z.object({
  id: kebabId,
  file: relativePath,
  role: z.enum(WB_TEMPLATE_REGION_ROLES),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const pageRefSchema = z.object({
  id: kebabId,
  title: z.string().min(1),
  path: z
    .string()
    .min(1)
    .regex(/^\/[a-z0-9/_-]*$/i, "path must start with /"),
  layoutId: kebabId,
  file: relativePath,
  description: z.string().min(1).optional(),
  optional: z.boolean().optional(),
});

const assetsConfigSchema = z.object({
  index: relativePath.optional(),
  roots: z.array(relativePath).optional(),
});

const regionPlacementSchema = z.object({
  allowedComponentTypes: z.array(z.string().min(1)).min(1),
  ordering: z.enum(WB_TEMPLATE_COMPONENT_ORDERING),
  allowNesting: z.boolean(),
  maxComponents: z.number().int().nonnegative(),
  minComponents: z.number().int().nonnegative().optional(),
  requiredTypes: z.array(z.string().min(1)).optional(),
  mutuallyExclusive: z.array(z.array(z.string().min(1)).min(1)).optional(),
  allowCustomComponents: z.boolean().optional(),
});

export const wbTemplateCanvasDocumentSchema = z
  .object({
    id: kebabId,
    grid: z.object({
      columns: z.number().int().positive(),
      gutter: z.string().min(1),
      margin: z.string().min(1),
      maxWidth: z.string().min(1).optional(),
    }),
    spacing: z.object({
      unit: z.string().min(1),
      scale: z.array(z.string().min(1)).min(1),
    }),
    visualIdentity: z.object({
      colors: z.record(z.string(), z.string().min(1)).refine(
        (value) => Object.keys(value).length > 0,
        "at least one color token is required",
      ),
      typography: z.object({
        display: z.string().min(1),
        body: z.string().min(1),
        scale: z.record(z.string(), z.string().min(1)).optional(),
      }),
      radius: z.record(z.string(), z.string().min(1)),
      shadows: z.record(z.string(), z.string().min(1)).optional(),
      borders: z.record(z.string(), z.string().min(1)).optional(),
      animation: z.string().min(1).optional(),
    }),
    designSystem: z
      .object({
        tier: z.string().min(1).optional(),
        industry: z.string().min(1).optional(),
        layoutKind: z.string().min(1).optional(),
        templateIntelligenceId: z.string().min(1).optional(),
      })
      .optional(),
  })
  .strict();

export const wbTemplatePlacementRulesDocumentSchema = z
  .object({
    global: z.object({
      maxComponentsPerPage: z.number().int().positive().optional(),
      allowDuplicateTypes: z.boolean().optional(),
      defaultOrdering: z.enum(WB_TEMPLATE_COMPONENT_ORDERING).optional(),
    }),
    regionOverrides: z.record(z.string().min(1), regionPlacementSchema.partial()).optional(),
    constraints: z
      .array(
        z.object({
          id: kebabId,
          description: z.string().min(1).optional(),
          when: z.object({
            region: kebabId.optional(),
            page: kebabId.optional(),
          }),
          allow: z
            .object({
              componentTypes: z.array(z.string().min(1)).optional(),
            })
            .optional(),
          deny: z
            .object({
              componentTypes: z.array(z.string().min(1)).optional(),
            })
            .optional(),
        }),
      )
      .optional(),
  })
  .strict();

export const wbTemplateComponentTypesDocumentSchema = z
  .object({
    types: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1).optional(),
          category: z.enum(WB_TEMPLATE_COMPONENT_CATEGORIES),
          nestable: z.boolean().optional(),
          description: z.string().min(1).optional(),
        }),
      )
      .min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.types.map((item) => item.id), "types", ctx);
  });

export const wbTemplateRegionDocumentSchema = z
  .object({
    id: kebabId,
    role: z.enum(WB_TEMPLATE_REGION_ROLES),
    label: z.string().min(1).optional(),
    layout: z.object({
      width: z.enum(WB_TEMPLATE_REGION_WIDTH),
      alignment: z.enum(WB_TEMPLATE_REGION_ALIGNMENT),
      maxWidth: z.string().min(1).optional(),
      padding: z.string().min(1).optional(),
      minHeight: z.string().min(1).optional(),
    }),
    placement: regionPlacementSchema,
    responsive: z
      .object({
        collapseBelow: z.string().min(1).optional(),
        stackOrder: z.enum(["normal", "reverse"]).optional(),
        hideBelow: z.string().min(1).optional(),
        fullWidthBelow: z.string().min(1).optional(),
      })
      .optional(),
  })
  .strict();

export const wbTemplateLayoutDocumentSchema = z
  .object({
    id: kebabId,
    kind: z.enum(WB_TEMPLATE_LAYOUT_KINDS),
    label: z.string().min(1).optional(),
    regionOrder: z.array(kebabId).min(1),
    rules: z
      .object({
        minHeight: z.string().min(1).optional(),
        gap: z.string().min(1).optional(),
        regionGap: z.string().min(1).optional(),
      })
      .optional(),
    grid: z
      .object({
        templateAreas: z.string().min(1).optional(),
        columns: z.string().min(1).optional(),
        rows: z.string().min(1).optional(),
      })
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.regionOrder, "regionOrder", ctx);
  });

export const wbTemplatePageBlueprintSchema = z
  .object({
    id: kebabId,
    title: z.string().min(1),
    path: z
      .string()
      .min(1)
      .regex(/^\/[a-z0-9/_-]*$/i),
    layoutId: kebabId,
    regions: z.array(kebabId).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.regions, "regions", ctx);
  });

export const wbTemplatePackageManifestSchema = z
  .object({
    specVersion: semver,
    id: kebabId,
    version: semver,
    name: z.string().min(1),
    description: z.string().min(1),
    metadata: metadataSchema,
    media: mediaSchema,
    compatibility: compatibilitySchema,
    dependencies: dependenciesSchema.optional(),
    update: updateSchema,
    responsive: responsiveSchema,
    canvas: fileRefSchema,
    placementRules: fileRefSchema,
    componentTypes: fileRefSchema.optional(),
    layouts: z.array(layoutRefSchema).min(1),
    regions: z.array(regionRefSchema).min(1),
    pages: z.array(pageRefSchema).min(1),
    assets: assetsConfigSchema.optional(),
    entry: relativePath,
  })
  .superRefine((value, ctx) => {
    assertUniqueIds(value.layouts.map((item) => item.id), "layouts", ctx);
    assertUniqueIds(value.regions.map((item) => item.id), "regions", ctx);
    assertUniqueIds(value.pages.map((item) => item.id), "pages", ctx);

    const layoutIds = new Set(value.layouts.map((item) => item.id));
    const regionIds = new Set(value.regions.map((item) => item.id));

    for (const page of value.pages) {
      if (!layoutIds.has(page.layoutId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `page "${page.id}" references unknown layout "${page.layoutId}"`,
          path: ["pages"],
        });
      }
    }

    for (const regionRef of value.regions) {
      if (regionRef.id !== regionRef.role && !regionIds.has(regionRef.id)) {
        // id uniqueness already checked
      }
    }

    const homePage = value.pages.find((page) => page.id === "home");
    if (!homePage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'pages must include an entry with id "home"',
        path: ["pages"],
      });
    }

    if (value.compatibility.specVersion !== WB_TEMPLATE_PACKAGE_SPEC_VERSION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `compatibility.specVersion must be ${WB_TEMPLATE_PACKAGE_SPEC_VERSION}`,
        path: ["compatibility", "specVersion"],
      });
    }
  });

export const wbTemplatePackageEntrySchema = z
  .object({
    defaultPageId: kebabId,
    defaultLayoutId: kebabId,
  })
  .strict();

export const wbTemplateAssetsManifestSchema = z
  .object({
    files: z
      .array(
        z.object({
          id: kebabId,
          path: relativePath,
          kind: z.enum(["image", "icon", "font", "video", "document", "other"]),
          mimeType: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
        }),
      )
      .default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.files.map((item) => item.id), "files", ctx);
  });

export type WbTemplatePackageManifestInput = z.input<
  typeof wbTemplatePackageManifestSchema
>;

function assertUniqueIds(
  ids: string[],
  label: string,
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate ${label} id "${id}"`,
        path: [label],
      });
    }
    seen.add(id);
  }
}

export function parseWbTemplatePackageManifest(raw: unknown) {
  return wbTemplatePackageManifestSchema.parse(raw);
}

export function safeParseWbTemplatePackageManifest(raw: unknown) {
  return wbTemplatePackageManifestSchema.safeParse(raw);
}
