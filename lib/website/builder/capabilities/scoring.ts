import {
  CAPABILITY_ANALYZER_SET_VERSION,
  CAPABILITY_CONFIDENCE_THRESHOLDS,
  CAPABILITY_MANIFEST_SPEC_VERSION,
} from "@/lib/website/builder/capabilities/constants";
import {
  CAPABILITY_DETECTION_DEFINITIONS,
  matchersForPhase,
} from "@/lib/website/builder/capabilities/detection-rules";
import type {
  CapabilityConfidence,
  CapabilityManifestEntry,
  CapabilityManifestPhase,
  CapabilityMatchContext,
  CapabilityScoreResult,
  ProjectAnalysisSignals,
  WebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/types";

function resolveConfidence(score: number): CapabilityConfidence {
  if (score >= CAPABILITY_CONFIDENCE_THRESHOLDS.high) return "high";
  if (score >= CAPABILITY_CONFIDENCE_THRESHOLDS.medium) return "medium";
  return "low";
}

function maxPossibleWeight(
  matchers: ReturnType<typeof matchersForPhase>,
): number {
  return matchers.reduce((sum, matcher) => sum + matcher.weight, 0) || 1;
}

export function scoreCapability(
  ctx: CapabilityMatchContext,
  definition: (typeof CAPABILITY_DETECTION_DEFINITIONS)[number],
): CapabilityScoreResult {
  const matchers = matchersForPhase(definition, ctx.phase);
  const evidence: CapabilityScoreResult["evidence"] = [];
  let rawScore = 0;

  for (const matcher of matchers) {
    if (!matcher.test(ctx)) continue;
    rawScore += matcher.weight;
    evidence.push({
      source: matcher.source,
      ref: matcher.ref,
      weight: matcher.weight,
    });
  }

  const normalized = Math.min(1, rawScore / maxPossibleWeight(matchers));
  return {
    id: definition.id,
    score: normalized,
    confidence: resolveConfidence(normalized),
    evidence,
  };
}

export function scoreAllCapabilities(
  signals: ProjectAnalysisSignals,
  phase: CapabilityManifestPhase,
): CapabilityScoreResult[] {
  const ctx: CapabilityMatchContext = { ...signals, phase };
  return CAPABILITY_DETECTION_DEFINITIONS.map((definition) =>
    scoreCapability(ctx, definition),
  );
}

function toManifestEntry(result: CapabilityScoreResult): CapabilityManifestEntry | null {
  if (result.confidence === "low") return null;
  return {
    id: result.id,
    status: "active",
    confidence: result.confidence,
    score: result.score,
    evidence: result.evidence,
  };
}

function mergeEvidence(
  left: CapabilityManifestEntry,
  right: CapabilityManifestEntry,
): CapabilityManifestEntry {
  const evidenceMap = new Map<string, CapabilityManifestEntry["evidence"][number]>();
  for (const item of [...left.evidence, ...right.evidence]) {
    const key = `${item.source}:${item.ref}`;
    const existing = evidenceMap.get(key);
    if (!existing || item.weight > existing.weight) {
      evidenceMap.set(key, item);
    }
  }
  const evidence = [...evidenceMap.values()];
  const rawScore = evidence.reduce((sum, item) => sum + item.weight, 0);
  const definition = CAPABILITY_DETECTION_DEFINITIONS.find((d) => d.id === left.id);
  const maxWeight = definition
    ? maxPossibleWeight(definition.matchers)
    : rawScore || 1;
  const score = Math.min(1, rawScore / maxWeight);
  const confidence = resolveConfidence(score);
  if (confidence === "low") {
    return { ...left, ...right, evidence, score, confidence, status: "latent" };
  }
  return {
    id: left.id,
    status: "active",
    confidence,
    score,
    evidence,
    metadata: { ...left.metadata, ...right.metadata },
  };
}

export function mergeManifestEntries(
  entries: CapabilityManifestEntry[],
): CapabilityManifestEntry[] {
  const merged = new Map<string, CapabilityManifestEntry>();
  for (const entry of entries) {
    const existing = merged.get(entry.id);
    if (!existing) {
      merged.set(entry.id, entry);
      continue;
    }
    merged.set(entry.id, mergeEvidence(existing, entry));
  }
  return [...merged.values()].filter((entry) => entry.confidence !== "low");
}

export function buildManifestFromScores(
  scores: CapabilityScoreResult[],
  phase: CapabilityManifestPhase,
  projectId?: string,
): WebsiteCapabilityManifest {
  const capabilities = scores
    .map((score) => toManifestEntry(score))
    .filter((entry): entry is CapabilityManifestEntry => entry !== null);

  return {
    specVersion: CAPABILITY_MANIFEST_SPEC_VERSION,
    projectId,
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: CAPABILITY_ANALYZER_SET_VERSION,
    phase,
    capabilities,
  };
}

export function buildInitialCapabilityManifest(
  signals: ProjectAnalysisSignals,
  projectId?: string,
): WebsiteCapabilityManifest {
  const scores = scoreAllCapabilities(signals, "initial");
  return buildManifestFromScores(scores, "initial", projectId);
}

export function verifyCapabilityManifest(
  initial: WebsiteCapabilityManifest,
  signals: ProjectAnalysisSignals,
  projectId?: string,
): WebsiteCapabilityManifest {
  const verifiedScores = scoreAllCapabilities(signals, "verified");
  const verifiedManifest = buildManifestFromScores(
    verifiedScores,
    "verified",
    projectId,
  );

  const merged = mergeManifestEntries([
    ...initial.capabilities,
    ...verifiedManifest.capabilities,
  ]);

  return {
    specVersion: CAPABILITY_MANIFEST_SPEC_VERSION,
    projectId: projectId ?? initial.projectId,
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: CAPABILITY_ANALYZER_SET_VERSION,
    phase: "final",
    capabilities: merged,
  };
}

export function buildFinalCapabilityManifest(
  signals: ProjectAnalysisSignals,
  projectId?: string,
): WebsiteCapabilityManifest {
  const initial = buildInitialCapabilityManifest(signals, projectId);
  return verifyCapabilityManifest(initial, signals, projectId);
}

export function getActiveCapabilityIds(
  manifest: WebsiteCapabilityManifest,
): Set<string> {
  return new Set(
    manifest.capabilities
      .filter((entry) => entry.status === "active")
      .map((entry) => entry.id),
  );
}
