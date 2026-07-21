import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { documentCounts } from "@/lib/content-studio/documents";
import { createDocumentVersion } from "@/lib/content-studio/versions";
import type { ContentDocument } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().optional(),
  projectId: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  is_favorite: z.boolean().optional(),
  contentType: z.string().trim().optional(),
  contentTool: z.string().trim().optional(),
  brandIdentityId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  autosave: z.boolean().optional(),
  changeSummary: z.string().trim().max(500).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("content_documents")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document: data as ContentDocument });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_edited_at: new Date().toISOString(),
  };

  if (input.title !== undefined) patch.title = input.title;
  if (input.body !== undefined) {
    patch.body = input.body;
    Object.assign(patch, documentCounts(input.body));
  }
  if (input.projectId !== undefined) patch.project_id = input.projectId;
  if (input.status !== undefined) patch.status = input.status;
  if (input.is_favorite !== undefined) patch.is_favorite = input.is_favorite;
  if (input.contentType !== undefined) patch.content_type = input.contentType;
  if (input.contentTool !== undefined) patch.content_tool = input.contentTool;
  if (input.brandIdentityId !== undefined) patch.brand_identity_id = input.brandIdentityId;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const { data, error } = await auth.supabase
    .from("content_documents")
    .update(patch)
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return databaseErrorResponse("content-studio.documents.update", error);
  }

  if (input.body !== undefined) {
    await createDocumentVersion(auth.supabase, {
      userId: auth.user!.id,
      documentId: idParsed.id,
      title: data.title as string,
      body: data.body as string,
      changeSummary: input.changeSummary ?? (input.autosave ? "Autosave" : "Manual edit"),
      source: input.autosave ? "autosave" : "manual",
    });
  }

  return NextResponse.json({ document: data as ContentDocument });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { error } = await auth.supabase
    .from("content_documents")
    .delete()
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id);

  if (error) return databaseErrorResponse("content-studio.documents.delete", error);
  return NextResponse.json({ message: "Document deleted." });
}
