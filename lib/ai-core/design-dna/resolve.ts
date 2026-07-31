import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import {
  DESIGN_DNA_BENCHMARKS,
  getDesignDNABenchmark,
} from "@/lib/ai-core/design-dna/benchmarks";
import type {
  DesignDNAPrinciples,
  DesignQualityBenchmark,
} from "@/lib/ai-core/design-dna/types";

const BENCHMARK_ALIASES: Array<{
  pattern: RegExp;
  benchmark: DesignQualityBenchmark;
}> = [
  { pattern: /\bapple[\s-]?quality\b/i, benchmark: "apple-quality" },
  { pattern: /\bstripe[\s-]?quality\b/i, benchmark: "stripe-quality" },
  { pattern: /\bnotion[\s-]?style\b|\bnotion[\s-]?quality\b/i, benchmark: "notion-quality" },
  { pattern: /\blinear[\s-]?quality\b/i, benchmark: "linear-quality" },
  { pattern: /\bvercel[\s-]?quality\b/i, benchmark: "vercel-quality" },
  { pattern: /\bclaude[\s-]?level\b|\bclaude[\s-]?quality\b/i, benchmark: "claude-quality" },
];

function inferBenchmarkFromBusiness(
  profile: BusinessIntelligenceProfile,
): DesignQualityBenchmark {
  const hay = [
    profile.tone,
    profile.visualStyle.join(" "),
    profile.designSystemHints.mood,
    profile.designSystemHints.layoutApproach,
    profile.industry,
    profile.subcategory,
  ]
    .join(" ")
    .toLowerCase();

  if (/luxury|premium|exclusive|high-end|boutique/.test(hay)) {
    return "apple-quality";
  }
  if (/saas|software|b2b|enterprise|platform|api/.test(hay)) {
    return "stripe-quality";
  }
  if (/minimal|clean|simple|scandinavian/.test(hay)) {
    return "notion-quality";
  }
  if (/tech|ai|cyber|developer|startup/.test(hay)) {
    return "vercel-quality";
  }
  if (/creative|agency|studio|bold/.test(hay)) {
    return "agency-elite";
  }
  if (/dark|noir|night|gaming/.test(hay)) {
    return "linear-quality";
  }
  return "agency-elite";
}

/**
 * Resolve design DNA from user prompt + business profile.
 * Never copies brands — applies design philosophy principles only.
 */
export function resolveDesignDNA(params: {
  prompt: string;
  businessProfile: BusinessIntelligenceProfile;
}): DesignDNAPrinciples {
  const prompt = params.prompt.toLowerCase();

  for (const alias of BENCHMARK_ALIASES) {
    if (alias.pattern.test(prompt)) {
      return personalizeDNA(
        getDesignDNABenchmark(alias.benchmark),
        params.businessProfile,
      );
    }
  }

  const inferred = inferBenchmarkFromBusiness(params.businessProfile);
  return personalizeDNA(getDesignDNABenchmark(inferred), params.businessProfile);
}

function personalizeDNA(
  base: DesignDNAPrinciples,
  profile: BusinessIntelligenceProfile,
): DesignDNAPrinciples {
  const paletteHint = profile.colorPalette.slice(0, 3).join(", ") || "brand-aligned";
  const toneHint = profile.tone || "professional";

  return {
    ...base,
    philosophy: [
      ...base.philosophy,
      `Tailored for ${profile.industry} (${profile.subcategory})`,
      `Brand tone: ${toneHint}`,
      `Audience: ${profile.audience.slice(0, 2).join(", ")}`,
    ],
    color: {
      ...base.color,
      paletteStrategy: `${base.color.paletteStrategy} · ${paletteHint}`,
    },
    layout: {
      ...base.layout,
      sectionFlow: profile.recommendedSections.length >= 4
        ? profile.recommendedSections.slice(0, 6).join(" → ")
        : base.layout.sectionFlow,
    },
    qualityBar: `${base.qualityBar} Industry: ${profile.industry}.`,
  };
}

export function listDesignDNABenchmarks(): DesignQualityBenchmark[] {
  return Object.keys(DESIGN_DNA_BENCHMARKS) as DesignQualityBenchmark[];
}
