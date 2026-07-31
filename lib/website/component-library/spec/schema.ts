import { z } from "zod";
import {
  WB_COMPONENT_CAPABILITIES,
  WB_COMPONENT_CATEGORIES,
  WB_COMPONENT_EDITABLE_KINDS,
  WB_COMPONENT_LIBRARY_SPEC_VERSION,
  WB_COMPONENT_RENDERER_CONTRACT_VERSION,
  WB_COMPONENT_RENDERER_OUTPUTS,
  WB_COMPONENT_RESPONSIVE_MODES,
  WB_COMPONENT_SLOT_KINDS,
  WB_COMPONENT_VARIANT_STYLES,
} from "@/lib/website/component-library/constants";

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

const fileRefSchema = z.object({ file: relativePath });

const propFieldSchema: z.ZodType<{
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: unknown;
  properties?: Record<string, unknown>;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}> = z.lazy(() =>
  z.object({
    type: z.enum(["string", "number", "boolean", "object", "array"]),
    description: z.string().min(1).optional(),
    default: z.unknown().optional(),
    enum: z.array(z.unknown()).optional(),
    items: propFieldSchema.optional(),
    properties: z.record(z.string(), propFieldSchema).optional(),
    required: z.array(z.string().min(1)).optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
  }),
);

export const wbComponentManifestSchema = z
  .object({
    specVersion: semver,
    id: kebabId,
    name: z.string().min(1),
    category: z.enum(WB_COMPONENT_CATEGORIES),
    capability: z.enum(WB_COMPONENT_CAPABILITIES),
    version: semver,
    description: z.string().min(1),
    composable: z.boolean(),
    primitive: z.boolean(),
    propsSchema: fileRefSchema,
    slots: fileRefSchema,
    variants: fileRefSchema,
    responsive: fileRefSchema,
    editableProperties: fileRefSchema,
    validation: fileRefSchema,
    renderer: z.object({
      contract: z.string().min(1),
      file: relativePath,
    }),
    composition: fileRefSchema.optional(),
    constraints: fileRefSchema.optional(),
    compatibility: z.object({
      libraryVersion: z.string().min(1),
      rendererContract: z.string().min(1),
    }),
    tags: z.array(z.string().min(1)).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.composable && value.primitive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "a component cannot be both composable and primitive",
        path: ["primitive"],
      });
    }
    if (!value.composable && !value.primitive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "a component must be composable or primitive",
        path: ["composable"],
      });
    }
    if (value.composable && !value.composition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "composable components must declare a composition document",
        path: ["composition"],
      });
    }
    if (value.compatibility.libraryVersion !== WB_COMPONENT_LIBRARY_SPEC_VERSION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `compatibility.libraryVersion must be ${WB_COMPONENT_LIBRARY_SPEC_VERSION}`,
        path: ["compatibility", "libraryVersion"],
      });
    }
    if (
      value.compatibility.rendererContract !== WB_COMPONENT_RENDERER_CONTRACT_VERSION
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `compatibility.rendererContract must be ${WB_COMPONENT_RENDERER_CONTRACT_VERSION}`,
        path: ["compatibility", "rendererContract"],
      });
    }
  });

export const wbComponentPropsSchemaDocumentSchema = z
  .object({
    id: kebabId,
    version: semver,
    properties: z.record(z.string().min(1), propFieldSchema),
    required: z.array(z.string().min(1)).optional(),
    additionalProperties: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.id !== value.id) return;
    for (const key of value.required ?? []) {
      if (!(key in value.properties)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `required prop "${key}" is not defined in properties`,
          path: ["required"],
        });
      }
    }
  });

export const wbComponentSlotsDocumentSchema = z
  .object({
    id: kebabId,
    slots: z.array(
      z.object({
        id: kebabId,
        label: z.string().min(1).optional(),
        kind: z.enum(WB_COMPONENT_SLOT_KINDS),
        accepts: z.array(z.enum(WB_COMPONENT_CAPABILITIES)).min(1),
        acceptsComponents: z.array(kebabId).optional(),
        optional: z.boolean().optional(),
        minItems: z.number().int().nonnegative().optional(),
        maxItems: z.number().int().positive().optional(),
        ordering: z.enum(["vertical", "horizontal", "grid", "free"]).optional(),
        allowNesting: z.boolean().optional(),
      }),
    ),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.slots.map((slot) => slot.id), "slots", ctx);
  });

export const wbComponentVariantsDocumentSchema = z
  .object({
    id: kebabId,
    variants: z
      .array(
        z.object({
          id: kebabId,
          label: z.string().min(1).optional(),
          style: z.enum(WB_COMPONENT_VARIANT_STYLES).optional(),
          description: z.string().min(1).optional(),
          propOverrides: z.record(z.string(), z.unknown()).optional(),
          className: z.string().min(1).optional(),
          default: z.boolean().optional(),
        }),
      )
      .min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    assertUniqueIds(value.variants.map((variant) => variant.id), "variants", ctx);
    const defaults = value.variants.filter((variant) => variant.default);
    if (defaults.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "only one variant may be marked default",
        path: ["variants"],
      });
    }
  });

export const wbComponentResponsiveDocumentSchema = z
  .object({
    id: kebabId,
    rules: z.array(
      z.object({
        breakpoint: z.string().min(1),
        mode: z.enum(WB_COMPONENT_RESPONSIVE_MODES),
        target: z.enum(["component", "slot"]).optional(),
        slotId: kebabId.optional(),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
      }),
    ),
  })
  .strict();

export const wbComponentEditablePropertiesDocumentSchema = z
  .object({
    id: kebabId,
    properties: z.array(
      z.object({
        path: z.string().min(1),
        label: z.string().min(1),
        kind: z.enum(WB_COMPONENT_EDITABLE_KINDS),
        description: z.string().min(1).optional(),
        group: z.string().min(1).optional(),
        options: z
          .array(
            z.object({
              value: z.string().min(1),
              label: z.string().min(1),
            }),
          )
          .optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      }),
    ),
  })
  .strict();

export const wbComponentValidationDocumentSchema = z
  .object({
    id: kebabId,
    rules: z.array(
      z.object({
        id: kebabId,
        path: z.string().min(1).optional(),
        rule: z.enum([
          "required",
          "minLength",
          "maxLength",
          "pattern",
          "min",
          "max",
          "custom",
        ]),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        message: z.string().min(1),
      }),
    ),
  })
  .strict();

export const wbComponentRendererContractDocumentSchema = z
  .object({
    contractVersion: z.string().min(1),
    componentId: kebabId,
    output: z.enum(WB_COMPONENT_RENDERER_OUTPUTS),
    rootElement: z.string().min(1),
    requiredAttributes: z.array(z.string().min(1)),
    slotRendering: z.enum(["named-regions", "child-tree"]),
    aria: z.record(z.string(), z.string()).optional(),
    notes: z.string().min(1).optional(),
  })
  .strict();

const compositionNodeSchema: z.ZodType<{
  slotId: string;
  componentId?: string;
  capability?: (typeof WB_COMPONENT_CAPABILITIES)[number];
  variantId?: string;
  children?: unknown[];
}> = z.lazy(() =>
  z.object({
    slotId: kebabId,
    componentId: kebabId.optional(),
    capability: z.enum(WB_COMPONENT_CAPABILITIES).optional(),
    variantId: kebabId.optional(),
    children: z.array(compositionNodeSchema).optional(),
  }),
);

export const wbComponentCompositionDocumentSchema = z
  .object({
    id: kebabId,
    description: z.string().min(1).optional(),
    example: z.array(compositionNodeSchema).optional(),
    allowedChildCapabilities: z.array(z.enum(WB_COMPONENT_CAPABILITIES)).optional(),
    allowedChildComponents: z.array(kebabId).optional(),
  })
  .strict();

export const wbComponentConstraintsDocumentSchema = z
  .object({
    id: kebabId,
    rules: z.array(
      z.object({
        id: kebabId,
        description: z.string().min(1).optional(),
        when: z.object({
          variantId: kebabId.optional(),
          slotId: kebabId.optional(),
        }),
        require: z
          .object({
            slots: z.array(kebabId).optional(),
            props: z.array(z.string().min(1)).optional(),
          })
          .optional(),
        forbid: z
          .object({
            capabilities: z.array(z.enum(WB_COMPONENT_CAPABILITIES)).optional(),
            componentIds: z.array(kebabId).optional(),
          })
          .optional(),
      }),
    ),
  })
  .strict();

export type WbComponentManifestInput = z.input<typeof wbComponentManifestSchema>;

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

export function parseWbComponentManifest(raw: unknown) {
  return wbComponentManifestSchema.parse(raw);
}

export function safeParseWbComponentManifest(raw: unknown) {
  return wbComponentManifestSchema.safeParse(raw);
}
