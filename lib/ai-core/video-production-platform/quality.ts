/**
 * Video quality checks — structure, scenes, audio, subtitles, render status.
 */

import type {
  VideoProductionModel,
  VideoQualityReport,
} from "@/lib/ai-core/video-production-platform/types";
import { getLatestJob } from "@/lib/ai-core/video-production-platform/render-engine";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";

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

  if (job?.audioAsset && job.compositeAsset) {
    const audioDur = job.audioAsset.durationSec || 0;
    const videoDur = job.compositeAsset.durationSec || model.targetDurationSec;
    const drift = Math.abs(audioDur - videoDur);
    checks.push({
      id: "av-duration-align",
      label: "A/V duration alignment",
      passed: audioDur === 0 || drift <= Math.max(3, videoDur * 0.25),
      severity: "warning",
      detail:
        audioDur === 0
          ? "Audio duration unknown"
          : `Audio ~${audioDur}s vs video ~${videoDur}s (drift ${drift.toFixed(1)}s)`,
    });
  }

  const providerFailed = job?.clips.some(
    (c) => c.status === "failed" && Boolean(c.error),
  );
  checks.push({
    id: "provider-failures",
    label: "Provider failures",
    passed: !providerFailed,
    severity: providerFailed ? "blocker" : "info",
    detail: providerFailed
      ? job!.clips
          .filter((c) => c.error)
          .map((c) => c.error)
          .join("; ")
      : `Provider ${job?.provider || "n/a"} · attempts ${job?.attemptCount || 0}`,
  });

  checks.push({
    id: "missing-scenes",
    label: "All scenes present",
    passed: model.scenes.length > 0 && model.scenes.every((s) => s.name && s.order >= 0),
    severity: "blocker",
    detail: `${model.scenes.length} scenes in timeline`,
  });

  if (job?.assemblyManifest) {
    checks.push({
      id: "assembly",
      label: "Final assembly",
      passed: job.assemblyManifest.method === "ffmpeg" || job.assemblyManifest.method === "first-clip",
      severity: "info",
      detail: `${job.assemblyManifest.method}: ${job.assemblyManifest.note}`,
    });
  }

  const cost = job?.costCreditsSpent ?? job?.costCreditsEstimate;
  if (typeof cost === "number") {
    checks.push({
      id: "cost",
      label: "Render cost tracking",
      passed: true,
      severity: "info",
      detail: `Spent ~${job?.costCreditsSpent ?? 0} / est ${job?.costCreditsEstimate ?? 0} credits`,
    });
  }

  // Scene consistency — visual prompts + durations
  const inconsistent = model.scenes.filter(
    (s) => !s.visualPrompt || s.visualPrompt.length < 8 || s.durationSec < 1,
  );
  checks.push({
    id: "scene-consistency",
    label: "Scene consistency",
    passed: inconsistent.length === 0,
    severity: "warning",
    detail:
      inconsistent.length === 0
        ? "Scenes have prompts and valid durations"
        : `${inconsistent.length} scene(s) need visual/duration fixes`,
  });

  // Human realism for presenter-driven projects
  const realism = model.presenter?.realismLevel;
  checks.push({
    id: "human-realism",
    label: "Human presenter realism",
    passed: Boolean(!model.presenter || realism),
    severity: "info",
    detail: model.presenter
      ? `${model.presenter.displayName} · realism ${realism || "standard"} · lip-sync ${model.presenter.lipSyncProfile}`
      : "No presenter assigned",
  });

  // Brand compliance
  const brandOk = !model.brand || Boolean(model.brand.businessName);
  checks.push({
    id: "brand-compliance",
    label: "Brand compliance",
    passed: brandOk,
    severity: "info",
    detail: model.brand?.businessName
      ? `Brand kit: ${model.brand.businessName}${model.brand.primary ? ` · ${model.brand.primary}` : ""}`
      : "No brand kit applied (optional)",
  });

  // Subtitle accuracy vs scene scripts
  if (model.subtitles.length > 0 && model.scenes.length > 0) {
    const scriptWords = model.scenes
      .map((s) => s.script)
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const subWords = model.subtitles
      .map((s) => s.text)
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const overlap =
      scriptWords.length === 0
        ? 1
        : subWords.filter((w) => scriptWords.includes(w)).length /
          Math.max(1, subWords.length);
    checks.push({
      id: "subtitle-accuracy",
      label: "Subtitle accuracy",
      passed: overlap >= 0.35 || model.subtitles.length >= model.scenes.length,
      severity: "warning",
      detail: `Cue/script word overlap ~${Math.round(overlap * 100)}% · ${model.subtitles.length} cues`,
    });
  }

  checks.push({
    id: "video-quality-signal",
    label: "Video quality signal",
    passed:
      Boolean(job?.compositeAsset?.url) ||
      job?.clips.some((c) => c.status === "completed") ||
      job?.mode === "preview",
    severity: "info",
    detail: job?.compositeAsset
      ? `Composite ready (${job.assemblyManifest?.method || "asset"})`
      : "Run full render for final quality assessment",
  });

  const stubAsset = model.assets.some((a) => {
    if (!a.url.startsWith("data:")) return false;
    try {
      const b64 = a.url.split(",")[1];
      if (!b64) return false;
      return isStubVideoBytes(new Uint8Array(Buffer.from(b64, "base64")));
    } catch {
      return false;
    }
  });
  const previewProvider =
    job?.provider === "preview" ||
    job?.provider === "preview-stub" ||
    model.assets.every((a) => a.provider === "preview");

  checks.push({
    id: "production-media",
    label: "Production (non-stub) media",
    passed: !stubAsset && !(previewProvider && job?.mode === "full"),
    severity: stubAsset || (previewProvider && job?.mode === "full") ? "blocker" : "info",
    detail: stubAsset
      ? "Stub/placeholder MP4 detected — configure video providers"
      : previewProvider && job?.mode === "full"
        ? "Full render used preview provider — configure Kling/Runway/HeyGen"
        : "Media looks production-ready or preview mode",
  });

  checks.push({
    id: "ffmpeg-assembly",
    label: "FFmpeg final assembly",
    passed:
      !job ||
      job.mode === "preview" ||
      job.assemblyManifest?.method === "ffmpeg" ||
      job.status === "processing" ||
      job.status === "queued",
    severity: "warning",
    detail: job?.assemblyManifest
      ? `${job.assemblyManifest.method}: ${job.assemblyManifest.note}`
      : "No assembly yet — install ffmpeg for multi-scene merge",
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
