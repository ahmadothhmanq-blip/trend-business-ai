import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { reorderEditorScenes } from "@/lib/ai-core/video-production-platform/editor-mvp/service";
import { editorMvpErrorResponse } from "@/lib/ai-core/video-production-platform/editor-mvp/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  orderedSceneIds: z.array(z.string().uuid()).min(1).max(80),
});

export async function POST(request: Request, context: Params) {
  const { id: rawId } = await context.params;
  const parsed = parseUuidParam(rawId);
  if (parsed instanceof NextResponse) return parsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const valid = bodySchema.safeParse(body);
  if (!valid.success) return apiValidationError(valid.error.issues[0]?.message);
  try {
    const scenes = await reorderEditorScenes(auth.supabase, {
      userId: auth.user!.id,
      projectId: parsed.id,
      orderedSceneIds: valid.data.orderedSceneIds,
    });
    return NextResponse.json({ scenes });
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.reorder", error);
  }
}
