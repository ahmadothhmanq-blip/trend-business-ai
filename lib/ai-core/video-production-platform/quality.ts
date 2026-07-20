/**
 * Video quality checks — structure, scenes, audio, subtitles, render status.
 */

import type {
  VideoProductionModel,
  VideoQualityReport,
} from "@/lib/ai-core/video-production-platform/types";
import { getLatestJob } from "@/lib/ai-core/video-production-platform/render-engine";

export function runVideoQualityChecks(
  model: VideoProductionModel,
): VideoQualityReport {
  const checks: VideoQualityReport["checks"] = [];
  const job = getLatestJob(model);

  checks.push({
    id: "structure",
    label: "Video structure present",
    passed: model.scenes.length > 0,
    severity: "blocker",
    detail: `${model.scenes.length} scenes · ${model.chapters.length} chapters`,
  });

  const missingScript = model.scenes.filter((s) => !s.script.trim());
  checks.push({
    id: "scripts",
    label: "Scene scripts filled",
    passed: missingScript.length === 0,
    severity: "warning",
    detail:
      missingScript.length === 0
        ? "All scenes have narration/script"
        : `${missingScript.length} scenes missing script`,
  });

  checks.push({
    id: "visual-prompts",
    label: "Visual prompts present",
    passed: model.scenes.every((s) => s.visualPrompt.trim().length > 10),
    severity: "warning",
    detail: "Required for clip rendering",
  });

  const voiceReady = model.voiceTracks.some(
    (v) => v.status === "completed" || v.script.trim().length > 0,
  );
  checks.push({
    id: "audio",
    label: "Voice / audio tracks",
    passed: voiceReady,
    severity: "warning",
    detail: `${model.voiceTracks.length} voice · ${model.audioBeds.length} beds`,
  });

  checks.push({
    id: "subtitles",
    label: "Subtitles coverage",
    passed: model.subtitles.length > 0,
    severity: "info",
    detail: `${model.subtitles.length} caption cues`,
  });

  const subtitleLenOk = model.subtitles.every((s) => s.text.length <= 120);
  checks.push({
    id: "subtitle-quality",
    label: "Subtitle cue length",
    passed: subtitleLenOk,
    severity: "info",
    detail: subtitleLenOk ? "Cues within readable length" : "Some cues are long",
  });

  checks.push({
    id: "presenter",
    label: "AI presenter assigned",
    passed: Boolean(model.presenter),
    severity: "info",
    detail: model.presenter?.displayName || "No presenter",
  });

  checks.push({
    id: "render",
    label: "Rendering status",
    passed: !job || job.status === "completed" || job.status === "queued",
    severity: job?.status === "failed" ? "blocker" : "info",
    detail: job
      ? `${job.status} · ${job.clips.filter((c) => c.status === "completed").length}/${job.clips.length} clips`
      : "No render job yet",
  });

  checks.push({
    id: "generation-errors",
    label: "No clip errors",
    passed: !job?.clips.some((c) => c.status === "failed"),
    severity: "blocker",
    detail: job?.clips.filter((c) => c.error).map((c) => c.error).join("; ") || "OK",
  });

  const hasMp4 = model.assets.some(
    (a) =>
      a.mimeType.includes("mp4") ||
      a.mimeType.includes("webm") ||
      a.url.includes(".mp4") ||
      a.storagePath?.includes(".mp4"),
  );
  checks.push({
    id: "file-validation",
    label: "Video file assets",
    passed: hasMp4 || job?.mode === "preview",
    severity: hasMp4 ? "info" : "warning",
    detail: hasMp4
      ? `${model.assets.filter((a) => a.kind === "clip" || a.kind === "composite").length} media assets`
      : "No MP4/WebM in storage yet — run full render",
  });

  const voiceDone = model.voiceTracks.some(
    (v) => v.asset?.url || v.status === "completed",
  );
  checks.push({
    id: "audio-sync",
    label: "Audio / voice sync",
    passed: voiceDone || model.voiceTracks.length === 0,
    severity: "warning",
    detail: voiceDone
      ? "Voice track present"
      : "No synthesized voice asset — run TTS/full render",
  });

  const blockers = checks.filter((c) => c.severity === "blocker" && !c.passed);
  const warnings = checks.filter((c) => c.severity === "warning" && !c.passed);
  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    ready: blockers.length === 0,
    score,
    checks,
    summary:
      blockers.length > 0
        ? `Not ready: ${blockers.length} blocker(s).`
        : warnings.length > 0
          ? `Ready with warnings. Score ${score}.`
          : `Ready. Quality score ${score}.`,
  };
}
