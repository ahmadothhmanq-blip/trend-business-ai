import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiNotFoundError } from "@/lib/i18n/api-errors";
import { authorizeVideoStudioDesignPlatform } from "@/lib/ai-core/video-production-platform/runtime/design-platform-auth";
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
  resolveVideoProviderForMode,
  envProviderFlags,
  listMarketplaceIndustries,
  probeFfmpegCapabilities,
} from "@/lib/ai-core/video-production-platform";

export const dynamic = "force-dynamic";

/**
 * GET — Video Production Platform catalog (templates, presenters, locations, capabilities).
 * Authenticated dashboard users or VIDEO_STUDIO_CRON_SECRET only.
 */
export async function GET(request: Request) {
  const access = await authorizeVideoStudioDesignPlatform(request);
  if (access.response) return access.response;

  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 40)));

  if (templateId) {
    const all = listVideoTemplates();
    const template = all.find((t) => t.id === templateId);
    if (!template) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
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
  const full = resolveVideoProviderForMode("full");
  const imageToVideoResolution = resolveVideoProviderForMode("image-to-video");
  const avatar = resolveVideoProviderForMode("avatar");
  const ffmpeg = await probeFfmpegCapabilities();
  const ttsConfigured = isTtsConfigured() || isTtsProviderConfigured();
  const fullRender =
    !full.error && full.providerId !== "preview" && isExternalVideoProviderConfigured();
  const imageToVideo =
    !imageToVideoResolution.error &&
    imageToVideoResolution.providerId !== "preview" &&
    Boolean(flags.kling || flags.runway || (flags.external && flags.baseUrl));
  const ffmpegAssembly = ffmpeg.available && ffmpeg.merge;
  const socialPublishPackages = fullRender && ffmpegAssembly;

  return NextResponse.json({
    stats: templateCatalogStats(),
    capabilities: {
      videoProviderConfigured: isExternalVideoProviderConfigured(),
      videoProvider: resolveVideoProviderName("full"),
      preferredProvider: resolvePreferredProviderId(),
      fullRenderProvider: full.error ? "unconfigured" : full.providerId,
      fullRenderError: full.error || null,
      avatarProvider: avatar.error ? "unconfigured" : avatar.providerId,
      providerFlags: flags,
      ttsConfigured,
      previewRender: true,
      fullRender,
      imageToVideo,
      avatarPresenters: Boolean(flags.heygen) && !avatar.error,
      batch: true,
      productPresenter: true,
      educational: true,
      editorFoundation: true,
      brandIntegration: true,
      socialExport: socialPublishPackages,
      asyncRender: true,
      jobResume: true,
      jobRetry: true,
      ffmpegAssembly,
      mediaLibrary: true,
      socialPublishPackages,
      templateMarketplace: true,
      advancedBatch: true,
      subtitleBurnIn: ffmpeg.available && ffmpeg.subtitleBurn,
      sceneTransitions: ffmpeg.available && ffmpeg.merge,
      exportPresets: ffmpegAssembly,
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
