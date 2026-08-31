/**
 * Business Engine — orchestrates AI analysis, content, SEO, brand, and assets.
 */

import { runBusinessIntelligenceAnalysis } from "@/lib/ai-core/business-intelligence/analyze";
import { detectionFromBusinessIntelligence } from "@/lib/ai-core/business-intelligence/detection";
import { buildProductionContentPack } from "@/lib/ai-core/content/production-content";
import { buildIndustryCopyPack } from "@/lib/ai-core/content/industry-copy";
import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  BusinessLayerInput,
  WebsiteBusinessPack,
} from "@/lib/website-builder-platform/contracts/business-layer";
import { BUSINESS_LAYER_VERSION } from "@/lib/website-builder-platform/contracts/business-layer";
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { slotsToManifestItems } from "@/lib/ai-core/image-engine/profile-engine";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";

export type RunBusinessEngineParams = BusinessLayerInput & {
  brief?: CoreBrief;
  onProgress?: (message: string) => void;
};

function buildBrief(input: RunBusinessEngineParams): CoreBrief {
  return (
    input.brief ?? {
      prompt: input.prompt,
      productId: "website-builder",
      theme: input.theme ?? undefined,
      features: input.features ?? [],
      language: input.language ?? "en",
      metadata: {},
    }
  );
}

function buildImageManifest(
  industryId: string,
  projectSeed: string,
): CoreAssetManifest {
  const { slots, profileId } = buildSlotsFromProfile(
    { industry: industryId, routingIndustryId: industryId },
    { projectSeed },
  );
  return {
    items: slotsToManifestItems(slots, profileId),
    engine: "profile-engine",
  };
}

/**
 * Run the full Business Engine pipeline:
 * AI analysis → industry detection → content → brand → SEO → navigation → images
 */
export async function runBusinessEngine(
  params: RunBusinessEngineParams,
): Promise<WebsiteBusinessPack> {
  const brief = buildBrief(params);
  const locale = resolveContentLanguage(params.language);
  const brandName = params.brandName?.trim() || "Your Brand";
  const projectSeed = brandName.toLowerCase().replace(/\s+/g, "-");

  params.onProgress?.("[business-engine] Running AI business analysis…");
  const biResult = await runBusinessIntelligenceAnalysis({
    brief,
    onProgress: params.onProgress,
  });

  const detection = detectionFromBusinessIntelligence(biResult);
  const industryId = detection.industryId;
  const profile = biResult.profile;

  params.onProgress?.(
    `[business-engine] Generating content pack · ${profile.industry}`,
  );
  const copyPack = buildIndustryCopyPack({
    industryId,
    profile: {
      projectName: brandName,
      industry: industryId,
      targetAudience: profile.audience.join(", "),
      businessGoals: profile.heroMessaging,
      offer: profile.subcategory,
      tone: profile.tone,
      geography: "",
      competitors: [],
      kpis: [],
      summary: profile.reason,
      requiredSections: profile.recommendedSections,
    },
    language: locale,
  });
  const content = buildProductionContentPack(copyPack, brandName, locale);

  const navigation = {
    style: profile.navigationStyle,
    links: content.navLinks,
    primaryCta: profile.primaryCta,
    secondaryCta: profile.secondaryCta,
  };

  const seo = {
    title: `${brandName} — ${profile.subcategory}`,
    description:
      profile.heroMessaging[0] ||
      `${brandName} — ${profile.industry} ${profile.subcategory}`,
    keywords: [
      profile.industry,
      profile.subcategory,
      ...profile.photographyStyle.slice(0, 4),
    ].map((k) => k.toLowerCase()),
    openGraph: {
      title: `${brandName} — ${profile.subcategory}`,
      description: profile.heroMessaging[0] || profile.reason,
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: brandName,
        description: profile.reason,
      },
    ],
  };

  const contact = {
    email: `hello@${projectSeed}.com`,
    formSubmitLabel: content.primaryCta || profile.primaryCta,
  };

  const brand = {
    name: brandName,
    tagline: content.brandTagline,
    tone: profile.tone,
    voice: profile.visualStyle,
  };

  const images = buildImageManifest(industryId, projectSeed);

  const pages = [
    {
      id: "home",
      type: "home" as const,
      slug: "/",
      title: brandName,
      description: seo.description,
      sections: profile.recommendedSections.map((s) => s.toLowerCase()),
    },
    ...profile.recommendedSections
      .filter((s) => !/hero/i.test(s))
      .slice(0, 4)
      .map((section, index) => ({
        id: `page-${index + 1}`,
        type: "custom" as const,
        slug: `/${section.toLowerCase().replace(/\s+/g, "-")}`,
        title: section,
        sections: [section.toLowerCase()],
      })),
  ];

  return {
    version: BUSINESS_LAYER_VERSION,
    intelligence: profile,
    brand,
    content,
    navigation,
    seo,
    contact,
    images,
    pages,
    locale,
    projectSeed,
  };
}
