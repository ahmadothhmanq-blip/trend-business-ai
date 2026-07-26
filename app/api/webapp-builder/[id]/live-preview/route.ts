import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import {
  appLivePreviewResponseHeaders,
  resolveAppLivePreviewHtml,
} from "@/lib/webapp/live-preview";
import type { WebAppGeneration } from "@/types/webapp";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET — sandbox live preview of generated app (HTML runtime from appModel + files).
 * Query: ?path=/dashboard — optional active screen path hint (hash routing in HTML).
 */
export async function GET(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId, "generation id");
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const screenPath = new URL(request.url).searchParams.get("path");

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");
  }

  const html = resolveAppLivePreviewHtml(data as WebAppGeneration, {
    screenPath,
  });

  return new NextResponse(html, {
    status: 200,
    headers: appLivePreviewResponseHeaders(),
  });
}
