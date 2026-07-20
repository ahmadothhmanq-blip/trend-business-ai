import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  listEditorHistory,
  saveEditorHistory,
} from "@/lib/ai-core/image-design-platform/canvas-repository";
import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const historySchema = z.object({
  canvasId: z.string().uuid(),
  action: z.string().min(1),
  snapshot: z.record(z.string(), z.unknown()),
  cursor: z.number().int().min(0).default(0),
});

export async function GET(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const canvasId = new URL(request.url).searchParams.get("canvasId");
  if (!canvasId) {
    return NextResponse.json({ error: "canvasId required" }, { status: 400 });
  }

  const result = await listEditorHistory({
    supabase: auth.supabase,
    userId: auth.user!.id,
    canvasId,
  });

  return NextResponse.json({ entries: result.entries, error: result.error });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = historySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid history payload" }, { status: 400 });
  }

  try {
    const result = await saveEditorHistory({
      supabase: auth.supabase,
      userId: auth.user!.id,
      canvasId: parsed.data.canvasId,
      action: parsed.data.action,
      snapshot: parsed.data.snapshot as unknown as CanvasDocumentModel,
      cursor: parsed.data.cursor,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({ message: "History saved." });
  } catch (error) {
    return serverErrorResponse("image-generator.editor.history", error, "Unable to save history.");
  }
}
