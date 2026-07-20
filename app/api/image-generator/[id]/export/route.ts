import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { blueprintToModel, buildExportManifest, assetToBuffer, buildProjectExport, buildPdfFromCanvas } from "@/lib/ai-core/image-design-platform";
import { loadCanvasDocument } from "@/lib/ai-core/image-design-platform/canvas-repository";
import type { ImageGeneration } from "@/types/image-generation";
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

  const { data: gen, error } = await auth.supabase
    .from("image_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !gen?.blueprint) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const generation = gen as ImageGeneration;
  const model = blueprintToModel(generation.blueprint!);
  const loaded = await auth.supabase
    .from("design_canvas")
    .select("document")
    .eq("image_generation_id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();
  const canvasDoc = loaded.data?.document ?? (
    await loadCanvasDocument({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      generationName: generation.image_name,
      blueprint: generation.blueprint,
    })
  ).document;

  const manifest = buildExportManifest(model);

  if (format === "project") {
    return NextResponse.json(buildProjectExport(canvasDoc));
  }

  if (format === "pdf") {
    const pdfBytes = await buildPdfFromCanvas(canvasDoc);
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${model.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  }

  if (format === "zip") {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const f of model.files) zip.file(f.path, f.content);
    for (const { path, asset } of manifest.rasterFiles) {
      const buf = assetToBuffer(asset);
      if (buf) zip.file(path, buf);
    }
    zip.file("prompt-library.json", JSON.stringify(model.promptLibrary, null, 2));
    zip.file("design-project.json", JSON.stringify(buildProjectExport(canvasDoc), null, 2));
    const blob = await zip.generateAsync({ type: "arraybuffer" });
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${model.title.replace(/\s+/g, "-").toLowerCase()}-design-kit.zip"`,
      },
    });
  }

  const raster = model.rasterAssets.find((a) => a.status === "completed");
  if (raster && (format === "png" || format === "jpg" || format === "webp")) {
    const buf = assetToBuffer(raster);
    if (buf) {
      const mime =
        format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": mime,
          "Content-Disposition": `attachment; filename="${model.title.replace(/\s+/g, "-").toLowerCase()}.${format}"`,
        },
      });
    }
  }

  return NextResponse.json({ model, manifest });
}
