import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

function ffmpegBin(): string {
  return process.env.FFMPEG_PATH || process.env.FFMPEG_BINARY || "ffmpeg";
}

function runFfmpeg(args: string[]): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(ffmpegBin(), args, { windowsHide: true });
    let output = "";
    child.stderr?.on("data", (d: Buffer) => {
      output += d.toString();
    });
    child.stdout?.on("data", (d: Buffer) => {
      output += d.toString();
    });
    child.on("error", () => resolve({ ok: false, stderr: "ffmpeg not available" }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr: output }));
  });
}

export type BlackFrameResult = {
  available: boolean;
  blackRatio: number | null;
  note: string;
};

export async function detectBlackFrames(bytes: Uint8Array | null | undefined): Promise<BlackFrameResult> {
  if (!bytes?.byteLength) {
    return { available: false, blackRatio: null, note: "No video bytes available for black-frame detection." };
  }
  const dir = await mkdtemp(join(tmpdir(), "vs-black-"));
  try {
    const path = join(dir, "clip.bin");
    await writeFile(path, bytes);
    const result = await runFfmpeg([
      "-hide_banner",
      "-i",
      path,
      "-vf",
      "blackdetect=d=0.05:pix_th=0.10",
      "-an",
      "-f",
      "null",
      "-",
    ]);
    if (!result.ok && /not available|not found|ENOENT/i.test(result.stderr)) {
      return { available: false, blackRatio: null, note: "FFmpeg is not available for black-frame detection." };
    }
    const matches = [...result.stderr.matchAll(/black_duration:([\d.]+)/g)];
    const blackSec = matches.reduce((sum, match) => sum + Number(match[1] || 0), 0);
    const durationMatch = result.stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    let durationSec = 0;
    if (durationMatch) {
      durationSec =
        Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]);
    }
    if (!(durationSec > 0)) {
      return {
        available: true,
        blackRatio: blackSec > 0 ? 1 : 0,
        note: blackSec > 0 ? `Black segments detected (${blackSec.toFixed(2)}s).` : "No black-frame intervals reported.",
      };
    }
    const blackRatio = Math.min(1, blackSec / durationSec);
    return {
      available: true,
      blackRatio,
      note: `Black-frame ratio ${(blackRatio * 100).toFixed(1)}%.`,
    };
  } catch {
    return { available: false, blackRatio: null, note: "Black-frame detection could not run." };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
