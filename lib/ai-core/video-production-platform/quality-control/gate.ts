import type { QualityVerdict } from "@/lib/ai-core/video-production-platform/quality-control/types";

export function canAssembleAfterQuality(verdict: QualityVerdict | undefined | null): boolean {
  if (verdict === "BLOCKED") return false;
  return true;
}
