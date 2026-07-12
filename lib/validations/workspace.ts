import { z } from "zod";

export const workspaceInputSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your project in at least 10 characters."),
  template: z.string().trim().optional(),
  language: z.string().trim().min(1).default("English"),
  theme: z.string().trim().min(1).default("Gold"),
  features: z.array(z.string().trim()).default([]),
});

export const workspacePatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  is_favorite: z.boolean().optional(),
});
