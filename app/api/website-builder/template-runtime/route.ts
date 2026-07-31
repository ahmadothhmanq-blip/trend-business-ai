import { NextResponse } from "next/server";
import {
  listInstalledBuilderTemplatePackageIds,
  resolveBuilderTemplateRuntimeModel,
} from "@/lib/website/builder/template-runtime.server";

export const dynamic = "force-dynamic";

/**
 * GET /api/website-builder/template-runtime
 * GET /api/website-builder/template-runtime?id=<templatePackageId>
 * GET /api/website-builder/template-runtime?id=<templatePackageId>&pageId=<pageId>
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const templateId = url.searchParams.get("id")?.trim();

  if (!templateId) {
    const templateIds = await listInstalledBuilderTemplatePackageIds();
    return NextResponse.json({
      ok: true,
      count: templateIds.length,
      templateIds,
    });
  }

  const pageId = url.searchParams.get("pageId")?.trim() || undefined;
  const layoutId = url.searchParams.get("layoutId")?.trim() || undefined;

  const result = await resolveBuilderTemplateRuntimeModel(templateId, {
    pageId,
    layoutId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result,
      },
      { status: result.code === "input.missing_package" ? 404 : 422 },
    );
  }

  return NextResponse.json(result);
}
