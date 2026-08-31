/**
 * Business Layer — single source of truth for all business-owned website data.
 * Templates and design systems MUST NOT define or embed this data.
 */

import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";

export const BUSINESS_LAYER_VERSION = "1.0.0";

export type BusinessPageType =
  | "home"
  | "about"
  | "services"
  | "contact"
  | "pricing"
  | "blog"
  | "portfolio"
  | "careers"
  | "privacy"
  | "terms"
  | "custom";

export type BusinessPageSpec = {
  id: string;
  type: BusinessPageType;
  slug: string;
  title: string;
  description?: string;
  /** Section semantic roles present on this page (hero, features, etc.). */
  sections: string[];
};

export type BusinessBrandPack = {
  name: string;
  tagline: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  displayFont?: string;
  bodyFont?: string;
  tone: string;
  voice: string[];
};

export type BusinessNavigationPack = {
  style: string;
  links: Array<{ href: string; label: string }>;
  primaryCta: string;
  secondaryCta?: string;
};

export type BusinessSeoPack = {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  openGraph?: {
    title: string;
    description: string;
    image?: string;
  };
  structuredData?: Record<string, unknown>[];
};

export type BusinessContactPack = {
  email?: string;
  phone?: string;
  address?: string;
  formSubmitLabel: string;
};

/**
 * Canonical business payload consumed by the Design Layer at render time.
 * Every field is produced by the Business Engine — never by templates.
 */
export type WebsiteBusinessPack = {
  version: typeof BUSINESS_LAYER_VERSION;
  intelligence: BusinessIntelligenceProfile;
  brand: BusinessBrandPack;
  content: ProductionContentPack;
  navigation: BusinessNavigationPack;
  seo: BusinessSeoPack;
  contact: BusinessContactPack;
  images: CoreAssetManifest;
  pages: BusinessPageSpec[];
  locale: string;
  projectSeed: string;
};

export type BusinessLayerInput = {
  prompt: string;
  language?: string | null;
  brandName?: string | null;
  theme?: string | null;
  features?: string[];
};
