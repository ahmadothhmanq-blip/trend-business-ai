import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError } from "@/lib/i18n/api-errors";
import { buildProjectZip } from "@/lib/ai/zipper";
import { mergeMobileStoreIntoProjectFiles } from "@/lib/ai/webapp-mobile-store";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppGeneration } from "@/types/webapp";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function extractFiles(generation: WebAppGeneration): GeneratedProjectFile[] {
  const files = generation.blueprint?.files ?? [];
  return files.filter(
    (file) =>
      file &&
      typeof file.path === "string" &&
      typeof file.content === "string" &&
      file.path.trim().length > 0,
  );
}

function safeFilename(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "webapp-project"}.zip`;
}

/**
 * GET — download generated app source as ZIP (includes mobile-store packaging).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId, "generation id");
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");
  }

  const generation = data as WebAppGeneration;
  const rawFiles = extractFiles(generation);

  if (rawFiles.length === 0) {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      409,
      "This app has no downloadable source files yet. Regenerate or sync code from App Management.",
    );
  }

  const appModel = generation.blueprint?.appModel;
  const exportFiles = mergeMobileStoreIntoProjectFiles(rawFiles, {
    title: appModel?.settings.appName ?? generation.app_name,
    primaryColor: appModel?.brand?.tokens?.primary,
  });

  const zipBytes = await buildProjectZip(exportFiles);
  const filename = safeFilename(generation.app_name || "webapp-project");

  return new Response(Buffer.from(zipBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
