/**
 * Unified AI Core product catalog (Phase 5).
 * Canonical ids + aliases resolve to the same adapter factory.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import { createBrandDesignerAdapter } from "@/lib/ai-core/adapters/brand-designer";
import { createContentStudioAdapter } from "@/lib/ai-core/adapters/content-studio";
import { createLandingPageBuilderAdapter } from "@/lib/ai-core/adapters/landing-page-builder";
import { createMarketingAiAdapter } from "@/lib/ai-core/adapters/marketing-ai";
import { createVideoStudioAdapter } from "@/lib/ai-core/adapters/video-studio";
import { createWebappBuilderAdapter } from "@/lib/ai-core/adapters/webapp-builder";
import { createWebsiteBuilderAdapter } from "@/lib/ai-core/adapters/website-builder";

export type AiCoreProductId =
  | "website-builder"
  | "app-builder"
  | "landing-page-builder"
  | "brand-designer"
  | "content-studio"
  | "video-studio"
  | "marketing-ai";

export type AiCoreProductDefinition = {
  /** Canonical product id used by /api/ai-core/runs */
  id: AiCoreProductId;
  /** Alternate ids accepted by the API (legacy / product-route names) */
  aliases: string[];
  label: string;
  description: string;
  /** Fresh adapter instance per run (session state). */
  createAdapter: () => ProductEngineAdapter<unknown, unknown>;
};

export const AI_CORE_PRODUCTS: AiCoreProductDefinition[] = [
  {
    id: "website-builder",
    aliases: [],
    label: "Website Builder",
    description: "Full website generation with Design Engine layers",
    createAdapter: () => createWebsiteBuilderAdapter(),
  },
  {
    id: "app-builder",
    aliases: ["webapp-builder"],
    label: "App Builder",
    description: "Web application generation (Next.js app packages)",
    createAdapter: () => createWebappBuilderAdapter(),
  },
  {
    id: "landing-page-builder",
    aliases: [],
    label: "Landing Page Builder",
    description: "High-converting landing page packages",
    createAdapter: () => createLandingPageBuilderAdapter(),
  },
  {
    id: "brand-designer",
    aliases: ["brand-identity"],
    label: "Brand Designer",
    description: "Brand identity systems and guidelines",
    createAdapter: () => createBrandDesignerAdapter(),
  },
  {
    id: "content-studio",
    aliases: [],
    label: "Content Studio",
    description: "Articles, copy, and content packages",
    createAdapter: () => createContentStudioAdapter(),
  },
  {
    id: "video-studio",
    aliases: [],
    label: "Video Studio",
    description: "Video concepts, scenes, scripts, and storyboards",
    createAdapter: () => createVideoStudioAdapter(),
  },
  {
    id: "marketing-ai",
    aliases: ["marketing-strategy", "marketing"],
    label: "Marketing AI",
    description: "Campaign strategy, offers, funnels, and angles",
    createAdapter: () => createMarketingAiAdapter(),
  },
];

const byId = new Map<string, AiCoreProductDefinition>();

for (const product of AI_CORE_PRODUCTS) {
  byId.set(product.id, product);
  for (const alias of product.aliases) {
    byId.set(alias, product);
  }
}

export function resolveAiCoreProduct(
  productId: string,
): AiCoreProductDefinition | undefined {
  return byId.get(productId);
}

export function listAiCoreProducts(): AiCoreProductDefinition[] {
  return [...AI_CORE_PRODUCTS];
}

export function isAiCoreProductId(value: string): boolean {
  return byId.has(value);
}

export function createAdapterForProduct(
  productId: string,
): ProductEngineAdapter<unknown, unknown> | undefined {
  const product = resolveAiCoreProduct(productId);
  return product?.createAdapter();
}
