/**
 * Final video assembly — ffmpeg concat + audio mux when available.
 * Falls back to first-clip composite + assembly manifest.
 */

import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { VideoMediaAsset } from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import { fetchRemoteToBytes } from "@/lib/ai-core/video-production-platform/media-storage";

export type AssemblyInput = {
  clips: Array<{ url: string; durationSec: number }>;
  audioUrl?: string | null;
  title: string;
};

export type AssemblyResult = {
  method: "ffmpeg" | "first-clip" | "manifest-only";
  bytes?: Uint8Array;
  mimeType: "video/mp4" | "video/webm";
  note: string;
  manifest: {
    clipUrls: string[];
    audioUrl?: string;
    method: "ffmpeg" | "first-clip" | "manifest-only";
    note: string;
  };
  assetStub: VideoMediaAsset;
};

function runFfmpeg(args: string[]): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("ffmpeg", args, { windowsHide: true });
    let stderr = "";
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("error", () => resolve({ ok: false, stderr: "ffmpeg not available" }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr }));
  });
}

async function tryFfmpegAssemble(
  clips: Array<{ url: string; durationSec: number }>,
  audioUrl?: string | null,
): Promise<Uint8Array | null> {
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

    const listPath = join(dir, "concat.txt");
    const listBody = localClips
      .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
      .join("\n");
    await writeFile(listPath, listBody, "utf8");

    const concatOut = join(dir, "concat.mp4");
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
      concatOut,
    ]);
    if (!concat.ok) {
      // Re-encode fallback
      const reencode = await runFfmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listPath,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        concatOut,
      ]);
      if (!reencode.ok) return null;
    }

    let finalPath = concatOut;
    if (audioUrl) {
      const audioBytes = await fetchRemoteToBytes(audioUrl);
      if (audioBytes && audioBytes.byteLength > 16) {
        const audioPath = join(dir, "voice.mp3");
        await writeFile(audioPath, audioBytes);
        const muxed = join(dir, "final.mp4");
        const mux = await runFfmpeg([
          "-y",
          "-i",
          concatOut,
          "-i",
          audioPath,
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-shortest",
          "-movflags",
          "+faststart",
          muxed,
        ]);
        if (mux.ok) finalPath = muxed;
      }
    }

    return new Uint8Array(await readFile(finalPath));
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/**
 * Assemble completed clip URLs into a final composite.
 */
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

  const ffmpegBytes = await tryFfmpegAssemble(input.clips, input.audioUrl);
  if (ffmpegBytes) {
    return {
      method: "ffmpeg",
      bytes: ffmpegBytes,
      mimeType: "video/mp4",
      note: `FFmpeg assembled ${clipUrls.length} clips${input.audioUrl ? " + voice" : ""}.`,
      manifest: {
        clipUrls,
        audioUrl: input.audioUrl || undefined,
        method: "ffmpeg",
        note: "FFmpeg concat + optional audio mux",
      },
      assetStub: {
        id: vid("composite", input.title, Date.now() % 10000),
        kind: "composite",
        mimeType: "video/mp4",
        url: "",
        durationSec: input.clips.reduce((s, c) => s + c.durationSec, 0),
        provider: "external",
        createdAt: nowIso(),
      },
    };
  }

  // Fallback: first clip stands in; store full manifest for later ffmpeg worker
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
        : `FFmpeg unavailable — using first clip as preview composite; ${clipUrls.length} clips in assembly manifest.`,
    manifest: {
      clipUrls,
      audioUrl: input.audioUrl || undefined,
      method: clipUrls.length === 1 ? "first-clip" : "manifest-only",
      note: "Install ffmpeg on the server for true multi-clip merge.",
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
