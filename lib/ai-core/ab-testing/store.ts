/**
 * In-process A/B experiment store for Website Builder.
 */

import type {
  CreateExperimentInput,
  ExperimentStatus,
  ExperimentVariant,
  WebsiteExperiment,
} from "@/lib/ai-core/ab-testing/types";

type StoreState = {
  experiments: WebsiteExperiment[];
};

const globalStore = globalThis as typeof globalThis & {
  __tbaWebsiteExperiments?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaWebsiteExperiments) {
    globalStore.__tbaWebsiteExperiments = { experiments: [] };
  }
  return globalStore.__tbaWebsiteExperiments;
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listExperiments(generationId: string): WebsiteExperiment[] {
  return getState()
    .experiments.filter((e) => e.generationId === generationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getExperiment(experimentId: string): WebsiteExperiment | null {
  return getState().experiments.find((e) => e.id === experimentId) ?? null;
}

export function createExperiment(
  input: CreateExperimentInput,
): WebsiteExperiment {
  const weightA = input.variantA?.weight ?? 50;
  const weightB = input.variantB.weight ?? 50;
  const variantA: ExperimentVariant = {
    id: id("var-a"),
    key: "A",
    name: input.variantA?.name || "Control (A)",
    weight: weightA,
    changes: input.variantA?.changes || [],
    impressions: 0,
    conversions: 0,
    clicks: 0,
  };
  const variantB: ExperimentVariant = {
    id: id("var-b"),
    key: "B",
    name: input.variantB.name || "Challenger (B)",
    weight: weightB,
    changes: input.variantB.changes,
    impressions: 0,
    conversions: 0,
    clicks: 0,
  };

  const changeTypes =
    input.changeTypes ||
    [
      ...new Set(
        [...variantA.changes, ...variantB.changes].map((c) => c.type),
      ),
    ];

  const started = Boolean(input.start);
  const experiment: WebsiteExperiment = {
    id: id("exp"),
    generationId: input.generationId,
    userId: input.userId ?? null,
    name: input.name.trim(),
    hypothesis: input.hypothesis?.trim() || "",
    status: started ? "running" : "draft",
    changeTypes,
    variants: [variantA, variantB],
    minSampleSize: input.minSampleSize ?? 40,
    confidenceThreshold: input.confidenceThreshold ?? 0.9,
    winnerVariantId: null,
    winnerDeclaredAt: null,
    winnerReason: null,
    startedAt: started ? nowIso() : null,
    endedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  getState().experiments.unshift(experiment);
  return experiment;
}

export function updateExperimentStatus(
  experimentId: string,
  status: ExperimentStatus,
): WebsiteExperiment {
  const experiment = getExperiment(experimentId);
  if (!experiment) throw new Error("Experiment not found");

  experiment.status = status;
  experiment.updatedAt = nowIso();
  if (status === "running" && !experiment.startedAt) {
    experiment.startedAt = nowIso();
  }
  if (status === "completed" || status === "archived") {
    experiment.endedAt = nowIso();
  }
  return experiment;
}

export function duplicateSectionForVariant(params: {
  experimentId: string;
  variantKey: "A" | "B";
  sectionLabel: string;
  changeType: ExperimentVariant["changes"][number]["type"];
  controlValue?: string;
  variantValue: string;
}): WebsiteExperiment {
  const experiment = getExperiment(params.experimentId);
  if (!experiment) throw new Error("Experiment not found");

  const variant = experiment.variants.find((v) => v.key === params.variantKey);
  if (!variant) throw new Error("Variant not found");

  variant.changes.push({
    type: params.changeType,
    target: params.sectionLabel,
    controlValue: params.controlValue,
    variantValue: params.variantValue,
    notes: `Duplicated ${params.sectionLabel} for variant ${params.variantKey}`,
  });
  if (!experiment.changeTypes.includes(params.changeType)) {
    experiment.changeTypes.push(params.changeType);
  }
  experiment.updatedAt = nowIso();
  return experiment;
}

export function recordVariantMetric(params: {
  experimentId: string;
  variantId: string;
  kind: "impression" | "conversion" | "click";
}): WebsiteExperiment | null {
  const experiment = getExperiment(params.experimentId);
  if (!experiment || experiment.status !== "running") return experiment;

  const variant = experiment.variants.find((v) => v.id === params.variantId);
  if (!variant) return experiment;

  if (params.kind === "impression") variant.impressions += 1;
  if (params.kind === "conversion") variant.conversions += 1;
  if (params.kind === "click") variant.clicks += 1;
  experiment.updatedAt = nowIso();
  return experiment;
}

export function setWinner(
  experimentId: string,
  winnerVariantId: string,
  reason: string,
): WebsiteExperiment {
  const experiment = getExperiment(experimentId);
  if (!experiment) throw new Error("Experiment not found");
  if (!experiment.variants.some((v) => v.id === winnerVariantId)) {
    throw new Error("Winner variant not found");
  }
  experiment.winnerVariantId = winnerVariantId;
  experiment.winnerDeclaredAt = nowIso();
  experiment.winnerReason = reason;
  experiment.status = "completed";
  experiment.endedAt = nowIso();
  experiment.updatedAt = nowIso();
  return experiment;
}

/** Seed a demo running experiment when generation has none. */
export function ensureDemoExperiment(generationId: string): WebsiteExperiment {
  const existing = listExperiments(generationId);
  if (existing.length) return existing[0]!;

  const experiment = createExperiment({
    generationId,
    name: "Hero CTA copy test",
    hypothesis:
      "A clearer primary CTA increases contact conversions vs the control headline.",
    changeTypes: ["headline", "button"],
    variantA: {
      name: "Control (A)",
      weight: 50,
      changes: [
        {
          type: "headline",
          target: "hero",
          controlValue: "Original headline",
          variantValue: "Original headline",
        },
        {
          type: "button",
          target: "hero-cta",
          controlValue: "Get started",
          variantValue: "Get started",
        },
      ],
    },
    variantB: {
      name: "Challenger (B)",
      weight: 50,
      changes: [
        {
          type: "headline",
          target: "hero",
          controlValue: "Original headline",
          variantValue: "Grow faster with a conversion-ready site",
        },
        {
          type: "button",
          target: "hero-cta",
          controlValue: "Get started",
          variantValue: "Book a free consult",
        },
      ],
    },
    start: true,
    minSampleSize: 40,
  });

  // Seed uneven metrics so winner logic can demonstrate
  const a = experiment.variants[0]!;
  const b = experiment.variants[1]!;
  a.impressions = 120;
  a.conversions = 9;
  a.clicks = 34;
  b.impressions = 118;
  b.conversions = 16;
  b.clicks = 48;
  experiment.updatedAt = nowIso();
  return experiment;
}
