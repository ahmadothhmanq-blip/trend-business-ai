import { elevenLabsTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/elevenlabs";
import { openAiTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/openai";
import type { TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";

export function listTtsProviders(): TtsProvider[] {
  return [elevenLabsTtsProvider, openAiTtsProvider];
}

export function resolveTtsProvider(preferred?: string): TtsProvider {
  const providers = listTtsProviders();
  if (preferred) {
    const match = providers.find((provider) => provider.id === preferred);
    if (match) return match;
  }
  const ready = providers.find((provider) => provider.status() === "ready");
  if (ready) return ready;
  throw new AudioEngineError(
    "No TTS provider is configured. Set ELEVENLABS_API_KEY or OPENAI_API_KEY.",
    "unconfigured",
  );
}

export function ttsProviderHealthReport() {
  return listTtsProviders().map((provider) => ({
    id: provider.id,
    ...provider.health(),
    capabilities: provider.capabilities(),
  }));
}
