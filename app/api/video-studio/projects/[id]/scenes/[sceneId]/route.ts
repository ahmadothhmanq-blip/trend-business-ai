import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  deleteEditorScene,
  loadScenePreview,
  patchEditorScene,
  trimEditorScene,
} from "@/lib/ai-core/video-production-platform/editor-mvp/service";
import { editorMvpErrorResponse } from "@/lib/ai-core/video-production-platform/editor-mvp/http";
import { editorScenePatchSchema } from "@/lib/ai-core/video-production-platform/editor-mvp/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; sceneId: string }> };

async function ids(context: Params) {
  const { id: rawProjectId, sceneId: rawSceneId } = await context.params;
  const projectParsed = parseUuidParam(rawProjectId);
  if (projectParsed instanceof NextResponse) return projectParsed;
  const sceneParsed = parseUuidParam(rawSceneId);
  if (sceneParsed instanceof NextResponse) return sceneParsed;
  return { projectId: projectParsed.id, sceneId: sceneParsed.id };
}

export async function GET(_request: Request, context: Params) {
  const parsed = await ids(context);
  if (parsed instanceof NextResponse) return parsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const preview = await loadScenePreview(auth.supabase, {
      userId: auth.user!.id,
      projectId: parsed.projectId,
      sceneId: parsed.sceneId,
    });
    return NextResponse.json({ preview });
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.preview", error);
  }
}

export async function PATCH(request: Request, context: Params) {
  const parsed = await ids(context);
  if (parsed instanceof NextResponse) return parsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const valid = editorScenePatchSchema.safeParse(body);
  if (!valid.success) return apiValidationError(valid.error.issues[0]?.message);
  try {
    const { trim, ...patch } = valid.data;
    const scene = trim
      ? await trimEditorScene(auth.supabase, {
          userId: auth.user!.id,
          projectId: parsed.projectId,
          sceneId: parsed.sceneId,
          edge: trim.edge,
          seconds: trim.seconds,
        })
      : await patchEditorScene(auth.supabase, {
          userId: auth.user!.id,
          projectId: parsed.projectId,
          sceneId: parsed.sceneId,
          patch,
        });
    return NextResponse.json({ scene });
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.patch", error);
  }
}

export async function DELETE(_request: Request, context: Params) {
  const parsed = await ids(context);
  if (parsed instanceof NextResponse) return parsed;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const result = await deleteEditorScene(auth.supabase, {
      userId: auth.user!.id,
      projectId: parsed.projectId,
      sceneId: parsed.sceneId,
    });
    return NextResponse.json(result);
  } catch (error) {
    return editorMvpErrorResponse(error) || serverErrorResponse("video-editor.delete", error);
  }
}
