import { z } from "zod";

export const ideaInputSchema = z.object({
  interests: z.string().trim().min(1).max(2000),
  skills: z.string().trim().min(1).max(500),
  budget: z.string().trim().min(1).max(200),
  industry: z.string().trim().max(200).optional(),
});

export const ideaUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  industry: z.string().trim().min(1).max(200),
  target_market: z.string().trim().min(1).max(500),
  revenue_model: z.string().trim().min(1).max(500),
});

