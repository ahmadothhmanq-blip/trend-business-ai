import type {
  WqbsBenchmarkInput,
  WqbsBenchmarkMode,
  WqbsCategory,
  WqbsComparisonInput,
  WqbsComparisonResult,
} from "@/lib/website/quality-benchmark/types";
import { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark/pipeline/run-benchmark";

const CATEGORY_LABELS: Record<WqbsCategory, string> = {
  visualDesign: "Visual Design",
  userExperience: "User Experience",
  business: "Business",
  seo: "SEO",
  performance: "Performance",
  accessibility: "Accessibility",
  content: "Content",
  localization: "Localization",
};

function detectMissingFeatures(
  generated: WqbsComparisonResult["generated"],
  reference: WqbsComparisonResult["reference"],
): string[] {
  const missing: string[] = [];
  const refSubs = new Set(
    reference.categories.flatMap((c) =>
      c.subDimensions.filter((s) => s.score >= 75).map((s) => s.id),
    ),
  );
  const genSubs = new Set(
    generated.categories.flatMap((c) =>
      c.subDimensions.filter((s) => s.score >= 60).map((s) => s.id),
    ),
  );

  for (const sub of refSubs) {
    if (!genSubs.has(sub)) {
      missing.push(`Missing or weak: ${sub}`);
    }
  }

  return missing.slice(0, 10);
}

/**
 * Compare a generated website against a reference website or platform benchmark.
 */
export async function compareWebsiteQuality(
  input: WqbsComparisonInput,
): Promise<WqbsComparisonResult | { ok: false; errors: string[] }> {
  const mode: WqbsBenchmarkMode = input.mode ?? "standard";

  const [genResult, refResult] = await Promise.all([
    runWebsiteQualityBenchmark({ ...input.generated, mode }),
    runWebsiteQualityBenchmark({ ...input.reference, mode }),
  ]);

  if (!genResult.ok) return { ok: false, errors: genResult.errors };
  if (!refResult.ok) return { ok: false, errors: refResult.errors };

  const generated = genResult.report;
  const reference = refResult.report;
  const overallGap = reference.scores.overall - generated.scores.overall;

  const categoryGaps = {} as Record<WqbsCategory, number>;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const cat of generated.categories) {
    const refCat = reference.categories.find((c) => c.category === cat.category);
    const refScore = refCat?.score ?? reference.scores[cat.category];
    const gap = refScore - cat.score;
    categoryGaps[cat.category] = gap;

    if (gap <= -5) {
      strengths.push(
        `${CATEGORY_LABELS[cat.category]}: generated leads reference by ${Math.abs(gap)} points`,
      );
    } else if (gap >= 10) {
      weaknesses.push(
        `${CATEGORY_LABELS[cat.category]}: ${gap} points behind reference (${cat.score} vs ${refScore})`,
      );
    }
  }

  const missingFeatures = detectMissingFeatures(generated, reference);
  const refLabel = input.referenceLabel ?? input.reference.referencePlatform ?? "reference";

  const qualityGap =
    overallGap > 0
      ? `Generated website scores ${overallGap} points below ${refLabel} (${generated.scores.overall} vs ${reference.scores.overall})`
      : overallGap < 0
        ? `Generated website exceeds ${refLabel} by ${Math.abs(overallGap)} points`
        : `Generated website matches ${refLabel} overall quality`;

  return {
    generated,
    reference,
    overallGap,
    categoryGaps,
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    missingFeatures,
    qualityGap,
  };
}

export type WqbsReferenceBenchmarkInput = {
  platform: import("@/lib/website/quality-benchmark/types").WqbsReferencePlatform;
  mode?: WqbsBenchmarkMode;
  /** Reference artifact files — supplied externally until platform APIs exist */
  referenceFiles: WqbsBenchmarkInput["files"];
  generated: WqbsBenchmarkInput;
  referenceLabel?: string;
};

/**
 * Future-ready comparison against reference platforms (Wix, Framer, Webflow, etc.).
 * Requires reference artifact files until platform connectors are implemented.
 */
export async function compareAgainstReferencePlatform(
  input: WqbsReferenceBenchmarkInput,
) {
  return compareWebsiteQuality({
    generated: input.generated,
    reference: {
      id: `ref-${input.platform}`,
      label: input.referenceLabel ?? input.platform,
      files: input.referenceFiles,
      referencePlatform: input.platform,
      mode: input.mode,
    },
    referenceLabel: input.referenceLabel ?? input.platform,
    mode: input.mode,
  });
}
