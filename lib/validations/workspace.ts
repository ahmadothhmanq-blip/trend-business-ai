import { z } from "zod";

const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.enum(["file", "image"]),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  storagePath: z.string(),
  publicUrl: z.string().nullable().optional(),
});

export const workspaceInputSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your project in at least 10 characters."),
  template: z.string().trim().optional(),
  language: z.string().trim().min(1).default("English"),
  theme: z.string().trim().min(1).default("Gold"),
  features: z.array(z.string().trim()).default([]),
  /** Product engine id — stored on the generation for user/workspace/project scoping. */
  productId: z.string().trim().optional(),
  depth: z.enum(["focused", "standard", "deep"]).optional(),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  attachments: z.array(attachmentSchema).optional(),
  stream: z.boolean().optional(),
});

export const workspacePatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  is_favorite: z.boolean().optional(),
  draft_prompt: z.string().optional(),
  brief: z.string().trim().min(1).optional(),
  output: z.record(z.string(), z.unknown()).optional(),
  prompt_versions: z
    .array(
      z.object({
        id: z.string(),
        prompt: z.string(),
        createdAt: z.string(),
        mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
      }),
    )
    .optional(),
  attachments: z.array(attachmentSchema).optional(),
  status: z.enum(["pending", "running", "completed", "failed"]).optional(),
});
