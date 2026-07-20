/**
 * Real AI Avatar Presenter — generation requests beyond static profiles.
 */

import type { AiPresenterProfile, VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import { buildPresenterProfile } from "@/lib/ai-core/video-production-platform/presenters";
import { getVideoProvider } from "@/lib/ai-core/video-production-platform/providers";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";

export type AvatarGenerationRequest = {
  personaId: AiPresenterProfile["personaId"];
  script: string;
  language?: string;
  emotion?: string;
  aspectRatio?: string;
};

export async function requestAvatarPresenterClip(
  req: AvatarGenerationRequest,
): Promise<{
  profile: AiPresenterProfile;
  provider: string;
  status: string;
  remoteUrl?: string;
  externalJobId?: string;
  message: string;
}> {
  const profile = buildPresenterProfile(req.personaId, {
    language: req.language || "English",
  });
  // Prefer HeyGen for avatars when configured
  const provider = getVideoProvider(
    process.env.HEYGEN_API_KEY ? "heygen" : undefined,
  );
  const result = await provider.generateClip({
    prompt: `${profile.appearance}. Emotion: ${req.emotion || "natural"}. ${req.script}`,
    durationSec: Math.min(30, Math.max(5, Math.ceil(req.script.split(/\s+/).length / 2.5))),
    aspectRatio: req.aspectRatio || "9:16",
    avatar: {
      personaId: profile.personaId,
      script: req.script,
      voiceId: profile.voiceId,
    },
  });

  return {
    profile: {
      ...profile,
      realismLevel: provider.id === "heygen" ? "ultra" : "high",
      facialExpressionStyle: `${profile.facialExpressionStyle} Emotion=${req.emotion || "natural"}`,
    },
    provider: provider.id,
    status: result.status,
    remoteUrl: result.remoteUrl,
    externalJobId: result.externalJobId,
    message: result.message,
  };
}

export function applyAvatarProfileToModel(
  model: VideoProductionModel,
  profile: AiPresenterProfile,
): VideoProductionModel {
  return {
    ...model,
    presenter: profile,
    scenes: model.scenes.map((s) => ({ ...s, presenterId: profile.id })),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}
