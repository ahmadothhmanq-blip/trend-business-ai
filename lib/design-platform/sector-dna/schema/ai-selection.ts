import { z } from "zod";
import { tbdpSectorIdSchema } from "@/lib/design-platform/sector-dna/schema/metadata";

/** AI selection request schema — input for automatic design resolution. */
export const tbdpAiSelectionRequestSchema = z.object({
  sectorId: tbdpSectorIdSchema,
  locale: z.string().min(2).optional(),
  direction: z.enum(["ltr", "rtl"]).optional(),
  goal: z.enum(["conversion", "trust", "engagement", "information"]).optional(),
});

/** AI selection output schema — resolved design recommendations. */
export const tbdpAiSelectionResultSchema = z.object({
  sector: z.object({ id: tbdpSectorIdSchema, name: z.string() }),
  experienceProfile: z.object({
    id: z.string(),
    label: z.string(),
  }),
  selections: z.object({
    layoutId: z.string().min(1),
    heroComponent: z.string().min(1),
    navComponent: z.string().min(1),
    ctaComponent: z.string().min(1),
    motionPresets: z.array(z.string().min(1)).min(1),
    typographyProfile: z.string().min(1),
    spacingBehavior: z.string().min(1),
    pageFlow: z.array(z.string().min(1)).min(1),
    primaryButton: z.string().min(1),
    cardComponent: z.string().min(1),
  }),
  metadata: z.object({
    confidence: z.number().min(0).max(1),
    layoutIds: z.array(z.string()),
    heroComponents: z.array(z.string()),
    navComponents: z.array(z.string()),
    ctaComponents: z.array(z.string()),
    motionPresets: z.array(z.string()),
    typographyProfiles: z.array(z.string()),
    spacingScale: z.string(),
    pageFlow: z.array(z.string()),
    primaryButtonVariant: z.string(),
    cardComponents: z.array(z.string()),
    feedbackStates: z.array(z.string()),
  }),
});

/** AI rule weights for automatic profile ranking. */
export const tbdpAiSelectionWeightsSchema = z.object({
  goal: z.record(z.string(), z.number()).optional(),
  direction: z.record(z.string(), z.number()).optional(),
  locale: z.record(z.string(), z.number()).optional(),
});
