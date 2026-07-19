/**
 * AI SEO Optimizer — generated assets + applyable fixes.
 */

import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { KeywordPlan } from "@/lib/ai-core/seo-performance/types";

export type SeoFixApplyMode = "seo-package" | "editor" | "both";

export type SeoGeneratedAssets = {
  seoTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  keywordPlan: KeywordPlan;
  blogSuggestions: string[];
  faqItems: Array<{ question: string; answer: string }>;
  imageAltTexts: Array<{ target: string; alt: string }>;
  structuredDataTypes: string[];
  /** Enhanced SEO package ready to inject. */
  seoPackage: CoreSeoPackage;
};

export type SeoFix = {
  id: string;
  title: string;
  detail: string;
  applyMode: SeoFixApplyMode;
  /** Natural-language command for Website Editor. */
  command?: string;
  actions?: WebsiteEditAction[];
  /** When true, merge generated SEO package into project. */
  injectSeoPackage?: boolean;
  category:
    | "title"
    | "meta"
    | "keywords"
    | "content"
    | "faq"
    | "schema"
    | "images"
    | "technical"
    | "ai-search";
};

export type SeoOptimizerResult = {
  assets: SeoGeneratedAssets;
  fixes: SeoFix[];
  summary: string;
  generatedAt: string;
};
