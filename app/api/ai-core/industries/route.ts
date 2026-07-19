import { requireUser } from "@/lib/api/helpers";
import { listPrimaryWebsiteIndustryIntelligence } from "@/lib/ai-core/industry-intelligence";
import { listIndustryProfiles } from "@/lib/ai-core/templates";
import { NextResponse } from "next/server";

/** GET /api/ai-core/industries — Industry Website Intelligence catalog. */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const primary = listPrimaryWebsiteIndustryIntelligence();

  return NextResponse.json({
    industries: listIndustryProfiles().map((profile) => ({
      id: profile.id,
      label: profile.label,
      description: profile.description,
      layoutStyle: profile.layoutStyle,
      sections: profile.sections,
      designPreset: profile.designPreset,
      requiredFeatures: profile.requiredFeatures,
      suggestedPages: profile.suggestedPages,
      contentTone: profile.contentTone,
      industryPattern: profile.industryPattern,
      ctaTypes: profile.ctaTypes ?? [],
      designStyle: profile.designStyle ?? profile.designPreset,
      imageRequirements: profile.imageRequirements ?? [],
    })),
    websiteIndustries: primary.map((profile) => ({
      id: profile.id,
      label: profile.label,
      description: profile.description,
      recommendedPages: profile.recommendedPages,
      requiredSections: profile.requiredSections,
      ctaTypes: profile.ctaTypes,
      contentStyle: profile.contentStyle,
      designStyle: profile.designStyle,
      designPreset: profile.designPreset,
      layoutStyle: profile.layoutStyle,
      imageRequirements: profile.imageRequirements,
      preferredSmartTemplateId: profile.preferredSmartTemplateId,
    })),
  });
}
