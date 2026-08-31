import { createHash } from "node:crypto";
import type { AudioArtifact, PlayableAudioMimeType } from "@/lib/ai-core/video-production-platform/domain/audio";
import { PLAYABLE_AUDIO_MIME_TYPES } from "@/lib/ai-core/video-production-platform/domain/audio";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";

const MIN_AUDIO_BYTES = 256;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MIN_DURATION_SEC = 0.2;
const MAX_DURATION_SEC = 180;

export function sniffAudioMime(bytes: Uint8Array): PlayableAudioMimeType | null {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...Array.from(bytes.subarray(start, end)));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE") return "audio/wav";
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return "audio/mpeg";
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) return "audio/mpeg";
  if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return "audio/ogg";
  }
  return null;
}

export function isSilentPreviewWav(bytes: Uint8Array): boolean {
  if (sniffAudioMime(bytes) !== "audio/wav" || bytes.length < 44) return false;
  const pcm = bytes.subarray(44);
  let energy = 0;
  for (let i = 0; i + 1 < pcm.length; i += 2) {
    const sample = pcm[i]! | (pcm[i + 1]! << 8);
    const signed = sample > 32767 ? sample - 65536 : sample;
    energy += Math.abs(signed);
    if (energy > 32) return false;
  }
  return true;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function assertValidAudioBytes(input: {
  bytes: Uint8Array;
  declaredMime?: string;
  durationSec?: number;
}): PlayableAudioMimeType {
  if (!input.bytes?.byteLength || input.bytes.byteLength < MIN_AUDIO_BYTES) {
    throw new AudioEngineError("Audio file is too small.", "invalid_audio");
  }
  if (input.bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new AudioEngineError("Audio file exceeds the 8MB limit.", "invalid_audio");
  }
  const sniffed = sniffAudioMime(input.bytes);
  if (!sniffed) {
    throw new AudioEngineError("Audio magic bytes are not a playable MPEG/WAV/OGG file.", "invalid_audio");
  }
  if (input.declaredMime) {
    const declared = input.declaredMime.split(";")[0].trim().toLowerCase();
    if (!(PLAYABLE_AUDIO_MIME_TYPES as readonly string[]).includes(declared)) {
      throw new AudioEngineError(`Unsupported audio MIME ${declared}.`, "invalid_audio");
    }
    if (declared !== sniffed) {
      throw new AudioEngineError("Declared audio MIME does not match file signature.", "invalid_audio");
    }
  }
  if (isSilentPreviewWav(input.bytes)) {
    throw new AudioEngineError("Silent preview WAV is not a production audio artifact.", "invalid_audio");
  }
  if (input.durationSec != null && (input.durationSec < MIN_DURATION_SEC || input.durationSec > MAX_DURATION_SEC)) {
    throw new AudioEngineError("Audio duration is outside the allowed range.", "invalid_audio");
  }
  return sniffed;
}

export function assertAudioOwnership(input: { ownerId: string; userId: string }): void {
  if (!input.ownerId || input.ownerId !== input.userId) {
    throw new AudioEngineError("Audio artifact does not belong to this user.", "ownership");
  }
}

export function isValidAudioArtifact(artifact: AudioArtifact): boolean {
  if (artifact.isStub) return false;
  if (!(PLAYABLE_AUDIO_MIME_TYPES as readonly string[]).includes(artifact.mimeType)) return false;
  if (!artifact.url || artifact.durationSec < MIN_DURATION_SEC) return false;
  if (artifact.sizeBytes < MIN_AUDIO_BYTES) return false;
  if (artifact.provider === "preview" || artifact.provider === "preview-stub") return false;
  if (artifact.bytes) {
    try {
      assertValidAudioBytes({ bytes: artifact.bytes, declaredMime: artifact.mimeType, durationSec: artifact.durationSec });
    } catch {
      return false;
    }
  }
  return true;
}

export function buildAudioIdempotencyKey(input: {
  projectId: string;
  kind: string;
  provider: string;
  fingerprint: string;
  attempt?: number;
}): string {
  const hash = createHash("sha256").update(input.fingerprint).digest("hex").slice(0, 24);
  const attempt = input.attempt && input.attempt > 1 ? `:a${input.attempt}` : "";
  return `${input.projectId}:${input.kind}:${input.provider}:${hash}${attempt}`;
}
