import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
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
  if (error) return { error: apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message) };
  if (!data) {
    return {
      error: apiErrorResponse(API_ERROR_CODES.NOT_FOUND, 404, "Website not found."),
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

  await ensureDemoExperiment(parsedId.id, auth.user!.id, auth.supabase);
  const experiments = await listExperiments(parsedId.id, auth.supabase);
  const results = await listExperimentResults(parsedId.id, auth.supabase);

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
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const action =
    typeof body === "object" && body && "action" in body
      ? (body as { action?: string }).action
      : "create";

  try {
    if (action === "status") {
      const parsed = statusSchema.safeParse(body);
      if (!parsed.success) {
        return apiValidationError(parsed.error.issues[0]?.message);
      }
      const experiment = await updateExperimentStatus(
        parsed.data.experimentId,
        parsed.data.status,
        auth.supabase,
      );
      if (experiment.generationId !== parsedId.id) {
        return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Experiment not found.");
      }
      const results = await evaluateExperimentResults(
        experiment.id,
        true,
        auth.supabase,
      );
      return NextResponse.json({ experiment, results });
    }

    if (action === "duplicate-section") {
      const parsed = duplicateSchema.safeParse(body);
      if (!parsed.success) {
        return apiValidationError(parsed.error.issues[0]?.message);
      }
      const experiment = await duplicateSectionForVariant(
        {
          experimentId: parsed.data.experimentId,
          variantKey: parsed.data.variantKey,
          sectionLabel: parsed.data.sectionLabel,
          changeType: parsed.data.changeType as ExperimentChangeType,
          controlValue: parsed.data.controlValue,
          variantValue: parsed.data.variantValue,
        },
        auth.supabase,
      );
      if (experiment.generationId !== parsedId.id) {
        return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Experiment not found.");
      }
      return NextResponse.json({ experiment });
    }

    if (action === "evaluate") {
      const parsed = evaluateSchema.safeParse(body);
      if (!parsed.success) {
        return apiValidationError(parsed.error.issues[0]?.message);
      }
      const results = await evaluateExperimentResults(
        parsed.data.experimentId,
        true,
        auth.supabase,
      );
      if (!results || results.experiment.generationId !== parsedId.id) {
        return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Experiment not found.");
      }
      return NextResponse.json({ results });
    }

    const parsed = createSchema.safeParse({ ...(body as object), action: undefined });
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message);
    }

    const experiment = await createExperiment(
      {
        generationId: parsedId.id,
        userId: auth.user!.id,
        name: parsed.data.name,
        hypothesis: parsed.data.hypothesis,
        changeTypes: parsed.data.changeTypes as ExperimentChangeType[] | undefined,
        variantA: parsed.data.variantA,
        variantB: parsed.data.variantB,
        minSampleSize: parsed.data.minSampleSize,
        start: parsed.data.start ?? true,
      },
      auth.supabase,
    );

    const results = await evaluateExperimentResults(
      experiment.id,
      false,
      auth.supabase,
    );
    return NextResponse.json({ experiment, results }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Experiment action failed";
    return apiValidationError(message);
  }
}
