import { z } from "zod";
import {
  WEBSITE_COLOR_STYLES,
  WEBSITE_DESIGN_STYLES,
  WEBSITE_FEATURE_IDS,
  WEBSITE_LANGUAGES,
  WEBSITE_PAGE_COUNTS,
  WEBSITE_TYPES,
} from "@/lib/constants/website-builder";

export const websiteBuilderInputSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required").max(200),
  websiteType: z.enum(WEBSITE_TYPES, { message: "Select a valid website type" }),
  businessDescription: z
    .string()
    .trim()
    .min(10, "Business description must be at least 10 characters")
    .max(4000),
  targetAudience: z.string().trim().min(2, "Target audience is required").max(500),
  language: z.enum(WEBSITE_LANGUAGES, { message: "Select a valid language" }),
  colorStyle: z.enum(WEBSITE_COLOR_STYLES, { message: "Select a valid color style" }),
  designStyle: z.enum(WEBSITE_DESIGN_STYLES, { message: "Select a valid design style" }),
  pageCount: z.enum(WEBSITE_PAGE_COUNTS, { message: "Select a valid page count" }),
  features: z
    .array(z.enum(WEBSITE_FEATURE_IDS))
    .min(1, "Select at least one required feature"),
});

export const websiteBlueprintSchema = z.object({
  structure: z.object({
    overview: z.string(),
    hierarchy: z.array(z.string()),
  }),
  suggestedPages: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      keySections: z.array(z.string()),
    }),
  ),
  uiComponents: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      placement: z.string(),
    }),
  ),
  colorPalette: z.array(
    z.object({
      name: z.string(),
      hex: z.string(),
      role: z.string(),
    }),
  ),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    notes: z.string(),
    scale: z.array(z.string()),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),
    tips: z.array(z.string()),
  }),
});
