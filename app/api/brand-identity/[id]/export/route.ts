import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import {
  blueprintToModel,
  buildExportManifest,
  buildBrandGuidelinesHtml,
  applyBrandKit,
} from "@/lib/ai-core/brand-studio";
import type { BrandApplyTarget } from "@/lib/ai-core/brand-studio/types";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const applyTo = searchParams.get("applyTo") as BrandApplyTarget | null;

  const { data: gen, error } = await auth.supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !gen?.blueprint) {
    return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  }

  const generation = gen as BrandIdentityGeneration;
  const model = blueprintToModel(generation.blueprint!, generation);
  const manifest = buildExportManifest(model);

  if (format === "html" || format === "pdf") {
    const html = buildBrandGuidelinesHtml(model);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${model.brandName.replace(/\s+/g, "-").toLowerCase()}-guidelines.html"`,
      },
    });
  }

  if (format === "markdown") {
    return new NextResponse(manifest.guidelines, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${model.brandName.replace(/\s+/g, "-").toLowerCase()}-guidelines.md"`,
      },
    });
  }

  if (applyTo) {
    return NextResponse.json({
      apply: applyBrandKit(model, applyTo),
      tokens: model.tokens,
    });
  }

  return NextResponse.json({
    model,
    manifest,
    files: manifest.files,
    qualityScore: model.qualityScore,
  });
}
