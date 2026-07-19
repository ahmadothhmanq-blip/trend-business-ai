/**
 * Traffic split, assignment, and automatic winner declaration.
 */

import {
  ensureDemoExperiment,
  getExperiment,
  listExperiments,
  recordVariantMetric,
  setWinner,
} from "@/lib/ai-core/ab-testing/store";
import type {
  ExperimentAssignment,
  ExperimentResults,
  WebsiteExperiment,
} from "@/lib/ai-core/ab-testing/types";

function rate(conversions: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.round((conversions / impressions) * 1000) / 10;
}

/**
 * Assign a visitor to a variant using sticky hash + weights.
 */
export function assignVariant(
  experiment: WebsiteExperiment,
  visitorId: string,
): ExperimentAssignment | null {
  if (experiment.status !== "running") return null;
  const totalWeight = experiment.variants.reduce((s, v) => s + v.weight, 0);
  if (totalWeight <= 0) return null;

  let h = 0;
  const key = `${experiment.id}:${visitorId}`;
  for (let i = 0; i < key.length; i += 1) {
    h = (h + key.charCodeAt(i) * (i + 1)) % 10_007;
  }
  const roll = h % totalWeight;
  let cursor = 0;
  for (const variant of experiment.variants) {
    cursor += variant.weight;
    if (roll < cursor) {
      return {
        experimentId: experiment.id,
        variantId: variant.id,
        variantKey: variant.key,
      };
    }
  }
  const fallback = experiment.variants[0]!;
  return {
    experimentId: experiment.id,
    variantId: fallback.id,
    variantKey: fallback.key,
  };
}

/**
 * Simple z-test style confidence for two proportions (approx).
 */
export function computeWinnerConfidence(
  experiment: WebsiteExperiment,
): {
  winnerVariantId: string | null;
  confidence: number;
  liftPercent: number | null;
  ready: boolean;
} {
  const [a, b] = experiment.variants;
  if (!a || !b) {
    return {
      winnerVariantId: null,
      confidence: 0,
      liftPercent: null,
      ready: false,
    };
  }

  const total = a.impressions + b.impressions;
  const ready = total >= experiment.minSampleSize;
  const rateA = a.impressions ? a.conversions / a.impressions : 0;
  const rateB = b.impressions ? b.conversions / b.impressions : 0;
  const liftPercent =
    rateA > 0 ? Math.round(((rateB - rateA) / rateA) * 1000) / 10 : null;

  // Pooled SE approximation
  const p =
    (a.conversions + b.conversions) /
    Math.max(1, a.impressions + b.impressions);
  const se = Math.sqrt(
    p * (1 - p) * (1 / Math.max(1, a.impressions) + 1 / Math.max(1, b.impressions)),
  );
  const z = se > 0 ? Math.abs(rateB - rateA) / se : 0;
  // Map z to rough confidence (0–1)
  const confidence = Math.min(0.999, 1 - Math.exp(-0.5 * z * z));

  let winnerVariantId: string | null = null;
  if (ready && confidence >= experiment.confidenceThreshold) {
    winnerVariantId = rateB >= rateA ? b.id : a.id;
  }

  return { winnerVariantId, confidence, liftPercent, ready };
}

export function evaluateExperimentResults(
  experimentId: string,
  autoDeclare = true,
): ExperimentResults | null {
  let experiment = getExperiment(experimentId);
  if (!experiment) return null;

  const decision = computeWinnerConfidence(experiment);
  let autoDeclared = false;

  if (
    autoDeclare &&
    experiment.status === "running" &&
    decision.winnerVariantId &&
    !experiment.winnerVariantId
  ) {
    const winner = experiment.variants.find(
      (v) => v.id === decision.winnerVariantId,
    );
    experiment = setWinner(
      experimentId,
      decision.winnerVariantId,
      `Auto-declared winner ${winner?.key || ""} at ${(decision.confidence * 100).toFixed(1)}% confidence` +
        (decision.liftPercent != null
          ? ` (lift ${decision.liftPercent > 0 ? "+" : ""}${decision.liftPercent}%).`
          : "."),
    );
    autoDeclared = true;
  }

  const conversionRates = experiment.variants.map((v) => ({
    variantId: v.id,
    key: v.key,
    name: v.name,
    impressions: v.impressions,
    conversions: v.conversions,
    clicks: v.clicks,
    conversionRate: rate(v.conversions, v.impressions),
  }));

  const summary = experiment.winnerVariantId
    ? experiment.winnerReason || "Winner declared."
    : decision.ready
      ? `Collecting significance — confidence ${(decision.confidence * 100).toFixed(1)}% (need ${(experiment.confidenceThreshold * 100).toFixed(0)}%).`
      : `Need more traffic — ${experiment.variants.reduce((s, v) => s + v.impressions, 0)}/${experiment.minSampleSize} samples.`;

  return {
    experiment,
    conversionRates,
    liftPercent: decision.liftPercent,
    winnerVariantId: experiment.winnerVariantId || decision.winnerVariantId,
    autoDeclared,
    summary,
  };
}

export function getRunningAssignment(
  generationId: string,
  visitorId: string,
): ExperimentAssignment | null {
  ensureDemoExperiment(generationId);
  const running = listExperiments(generationId).find(
    (e) => e.status === "running",
  );
  if (!running) return null;
  const assignment = assignVariant(running, visitorId);
  if (assignment) {
    recordVariantMetric({
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
      kind: "impression",
    });
  }
  return assignment;
}

export function listExperimentResults(generationId: string): ExperimentResults[] {
  ensureDemoExperiment(generationId);
  return listExperiments(generationId)
    .map((e) => evaluateExperimentResults(e.id, true))
    .filter((r): r is ExperimentResults => Boolean(r));
}
