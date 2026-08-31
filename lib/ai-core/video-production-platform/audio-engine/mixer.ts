/**
 * Audio mixer — duration alignment, ducking, fade, normalize.
 * Production mix uses FFmpeg. WAV PCM mix is used for deterministic tests
 * and as the filter-plan source of truth. Never emits silent preview files.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import { assertValidAudioBytes, sniffAudioMime } from "@/lib/ai-core/video-production-platform/audio-engine/validation";
import { probeFfmpegHealth } from "@/lib/ai-core/video-production-platform/assemble";

export type MixSettings = {
  voiceLevel: number;
  musicLevel: number;
  sfxLevel: number;
  ducking: boolean;
  normalize: boolean;
  fadeInSec: number;
  fadeOutSec: number;
  targetDurationSec: number;
};

export type MixInput = {
  voice?: Uint8Array | null;
  music?: Uint8Array | null;
  sfx?: Array<{ bytes: Uint8Array; timestampSec: number; intensity: number }>;
  settings: MixSettings;
};

export type MixResult = {
  bytes: Uint8Array;
  mimeType: "audio/wav";
  durationSec: number;
  method: "ffmpeg" | "pcm";
  ducked: boolean;
  aligned: boolean;
};

const SAMPLE_RATE = 8000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function pcmFromWav(bytes: Uint8Array): Int16Array {
  if (sniffAudioMime(bytes) !== "audio/wav" || bytes.length < 44) {
    throw new AudioEngineError("Mixer requires WAV PCM input.", "invalid_audio");
  }
  const pcm = bytes.subarray(44);
  const samples = new Int16Array(Math.floor(pcm.length / 2));
  for (let i = 0; i < samples.length; i++) {
    const lo = pcm[i * 2]!;
    const hi = pcm[i * 2 + 1]!;
    let sample = lo | (hi << 8);
    if (sample > 32767) sample -= 65536;
    samples[i] = sample;
  }
  return samples;
}

export function toneWavBytes(input: {
  durationSec: number;
  frequencyHz?: number;
  amplitude?: number;
}): Uint8Array {
  const samples = Math.max(1, Math.round(input.durationSec * SAMPLE_RATE));
  const pcm = new Int16Array(samples);
  const freq = input.frequencyHz ?? 440;
  const amp = input.amplitude ?? 12000;
  for (let i = 0; i < samples; i++) {
    pcm[i] = Math.round(Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE) * amp);
  }
  return wavFromPcm(pcm);
}

export function wavFromPcm(samples: Int16Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, dataSize, true);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i]!;
    out[44 + i * 2] = sample & 0xff;
    out[45 + i * 2] = (sample >> 8) & 0xff;
  }
  return out;
}

export function alignDuration(samples: Int16Array, targetSec: number, sampleRate = SAMPLE_RATE): Int16Array {
  const target = Math.max(1, Math.round(targetSec * sampleRate));
  if (samples.length === target) return samples;
  if (samples.length > target) return samples.slice(0, target);
  const padded = new Int16Array(target);
  padded.set(samples);
  return padded;
}

export function applyFade(samples: Int16Array, fadeInSec: number, fadeOutSec: number, sampleRate = SAMPLE_RATE): Int16Array {
  const out = new Int16Array(samples);
  const fadeIn = Math.min(samples.length, Math.round(fadeInSec * sampleRate));
  const fadeOut = Math.min(samples.length, Math.round(fadeOutSec * sampleRate));
  for (let i = 0; i < fadeIn; i++) out[i] = Math.round((out[i]! * i) / fadeIn);
  for (let i = 0; i < fadeOut; i++) {
    const idx = samples.length - 1 - i;
    out[idx] = Math.round((out[idx]! * i) / fadeOut);
  }
  return out;
}

export function duckMusic(voice: Int16Array, music: Int16Array, ratio = 0.35): { music: Int16Array; ducked: boolean } {
  const out = new Int16Array(music);
  let ducked = false;
  const n = Math.min(voice.length, music.length);
  for (let i = 0; i < n; i++) {
    if (Math.abs(voice[i]!) > 800) {
      out[i] = Math.round(out[i]! * ratio);
      ducked = true;
    }
  }
  return { music: out, ducked };
}

export function normalizePcm(samples: Int16Array): Int16Array {
  let peak = 1;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const gain = peak > 0 ? Math.min(1, 30000 / peak) : 1;
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = Math.round(samples[i]! * gain);
  return out;
}

export function mixPcmWav(input: MixInput): MixResult {
  const target = input.settings.targetDurationSec;
  if (!input.voice && !input.music && !input.sfx?.length) {
    throw new AudioEngineError("Mixer requires at least one real audio stem.", "mix_failed");
  }
  const length = Math.round(target * SAMPLE_RATE);
  const mix = new Int16Array(length);
  let ducked = false;

  let music = input.music ? alignDuration(pcmFromWav(input.music), target) : null;
  const voice = input.voice ? alignDuration(pcmFromWav(input.voice), target) : null;
  if (input.settings.ducking && voice && music) {
    const duckedMusic = duckMusic(voice, music);
    music = duckedMusic.music;
    ducked = duckedMusic.ducked;
  }

  const add = (samples: Int16Array | null, level: number) => {
    if (!samples) return;
    for (let i = 0; i < length; i++) {
      mix[i] = clamp(mix[i]! + Math.round((samples[i] || 0) * level), -32767, 32767);
    }
  };

  add(voice, clamp(input.settings.voiceLevel, 0, 2));
  add(music, clamp(input.settings.musicLevel, 0, 2));
  for (const cue of input.sfx || []) {
    const sfx = pcmFromWav(cue.bytes);
    const offset = Math.round(cue.timestampSec * SAMPLE_RATE);
    const level = clamp(input.settings.sfxLevel * cue.intensity, 0, 2);
    for (let i = 0; i < sfx.length && offset + i < length; i++) {
      mix[offset + i] = clamp(mix[offset + i]! + Math.round(sfx[i]! * level), -32767, 32767);
    }
  }

  let out = applyFade(mix, input.settings.fadeInSec, input.settings.fadeOutSec);
  if (input.settings.normalize) out = normalizePcm(out);
  const bytes = wavFromPcm(out);
  assertValidAudioBytes({ bytes, declaredMime: "audio/wav", durationSec: target });
  return { bytes, mimeType: "audio/wav", durationSec: target, method: "pcm", ducked, aligned: true };
}

function ffmpegBin() {
  return process.env.FFMPEG_PATH || process.env.FFMPEG_BINARY || "ffmpeg";
}

function runFfmpeg(args: string[]): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(ffmpegBin(), args, { windowsHide: true });
    let output = "";
    child.stderr?.on("data", (d: Buffer) => {
      output += d.toString();
    });
    child.on("error", () => resolve({ ok: false, stderr: "ffmpeg not available" }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr: output }));
  });
}

export async function mixAudio(input: MixInput): Promise<MixResult> {
  const health = await probeFfmpegHealth();
  if (!health.available) {
    throw new AudioEngineError(health.message || "FFmpeg is not available for audio mix.", "ffmpeg_unavailable");
  }
  if (!input.voice && !input.music && !input.sfx?.length) {
    throw new AudioEngineError("Mixer requires at least one real audio stem.", "mix_failed");
  }

  const dir = await mkdtemp(join(tmpdir(), "vs-audio-mix-"));
  try {
    const args = ["-y"];
    const labels: string[] = [];
    let index = 0;
    const writeStem = async (name: string, bytes: Uint8Array) => {
      const path = join(dir, name);
      await writeFile(path, bytes);
      args.push("-i", path);
      return index++;
    };
    const filters: string[] = [];
    const fadeIn = Math.max(0, input.settings.fadeInSec);
    const fadeOut = Math.max(0, input.settings.fadeOutSec);
    const fadeOutStart = Math.max(0, input.settings.targetDurationSec - fadeOut);
    const voiceFade = `afade=t=in:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}`;
    let voiceIndex: number | null = null;
    if (input.voice) {
      voiceIndex = await writeStem("voice.wav", input.voice);
      if (input.settings.ducking && input.music) {
        filters.push(`[${voiceIndex}:a]asplit=2[vsrc][vside]`);
        filters.push(
          `[vsrc]volume=${clamp(input.settings.voiceLevel, 0, 2)},${voiceFade},aformat=sample_fmts=fltp:sample_rates=48000[v]`,
        );
      } else {
        filters.push(
          `[${voiceIndex}:a]volume=${clamp(input.settings.voiceLevel, 0, 2)},${voiceFade},aformat=sample_fmts=fltp:sample_rates=48000[v]`,
        );
      }
      labels.push("[v]");
    }
    if (input.music) {
      const i = await writeStem("music.wav", input.music);
      if (input.settings.ducking && voiceIndex != null) {
        filters.push(`[${i}:a]volume=${clamp(input.settings.musicLevel, 0, 2)}[mraw]`);
        filters.push(`[mraw][vside]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=250,aformat=sample_fmts=fltp:sample_rates=48000[m]`);
      } else {
        filters.push(
          `[${i}:a]volume=${clamp(input.settings.musicLevel, 0, 2)},aformat=sample_fmts=fltp:sample_rates=48000[m]`,
        );
      }
      labels.push("[m]");
    }
    for (const [n, cue] of (input.sfx || []).entries()) {
      const i = await writeStem(`sfx-${n}.wav`, cue.bytes);
      const delay = Math.max(0, Math.round(cue.timestampSec * 1000));
      filters.push(
        `[${i}:a]volume=${clamp(input.settings.sfxLevel * cue.intensity, 0, 2)},adelay=${delay}|${delay}[s${n}]`,
      );
      labels.push(`[s${n}]`);
    }
    const mixInputs = labels.join("");
    const norm = input.settings.normalize ? ",loudnorm=I=-16:TP=-1.5:LRA=11" : "";
    filters.push(
      `${mixInputs}amix=inputs=${labels.length}:duration=longest:dropout_transition=2,atrim=0:${input.settings.targetDurationSec}${norm}[out]`,
    );
    const output = join(dir, "mix.wav");
    args.push("-filter_complex", filters.join(";"), "-map", "[out]", "-t", String(input.settings.targetDurationSec), output);
    const result = await runFfmpeg(args);
    if (!result.ok) {
      throw new AudioEngineError(`FFmpeg mix failed: ${result.stderr.slice(0, 240)}`, "mix_failed");
    }
    const bytes = new Uint8Array(await readFile(output));
    assertValidAudioBytes({ bytes, declaredMime: sniffAudioMime(bytes) || "audio/wav" });
    return {
      bytes,
      mimeType: "audio/wav",
      durationSec: input.settings.targetDurationSec,
      method: "ffmpeg",
      ducked: Boolean(input.settings.ducking && input.voice && input.music),
      aligned: true,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
