import type { VersionComparison, WebsiteVersion } from "@/lib/website/review-studio/types";

/**
 * Compare before and after website versions.
 */
export function compareVersions(
  before: WebsiteVersion,
  after: WebsiteVersion,
): VersionComparison {
  const beforeScores = before.qualityScores;
  const afterScores = after.qualityScores;

  const diff = (afterVal: number, beforeVal: number) => afterVal - beforeVal;

  const scoreDifferences = {
    overall: diff(afterScores.overall, beforeScores.overall),
    visualDesign: diff(afterScores.visualDesign, beforeScores.visualDesign),
    userExperience: diff(afterScores.userExperience, beforeScores.userExperience),
    business: diff(afterScores.business, beforeScores.business),
    seo: diff(afterScores.seo, beforeScores.seo),
    performance: diff(afterScores.performance, beforeScores.performance),
    accessibility: diff(afterScores.accessibility, beforeScores.accessibility),
    content: diff(afterScores.content, beforeScores.content),
    localization: diff(afterScores.localization, beforeScores.localization),
  };

  const qualityDifference = scoreDifferences.overall;
  const summary =
    qualityDifference > 0
      ? `Quality improved by ${qualityDifference} points (v${before.versionNumber} → v${after.versionNumber})`
      : qualityDifference < 0
        ? `Quality decreased by ${Math.abs(qualityDifference)} points`
        : `No overall quality change (v${before.versionNumber} → v${after.versionNumber})`;

  return {
    beforeVersionId: before.id,
    afterVersionId: after.id,
    qualityDifference,
    scoreDifferences,
    seoDifference: scoreDifferences.seo,
    conversionDifference: scoreDifferences.business,
    accessibilityDifference: scoreDifferences.accessibility,
    performanceDifference: scoreDifferences.performance,
    contentDifference: scoreDifferences.content,
    appliedChanges: after.improvementTitles,
    summary,
  };
}
