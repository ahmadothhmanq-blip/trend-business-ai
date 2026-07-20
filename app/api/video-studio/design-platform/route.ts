import { NextResponse } from "next/server";
import {
  listVideoTemplates,
  templateCatalogStats,
  listPresenterProfiles,
  matchVideoTemplate,
  VIDEO_PRESENTER_PERSONAS,
  VIDEO_LOCATIONS,
  VIDEO_CONTENT_TYPES,
  DURATION_PRESETS,
  VOICE_STYLES,
  isExternalVideoProviderConfigured,
  isTtsConfigured,
  resolveVideoProviderName,
  listVideoProviders,
  SOCIAL_EXPORT_PRESETS,
  TTS_VOICE_CATALOG,
  isTtsProviderConfigured,
  resolvePreferredProviderId,
  envProviderFlags,
  listMarketplaceIndustries,
} from "@/lib/ai-core/video-production-platform";

export const dynamic = "force-dynamic";

/**
 * GET — Video Production Platform catalog (templates, presenters, locations, capabilities).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 40)));

  if (templateId) {
    const all = listVideoTemplates();
    const template = all.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({ template });
  }

  let templates = listVideoTemplates();
  if (q) {
    const hay = q.toLowerCase();
    templates = templates.filter(
      (t) =>
        t.label.toLowerCase().includes(hay) ||
        t.tags.some((tag) => tag.includes(hay)) ||
        t.contentType.includes(hay) ||
        t.location.includes(hay),
    );
  }

  const page = templates.slice(0, limit);
  const flags = envProviderFlags();

  return NextResponse.json({
    stats: templateCatalogStats(),
    capabilities: {
      videoProviderConfigured: isExternalVideoProviderConfigured(),
      videoProvider: resolveVideoProviderName(),
      preferredProvider: resolvePreferredProviderId(),
      providerFlags: flags,
      ttsConfigured: isTtsConfigured() || isTtsProviderConfigured(),
      previewRender: true,
      fullRender: true,
      imageToVideo: true,
      avatarPresenters: true,
      batch: true,
      productPresenter: true,
      educational: true,
      editorFoundation: true,
      brandIntegration: true,
      socialExport: true,
      asyncRender: true,
      jobResume: true,
      jobRetry: true,
      ffmpegAssembly: true,
      mediaLibrary: true,
      socialPublishPackages: true,
      templateMarketplace: true,
      advancedBatch: true,
      subtitleBurnIn: true,
      sceneTransitions: true,
      exportPresets: true,
    },
    industries: listMarketplaceIndustries(),
    providers: listVideoProviders().map((p) => ({
      id: p.id,
      label: p.label,
      configured: p.configured,
      supportsImageToVideo: p.supportsImageToVideo,
      supportsAvatar: p.supportsAvatar,
    })),
    socialExportPresets: SOCIAL_EXPORT_PRESETS,
    ttsVoices: TTS_VOICE_CATALOG,
    presenters: VIDEO_PRESENTER_PERSONAS,
    locations: VIDEO_LOCATIONS,
    contentTypes: VIDEO_CONTENT_TYPES,
    durationPresets: DURATION_PRESETS,
    voiceStyles: VOICE_STYLES,
    presenterProfiles: listPresenterProfiles(),
    templates: page,
    templatesTotal: templates.length,
    matchedExample: matchVideoTemplate({ prompt: q || "product marketing video" }),
  });
}
