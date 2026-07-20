import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { saveCanvasDocument } from "@/lib/ai-core/image-design-platform/canvas-repository";
import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const saveSchema = z.object({
  document: z.record(z.string(), z.unknown()),
  brandKitId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid save payload" }, { status: 400 });
  }

  const { data: gen, error: genErr } = await auth.supabase
    .from("image_generations")
    .select("id")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (genErr || !gen) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  try {
    const document = parsed.data.document as unknown as CanvasDocumentModel;
    const saved = await saveCanvasDocument({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      document: { ...document, generationId: id },
      brandKitId: parsed.data.brandKitId,
    });

    if (saved.error) {
      return NextResponse.json({ error: saved.error }, { status: 503 });
    }

    return NextResponse.json({
      canvas: saved.canvas,
      document: saved.canvas?.document ?? document,
      message: "Design saved.",
    });
  } catch (error) {
    return serverErrorResponse("image-generator.editor.save", error, "Unable to save design.");
  }
}
