import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import type {
  ArtifactQualityCheck,
  ArtifactQualityReport,
  QualityInspectInput,
  QualityVerdict,
} from "@/lib/ai-core/video-production-platform/quality-control/types";

function normalizeMime(mime?: string | null): string {
  return (mime || "").split(";")[0].trim().toLowerCase();
}

function looksLikePlayableVideo(bytes: Uint8Array | null | undefined, mime: string): boolean {
  if (!bytes || bytes.byteLength < 12) return false;
  if (isStubVideoBytes(bytes)) return false;
  if (mime === "video/mp4") return Buffer.from(bytes.subarray(4, 8)).toString("ascii") === "ftyp";
  if (mime === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

function driftRatio(a: number, b: number): number {
  const max = Math.max(a, b, 0.001);
  return Math.abs(a - b) / max;
}

function verdictOf(checks: ArtifactQualityCheck[]): QualityVerdict {
  if (checks.some((check) => check.severity === "blocker" && !check.passed)) return "BLOCKED";
  if (checks.some((check) => check.severity === "warning" && !check.passed)) return "WARNING";
  return "PASS";
}

export function inspectArtifactQuality(input: QualityInspectInput): ArtifactQualityReport {
  const checks: ArtifactQualityCheck[] = [];
  const video = input.video;
  const mime = normalizeMime(video?.mimeType);
  const requiredVideo = input.requiredVideo !== false;
  const bytes = video?.bytes || null;
  const probed = input.probed || null;
  const durationSec = probed?.durationSec && probed.durationSec > 0 ? probed.durationSec : video?.durationSec || 0;
  const width = probed?.width || video?.width || 0;
  const height = probed?.height || video?.height || 0;
  const codec = probed?.codec || video?.codec || null;

  const validShape = video
    ? isValidVideoArtifact({
        id: video.id || "qc-video",
        projectId: "qc",
        kind: "composite",
        mimeType: video.mimeType,
        url: video.url,
        durationSec: video.durationSec,
        width: video.width ?? undefined,
        height: video.height ?? undefined,
        provider: video.provider || "external",
        isStub: video.isStub,
        bytes: video.bytes,
      })
    : false;
  const visualOk = Boolean(
    video &&
      !video.isStub &&
      ((bytes && looksLikePlayableVideo(bytes, mime)) || (!bytes && validShape && Boolean(video.url))),
  );

  checks.push({
    id: "visual_integrity",
    label: "Visual integrity",
    passed: visualOk,
    severity: "blocker",
    detail: visualOk ? "Playable video signature/URL present." : "Video is missing, stub, or not a playable container.",
  });

  checks.push({
    id: "artifact_validity",
    label: "Artifact validity",
    passed: validShape,
    severity: "blocker",
    detail: validShape ? "Artifact MIME, duration, and provider are valid." : "Artifact failed playable video validation.",
  });

  const expected = input.expectedDurationSec && input.expectedDurationSec > 0 ? input.expectedDurationSec : durationSec;
  const durationOk = durationSec > 0;
  const durationAligned = durationOk && driftRatio(durationSec, expected) <= 0.25;
  checks.push({
    id: "duration_consistency",
    label: "Duration consistency",
    passed: durationOk && durationAligned,
    severity: durationOk ? "warning" : "blocker",
    detail: durationOk
      ? `Duration ${durationSec.toFixed(2)}s vs expected ${expected.toFixed(2)}s.`
      : "Video duration is missing or zero.",
  });

  const audio = input.audio;
  const audioRequired = Boolean(input.narrationRequired);
  if (audioRequired && (!audio || !(audio.durationSec > 0))) {
    checks.push({
      id: "audio_video_sync",
      label: "Audio / video sync",
      passed: false,
      severity: "blocker",
      detail: "Narration is required but no playable audio artifact is present.",
    });
  } else if (!audio || !(audio.durationSec > 0)) {
    checks.push({
      id: "audio_video_sync",
      label: "Audio / video sync",
      passed: true,
      severity: "info",
      detail: "No audio track to align; sync check is not applicable.",
    });
  } else {
    const syncOk = durationOk && driftRatio(durationSec, audio.durationSec) <= 0.25;
    checks.push({
      id: "audio_video_sync",
      label: "Audio / video sync",
      passed: syncOk,
      severity: "warning",
      detail: `Audio ${audio.durationSec.toFixed(2)}s vs video ${durationSec.toFixed(2)}s.`,
    });
  }

  const resolutionKnown = Number(width) > 0 && Number(height) > 0;
  checks.push({
    id: "resolution",
    label: "Resolution",
    passed: resolutionKnown,
    severity: "warning",
    detail: resolutionKnown ? `${width}×${height}` : "Width/height could not be probed; continuing with warning.",
  });

  checks.push({
    id: "codec",
    label: "Codec",
    passed: Boolean(codec),
    severity: "warning",
    detail: codec ? `Video codec ${codec}` : "Codec could not be probed; continuing with warning.",
  });

  const black = input.blackFrames;
  if (!black?.available) {
    checks.push({
      id: "black_frames",
      label: "Black frame detection",
      passed: true,
      severity: "info",
      detail: black?.note || "Black-frame detection is unavailable on this artifact.",
    });
  } else {
    const ratio = black.blackRatio ?? 0;
    const mostlyBlack = ratio >= 0.5;
    checks.push({
      id: "black_frames",
      label: "Black frame detection",
      passed: ratio < 0.15,
      severity: mostlyBlack ? "blocker" : "warning",
      detail: black.note || `Black-frame ratio ${(ratio * 100).toFixed(1)}%.`,
      score: Math.round((1 - ratio) * 100),
    });
  }

  const scenes = input.scenes || [];
  const missingSceneArtifacts = scenes.filter((scene) => !scene.artifactId?.trim()).length;
  const missingRequiredVideo = requiredVideo && !video;
  checks.push({
    id: "missing_assets",
    label: "Missing asset detection",
    passed: !missingRequiredVideo && (scenes.length === 0 || missingSceneArtifacts === 0),
    severity: missingRequiredVideo ? "blocker" : "warning",
    detail: missingRequiredVideo
      ? "Required video artifact is missing."
      : missingSceneArtifacts
        ? `${missingSceneArtifacts} scene(s) missing artifacts.`
        : "Required video asset is present.",
  });

  const prompt = input.promptAdherence;
  if (!prompt?.available) {
    checks.push({
      id: "prompt_adherence",
      label: "Prompt adherence",
      passed: true,
      severity: "info",
      detail: prompt?.note || "Prompt-adherence scoring is not available for this provider capability.",
      score: null,
    });
  } else {
    const score = prompt.score ?? 0;
    checks.push({
      id: "prompt_adherence",
      label: "Prompt adherence",
      passed: score >= 70,
      severity: score < 40 ? "blocker" : "warning",
      detail: prompt.note || `Prompt adherence score ${score}.`,
      score,
    });
  }

  const consistency = input.consistency;
  const hasRefs = Boolean(consistency?.hasReferences);
  if (!hasRefs) {
    checks.push({
      id: "character_product_consistency",
      label: "Character / product consistency",
      passed: true,
      severity: "info",
      detail: "No character or product references supplied.",
      score: null,
    });
  } else if (!consistency?.available) {
    checks.push({
      id: "character_product_consistency",
      label: "Character / product consistency",
      passed: true,
      severity: "info",
      detail: consistency?.note || "Consistency scoring capability is not available; references were recorded only.",
      score: null,
    });
  } else {
    const score = consistency.score ?? 0;
    checks.push({
      id: "character_product_consistency",
      label: "Character / product consistency",
      passed: score >= 70,
      severity: score < 40 ? "blocker" : "warning",
      detail: consistency.note || `Consistency score ${score}.`,
      score,
    });
  }

  const verdict = verdictOf(checks);
  const blockers = checks.filter((check) => check.severity === "blocker" && !check.passed).map((check) => check.detail);
  const warnings = checks.filter((check) => check.severity === "warning" && !check.passed).map((check) => check.detail);
  const passed = checks.filter((check) => check.passed).length;
  const score = Math.round((passed / Math.max(1, checks.length)) * 100);
  const summary =
    verdict === "BLOCKED"
      ? `Blocked: ${blockers.length} blocker(s).`
      : verdict === "WARNING"
        ? `Ready with warnings. Score ${score}.`
        : `Pass. Quality score ${score}.`;

  return {
    verdict,
    ready: verdict !== "BLOCKED",
    score,
    summary,
    blockers,
    warnings,
    checks,
  };
}

export function combineQualityVerdicts(
  artifact: ArtifactQualityReport,
  extraBlockers: string[] = [],
): ArtifactQualityReport {
  if (!extraBlockers.length) return artifact;
  return {
    ...artifact,
    verdict: "BLOCKED",
    ready: false,
    blockers: [...artifact.blockers, ...extraBlockers],
    summary: `Blocked: ${artifact.blockers.length + extraBlockers.length} blocker(s).`,
  };
}
