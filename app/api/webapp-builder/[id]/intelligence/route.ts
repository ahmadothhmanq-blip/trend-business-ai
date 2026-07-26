import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import type { WebAppGeneration } from "@/types/webapp";
import {
  extractAppModelFromBlueprint,
  runAppIntelligence,
  runAppQualityChecks,
} from "@/lib/ai-core/app-design-platform";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const { data, error } = await auth.supabase
      .from("webapp_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
    }
    if (!data) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");
    }

    const generation = data as WebAppGeneration;
    const model = extractAppModelFromBlueprint(generation.blueprint, {
      prompt: generation.prompt,
      appType: generation.app_type,
      language: generation.language,
      features: generation.features,
      appName: generation.app_name,
    });

    return NextResponse.json({
      intelligence: runAppIntelligence(model),
      quality: runAppQualityChecks({
        model,
        files: generation.blueprint?.files ?? [],
      }),
      modelSummary: {
        appName: model.settings.appName,
        templateId: model.templateId,
        screens: model.screens.length,
        dataModels: model.dataModels.length,
        roles: model.roles.length,
        catalog: model.catalog.length,
      },
    });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.intelligence",
      error,
      "Unable to analyze application.",
    );
  }
}
