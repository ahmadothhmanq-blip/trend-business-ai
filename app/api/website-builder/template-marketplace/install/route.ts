import { requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import { installRemoteTemplatePackage } from "@/lib/website/template-marketplace/install.server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const installBodySchema = z.object({
  templateId: z.string().trim().min(1).max(120),
});

/**
 * POST /api/website-builder/template-marketplace/install
 * Download (from registry), validate, register, and persist a remote template package.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      400,
      "Request body must be valid JSON",
    );
  }

  const parsed = installBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      400,
      "templateId is required",
      undefined,
      { issues: parsed.error.flatten() },
    );
  }

  const result = await installRemoteTemplatePackage(parsed.data.templateId);
  if (!result.ok) {
    const status =
      result.code === "listing.not_found"
        ? 404
        : result.code === "package.invalid" ||
            result.code === "package.checksum_mismatch"
          ? 422
          : 400;

    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      status,
      result.message,
      undefined,
      {
        code: result.code,
        issues: result.issues,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    listing: result.listing,
    alreadyInstalled: result.alreadyInstalled,
    packageId: result.packageId,
    packageVersion: result.packageVersion,
  });
}
