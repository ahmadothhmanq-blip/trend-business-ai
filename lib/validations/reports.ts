import { z } from "zod";

export const REPORT_TYPES = [
  "Strategic Analysis",
  "Competitive Intelligence",
  "Growth Forecast",
  "Risk Assessment",
  "Market Entry Plan",
] as const;

export const reportInputSchema = z.object({
  topic: z.string().trim().min(1).max(300),
  reportType: z.enum(REPORT_TYPES),
  timeframe: z.string().trim().min(1).max(100),
});

