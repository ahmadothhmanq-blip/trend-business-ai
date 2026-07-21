import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import type { ContentProject } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  color: z.string().trim().default("#D4AF37"),
  isFolder: z.boolean().default(false),
  parentId: z.string().uuid().nullable().optional(),
  isFavorite: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  color: z.string().trim().optional(),
  isFavorite: z.boolean().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const foldersOnly = searchParams.get("folders");
  const parentId = searchParams.get("parentId");

  let query = auth.supabase
    .from("content_projects")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("sort_order")
    .order("name");

  const orFilter = buildMultiColumnIlikeOrFilter(["name", "description"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (foldersOnly === "true") query = query.eq("is_folder", true);
  if (parentId) query = query.eq("parent_id", parentId);
  if (parentId === "null") query = query.is("parent_id", null);

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01" || /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ projects: [] });
    }
    return databaseErrorResponse("content-studio.projects.list", error);
  }

  return NextResponse.json({ projects: data as ContentProject[] });
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
  const { data, error } = await auth.supabase
    .from("content_projects")
    .insert({
      user_id: auth.user!.id,
      name: input.name,
      description: input.description,
      color: input.color,
      is_folder: input.isFolder,
      parent_id: input.parentId ?? null,
      is_favorite: input.isFavorite ?? false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01" || /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ error: "Apply migration 061." }, { status: 503 });
    }
    return databaseErrorResponse("content-studio.projects.insert", error);
  }

  return NextResponse.json({ project: data as ContentProject });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.color !== undefined) patch.color = input.color;
  if (input.isFavorite !== undefined) patch.is_favorite = input.isFavorite;
  if (input.parentId !== undefined) patch.parent_id = input.parentId;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { data, error } = await auth.supabase
    .from("content_projects")
    .update(patch)
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: data as ContentProject });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await auth.supabase
    .from("content_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id);

  if (error) return databaseErrorResponse("content-studio.projects.delete", error);
  return NextResponse.json({ message: "Project deleted." });
}
