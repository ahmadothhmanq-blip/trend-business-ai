/**
 * Build SEO metadata package from Strategy (+ industry intelligence / premium topics).
 * EDS-006: delegates to SEO & AEO Intelligence Engine (SAIE).
 */

import { runSeoAeoIntelligenceEngine } from "@/lib/ai-core/seo-aeo-intelligence/saie-engine";
import type { AssembleSeoPackageInput } from "@/lib/ai-core/seo/assemble-package";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";

export type BuildSeoPackageInput = AssembleSeoPackageInput;

/**
 * Deterministic SEO package from Strategy — routed through SAIE for EDS-006 compliance.
 */
export function buildSeoPackageFromStrategy(
  input: BuildSeoPackageInput,
): CoreSeoPackage {
  return runSeoAeoIntelligenceEngine(input).spec.seoPackage;
}

/** Serialize package for generated project helpers / JSON artifacts. */
export function seoPackageToSerializable(
  pkg: CoreSeoPackage,
): Record<string, unknown> {
  return {
    metadata: pkg.metadata,
    openGraph: pkg.openGraph,
    twitter: pkg.twitter ?? {
      card: "summary_large_image",
      title: pkg.openGraph.title,
      description: pkg.openGraph.description,
      imageAlt: pkg.openGraph.imageAlt,
    },
    keywords: pkg.keywords,
    structuredData: pkg.structuredData.map((s) => s.jsonLd),
    sitemap: pkg.sitemap,
    readiness: pkg.readiness,
    generatedAt: pkg.generatedAt,
  };
}
