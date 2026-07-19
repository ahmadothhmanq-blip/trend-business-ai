/**
 * Automatic performance optimization checks over generated output + assets.
 */

import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import type {
  CorePerformanceCheck,
  CorePerformanceReport,
} from "@/lib/ai-core/performance/types";

/** Minimal file shape for performance heuristics. */
export type PerformanceCheckFile = {
  path: string;
  content: string;
};

export type RunPerformanceChecksInput = {
  files?: PerformanceCheckFile[];
  assetManifest?: CoreAssetManifest;
  /** Soft byte budget for generated source (heuristic) */
  maxTotalSourceBytes?: number;
};

function allContent(files: PerformanceCheckFile[]): string {
  return files.map((f) => f.content).join("\n");
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function checkImages(
  files: PerformanceCheckFile[],
  assets?: CoreAssetManifest,
): CorePerformanceCheck {
  const content = allContent(files);
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const usesNextImage = /from ["']next\/image["']|<Image\b/.test(content);
  const rawImgTags = (content.match(/<img\b/gi) || []).length;
  if (rawImgTags > 0 && !usesNextImage) {
    issues.push(`Found ${rawImgTags} raw <img> tag(s) without next/image`);
    recommendations.push("Prefer next/image for automatic image optimization");
    score -= 20;
  }
  if (!usesNextImage && (assets?.items.some((a) => a.url) ?? false)) {
    issues.push("Asset URLs present but next/image usage not detected");
    recommendations.push("Wire hero/product assets through optimized Image components");
    score -= 15;
  }

  const missingAlt = assets?.items.filter((a) => a.url && !a.alt?.trim()) ?? [];
  if (missingAlt.length > 0) {
    issues.push(`${missingAlt.length} asset(s) missing alt text`);
    recommendations.push(
      "Add descriptive alt text from the AI Image Engine for accessibility and SEO",
    );
    score -= 10;
  } else if (assets?.items.some((a) => a.alt?.trim())) {
    recommendations.push(
      "Keep Image Engine alt text wired into next/image for LCP-safe SEO",
    );
  }

  const failedAssets =
    assets?.items.filter((a) => a.status === "failed" || a.status === "pending") ??
    [];
  if (failedAssets.length > 0) {
    issues.push(`${failedAssets.length} asset(s) not successfully generated`);
    score -= 15;
  }

  return {
    name: "image_optimization",
    passed: score >= 70,
    score: clampScore(score),
    issues,
    recommendations,
  };
}

function checkAssetSize(
  files: PerformanceCheckFile[],
  maxTotalSourceBytes: number,
): CorePerformanceCheck {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const totalBytes = files.reduce((sum, f) => sum + byteLength(f.content), 0);
  if (totalBytes > maxTotalSourceBytes) {
    issues.push(
      `Generated source size ${Math.round(totalBytes / 1024)}KB exceeds budget ${Math.round(maxTotalSourceBytes / 1024)}KB`,
    );
    recommendations.push("Split large pages/components; avoid inlining oversized assets");
    score -= 25;
  }

  const largeFiles = files
    .map((f) => ({
      path: f.path,
      bytes: byteLength(f.content),
    }))
    .filter((f) => f.bytes > 120_000)
    .slice(0, 5);
  if (largeFiles.length > 0) {
    issues.push(
      `Large source files: ${largeFiles.map((f) => f.path).join(", ")}`,
    );
    recommendations.push("Extract shared UI and reduce duplicated markup");
    score -= 15;
  }

  const dataUriCount = files.reduce(
    (n, f) => n + (f.content.match(/data:image\//g) || []).length,
    0,
  );
  if (dataUriCount > 2) {
    issues.push(`Detected ${dataUriCount} inlined data:image payloads`);
    recommendations.push("Host images as files/CDN URLs instead of large data URIs");
    score -= 20;
  }

  return {
    name: "asset_size",
    passed: score >= 70,
    score: clampScore(score),
    issues,
    recommendations,
  };
}

function checkLoading(files: PerformanceCheckFile[]): CorePerformanceCheck {
  const content = allContent(files);
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!/loading=["']lazy["']|priority=\{?true\}?|fetchPriority/i.test(content)) {
    issues.push("No lazy-loading or priority image hints detected");
    recommendations.push("Lazy-load below-the-fold images; mark hero as priority");
    score -= 15;
  }

  if (/<script(?![^>]*defer)(?![^>]*async)[^>]*src=/i.test(content)) {
    issues.push("Blocking script tags may hurt first load");
    recommendations.push("Prefer async/defer or Next.js Script component");
    score -= 10;
  }

  if (!/dynamic\(|React\.lazy|Suspense/i.test(content) && files.length > 12) {
    recommendations.push("Consider dynamic imports for heavy client sections");
    score -= 5;
  }

  return {
    name: "loading_performance",
    passed: score >= 70,
    score: clampScore(score),
    issues,
    recommendations,
  };
}

function checkMobile(files: PerformanceCheckFile[]): CorePerformanceCheck {
  const content = allContent(files);
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!/viewport/i.test(content)) {
    issues.push("Viewport meta / viewport export not detected");
    recommendations.push("Ensure layout exports viewport for mobile scaling");
    score -= 25;
  }
  if (!/\b(sm|md|lg|xl):/.test(content)) {
    issues.push("No responsive breakpoint utilities detected");
    recommendations.push("Add sm/md/lg responsive layouts for key sections");
    score -= 25;
  }
  if (!/flex|grid|max-w-|container/i.test(content)) {
    issues.push("Few responsive layout primitives detected");
    score -= 10;
  }

  return {
    name: "mobile_responsiveness",
    passed: score >= 70,
    score: clampScore(score),
    issues,
    recommendations,
  };
}

function checkCoreWebVitalsPrep(
  files: PerformanceCheckFile[],
): CorePerformanceCheck {
  const content = allContent(files);
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // LCP prep: hero/priority image or clear heading structure
  if (!/priority=\{?true\}?|fetchPriority=["']high["']|<h1\b/i.test(content)) {
    issues.push("Weak LCP prep (no priority media / clear h1)");
    recommendations.push("Define a single h1 and prioritize hero media");
    score -= 15;
  }

  // CLS prep: width/height or aspect ratio on media
  if (/<img\b|<Image\b/.test(content) && !/width=|height=|aspect-|sizes=/i.test(content)) {
    issues.push("Images may lack size hints (CLS risk)");
    recommendations.push("Set width/height, sizes, or aspect-ratio on media");
    score -= 15;
  }

  // INP/JS prep: avoid huge client bundles signals
  if (/["']use client["']/.test(content)) {
    const clientFiles = files.filter((f) => /["']use client["']/.test(f.content));
    if (clientFiles.length > 8) {
      issues.push(`Many client components (${clientFiles.length}) may hurt INP`);
      recommendations.push("Keep interactive islands small; prefer server components");
      score -= 10;
    }
  }

  if (!/font|next\/font|@font-face/i.test(content)) {
    recommendations.push("Use next/font to reduce layout shift from web fonts");
    score -= 5;
  }

  return {
    name: "core_web_vitals",
    passed: score >= 70,
    score: clampScore(score),
    issues,
    recommendations,
  };
}

/**
 * Run automatic performance optimization checks.
 */
export function runPerformanceChecks(
  input: RunPerformanceChecksInput,
): CorePerformanceReport {
  const files = input.files ?? [];
  const maxBytes = input.maxTotalSourceBytes ?? 1_500_000;

  const checks: CorePerformanceCheck[] = [
    checkImages(files, input.assetManifest),
    checkAssetSize(files, maxBytes),
    checkLoading(files),
    checkMobile(files),
    checkCoreWebVitalsPrep(files),
  ];

  const score = clampScore(
    checks.reduce((sum, c) => sum + c.score, 0) / Math.max(checks.length, 1),
  );
  const issues = checks.flatMap((c) => c.issues);
  const recommendations = Array.from(
    new Set(checks.flatMap((c) => c.recommendations)),
  );

  return {
    passed: score >= 65 && checks.filter((c) => !c.passed).length <= 2,
    score,
    checks,
    issues,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}
