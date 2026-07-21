import { requireUser } from "@/lib/api/helpers";
import { SYSTEM_CONTENT_TEMPLATES, listTemplatesByCategory } from "@/lib/content-studio/templates";
import { CONTENT_TEMPLATE_CATEGORIES } from "@/lib/constants/content-studio";
import type { ContentTemplate } from "@/types/content";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim();

  let dbTemplates: ContentTemplate[] = [];
  try {
    let query = auth.supabase
      .from("content_templates")
      .select("*")
      .or(`is_system.eq.true,user_id.eq.${auth.user!.id}`)
      .order("category")
      .order("name");

    if (category) query = query.eq("category", category);

    const { data } = await query;
    dbTemplates = (data ?? []) as ContentTemplate[];
  } catch {
    // Table may not exist — fall back to code catalog
  }

  const systemFromCode = listTemplatesByCategory(category ?? undefined).map((t) => ({
    ...t,
    user_id: null,
    created_at: "",
    updated_at: "",
  }));

  const merged = dbTemplates.length > 0 ? dbTemplates : (systemFromCode as ContentTemplate[]);

  return NextResponse.json({
    templates: merged,
    categories: CONTENT_TEMPLATE_CATEGORIES,
    total: merged.length,
    systemCount: SYSTEM_CONTENT_TEMPLATES.length,
  });
}
