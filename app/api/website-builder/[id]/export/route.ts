import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { buildProjectZip } from "@/lib/ai/zipper";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { prepareWebsiteProjectForExport } from "@/lib/website/prepare-export";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function extractFiles(generation: WebsiteGeneration): GeneratedProjectFile[] {
  const blueprint = generation.blueprint as unknown as {
    files?: GeneratedProjectFile[];
  } | null;
  const files = Array.isArray(blueprint?.files) ? blueprint.files : [];
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
  return `${slug || "website-project"}.zip`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
  }

  const generation = data as WebsiteGeneration;
  const rawFiles = extractFiles(generation);

  if (rawFiles.length === 0) {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      409,
      "This project has no downloadable source files yet. Open it in Website Builder and regenerate if needed.",
    );
  }

  const prepared = prepareWebsiteProjectForExport(rawFiles);

  if (!prepared.ready) {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      422,
      "This project has export blockers. Fix validation issues in Website Builder, then try again.",
      undefined,
      {
        issues: prepared.blockingIssues.slice(0, 20),
        warnings: prepared.warnings.slice(0, 12),
        fixesApplied: prepared.fixesApplied.slice(0, 12),
      },
    );
  }

  const zipBytes = await buildProjectZip(prepared.files);
  const filename = safeFilename(generation.project_name || "website-project");

  return new Response(Buffer.from(zipBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
