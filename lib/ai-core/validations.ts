import { z } from "zod";

export const aiCoreRunCreateSchema = z.object({
  productId: z.string().trim().min(1, "productId is required."),
  prompt: z
    .string()
    .trim()
    .min(5, "Describe what to generate in at least 5 characters."),
  mode: z
    .enum(["generate", "regenerate", "continue", "retry"])
    .optional()
    .default("generate"),
  language: z.string().trim().optional(),
  theme: z.string().trim().optional(),
  features: z.array(z.string().trim()).optional(),
  industry: z.string().trim().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  parentRunId: z.string().uuid().optional(),
  provider: z.string().trim().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
});

export const aiCoreRunContinueSchema = z.object({
  continueInstruction: z
    .string()
    .trim()
    .min(3, "Continue instruction must be at least 3 characters.")
    .max(4000),
  provider: z.string().trim().optional(),
});
