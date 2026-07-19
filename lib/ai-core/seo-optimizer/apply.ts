/**
 * Apply SEO package injection into generated project files.
 */

import { injectSeoArtifacts } from "@/lib/ai-core/seo/inject";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { SeoOptimizerResult } from "@/lib/ai-core/seo-optimizer/types";
import { getSeoFix } from "@/lib/ai-core/seo-optimizer/engine";

export type ApplySeoFixResult = {
  files: GeneratedProjectFile[];
  seoPackage: CoreSeoPackage;
  appliedFixIds: string[];
  notes: string[];
};

/**
 * Inject optimized SEO package artifacts for one or all package-mode fixes.
 */
export function applySeoPackageFix(params: {
  files: GeneratedProjectFile[];
  optimizer: SeoOptimizerResult;
  fixId?: string | null;
}): ApplySeoFixResult {
  const { files, optimizer, fixId } = params;
  const notes: string[] = [];
  const appliedFixIds: string[] = [];

  if (fixId) {
    const fix = getSeoFix(optimizer, fixId);
    if (!fix) {
      throw new Error("SEO fix not found");
    }
    if (!fix.injectSeoPackage && fix.applyMode === "editor") {
      throw new Error("This fix requires the Website Editor apply path");
    }
    appliedFixIds.push(fix.id);
    notes.push(`Applied ${fix.title}`);
  } else {
    for (const fix of optimizer.fixes.filter((f) => f.injectSeoPackage)) {
      appliedFixIds.push(fix.id);
    }
    notes.push("Applied full SEO package injection");
  }

  const seoPackage = optimizer.assets.seoPackage;
  const nextFiles = injectSeoArtifacts(files, seoPackage);
  notes.push(
    `Injected seo/site-seo.*, sitemap, robots, structured data (${seoPackage.structuredData.length} entities)`,
  );

  return {
    files: nextFiles,
    seoPackage,
    appliedFixIds,
    notes,
  };
}
