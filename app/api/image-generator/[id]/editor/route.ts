import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { loadCanvasDocument } from "@/lib/ai-core/image-design-platform/canvas-repository";
import { listCanvasTemplatesV2 } from "@/lib/ai-core/image-design-platform/templates-v2";
import { listSupportedEditOperations } from "@/lib/ai-core/image-design-platform/editing/pipeline";
import type { ImageGeneration } from "@/types/image-generation";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const { data: gen, error } = await auth.supabase
      .from("image_generations")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .single();

    if (error || !gen) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const generation = gen as ImageGeneration;
    const templateId =
      typeof generation.blueprint?.templateId === "string"
        ? generation.blueprint.templateId
        : undefined;

    const loaded = await loadCanvasDocument({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      generationName: generation.image_name,
      blueprint: generation.blueprint,
      templateId,
    });

    return NextResponse.json({
      generation,
      canvas: loaded.canvas,
      document: loaded.document,
      templates: listCanvasTemplatesV2(),
      editOperations: listSupportedEditOperations(),
    });
  } catch (error) {
    return serverErrorResponse("image-generator.editor.get", error, "Unable to load editor.");
  }
}
