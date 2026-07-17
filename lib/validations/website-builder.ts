import { z } from "zod";
import {
  WEBSITE_COLOR_STYLES,
  WEBSITE_DESIGN_STYLES,
  WEBSITE_FEATURE_IDS,
  WEBSITE_LANGUAGES,
  WEBSITE_PAGE_COUNTS,
  WEBSITE_TYPES,
} from "@/lib/constants/website-builder";

/** Dashboard Website Builder generate/regenerate request (API). */
export const websiteGenerateRequestSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your project in at least 10 characters."),
  projectType: z.string().trim().min(1, "Select a project type."),
  language: z.string().trim().min(1, "Select a language."),
  theme: z.string().trim().min(1, "Select a theme."),
  features: z.array(z.string().trim()).default([]),
  productId: z.string().trim().optional(),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  projectId: z.string().uuid().optional(),
});

export type WebsiteGenerateRequest = z.infer<typeof websiteGenerateRequestSchema>;

export function detectWebsiteProjectKind(input: WebsiteGenerateRequest) {
  const signal = [input.prompt, input.projectType, ...input.features]
    .join(" ")
    .toLowerCase();
  const appSignals = [
    "app",
    "application",
    "dashboard",
    "admin",
    "crm",
    "erp",
    "saas",
    "authentication",
    "auth",
    "login",
    "sign in",
    "signup",
    "register",
    "portal",
    "platform",
    "payments",
    "payment",
    "analytics",
    "database",
    "workflow",
    "kanban",
    "management",
    "booking system",
    "user roles",
    "api",
    "api route",
    "crud",
    "mobile app",
    "web app",
  ];

  return appSignals.some((keyword) => signal.includes(keyword))
    ? ("web_application" as const)
    : ("website" as const);
}

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
