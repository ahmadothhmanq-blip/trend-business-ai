import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import {
  blueprintToModel,
  mergeModel,
  modelToBlueprint,
} from "@/lib/ai-core/brand-studio/model";
import { generateBrandLogos } from "@/lib/ai-core/brand-studio/logos";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveRequestLanguage } from "@/lib/i18n/api";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  conceptCount: z.number().int().min(1).max(5).optional(),
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

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "brand-identity");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError("Invalid input");
  }
  const aiLanguage = resolveRequestLanguage(request, parsed.data.language, parsed.data.country);

  const { data: gen, error: fetchError } = await auth.supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (fetchError || !gen || !gen.blueprint) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Brand identity not found");
  }

  try {
    const generation = gen as BrandIdentityGeneration;
    let model = blueprintToModel(generation.blueprint!, generation);

    const logoResult = await generateBrandLogos({
      model,
      conceptCount: parsed.data.conceptCount ?? 3,
      language: aiLanguage,
    });

    model = mergeModel(model, {
      logos: logoResult.concepts,
      logoVariants: logoResult.variants,
      logoDirection: {
        ...model.logoDirection,
        guidelinesDocument: logoResult.guidelines || model.logoDirection.guidelinesDocument,
      },
    });

    const blueprint = modelToBlueprint(model, generation.prompt);
    const { data, error } = await auth.supabase
      .from("brand_identity_generations")
      .update({
        blueprint: blueprint as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .select("*")
      .single();

    if (error) return databaseErrorResponse("brand-identity.logos", error);

    await creditLease.settle(auth.supabase);
    return NextResponse.json({
      generation: data as BrandIdentityGeneration,
      logos: logoResult.concepts,
      variants: logoResult.variants,
      message: "Logo concepts generated.",
    });
  } catch (error) {
    return serverErrorResponse("brand-identity.logos", error, "Unable to generate logos.");
  }
}
