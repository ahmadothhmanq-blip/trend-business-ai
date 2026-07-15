import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { PromptLibraryEntry } from "@/types/agents";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const category = searchParams.get("category");

  let query = auth.supabase
    .from("prompt_library")
    .select("*", { count: "exact" })
    .or(`user_id.eq.${auth.user!.id},is_public.eq.true`)
    .order("usage_count", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ prompts: [], total: 0, page, limit, totalPages: 1 });
    return databaseErrorResponse("prompts.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ prompts: data as PromptLibraryEntry[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().default("general"),
  promptText: z.string().trim().min(1).max(10000),
  variables: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { data, error } = await auth.supabase.from("prompt_library").insert({
    user_id: auth.user!.id,
    title: parsed.data.title,
    category: parsed.data.category,
    prompt_text: parsed.data.promptText,
    variables: parsed.data.variables,
    tags: parsed.data.tags,
    is_public: parsed.data.isPublic,
  }).select("*").single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Prompt library table not ready. Apply migration 022." }, { status: 503 });
    return databaseErrorResponse("prompts.create", error);
  }
  return NextResponse.json({ prompt: data as PromptLibraryEntry, message: "Prompt saved." });
}
