import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { createDocumentVersion, restoreDocumentVersion } from "@/lib/content-studio/versions";
import type { ContentVersion } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string(),
  changeSummary: z.string().trim().max(500).default("Manual snapshot"),
  source: z.enum(["manual", "autosave", "ai_action", "generation", "restore"]).default("manual"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const restoreSchema = z.object({
  documentId: z.string().uuid(),
  versionId: z.string().uuid(),
  action: z.literal("restore"),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const { page, limit, from, to } = paginationParams(searchParams);

  const { data, error, count } = await auth.supabase
    .from("content_versions")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "42P01" || /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ versions: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("content-studio.versions.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    versions: data as ContentVersion[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const restoreParsed = restoreSchema.safeParse(body);
  if (restoreParsed.success) {
    const result = await restoreDocumentVersion(
      auth.supabase,
      auth.user!.id,
      restoreParsed.data.documentId,
      restoreParsed.data.versionId,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      document: result.document,
      restoredFrom: result.restoredFrom,
      message: "Version restored.",
    });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;

  const { data: doc } = await auth.supabase
    .from("content_documents")
    .select("id")
    .eq("id", input.documentId)
    .eq("user_id", auth.user!.id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data, error } = await createDocumentVersion(auth.supabase, {
    userId: auth.user!.id,
    documentId: input.documentId,
    title: input.title,
    body: input.body,
    changeSummary: input.changeSummary,
    source: input.source,
    metadata: input.metadata,
  });

  if (error || !data) {
    return databaseErrorResponse("content-studio.versions.insert", error);
  }

  return NextResponse.json({ version: data as ContentVersion });
}
