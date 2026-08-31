import { z } from "zod";

export const universalServiceIdSchema = z.enum([
  "website-builder",
  "app-builder",
  "landing-page-builder",
  "logo-designer",
  "brand-designer",
  "image-generator",
  "video-studio",
  "content-studio",
  "marketing",
  "social-media",
  "crm",
  "erp",
  "business-manager",
  "business-intelligence",
  "future-service",
]);

const plannerIntentSchema = z.object({
  summary: z.string().min(1),
  goals: z.array(z.string()),
  constraints: z.array(z.string()),
  requestedServices: z.array(universalServiceIdSchema),
  requestedOutputs: z.array(z.string()),
});

const serviceCapabilitiesSchema = z.object({
  auth: z.object({
    required: z.boolean(),
    providerHint: z.string().optional(),
  }),
  database: z.object({
    required: z.boolean(),
    provider: z.string(),
    entities: z.array(z.string()).optional(),
  }),
  assets: z.object({
    images: z.boolean().optional(),
    video: z.boolean().optional(),
    branding: z.boolean().optional(),
  }),
  integrations: z.array(z.string()),
});

const clarificationQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  why: z.string().min(1),
  expectedAnswerFormat: z.enum(["text", "choice", "list", "boolean"]),
  priority: z.enum(["high", "medium", "low"]),
});

const clarificationResolutionSchema = z.object({
  questionId: z.string().min(1),
  answerSummary: z.string().min(1),
});

const serviceBlueprintSchema = z.object({
  serviceId: universalServiceIdSchema,
  adapterVersion: z.literal("1"),
  serviceBlueprint: z.record(z.string(), z.unknown()),
  supported: z.boolean(),
  note: z.string().optional(),
});

export const universalBlueprintSchema = z.object({
  version: z.literal("1"),
  plannerId: z.string().min(1),
  createdAt: z.string().min(1),
  briefId: z.string().min(1),
  industry: z.object({
    industryId: z.string().min(1),
    confidence: z.number().min(0).max(1),
    reason: z.string().min(1),
    routingProfile: z.string().min(1),
  }),
  intent: plannerIntentSchema,
  requirements: serviceCapabilitiesSchema,
  clarifications: z.object({
    questions: z.array(clarificationQuestionSchema),
    resolved: z.array(clarificationResolutionSchema),
  }),
  servicePlans: z.array(serviceBlueprintSchema),
  selectedServiceId: universalServiceIdSchema,
  executionPlan: z.object({
    mode: z.enum(["single-service", "multi-service"]),
    orderedServices: z.array(universalServiceIdSchema),
    workflowId: z.string().optional(),
  }),
  trace: z.object({
    planningTraceRef: z.string().min(1),
    orchestrationTraceRef: z.string().optional(),
  }),
});

export type UniversalBlueprintSchema = z.infer<typeof universalBlueprintSchema>;

export function validateUniversalBlueprint(input: unknown): UniversalBlueprintSchema {
  return universalBlueprintSchema.parse(input);
}

export function safeParseUniversalBlueprint(input: unknown) {
  return universalBlueprintSchema.safeParse(input);
}
