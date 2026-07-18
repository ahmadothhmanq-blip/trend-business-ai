import { requireUser } from "@/lib/api/helpers";
import { listIndustryProfiles } from "@/lib/ai-core/templates";
import { NextResponse } from "next/server";

/** GET /api/ai-core/industries — Industry Intelligence catalog (Phase 6). */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

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
    })),
  });
}
