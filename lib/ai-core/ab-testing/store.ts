/**
 * Persistent A/B experiment store for Website Builder (Supabase).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deleteExperimentDb,
  getExperimentDb,
  insertExperimentDb,
  listExperimentsDb,
  updateExperimentDb,
} from "@/lib/ai-core/ab-testing/repository";
import type {
  CreateExperimentInput,
  ExperimentStatus,
  ExperimentVariant,
  WebsiteExperiment,
} from "@/lib/ai-core/ab-testing/types";
import { createAdminClient } from "@/lib/supabase/admin";

function resolveClient(client?: SupabaseClient | null): SupabaseClient | null {
  return client ?? createAdminClient();
}

function nowIso() {
  return new Date().toISOString();
}

function variantId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function requireUserId(userId?: string | null): string {
  if (!userId) {
    throw new Error("userId is required to persist experiments");
  }
  return userId;
}

async function persistExperiment(
  client: SupabaseClient | null,
  experiment: WebsiteExperiment,
  mode: "insert" | "update",
): Promise<WebsiteExperiment> {
  if (!client) {
    throw new Error("Database unavailable — cannot persist experiment");
  }

  const saved =
    mode === "insert"
      ? await insertExperimentDb(client, experiment)
      : await updateExperimentDb(client, experiment);

  if (!saved) {
    throw new Error("Failed to persist experiment");
  }
  return saved;
}

export async function listExperiments(
  generationId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment[]> {
  const db = resolveClient(client);
  if (!db) return [];
  return listExperimentsDb(db, generationId);
}

export async function getExperiment(
  experimentId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment | null> {
  const db = resolveClient(client);
  if (!db) return null;
  return getExperimentDb(db, experimentId);
}

export async function createExperiment(
  input: CreateExperimentInput,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment> {
  const userId = requireUserId(input.userId);
  const weightA = input.variantA?.weight ?? 50;
  const weightB = input.variantB.weight ?? 50;
  const variantA: ExperimentVariant = {
    id: variantId("var-a"),
    key: "A",
    name: input.variantA?.name || "Control (A)",
    weight: weightA,
    changes: input.variantA?.changes || [],
    impressions: 0,
    conversions: 0,
    clicks: 0,
  };
  const variantB: ExperimentVariant = {
    id: variantId("var-b"),
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
  const timestamp = nowIso();
  const experiment: WebsiteExperiment = {
    id: crypto.randomUUID(),
    generationId: input.generationId,
    userId,
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
    startedAt: started ? timestamp : null,
    endedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return persistExperiment(resolveClient(client), experiment, "insert");
}

export async function updateExperimentStatus(
  experimentId: string,
  status: ExperimentStatus,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment> {
  const db = resolveClient(client);
  const experiment = await getExperiment(experimentId, db);
  if (!experiment) throw new Error("Experiment not found");

  experiment.status = status;
  experiment.updatedAt = nowIso();
  if (status === "running" && !experiment.startedAt) {
    experiment.startedAt = nowIso();
  }
  if (status === "completed" || status === "archived") {
    experiment.endedAt = nowIso();
  }
  return persistExperiment(db, experiment, "update");
}

export async function duplicateSectionForVariant(
  params: {
    experimentId: string;
    variantKey: "A" | "B";
    sectionLabel: string;
    changeType: ExperimentVariant["changes"][number]["type"];
    controlValue?: string;
    variantValue: string;
  },
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment> {
  const db = resolveClient(client);
  const experiment = await getExperiment(params.experimentId, db);
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
  return persistExperiment(db, experiment, "update");
}

export async function recordVariantMetric(
  params: {
    experimentId: string;
    variantId: string;
    kind: "impression" | "conversion" | "click";
  },
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment | null> {
  const db = resolveClient(client);
  const experiment = await getExperiment(params.experimentId, db);
  if (!experiment || experiment.status !== "running") return experiment;

  const variant = experiment.variants.find((v) => v.id === params.variantId);
  if (!variant) return experiment;

  if (params.kind === "impression") variant.impressions += 1;
  if (params.kind === "conversion") variant.conversions += 1;
  if (params.kind === "click") variant.clicks += 1;
  experiment.updatedAt = nowIso();
  return persistExperiment(db, experiment, "update");
}

export async function setWinner(
  experimentId: string,
  winnerVariantId: string,
  reason: string,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment> {
  const db = resolveClient(client);
  const experiment = await getExperiment(experimentId, db);
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
  return persistExperiment(db, experiment, "update");
}

export async function deleteExperiment(
  experimentId: string,
  client?: SupabaseClient | null,
): Promise<boolean> {
  const db = resolveClient(client);
  if (!db) return false;
  return deleteExperimentDb(db, experimentId);
}

/** Seed a demo running experiment when generation has none (non-production only). */
export async function ensureDemoExperiment(
  generationId: string,
  userId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteExperiment | null> {
  if (process.env.NODE_ENV === "production") return null;
  const db = resolveClient(client);
  const existing = await listExperiments(generationId, db);
  if (existing.length) return existing[0]!;

  const experiment = await createExperiment(
    {
      generationId,
      userId,
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
    },
    db,
  );

  const a = experiment.variants[0]!;
  const b = experiment.variants[1]!;
  a.impressions = 120;
  a.conversions = 9;
  a.clicks = 34;
  b.impressions = 118;
  b.conversions = 16;
  b.clicks = 48;
  experiment.updatedAt = nowIso();
  return persistExperiment(db, experiment, "update");
}
