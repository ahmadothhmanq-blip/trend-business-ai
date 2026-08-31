import { NextResponse } from "next/server";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { loadEditorDocument } from "@/lib/ai-core/video-production-platform/editor-mvp/service";
import { editorMvpErrorResponse } from "@/lib/ai-core/video-production-platform/editor-mvp/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id: rawId } = await context.params;
  const parsed = parseUuidParam(rawId);
  if (parsed instanceof NextResponse) return parsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const document = await loadEditorDocument(auth.supabase, {
      userId: auth.user!.id,
      projectId: parsed.id,
    });
    return NextResponse.json(document);
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.load", error);
  }
}
