import type { TtsJobHandle, TtsJobRequest, TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import { recallSucceededTtsJob, rememberSucceededTtsJob } from "@/lib/ai-core/video-production-platform/audio-engine/tts/job-cache";
import { assertValidAudioBytes } from "@/lib/ai-core/video-production-platform/audio-engine/validation";

const OPENAI_VOICES = [
  { id: "alloy", label: "Alloy", languages: ["en"] },
  { id: "verse", label: "Verse", languages: ["en"] },
  { id: "aria", label: "Aria", languages: ["en", "es"] },
];

export function openAiTtsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() || process.env.TTS_PROVIDER_API_KEY?.trim());
}

export const openAiTtsProvider: TtsProvider = {
  id: "openai",
  label: "OpenAI TTS",
  status: () => (openAiTtsConfigured() ? "ready" : "unconfigured"),
  capabilities: () => ({
    languages: ["en", "es", "fr", "de"],
    voices: OPENAI_VOICES,
    maxChars: 4000,
  }),
  estimateCost: ({ characters }) => ({
    provider: "openai",
    credits: Math.max(1, Math.ceil(characters / 120)),
    currency: "credits",
    characters,
  }),
  health: () =>
    openAiTtsConfigured()
      ? { ok: true, status: "ready", reason: "OPENAI_API_KEY is configured." }
      : { ok: false, status: "unconfigured", reason: "OPENAI_API_KEY is not configured." },
  async createJob(request: TtsJobRequest): Promise<TtsJobHandle> {
    const cached = recallSucceededTtsJob("openai", request.idempotencyKey);
    if (cached) return cached;
    const key = (process.env.OPENAI_API_KEY || process.env.TTS_PROVIDER_API_KEY || "").trim();
    if (!key) {
      throw new AudioEngineError("OpenAI TTS is not configured. Set OPENAI_API_KEY.", "unconfigured");
    }
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": request.idempotencyKey,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
          voice: request.voiceId || "alloy",
          input: request.script.slice(0, 4000),
          response_format: "mp3",
        }),
      });
      if (!res.ok) {
        return {
          provider: "openai",
          status: "failed",
          idempotencyKey: request.idempotencyKey,
          message: `OpenAI TTS failed (HTTP ${res.status}).`,
          errorCode: "provider_failed",
        };
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const mimeType = assertValidAudioBytes({ bytes, declaredMime: "audio/mpeg" });
      const handle: TtsJobHandle = {
        provider: "openai",
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType,
        bytes,
        durationSec: Math.max(1, Math.ceil(request.script.split(/\s+/).length / 2.5)),
        message: "OpenAI TTS succeeded.",
      };
      rememberSucceededTtsJob(handle);
      return handle;
    } catch (error) {
      if (error instanceof AudioEngineError) throw error;
      return {
        provider: "openai",
        status: "failed",
        idempotencyKey: request.idempotencyKey,
        message: error instanceof Error ? error.message : "OpenAI TTS failed.",
        errorCode: "provider_failed",
      };
    }
  },
  async pollJob(_externalJobId, idempotencyKey) {
    const cached = recallSucceededTtsJob("openai", idempotencyKey);
    if (cached) return cached;
    return {
      provider: "openai",
      status: "failed",
      idempotencyKey,
      message: "OpenAI TTS job is unknown. Jobs complete inline; poll only after createJob.",
      errorCode: "provider_failed",
    };
  },
};
