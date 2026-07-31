import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import type { BrandLogoAssets } from "@/lib/ai-core/agency-brand-kit/logo-svg";

export type BrandGuidelines = {
  personality: string;
  voice: {
    tone: string;
    principles: string[];
    doExamples: string[];
    dontExamples: string[];
  };
  colors: AgencyBrandKit["colorPalette"];
  typography: AgencyBrandKit["typography"];
  logo: {
    concept: string;
    style: string;
    usage: string[];
  };
  ui: {
    borderRadius: string;
    buttonStyle: string;
    iconStyle: string;
    illustrationDirection: string;
    photographyDirection: string[];
  };
  assets: BrandLogoAssets;
};

export function buildBrandGuidelines(params: {
  brandKit: AgencyBrandKit;
  profile: BusinessIntelligenceProfile;
  designDNA: DesignDNAPrinciples;
  logoAssets: BrandLogoAssets;
}): BrandGuidelines {
  const { brandKit, profile, designDNA, logoAssets } = params;
  const radius =
    designDNA.benchmark === "apple-quality" || designDNA.benchmark === "notion-quality"
      ? "12px–16px"
      : designDNA.benchmark === "linear-quality"
        ? "8px–10px"
        : "10px–14px";

  return {
    personality: `${profile.tone} · ${profile.visualStyle.join(", ")}`,
    voice: {
      tone: profile.tone,
      principles: [
        "Lead with clarity — every word earns its place",
        `Speak to ${profile.audience[0] || "customers"} with respect and specificity`,
        "Show expertise without jargon",
        `Reflect ${profile.industry} credibility`,
      ],
      doExamples: [
        `Use concrete ${profile.subcategory.toLowerCase()} benefits`,
        "Write active, confident sentences",
        "Include specific outcomes",
      ],
      dontExamples: [
        "Generic AI clichés (cutting-edge, game-changer)",
        "Vague superlatives without proof",
        "Copy from unrelated industries",
        ...profile.forbiddenSubjects.map((s) => `Reference ${s}`),
      ],
    },
    colors: brandKit.colorPalette,
    typography: brandKit.typography,
    logo: {
      concept: brandKit.logoConcept,
      style: brandKit.logoStyle,
      usage: [
        "Minimum clear space: height of monogram on all sides",
        "Never stretch, rotate, or recolor outside brand palette",
        "Use dark variant on light backgrounds, light variant on dark",
      ],
    },
    ui: {
      borderRadius: radius,
      buttonStyle: designDNA.components.buttons,
      iconStyle: "stroke-based, 1.5px weight, rounded caps",
      illustrationDirection: `${profile.tone} ${profile.industry} — minimal, purposeful`,
      photographyDirection: profile.photographyStyle,
    },
    assets: logoAssets,
  };
}
