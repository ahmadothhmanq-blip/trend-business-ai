import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import {
  createExperiment,
  duplicateSectionForVariant,
  ensureDemoExperiment,
  evaluateExperimentResults,
  listExperimentResults,
  listExperiments,
  updateExperimentStatus,
  type ExperimentChangeType,
} from "@/lib/ai-core/ab-testing";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function assertOwnedGeneration(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  generationId: string,
) {
  const { data, error } = await supabase
    .from("website_generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!data) {
    return {
      error: NextResponse.json({ error: "Website not found." }, { status: 404 }),
    };
  }
  return { error: null };
}

/**
 * GET — List experiments + results for a website generation.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const owned = await assertOwnedGeneration(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
  );
  if (owned.error) return owned.error;

  ensureDemoExperiment(parsedId.id);
  const experiments = listExperiments(parsedId.id);
  const results = listExperimentResults(parsedId.id);

  return NextResponse.json({
    experiments,
    results,
    count: experiments.length,
  });
}

const changeSchema = z.object({
  type: z.enum([
    "headline",
    "image",
    "button",
    "layout",
    "color",
    "pricing",
    "section",
    "page",
  ]),
  target: z.string().trim().min(1).max(120),
  controlValue: z.string().trim().max(500).optional(),
  variantValue: z.string().trim().min(1).max(500),
  notes: z.string().trim().max(500).optional(),
});

const createSchema = z.object({
  action: z.literal("create").optional(),
  name: z.string().trim().min(3).max(120),
  hypothesis: z.string().trim().max(1000).optional(),
  changeTypes: z.array(changeSchema.shape.type).max(8).optional(),
  variantA: z
    .object({
      name: z.string().trim().max(80).optional(),
      weight: z.number().int().min(1).max(99).optional(),
      changes: z.array(changeSchema).max(20).optional(),
    })
    .optional(),
  variantB: z.object({
    name: z.string().trim().max(80).optional(),
    weight: z.number().int().min(1).max(99).optional(),
    changes: z.array(changeSchema).min(1).max(20),
  }),
  minSampleSize: z.number().int().min(10).max(10_000).optional(),
  start: z.boolean().optional(),
});

const statusSchema = z.object({
  action: z.literal("status"),
  experimentId: z.string().trim().min(1),
  status: z.enum(["draft", "running", "paused", "completed", "archived"]),
});

const duplicateSchema = z.object({
  action: z.literal("duplicate-section"),
  experimentId: z.string().trim().min(1),
  variantKey: z.enum(["A", "B"]),
  sectionLabel: z.string().trim().min(1).max(120),
  changeType: changeSchema.shape.type,
  controlValue: z.string().trim().max(500).optional(),
  variantValue: z.string().trim().min(1).max(500),
});

const evaluateSchema = z.object({
  action: z.literal("evaluate"),
  experimentId: z.string().trim().min(1),
});

/**
 * POST — Create experiment, update status, duplicate section, or evaluate winner.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const owned = await assertOwnedGeneration(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
  );
  if (owned.error) return owned.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action =
    typeof body === "object" && body && "action" in body
      ? (body as { action?: string }).action
      : "create";

  try {
    if (action === "status") {
      const parsed = statusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid status" },
          { status: 400 },
        );
      }
      const experiment = updateExperimentStatus(
        parsed.data.experimentId,
        parsed.data.status,
      );
      if (experiment.generationId !== parsedId.id) {
        return NextResponse.json({ error: "Experiment not found." }, { status: 404 });
      }
      const results = evaluateExperimentResults(experiment.id, true);
      return NextResponse.json({ experiment, results });
    }

    if (action === "duplicate-section") {
      const parsed = duplicateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid duplicate" },
          { status: 400 },
        );
      }
      const experiment = duplicateSectionForVariant({
        experimentId: parsed.data.experimentId,
        variantKey: parsed.data.variantKey,
        sectionLabel: parsed.data.sectionLabel,
        changeType: parsed.data.changeType as ExperimentChangeType,
        controlValue: parsed.data.controlValue,
        variantValue: parsed.data.variantValue,
      });
      if (experiment.generationId !== parsedId.id) {
        return NextResponse.json({ error: "Experiment not found." }, { status: 404 });
      }
      return NextResponse.json({ experiment });
    }

    if (action === "evaluate") {
      const parsed = evaluateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid evaluate" },
          { status: 400 },
        );
      }
      const results = evaluateExperimentResults(parsed.data.experimentId, true);
      if (!results || results.experiment.generationId !== parsedId.id) {
        return NextResponse.json({ error: "Experiment not found." }, { status: 404 });
      }
      return NextResponse.json({ results });
    }

    const parsed = createSchema.safeParse({ ...(body as object), action: undefined });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid experiment" },
        { status: 400 },
      );
    }

    const experiment = createExperiment({
      generationId: parsedId.id,
      userId: auth.user!.id,
      name: parsed.data.name,
      hypothesis: parsed.data.hypothesis,
      changeTypes: parsed.data.changeTypes as ExperimentChangeType[] | undefined,
      variantA: parsed.data.variantA,
      variantB: parsed.data.variantB,
      minSampleSize: parsed.data.minSampleSize,
      start: parsed.data.start ?? true,
    });

    const results = evaluateExperimentResults(experiment.id, false);
    return NextResponse.json({ experiment, results }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Experiment action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
