import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { blueprintToModel } from "@/lib/ai-core/image-design-platform/model";
import { runDesignImageEdit } from "@/lib/ai-core/image-design-platform/editing/pipeline";
import type { ImageEditOperation } from "@/lib/ai-core/image-design-platform/editing/types";
import { saveDesignAssets } from "@/lib/ai-core/image-design-platform/assets";
import type { ImageGeneration } from "@/types/image-generation";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveRequestLanguage } from "@/lib/i18n/api";

type RouteContext = { params: Promise<{ id: string }> };

const editSchema = z.object({
  operation: z.enum([
    "background_removal",
    "enhance",
    "upscale",
    "variation",
    "object_replace",
  ]),
  assetId: z.string().optional(),
  prompt: z.string().optional(),
  scale: z.number().min(1).max(4).optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "image-generator");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }
  resolveRequestLanguage(request, parsed.data.language, parsed.data.country);

  const { data: gen, error } = await auth.supabase
    .from("image_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !gen?.blueprint) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Design not found");
  }

  const generation = gen as ImageGeneration;
  const model = blueprintToModel(generation.blueprint!);
  const source =
    (parsed.data.assetId
      ? model.rasterAssets.find((a) => a.id === parsed.data.assetId)
      : model.rasterAssets.find((a) => a.status === "completed")) ?? model.rasterAssets[0];

  if (!source) {
    return apiValidationError("No source image available for editing.");
  }

  try {
    const edited = await runDesignImageEdit({
      operation: parsed.data.operation as ImageEditOperation,
      sourceAsset: source,
      prompt: parsed.data.prompt,
      scale: parsed.data.scale,
    });

    const saved = await saveDesignAssets({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      assets: [edited.asset],
    });

    await creditLease.settle(auth.supabase);
    return NextResponse.json({
      asset: edited.asset,
      savedAssets: saved.assets,
      message: edited.message,
    });
  } catch (err) {
    return serverErrorResponse("image-generator.edit-image", err, "Unable to edit image.");
  }
}
