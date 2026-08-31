import type { TtsJobHandle, TtsJobRequest, TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import { recallSucceededTtsJob, rememberSucceededTtsJob } from "@/lib/ai-core/video-production-platform/audio-engine/tts/job-cache";
import { assertValidAudioBytes } from "@/lib/ai-core/video-production-platform/audio-engine/validation";

const ELEVEN_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", languages: ["en", "ar", "es", "fr"] },
  { id: "alloy", label: "Alloy alias", languages: ["en"] },
];

export function elevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

function unconfiguredHandle(): never {
  throw new AudioEngineError("ElevenLabs is not configured. Set ELEVENLABS_API_KEY.", "unconfigured");
}

export const elevenLabsTtsProvider: TtsProvider = {
  id: "elevenlabs",
  label: "ElevenLabs",
  status: () => (elevenLabsConfigured() ? "ready" : "unconfigured"),
  capabilities: () => ({
    languages: ["en", "ar", "es", "fr", "de", "it"],
    voices: ELEVEN_VOICES,
    maxChars: 5000,
  }),
  estimateCost: ({ characters }) => ({
    provider: "elevenlabs",
    credits: Math.max(1, Math.ceil(characters / 80)),
    currency: "credits",
    characters,
  }),
  health: () =>
    elevenLabsConfigured()
      ? { ok: true, status: "ready", reason: "ELEVENLABS_API_KEY is configured." }
      : { ok: false, status: "unconfigured", reason: "ELEVENLABS_API_KEY is not configured." },
  async createJob(request: TtsJobRequest): Promise<TtsJobHandle> {
    const cached = recallSucceededTtsJob("elevenlabs", request.idempotencyKey);
    if (cached) return cached;
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    if (!key) unconfiguredHandle();
    const voice = request.voiceId || process.env.ELEVENLABS_VOICE_ID || ELEVEN_VOICES[0]!.id;
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "Idempotency-Key": request.idempotencyKey,
        },
        body: JSON.stringify({
          text: request.script.slice(0, 5000),
          model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
          voice_settings: {
            stability: request.tone === "energetic" ? 0.3 : 0.45,
            similarity_boost: 0.8,
          },
        }),
      });
      if (!res.ok) {
        return {
          provider: "elevenlabs",
          status: "failed",
          idempotencyKey: request.idempotencyKey,
          message: `ElevenLabs TTS failed (HTTP ${res.status}).`,
          errorCode: "provider_failed",
        };
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const mimeType = assertValidAudioBytes({ bytes, declaredMime: "audio/mpeg" });
      const handle: TtsJobHandle = {
        provider: "elevenlabs",
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType,
        bytes,
        durationSec: Math.max(1, Math.ceil(request.script.split(/\s+/).length / 2.5)),
        message: "ElevenLabs TTS succeeded.",
      };
      rememberSucceededTtsJob(handle);
      return handle;
    } catch (error) {
      if (error instanceof AudioEngineError) throw error;
      return {
        provider: "elevenlabs",
        status: "failed",
        idempotencyKey: request.idempotencyKey,
        message: error instanceof Error ? error.message : "ElevenLabs TTS failed.",
        errorCode: "provider_failed",
      };
    }
  },
  async pollJob(_externalJobId, idempotencyKey) {
    const cached = recallSucceededTtsJob("elevenlabs", idempotencyKey);
    if (cached) return cached;
    return {
      provider: "elevenlabs",
      status: "failed",
      idempotencyKey,
      message: "ElevenLabs job is unknown. Jobs complete inline; poll only after createJob.",
      errorCode: "provider_failed",
    };
  },
};
