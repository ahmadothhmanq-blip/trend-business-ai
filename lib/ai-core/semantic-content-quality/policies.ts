import { resolveContentPolicy } from "@/lib/ai-core/content-intelligence/policies";
import type { SemanticQualityContext } from "@/lib/ai-core/semantic-content-quality/types";

export function buildSemanticQualityContext(params: {
  files: Array<{ path: string; content: string }>;
  prompt?: string;
  language?: string;
  industryId?: string;
  industry?: string;
  brandName?: string;
  seoFocus?: string[];
  primaryCta?: string;
  forbiddenSubjects?: string[];
  toneKeywords?: string[];
  requiredSections?: string[];
}): SemanticQualityContext {
  const industryId = params.industryId ?? params.industry ?? "business";
  let toneKeywords = params.toneKeywords;
  let forbiddenSubjects = params.forbiddenSubjects;

  if (!toneKeywords?.length || !forbiddenSubjects?.length) {
    try {
      const policy = resolveContentPolicy({ industryId }).value;
      toneKeywords = toneKeywords ?? policy.toneKeywords;
      forbiddenSubjects = forbiddenSubjects ?? policy.forbiddenSubjects;
    } catch {
      // CKB optional — keep caller-provided values
    }
  }

  return {
    ...params,
    industryId,
    toneKeywords,
    forbiddenSubjects,
  };
}
