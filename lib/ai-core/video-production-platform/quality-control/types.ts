export const QUALITY_VERDICTS = ["PASS", "WARNING", "BLOCKED"] as const;
export type QualityVerdict = (typeof QUALITY_VERDICTS)[number];

export type QualityCheckSeverity = "blocker" | "warning" | "info";

export type QualityCheckId =
  | "visual_integrity"
  | "artifact_validity"
  | "duration_consistency"
  | "audio_video_sync"
  | "resolution"
  | "codec"
  | "black_frames"
  | "missing_assets"
  | "prompt_adherence"
  | "character_product_consistency";

export type ArtifactQualityCheck = {
  id: QualityCheckId;
  label: string;
  passed: boolean;
  severity: QualityCheckSeverity;
  detail: string;
  score?: number | null;
};

export type ArtifactQualityReport = {
  verdict: QualityVerdict;
  ready: boolean;
  score: number;
  summary: string;
  blockers: string[];
  warnings: string[];
  checks: ArtifactQualityCheck[];
};

export type QualityInspectInput = {
  video: {
    id?: string;
    mimeType: string;
    url: string;
    durationSec: number;
    width?: number | null;
    height?: number | null;
    provider?: string;
    isStub?: boolean;
    bytes?: Uint8Array | null;
    codec?: string | null;
  } | null;
  audio?: {
    durationSec: number;
    mimeType?: string;
    url?: string;
  } | null;
  expectedDurationSec?: number;
  narrationRequired?: boolean;
  requiredVideo?: boolean;
  scenes?: Array<{
    prompt?: string;
    artifactId?: string | null;
    references?: unknown[];
    characters?: unknown[];
    products?: unknown[];
  }>;
  probed?: {
    durationSec: number | null;
    width: number | null;
    height: number | null;
    codec: string | null;
  } | null;
  blackFrames?: {
    available: boolean;
    blackRatio?: number | null;
    note?: string;
  } | null;
  promptAdherence?: {
    available: boolean;
    score?: number | null;
    note?: string;
  } | null;
  consistency?: {
    available: boolean;
    score?: number | null;
    hasReferences: boolean;
    note?: string;
  } | null;
};
