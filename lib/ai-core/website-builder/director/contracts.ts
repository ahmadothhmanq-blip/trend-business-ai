/**
 * Website Director contracts (Phase 2).
 * Planning document only — no HTML, React, CSS, persistence, or publish runtime.
 */

import type { WebsiteAssetKind, WebsitePlan, WebsiteProject, WebsiteSectionType } from "@/lib/ai-core/website-builder/domain/contracts";

export const WEBSITE_DIRECTOR_TYPES = [
  "company",
  "saas",
  "ecommerce",
  "restaurant",
  "portfolio",
  "agency",
  "healthcare",
  "education",
  "real-estate",
  "blog",
  "landing-page",
] as const;

export type WebsiteDirectorType = (typeof WEBSITE_DIRECTOR_TYPES)[number];

export const DIRECTOR_PAGE_SECTION_TYPES = [
  "hero",
  "features",
  "cta",
  "pricing",
  "testimonials",
  "faq",
  "contact",
  "gallery",
  "stats",
  "logos",
  "content",
  "footer",
  "about",
  "services",
  "products",
  "menu",
  "team",
  "process",
  "booking",
  "location",
  "listings",
  "blog-index",
] as const;

export type DirectorPageSectionType = (typeof DIRECTOR_PAGE_SECTION_TYPES)[number];

export const DIRECTOR_INTEGRATION_KINDS = [
  "analytics",
  "crm",
  "payments",
  "booking",
  "email",
  "chat",
] as const;

export type DirectorIntegrationKind = (typeof DIRECTOR_INTEGRATION_KINDS)[number];

export const DIRECTOR_FORM_KINDS = [
  "contact",
  "demo",
  "lead",
  "newsletter",
  "reservation",
  "quote",
  "application",
] as const;

export type DirectorFormKind = (typeof DIRECTOR_FORM_KINDS)[number];

export type WebsiteDirectorLlmAdapter = {
  generateJson(input: {
    prompt: string;
    schema: Record<string, unknown>;
  }): Promise<unknown>;
};

export type WebsiteDirectorInput = {
  prompt: string;
  project: WebsiteProject;
  language?: string;
};

export type DirectorSeoStrategy = {
  primaryKeywords: string[];
  titleTemplate: string;
  metaDescriptionTemplate: string;
  locale: string;
};

export type DirectorSuggestedTheme = {
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  fonts: {
    sans: string;
    display: string;
  };
  radiusPx: number;
};

export type DirectorSitemapNode = {
  slug: string;
  title: string;
  path: string;
  parentSlug: string | null;
};

export type DirectorNavItem = {
  label: string;
  pageSlug: string;
  order: number;
  children: DirectorNavItem[];
};

export type DirectorPlannedPage = {
  slug: string;
  name: string;
  purpose: string;
  isHomepage: boolean;
  sections: Array<{
    type: DirectorPageSectionType;
    purpose: string;
  }>;
};

export type DirectorContentRequirement = {
  pageSlug: string;
  tone: string;
  mustInclude: string[];
};

export type DirectorAssetRequirement = {
  kind: WebsiteAssetKind;
  purpose: string;
  description: string;
};

export type DirectorFormRequirement = {
  kind: DirectorFormKind;
  name: string;
  purpose: string;
  fields: string[];
};

export type DirectorIntegrationRequirement = {
  kind: DirectorIntegrationKind;
  name: string;
  purpose: string;
  required: boolean;
};

export type WebsiteIntentAnalysis = {
  websiteType: WebsiteDirectorType;
  promptSummary: string;
};

export type WebsiteBusinessAnalysis = {
  businessCategory: string;
  targetAudience: string;
  brandSummary: string;
  uniqueValue: string;
};

export type WebsiteStrategy = {
  goals: string[];
  conversionFocus: string;
  seoStrategy: DirectorSeoStrategy;
  suggestedTheme: DirectorSuggestedTheme;
};

export type WebsiteInformationArchitecture = {
  sitemap: DirectorSitemapNode[];
  navigation: DirectorNavItem[];
  requiredPages: DirectorPlannedPage[];
  contentRequirements: DirectorContentRequirement[];
  assetRequirements: DirectorAssetRequirement[];
  forms: DirectorFormRequirement[];
  integrations: DirectorIntegrationRequirement[];
};

export type WebsiteDirectorLlmDraft = {
  intent: WebsiteIntentAnalysis;
  business: WebsiteBusinessAnalysis;
  strategy: WebsiteStrategy;
  informationArchitecture: WebsiteInformationArchitecture;
};

/**
 * Phase 2 Website Plan document.
 * Distinct from the Phase 1 identity aggregate (`domain.WebsitePlan`).
 */
export type DirectorWebsitePlan = WebsiteDirectorLlmDraft & {
  id: string;
  projectId: string;
  userId: string;
  version: number;
  websiteType: WebsiteDirectorType;
  businessCategory: string;
  targetAudience: string;
  goals: string[];
  brandSummary: string;
  sitemap: DirectorSitemapNode[];
  navigation: DirectorNavItem[];
  requiredPages: DirectorPlannedPage[];
  seoStrategy: DirectorSeoStrategy;
  suggestedTheme: DirectorSuggestedTheme;
  contentRequirements: DirectorContentRequirement[];
  assetRequirements: DirectorAssetRequirement[];
  forms: DirectorFormRequirement[];
  integrations: DirectorIntegrationRequirement[];
  promptHash: string;
  language: string;
  createdAt: string;
};

export type WebsiteDirectorStatus = "ready" | "failed" | "reused";

export type WebsiteDirectorResult = {
  status: WebsiteDirectorStatus;
  plan: DirectorWebsitePlan | null;
  domainPlan: WebsitePlan | null;
  project: WebsiteProject;
  reused: boolean;
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
};

export type WebsiteDirectorPlanStore = {
  get(key: string): DirectorWebsitePlan | undefined;
  set(key: string, plan: DirectorWebsitePlan): void;
};

export const WEBSITE_DIRECTOR_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "business", "strategy", "informationArchitecture"],
  properties: {
    intent: {
      type: "object",
      additionalProperties: false,
      required: ["websiteType", "promptSummary"],
      properties: {
        websiteType: { type: "string", enum: [...WEBSITE_DIRECTOR_TYPES] },
        promptSummary: { type: "string" },
      },
    },
    business: {
      type: "object",
      additionalProperties: false,
      required: ["businessCategory", "targetAudience", "brandSummary", "uniqueValue"],
      properties: {
        businessCategory: { type: "string" },
        targetAudience: { type: "string" },
        brandSummary: { type: "string" },
        uniqueValue: { type: "string" },
      },
    },
    strategy: {
      type: "object",
      additionalProperties: false,
      required: ["goals", "conversionFocus", "seoStrategy", "suggestedTheme"],
      properties: {
        goals: { type: "array", items: { type: "string" }, minItems: 2 },
        conversionFocus: { type: "string" },
        seoStrategy: {
          type: "object",
          additionalProperties: false,
          required: ["primaryKeywords", "titleTemplate", "metaDescriptionTemplate", "locale"],
          properties: {
            primaryKeywords: { type: "array", items: { type: "string" }, minItems: 3 },
            titleTemplate: { type: "string" },
            metaDescriptionTemplate: { type: "string" },
            locale: { type: "string" },
          },
        },
        suggestedTheme: {
          type: "object",
          additionalProperties: false,
          required: ["name", "colors", "fonts", "radiusPx"],
          properties: {
            name: { type: "string" },
            colors: {
              type: "object",
              additionalProperties: false,
              required: ["background", "foreground", "accent", "muted"],
              properties: {
                background: { type: "string" },
                foreground: { type: "string" },
                accent: { type: "string" },
                muted: { type: "string" },
              },
            },
            fonts: {
              type: "object",
              additionalProperties: false,
              required: ["sans", "display"],
              properties: {
                sans: { type: "string" },
                display: { type: "string" },
              },
            },
            radiusPx: { type: "integer" },
          },
        },
      },
    },
    informationArchitecture: {
      type: "object",
      additionalProperties: false,
      required: [
        "sitemap",
        "navigation",
        "requiredPages",
        "contentRequirements",
        "assetRequirements",
        "forms",
        "integrations",
      ],
      properties: {
        sitemap: { type: "array", minItems: 1, items: { type: "object" } },
        navigation: { type: "array", minItems: 1, items: { type: "object" } },
        requiredPages: { type: "array", minItems: 1, items: { type: "object" } },
        contentRequirements: { type: "array", minItems: 1, items: { type: "object" } },
        assetRequirements: { type: "array", minItems: 1, items: { type: "object" } },
        forms: { type: "array", minItems: 1, items: { type: "object" } },
        integrations: { type: "array", items: { type: "object" } },
      },
    },
  },
};

export type { WebsiteSectionType };
