/**
 * AI Voice / TTS providers — ElevenLabs, OpenAI, preview.
 */

export type TtsProviderId = "preview" | "elevenlabs" | "openai";

export type TtsRequest = {
  text: string;
  voiceId?: string;
  language?: string;
  accent?: string;
  emotion?: string;
  style?: string;
};

export type TtsResult = {
  provider: TtsProviderId;
  status: "completed" | "failed";
  bytes?: Uint8Array;
  mimeType: "audio/mpeg" | "audio/wav" | "audio/ogg";
  durationSecEstimate: number;
  message: string;
  error?: string;
};

/** Minimal silent WAV (~0.5s) for preview when no TTS key. */
export function silentWavBytes(durationSec = 1): Uint8Array {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * Math.max(0.25, durationSec));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  return new Uint8Array(buffer);
}

export function isTtsProviderConfigured(): boolean {
  return Boolean(
    process.env.ELEVENLABS_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.TTS_PROVIDER_API_KEY,
  );
}

export function resolveTtsProviderId(): TtsProviderId {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.OPENAI_API_KEY || process.env.TTS_PROVIDER_API_KEY) return "openai";
  return "preview";
}

export const TTS_VOICE_CATALOG = [
  { id: "alloy", label: "Alloy", style: "Neutral conversational", languages: ["English"], accents: ["US"], emotions: ["neutral", "calm"] },
  { id: "verse", label: "Verse", style: "Motivational energetic", languages: ["English"], accents: ["US"], emotions: ["energetic", "confident"] },
  { id: "aria", label: "Aria", style: "Soft aspirational", languages: ["English", "Spanish"], accents: ["US", "LATAM"], emotions: ["warm", "empathetic"] },
  { id: "merlin", label: "Merlin", style: "Calm authoritative", languages: ["English"], accents: ["UK"], emotions: ["authoritative", "calm"] },
  { id: "nova", label: "Nova", style: "Clear instructional", languages: ["English"], accents: ["US"], emotions: ["clear", "friendly"] },
  { id: "echo", label: "Echo", style: "Broadcast", languages: ["English"], accents: ["US", "AU"], emotions: ["broadcast", "serious"] },
  { id: "shimmer", label: "Shimmer", style: "Bright commercial", languages: ["English"], accents: ["US"], emotions: ["upbeat", "sales"] },
  { id: "onyx", label: "Onyx", style: "Deep narration", languages: ["English"], accents: ["US"], emotions: ["dramatic", "calm"] },
] as const;

function buildTtsInstruction(req: TtsRequest): string {
  const parts = [req.text.slice(0, 4000)];
  if (req.language) parts.unshift(`[Language: ${req.language}]`);
  if (req.accent) parts.unshift(`[Accent: ${req.accent}]`);
  if (req.emotion) parts.unshift(`[Emotion: ${req.emotion}]`);
  if (req.style) parts.unshift(`[Style: ${req.style}]`);
  return parts.join("\n");
}

export async function synthesizeSpeech(req: TtsRequest): Promise<TtsResult> {
  const provider = resolveTtsProviderId();
  const estimate = Math.max(1, Math.ceil(req.text.split(/\s+/).length / 2.5));
  const instructed = buildTtsInstruction(req);

  if (provider === "elevenlabs") {
    const key = process.env.ELEVENLABS_API_KEY!;
    const voice = req.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
    try {
      const styleBoost =
        req.emotion || req.style
          ? Math.min(0.75, 0.25 + (req.emotion ? 0.25 : 0) + (req.style ? 0.15 : 0))
          : 0.2;
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": key,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: instructed.slice(0, 5000),
            model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
            voice_settings: {
              stability: req.emotion === "energetic" ? 0.3 : 0.45,
              similarity_boost: 0.8,
              style: styleBoost,
              use_speaker_boost: true,
            },
          }),
        },
      );
      if (res.ok) {
        return {
          provider: "elevenlabs",
          status: "completed",
          bytes: new Uint8Array(await res.arrayBuffer()),
          mimeType: "audio/mpeg",
          durationSecEstimate: estimate,
          message: `ElevenLabs TTS completed (${req.language || "en"}${req.emotion ? `, ${req.emotion}` : ""}).`,
        };
      }
    } catch {
      /* fall through */
    }
  }

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY || process.env.TTS_PROVIDER_API_KEY!;
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
          voice: req.voiceId || "alloy",
          input: instructed.slice(0, 4000),
          response_format: "mp3",
          ...(req.style || req.emotion
            ? { instructions: `Speak with ${req.style || "natural"} style, emotion ${req.emotion || "neutral"}, accent ${req.accent || "neutral"}.` }
            : {}),
        }),
      });
      if (res.ok) {
        return {
          provider: "openai",
          status: "completed",
          bytes: new Uint8Array(await res.arrayBuffer()),
          mimeType: "audio/mpeg",
          durationSecEstimate: estimate,
          message: `OpenAI TTS completed (${req.voiceId || "alloy"}).`,
        };
      }
    } catch {
      /* fall through */
    }
  }

  return {
    provider: "preview",
    status: "completed",
    bytes: silentWavBytes(Math.min(8, estimate)),
    mimeType: "audio/wav",
    durationSecEstimate: estimate,
    message: isTtsProviderConfigured()
      ? "TTS provider call failed; stored silent preview WAV."
      : "Preview TTS (silent WAV). Set ELEVENLABS_API_KEY or OPENAI_API_KEY for real voice.",
  };
}
