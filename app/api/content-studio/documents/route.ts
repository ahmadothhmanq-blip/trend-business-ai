import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { documentCounts } from "@/lib/content-studio/documents";
import { createDocumentVersion } from "@/lib/content-studio/versions";
import type { ContentDocument } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200).default("Untitled Document"),
  body: z.string().default(""),
  projectId: z.string().uuid().optional(),
  contentType: z.string().trim().default("document"),
  contentTool: z.string().trim().default("content-writer"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  generationId: z.string().uuid().optional(),
  brandIdentityId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const recent = searchParams.get("recent");

  let query = auth.supabase
    .from("content_documents")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id);

  if (recent === "true") {
    query = query.order("last_edited_at", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const orFilter = buildMultiColumnIlikeOrFilter(["title", "body"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (status) query = query.eq("status", status);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ documents: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("content-studio.documents.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    documents: data as ContentDocument[],
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const counts = documentCounts(input.body);
  const now = new Date().toISOString();

  const row = {
    user_id: auth.user!.id,
    project_id: input.projectId ?? null,
    title: input.title,
    body: input.body,
    content_type: input.contentType,
    content_tool: input.contentTool,
    status: input.status,
    generation_id: input.generationId ?? null,
    brand_identity_id: input.brandIdentityId ?? null,
    metadata: input.metadata ?? {},
    last_edited_at: now,
    ...counts,
  };

  const { data, error } = await auth.supabase.from("content_documents").insert(row).select("*").single();

  if (error) {
    if (error.code === "42P01" || /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ error: "Apply migration 061 for Content Studio platform tables." }, { status: 503 });
    }
    return databaseErrorResponse("content-studio.documents.insert", error);
  }

  await createDocumentVersion(auth.supabase, {
    userId: auth.user!.id,
    documentId: data.id,
    title: data.title,
    body: data.body,
    changeSummary: "Initial version",
    source: "manual",
  });

  return NextResponse.json({ document: data as ContentDocument });
}
