import { z } from "zod";

export const marketInputSchema = z.object({
  industry: z.string().trim().min(1).max(200),
  region: z.string().trim().min(1).max(200),
  targetAudience: z.string().trim().min(1).max(500),
});

