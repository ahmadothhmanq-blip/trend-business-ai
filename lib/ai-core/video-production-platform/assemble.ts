/**
 * Final video assembly — ffmpeg concat, xfade, audio mux, subtitle burn, export scale.
 */

import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { VideoMediaAsset } from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import { fetchRemoteToBytes } from "@/lib/ai-core/video-production-platform/media-storage";

export type AssemblyExportPreset = {
  aspectRatio: string;
  width: number;
  height: number;
  quality: "720p" | "1080p" | "4k";
};

export type AssemblySubtitleCue = {
  startSec: number;
  endSec: number;
  text: string;
};

export type AssemblyInput = {
  clips: Array<{ url: string; durationSec: number; transition?: string }>;
  audioUrl?: string | null;
  musicUrl?: string | null;
  title: string;
  subtitles?: AssemblySubtitleCue[];
  burnSubtitles?: boolean;
  useTransitions?: boolean;
  exportPreset?: AssemblyExportPreset;
  /** Prefer webm container when ffmpeg encodes */
  outputFormat?: "mp4" | "webm";
};

export type AssemblyResult = {
  method: "ffmpeg" | "first-clip" | "manifest-only";
  bytes?: Uint8Array;
  mimeType: "video/mp4" | "video/webm";
  note: string;
  manifest: {
    clipUrls: string[];
    audioUrl?: string;
    musicUrl?: string;
    method: "ffmpeg" | "first-clip" | "manifest-only";
    note: string;
    exportPreset?: AssemblyExportPreset;
    burnedSubtitles?: boolean;
    transitions?: boolean;
    outputFormat?: "mp4" | "webm";
  };
  assetStub: VideoMediaAsset;
};

function ffmpegBin(): string {
  return process.env.FFMPEG_PATH || process.env.FFMPEG_BINARY || "ffmpeg";
}

function runFfmpeg(args: string[]): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(ffmpegBin(), args, { windowsHide: true });
    let stderr = "";
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("error", () => resolve({ ok: false, stderr: "ffmpeg not available" }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr }));
  });
}

function runFfprobe(args: string[]): Promise<{ ok: boolean; stdout: string }> {
  return new Promise((resolve) => {
    const probe =
      process.env.FFPROBE_PATH ||
      (ffmpegBin().includes("ffmpeg")
        ? ffmpegBin().replace(/ffmpeg(\.exe)?$/i, "ffprobe$1")
        : "ffprobe");
    const child = spawn(probe, args, { windowsHide: true });
    let stdout = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.on("error", () => resolve({ ok: false, stdout: "" }));
    child.on("close", (code) => resolve({ ok: code === 0, stdout }));
  });
}

/** Health check for assembly tooling. */
export async function probeFfmpegHealth(): Promise<{
  available: boolean;
  path: string;
  version?: string;
  message: string;
}> {
  const path = ffmpegBin();
  const result = await runFfmpeg(["-version"]);
  if (!result.ok) {
    return {
      available: false,
      path,
      message:
        "FFmpeg not found. Install ffmpeg or set FFMPEG_PATH for multi-scene merge, burn-in, and export.",
    };
  }
  const version = result.stderr.split("\n")[0] || "ffmpeg available";
  return {
    available: true,
    path,
    version,
    message: version,
  };
}

export type FfmpegCapabilities = {
  available: boolean;
  merge: boolean;
  audioMix: boolean;
  subtitleBurn: boolean;
  trim: boolean;
  socialReencode: boolean;
  message: string;
};

/** Probe ffmpeg filter support used by Video Studio assembly. */
export async function probeFfmpegCapabilities(): Promise<FfmpegCapabilities> {
  const base = await probeFfmpegHealth();
  if (!base.available) {
    return {
      available: false,
      merge: false,
      audioMix: false,
      subtitleBurn: false,
      trim: false,
      socialReencode: false,
      message: base.message,
    };
  }

  const filters = await runFfmpeg(["-hide_banner", "-filters"]);
  const text = filters.stderr.toLowerCase();
  const has = (name: string) => text.includes(name);

  const merge = has("concat") || has("xfade");
  const audioMix = has("amix");
  const subtitleBurn = has("ass") || has("subtitles");
  const trim = true;
  const socialReencode = has("scale") && has("libx264");

  return {
    available: true,
    merge,
    audioMix,
    subtitleBurn,
    trim,
    socialReencode,
    message: [
      merge ? "merge" : "merge-missing",
      audioMix ? "audio-mix" : "audio-mix-missing",
      subtitleBurn ? "subtitle-burn" : "subtitle-burn-missing",
      trim ? "trim" : "trim-missing",
      socialReencode ? "social-reencode" : "social-reencode-missing",
    ].join(", "),
  };
}

/** Trim a remote/local clip to durationSec using ffmpeg (returns bytes or null). */
export async function trimClipWithFfmpeg(
  sourceUrl: string,
  durationSec: number,
): Promise<Uint8Array | null> {
  const bytes = await fetchRemoteToBytes(sourceUrl);
  if (!bytes || bytes.byteLength < 32) return null;
  const dir = await mkdtemp(join(tmpdir(), "vs-trim-"));
  try {
    const input = join(dir, "in.mp4");
    const output = join(dir, "out.mp4");
    await writeFile(input, bytes);
    const trim = await runFfmpeg([
      "-y",
      "-i",
      input,
      "-t",
      String(Math.max(0.5, durationSec)),
      "-c",
      "copy",
      output,
    ]);
    if (!trim.ok) {
      const re = await runFfmpeg([
        "-y",
        "-i",
        input,
        "-t",
        String(Math.max(0.5, durationSec)),
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        output,
      ]);
      if (!re.ok) return null;
    }
    return new Uint8Array(await readFile(output));
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/** Probe media duration via ffprobe when available. */
export async function probeMediaDurationSec(url: string): Promise<number | null> {
  const bytes = await fetchRemoteToBytes(url);
  if (!bytes) return null;
  const dir = await mkdtemp(join(tmpdir(), "vs-probe-"));
  try {
    const path = join(dir, "media.bin");
    await writeFile(path, bytes);
    const probe = await runFfprobe([
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      path,
    ]);
    if (!probe.ok) return null;
    const n = Number.parseFloat(probe.stdout.trim());
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function escapeAssText(text: string): string {
  return text.replace(/[{}\\]/g, "").replace(/\n/g, "\\N").slice(0, 200);
}

function buildAssFile(cues: AssemblySubtitleCue[]): string {
  const header = `[Script Info]
Title: Trend Business AI
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,40,40,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const fmt = (n: number) => {
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = Math.floor(n % 60);
    const cs = Math.floor((n % 1) * 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };
  const events = cues
    .map(
      (c) =>
        `Dialogue: 0,${fmt(c.startSec)},${fmt(c.endSec)},Default,,0,0,0,,${escapeAssText(c.text)}`,
    )
    .join("\n");
  return header + events + "\n";
}

function scaleFilter(preset?: AssemblyExportPreset): string {
  if (!preset) return "scale=trunc(iw/2)*2:trunc(ih/2)*2";
  const { width, height } = preset;
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
}

export function resolveExportPreset(
  aspectRatio?: string,
  quality: AssemblyExportPreset["quality"] = "1080p",
): AssemblyExportPreset {
  const q =
    quality === "4k" ? 2160 : quality === "720p" ? 720 : 1080;
  const ar = aspectRatio || "9:16";
  if (ar === "9:16") {
    return {
      aspectRatio: ar,
      width: Math.round((q * 9) / 16),
      height: q,
      quality,
    };
  }
  if (ar === "1:1") {
    return { aspectRatio: ar, width: q, height: q, quality };
  }
  return {
    aspectRatio: "16:9",
    width: Math.round((q * 16) / 9),
    height: q,
    quality,
  };
}

async function tryFfmpegAssemble(input: AssemblyInput): Promise<Uint8Array | null> {
  const clips = input.clips;
  if (clips.length === 0) return null;
  const dir = await mkdtemp(join(tmpdir(), "vs-assemble-"));
  try {
    const localClips: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const bytes = await fetchRemoteToBytes(clips[i]!.url);
      if (!bytes || bytes.byteLength < 32) return null;
      const path = join(dir, `clip-${i}.mp4`);
      await writeFile(path, bytes);
      localClips.push(path);
    }

    let workPath = join(dir, "concat.mp4");

    // Prefer xfade chain when transitions requested and 2+ clips
    if (input.useTransitions && localClips.length >= 2) {
      const inputs = localClips.flatMap((p) => ["-i", p]);
      let filter = "";
      let last = "[0:v]";
      for (let i = 1; i < localClips.length; i++) {
        const out = i === localClips.length - 1 ? "[vout]" : `[v${i}]`;
        const dur = Math.max(0.3, Math.min(1.0, (clips[i - 1]?.durationSec || 5) * 0.08));
        const offset = Math.max(0.1, (clips[i - 1]?.durationSec || 5) - dur);
        filter += `${last}[${i}:v]xfade=transition=fade:duration=${dur}:offset=${offset}${out};`;
        last = out;
      }
      filter += `${last === "[vout]" ? "[vout]" : last}${scaleFilter(input.exportPreset)}[vfinal]`;
      // simplify: use last labeled output
      filter = filter.replace("[vfinal]", "[vfinal]");
      const xfadeOut = join(dir, "xfade.mp4");
      const xfade = await runFfmpeg([
        "-y",
        ...inputs,
        "-filter_complex",
        localClips.length === 2
          ? `[0:v][1:v]xfade=transition=fade:duration=0.5:offset=${Math.max(0.5, (clips[0]?.durationSec || 3) - 0.5)}[v];[v]${scaleFilter(input.exportPreset)}[vout]`
          : `[0:v][1:v]xfade=transition=fade:duration=0.4:offset=1[v01];[v01]${scaleFilter(input.exportPreset)}[vout]`,
        "-map",
        "[vout]",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        xfadeOut,
      ]);
      if (xfade.ok) workPath = xfadeOut;
    }

    if (workPath.endsWith("concat.mp4")) {
      const listPath = join(dir, "concat.txt");
      const listBody = localClips
        .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
        .join("\n");
      await writeFile(listPath, listBody, "utf8");

      const concat = await runFfmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listPath,
        "-c",
        "copy",
        workPath,
      ]);
      if (!concat.ok) {
        const reencode = await runFfmpeg([
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          listPath,
          "-vf",
          scaleFilter(input.exportPreset),
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-movflags",
          "+faststart",
          workPath,
        ]);
        if (!reencode.ok) return null;
      } else if (input.exportPreset) {
        const scaled = join(dir, "scaled.mp4");
        const scale = await runFfmpeg([
          "-y",
          "-i",
          workPath,
          "-vf",
          scaleFilter(input.exportPreset),
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-movflags",
          "+faststart",
          scaled,
        ]);
        if (scale.ok) workPath = scaled;
      }
    }

    // Audio mux (voice ± music)
    if (input.audioUrl || input.musicUrl) {
      const muxed = join(dir, "muxed.mp4");
      const args = ["-y", "-i", workPath];
      let audioFilter = "";
      let mapAudio = "1:a:0";
      if (input.audioUrl) {
        const audioBytes = await fetchRemoteToBytes(input.audioUrl);
        if (audioBytes && audioBytes.byteLength > 16) {
          const audioPath = join(dir, "voice.mp3");
          await writeFile(audioPath, audioBytes);
          args.push("-i", audioPath);
        }
      }
      if (input.musicUrl) {
        const musicBytes = await fetchRemoteToBytes(input.musicUrl);
        if (musicBytes && musicBytes.byteLength > 16) {
          const musicPath = join(dir, "music.mp3");
          await writeFile(musicPath, musicBytes);
          args.push("-i", musicPath);
          if (args.filter((a) => a.endsWith(".mp3")).length >= 2) {
            audioFilter = "[1:a][2:a]amix=inputs=2:duration=shortest:dropout_transition=2[aout]";
            mapAudio = "[aout]";
          }
        }
      }
      if (args.length > 3) {
        const muxArgs = [...args];
        if (audioFilter) {
          muxArgs.push("-filter_complex", audioFilter, "-map", "0:v:0", "-map", mapAudio);
        } else {
          muxArgs.push("-map", "0:v:0", "-map", "1:a:0?");
        }
        muxArgs.push(
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-shortest",
          "-movflags",
          "+faststart",
          muxed,
        );
        const mux = await runFfmpeg(muxArgs);
        if (mux.ok) workPath = muxed;
      }
    }

    // Subtitle burn-in
    if (input.burnSubtitles && input.subtitles && input.subtitles.length > 0) {
      const assPath = join(dir, "subs.ass");
      await writeFile(assPath, buildAssFile(input.subtitles), "utf8");
      const burned = join(dir, "burned.mp4");
      const burn = await runFfmpeg([
        "-y",
        "-i",
        workPath,
        "-vf",
        `ass=${assPath.replace(/\\/g, "/").replace(/:/g, "\\:")}`,
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        burned,
      ]);
      if (burn.ok) workPath = burned;
    }

    if (input.outputFormat === "webm") {
      const webmPath = join(dir, "final.webm");
      const webm = await runFfmpeg([
        "-y",
        "-i",
        workPath,
        "-c:v",
        "libvpx-vp9",
        "-b:v",
        "1M",
        "-c:a",
        "libopus",
        webmPath,
      ]);
      if (webm.ok) workPath = webmPath;
    }

    return new Uint8Array(await readFile(workPath));
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function assembleComposite(input: AssemblyInput): Promise<AssemblyResult> {
  const clipUrls = input.clips.map((c) => c.url).filter(Boolean);
  const first = input.clips[0];

  if (clipUrls.length === 0 || !first) {
    return {
      method: "manifest-only",
      mimeType: "video/mp4",
      note: "No clips to assemble.",
      manifest: {
        clipUrls: [],
        audioUrl: input.audioUrl || undefined,
        method: "manifest-only",
        note: "No clips",
      },
      assetStub: {
        id: vid("composite", input.title, 0),
        kind: "composite",
        mimeType: "video/mp4",
        url: "",
        durationSec: 0,
        provider: "preview",
        createdAt: nowIso(),
      },
    };
  }

  const ffmpegBytes = await tryFfmpegAssemble(input);
  const mimeType: "video/mp4" | "video/webm" =
    input.outputFormat === "webm" ? "video/webm" : "video/mp4";
  if (ffmpegBytes) {
    return {
      method: "ffmpeg",
      bytes: ffmpegBytes,
      mimeType,
      note: `FFmpeg assembled ${clipUrls.length} clips${input.audioUrl ? " + voice" : ""}${input.burnSubtitles ? " + burned captions" : ""}${input.useTransitions ? " + transitions" : ""}${input.outputFormat === "webm" ? " · WebM" : " · MP4"}.`,
      manifest: {
        clipUrls,
        audioUrl: input.audioUrl || undefined,
        musicUrl: input.musicUrl || undefined,
        method: "ffmpeg",
        note: "FFmpeg concat/xfade + optional mux/burn/scale",
        exportPreset: input.exportPreset,
        burnedSubtitles: Boolean(input.burnSubtitles && input.subtitles?.length),
        transitions: Boolean(input.useTransitions),
        outputFormat: input.outputFormat || "mp4",
      },
      assetStub: {
        id: vid("composite", input.title, Date.now() % 10000),
        kind: "composite",
        mimeType,
        url: "",
        durationSec: input.clips.reduce((s, c) => s + c.durationSec, 0),
        provider: "external",
        createdAt: nowIso(),
      },
    };
  }

  let firstBytes: Uint8Array | undefined;
  try {
    firstBytes = (await fetchRemoteToBytes(first.url)) || undefined;
  } catch {
    firstBytes = undefined;
  }

  return {
    method: clipUrls.length === 1 ? "first-clip" : "manifest-only",
    bytes: firstBytes,
    mimeType: "video/mp4",
    note:
      clipUrls.length === 1
        ? "Single clip used as final composite."
        : `FFmpeg unavailable — first clip + assembly manifest (${clipUrls.length} clips).`,
    manifest: {
      clipUrls,
      audioUrl: input.audioUrl || undefined,
      musicUrl: input.musicUrl || undefined,
      method: clipUrls.length === 1 ? "first-clip" : "manifest-only",
      note: "Install ffmpeg for merge, burn-in, transitions, and export scale.",
      exportPreset: input.exportPreset,
    },
    assetStub: {
      id: vid("composite", input.title, Date.now() % 10000),
      kind: "composite",
      mimeType: "video/mp4",
      url: first.url,
      durationSec: input.clips.reduce((s, c) => s + c.durationSec, 0),
      provider: "external",
      createdAt: nowIso(),
    },
  };
}
