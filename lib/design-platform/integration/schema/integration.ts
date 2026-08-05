import { z } from "zod";
import { tbdpSectorIdSchema } from "@/lib/design-platform/sector-dna/schema/metadata";

export const tbdpDesignResolverInputSchema = z.object({
  sectorId: tbdpSectorIdSchema,
  language: z.string().optional(),
  generationLanguage: z.string().optional(),
  templateLanguage: z.string().optional(),
  direction: z.enum(["ltr", "rtl"]).optional(),
  goal: z.enum(["conversion", "trust", "engagement", "information"]).optional(),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  themeSource: z.enum(["brand", "industry", "user", "system"]).optional(),
  brandThemeId: z.string().optional(),
  userThemeId: z.string().optional(),
  prefersReducedMotion: z.boolean().optional(),
  templateId: z.string().optional(),
  architectureVersion: z.enum(["v1", "v2"]).optional(),
});

export const tbdpTemplateResolverInputSchema = z.object({
  templateId: z.string().min(1),
  sectorId: tbdpSectorIdSchema.optional(),
  industryId: z.string().optional(),
  language: z.string().optional(),
  generationLanguage: z.string().optional(),
  goal: z.enum(["conversion", "trust", "engagement", "information"]).optional(),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  architectureVersion: z.enum(["v1", "v2"]).optional(),
  prefersReducedMotion: z.boolean().optional(),
});

export const tbdpBuilderBridgeInputSchema = z.object({
  prompt: z.string().optional(),
  language: z.string().optional(),
  industryId: z.string().optional(),
  sectorId: tbdpSectorIdSchema.optional(),
  templateId: z.string().optional(),
  websiteStructureTemplateId: z.string().optional(),
  templateIntelligenceId: z.string().optional(),
  components: z.array(z.string()).optional(),
  theme: z.string().optional(),
  goal: z.enum(["conversion", "trust", "engagement", "information"]).optional(),
});

export const tbdpAiBridgeInputSchema = z.object({
  sectorId: tbdpSectorIdSchema.optional(),
  industryId: z.string().optional(),
  prompt: z.string().optional(),
  language: z.string().optional(),
  goal: z.enum(["conversion", "trust", "engagement", "information"]).optional(),
  direction: z.enum(["ltr", "rtl"]).optional(),
});
