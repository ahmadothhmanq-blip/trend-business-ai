/**
 * Realistic AI Human Presenter System — profiles & lip-sync/voice metadata.
 */

import type {
  AiPresenterProfile,
  PresenterPersonaId,
} from "@/lib/ai-core/video-production-platform/types";
import { vid } from "@/lib/ai-core/video-production-platform/ids";
import { VIDEO_PRESENTER_PERSONAS } from "@/lib/ai-core/video-production-platform/templates";

const LANGUAGE_PACKS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Japanese",
  "Hindi",
  "Turkish",
];

const ACCENTS: Record<string, string[]> = {
  English: ["US", "UK", "AU", "Neutral"],
  Spanish: ["ES", "LATAM"],
  Arabic: ["MSA", "Gulf", "Levant"],
  French: ["FR", "CA"],
  Portuguese: ["PT", "BR"],
  default: ["Neutral"],
};

export function buildPresenterProfile(
  personaId: PresenterPersonaId,
  opts?: { language?: string; accent?: string; displayName?: string },
): AiPresenterProfile {
  const persona =
    VIDEO_PRESENTER_PERSONAS.find((p) => p.id === personaId) ||
    VIDEO_PRESENTER_PERSONAS.find((p) => p.id === "business-expert")!;

  const language = opts?.language || "English";
  const accents = ACCENTS[language] || ACCENTS.default!;

  return {
    id: vid("presenter", personaId, 0),
    personaId: persona.id,
    displayName: opts?.displayName || persona.label,
    appearance: `${persona.character}. Photorealistic skin, natural eye micro-movements, studio-grade lighting response.`,
    facialExpressionStyle: "Natural micro-expressions matched to script emotion (smile, concern, emphasis).",
    bodyMotionStyle: "Subtle weight shifts, natural hand gestures, realistic breathing cadence.",
    lipSyncProfile: "Phoneme-accurate lip sync with jaw/cheek coupling; target latency <80ms when provider connected.",
    voiceId: `voice-${persona.id}`,
    voiceStyle: persona.voiceStyle,
    languages: LANGUAGE_PACKS,
    accents: opts?.accent ? [opts.accent, ...accents] : accents,
    realismLevel: "high",
  };
}

export function listPresenterProfiles(
  language = "English",
): AiPresenterProfile[] {
  return VIDEO_PRESENTER_PERSONAS.map((p) =>
    buildPresenterProfile(p.id, { language }),
  );
}

export function presenterPromptBlock(profile: AiPresenterProfile): string {
  return [
    `PRESENTER: ${profile.displayName} (${profile.personaId})`,
    `Appearance: ${profile.appearance}`,
    `Facial: ${profile.facialExpressionStyle}`,
    `Body: ${profile.bodyMotionStyle}`,
    `Lip sync: ${profile.lipSyncProfile}`,
    `Voice: ${profile.voiceStyle} / ${profile.voiceId}`,
    `Languages: ${profile.languages.slice(0, 5).join(", ")}`,
    `Accents: ${profile.accents.join(", ")}`,
    `Realism: ${profile.realismLevel}`,
  ].join("\n");
}
