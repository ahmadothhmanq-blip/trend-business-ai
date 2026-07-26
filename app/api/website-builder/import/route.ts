import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { importWebsiteProjectFromZip } from "@/lib/website/import-project";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const titleHint = String(form.get("title") || "").trim();

    if (!(file instanceof File)) {
      return apiValidationError("Missing ZIP file.");
    }
    if (file.size <= 0 || file.size > MAX_ZIP_BYTES) {
      return apiValidationError("ZIP exceeds the 50MB import limit.");
    }

    const bytes = await file.arrayBuffer();
    const imported = await importWebsiteProjectFromZip(bytes, titleHint || file.name);

    if (!imported.ready) {
      return apiErrorResponse(
        API_ERROR_CODES.INVALID_INPUT,
        422,
        "Import validation failed.",
        undefined,
        { issues: imported.blockingIssues },
      );
    }

    const project = {
      projectKind: "website" as const,
      title: imported.title,
      description: "Imported website project",
      pages: [],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: imported.files,
    };

    const saved = await persistWebsiteGeneration({
      supabase: auth.supabase,
      userId: auth.user!.id,
      project,
      projectKind: "website",
      input: {
        prompt: `Imported from ${file.name}`,
        language: "English",
        theme: "premium",
        features: [],
        productId: "website-builder",
        mode: "generate",
      },
    });

    if (!saved.ok) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
    }

    return NextResponse.json({
      ok: true,
      warnings: imported.warnings,
      generation: saved.generation,
      project: saved.project,
    });
  } catch (error) {
    return serverErrorResponse("website-builder.import", error);
  }
}
