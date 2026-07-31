import type { ImageIntelligenceContext, ImagePurpose } from "@/lib/ai-core/image-engine/types";
import {
  imageQualityGuardrails,
  inferSectionKey,
  type SectionKey,
} from "@/lib/ai-core/image-engine/section-strategies";

export const PROMPT_QUALITY_THRESHOLD = 65;

export type ImagePromptScore = {
  score: number;
  passed: boolean;
  dimensions: {
    industryRelevance: number;
    sectionRelevance: number;
    composition: number;
    professionalQuality: number;
    lighting: number;
    visualHierarchy: number;
    websiteSuitability: number;
    aestheticQuality: number;
  };
  issues: string[];
};

const QUALITY_TOKENS = [
  "professional",
  "realistic",
  "premium",
  "lighting",
  "composition",
  "no text",
  "no watermark",
  "no logo",
  "editorial",
  "photography",
];

const HERO_TOKENS = ["hero", "wide", "cinematic", "full-bleed"];
const PORTRAIT_TOKENS = ["portrait", "shallow", "bokeh", "trust"];
const NEGATIVE_TOKENS = [
  "placeholder",
  "lorem",
  "clipart",
  "cartoon",
  "generic stock smile",
  "svg",
  "mockup",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tokenScore(prompt: string, tokens: string[], weight: number): number {
  const hay = prompt.toLowerCase();
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return Math.min(100, (hits / Math.max(1, tokens.length)) * 100 * weight);
}

/**
 * Evaluate a planned image prompt before generation.
 * Scores industry/section relevance, quality signals, and website suitability.
 */
export function scoreImagePrompt(params: {
  prompt: string;
  purpose: ImagePurpose;
  ctx: ImageIntelligenceContext;
  sectionName?: string;
  shotBrief?: string;
}): ImagePromptScore {
  const issues: string[] = [];
  const prompt = params.prompt.toLowerCase();
  const industry = (params.ctx.businessProfile?.industry || params.ctx.industry || params.ctx.businessType || "").toLowerCase();
  const sectionKey: SectionKey = inferSectionKey(
    params.sectionName || params.purpose,
  );

  const forbidden = params.ctx.businessProfile?.forbiddenSubjects ?? [];
  const forbiddenHits = forbidden.filter((subject) => {
    const s = subject.trim().toLowerCase();
    return s.length > 2 && prompt.includes(s);
  });
  if (forbiddenHits.length) {
    issues.push(`Contains forbidden subjects: ${forbiddenHits.join(", ")}`);
  }

  if (NEGATIVE_TOKENS.some((t) => prompt.includes(t))) {
    issues.push("Contains placeholder or low-quality signals");
  }

  const industryTokens = [
    ...industry.split(/[^a-z0-9]+/).filter((t) => t.length > 3),
    ...(params.ctx.businessProfile?.photographyStyle ?? [])
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3),
  ];
  const industryRelevance =
    forbiddenHits.length > 0
      ? 15
      : industryTokens.length === 0
      ? 70
      : clamp(
          (industryTokens.some((t) => prompt.includes(t)) ? 85 : 35) +
            (params.shotBrief &&
            prompt.includes(params.shotBrief.toLowerCase().slice(0, 20))
              ? 15
              : 0),
        );

  if (industryRelevance < 50) {
    issues.push("Weak industry context in prompt");
  }

  let sectionRelevance = 60;
  if (params.purpose === "hero" && HERO_TOKENS.some((t) => prompt.includes(t))) {
    sectionRelevance = 90;
  } else if (
    params.purpose === "testimonial" &&
    PORTRAIT_TOKENS.some((t) => prompt.includes(t))
  ) {
    sectionRelevance = 88;
  } else if (params.purpose === "section" && prompt.includes(sectionKey)) {
    sectionRelevance = 85;
  } else if (prompt.includes(params.purpose)) {
    sectionRelevance = 78;
  } else {
    issues.push(`Section/purpose "${params.purpose}" not clearly reflected`);
    sectionRelevance = 45;
  }

  const composition = clamp(
    50 +
      (/(composition|crop|frame|negative space|focal)/.test(prompt) ? 30 : 0) +
      (/(wide|portrait|mid-shot|close-up|aerial)/.test(prompt) ? 20 : 0),
  );

  const professionalQuality = clamp(
    tokenScore(prompt, QUALITY_TOKENS, 1) -
      (NEGATIVE_TOKENS.some((t) => prompt.includes(t)) ? 40 : 0),
  );
  if (professionalQuality < 55) {
    issues.push("Missing professional quality guardrails");
  }

  const lighting = clamp(
    40 +
      (/(lighting|light|golden hour|natural light|studio|rim light)/.test(
        prompt,
      )
        ? 45
        : 0),
  );

  const visualHierarchy = clamp(
    45 +
      (/(hierarchy|subject|focal|hero|headline|backdrop)/.test(prompt) ? 40 : 0),
  );

  const websiteSuitability = clamp(
    50 +
      (/(website|section|card|hero|backdrop|no text|no watermark)/.test(prompt)
        ? 40
        : 0),
  );

  const aestheticQuality = clamp(
    45 +
      (/(editorial|luxury|premium|cinematic|agency|magazine)/.test(prompt)
        ? 40
        : 0) +
      (params.ctx.brandStyle &&
      prompt.includes(params.ctx.brandStyle.toLowerCase().slice(0, 8))
        ? 15
        : 0),
  );

  const dimensions = {
    industryRelevance,
    sectionRelevance,
    composition,
    professionalQuality,
    lighting,
    visualHierarchy,
    websiteSuitability,
    aestheticQuality,
  };

  const score = clamp(
    industryRelevance * 0.18 +
      sectionRelevance * 0.18 +
      composition * 0.1 +
      professionalQuality * 0.18 +
      lighting * 0.08 +
      visualHierarchy * 0.08 +
      websiteSuitability * 0.1 +
      aestheticQuality * 0.1,
  );

  return {
    score,
    passed: score >= PROMPT_QUALITY_THRESHOLD,
    dimensions,
    issues,
  };
}

/** Strengthen a low-scoring prompt with missing quality and context fragments. */
export function improvePromptForScore(params: {
  prompt: string;
  purpose: ImagePurpose;
  ctx: ImageIntelligenceContext;
  sectionName?: string;
  shotBrief?: string;
  score: ImagePromptScore;
}): string {
  if (params.score.passed) return params.prompt;

  const additions: string[] = [];
  const sectionKey = inferSectionKey(params.sectionName || params.purpose);

  if (params.score.dimensions.industryRelevance < 55) {
    const industryLabel =
      params.ctx.businessProfile?.industry || params.ctx.industry;
    const photoStyle = params.ctx.businessProfile?.photographyStyle?.[0];
    additions.push(
      photoStyle
        ? `Required photography: ${photoStyle}.`
        : `Industry-specific ${industryLabel} context for ${params.ctx.offer}.`,
    );
  }
  if (params.ctx.businessProfile?.forbiddenSubjects.length) {
    additions.push(
      `NEVER show: ${params.ctx.businessProfile.forbiddenSubjects.slice(0, 6).join(", ")}.`,
    );
  }
  if (params.score.dimensions.sectionRelevance < 55) {
    additions.push(
      `Purpose: ${params.purpose} for website section "${sectionKey}".`,
    );
  }
  if (params.score.dimensions.professionalQuality < 60) {
    additions.push(imageQualityGuardrails());
  }
  if (params.score.dimensions.lighting < 50) {
    additions.push("Natural premium commercial lighting, balanced exposure.");
  }
  if (params.shotBrief) {
    additions.push(`Shot brief: ${params.shotBrief}.`);
  }

  return [params.prompt, ...additions].filter(Boolean).join(" ").trim();
}
