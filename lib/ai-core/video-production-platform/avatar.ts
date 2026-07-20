/**
 * Real AI Avatar Presenter — generation + poll beyond static profiles.
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
  /** Poll for completion when provider returns async job */
  waitForResult?: boolean;
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
  mimeType?: string;
}> {
  const profile = buildPresenterProfile(req.personaId, {
    language: req.language || "English",
  });
  const provider = getVideoProvider(
    process.env.HEYGEN_API_KEY ? "heygen" : undefined,
  );
  let result = await provider.generateClip({
    prompt: `${profile.appearance}. Emotion: ${req.emotion || "natural"}. Natural facial expressions, body motion, lip sync. ${req.script}`,
    durationSec: Math.min(30, Math.max(5, Math.ceil(req.script.split(/\s+/).length / 2.5))),
    aspectRatio: req.aspectRatio || "9:16",
    avatar: {
      personaId: profile.personaId,
      script: req.script,
      voiceId: profile.voiceId,
    },
  });

  if (
    req.waitForResult !== false &&
    result.status === "processing" &&
    result.externalJobId &&
    provider.pollJob
  ) {
    const jobId = result.externalJobId;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      result = await provider.pollJob(jobId);
      if (result.status !== "processing") break;
    }
  }

  return {
    profile: {
      ...profile,
      realismLevel: provider.id === "heygen" ? "ultra" : "high",
      facialExpressionStyle: `${profile.facialExpressionStyle} Emotion=${req.emotion || "natural"}`,
      lipSyncProfile: `${profile.lipSyncProfile} · voice-matched`,
      bodyMotionStyle: `${profile.bodyMotionStyle} · natural movement`,
    },
    provider: provider.id,
    status: result.status,
    remoteUrl: result.remoteUrl,
    externalJobId: result.externalJobId,
    mimeType: result.mimeType,
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
