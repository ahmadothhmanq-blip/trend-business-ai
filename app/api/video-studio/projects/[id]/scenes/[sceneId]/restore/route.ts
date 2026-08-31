import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { restoreEditorScene } from "@/lib/ai-core/video-production-platform/editor-mvp/service";
import { editorMvpErrorResponse } from "@/lib/ai-core/video-production-platform/editor-mvp/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; sceneId: string }> };

const bodySchema = z.object({
  index: z.number().int().min(0).max(200),
  scene: z
    .object({
      id: z.string().uuid(),
      projectId: z.string().uuid(),
      planId: z.string().uuid(),
    })
    .passthrough(),
});

export async function POST(request: Request, context: Params) {
  const { id: rawProjectId, sceneId: rawSceneId } = await context.params;
  const projectParsed = parseUuidParam(rawProjectId);
  if (projectParsed instanceof NextResponse) return projectParsed;
  const sceneParsed = parseUuidParam(rawSceneId);
  if (sceneParsed instanceof NextResponse) return sceneParsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const valid = bodySchema.safeParse(body);
  if (!valid.success) return apiValidationError(valid.error.issues[0]?.message);
  try {
    const result = await restoreEditorScene(auth.supabase, {
      userId: auth.user!.id,
      projectId: projectParsed.id,
      sceneId: sceneParsed.id,
      index: valid.data.index,
      scene: valid.data.scene as Scene,
    });
    return NextResponse.json(result);
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.restore", error);
  }
}
