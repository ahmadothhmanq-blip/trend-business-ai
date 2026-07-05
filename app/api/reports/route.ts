import { generateReport } from "@/lib/ai/reports";
import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { reportInputSchema } from "@/lib/validations/reports";
import type { AIReport } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const reportType = searchParams.get("reportType")?.trim();

  let query = auth.supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["title", "topic", "content"],
    search,
  );
  if (orFilter) {
    query = query.or(orFilter);
  }

  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);
  if (reportType) query = query.eq("report_type", reportType);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    reports: data as AIReport[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "reports");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = reportInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { report, source } = await generateReport(parsed.data);

  const { data, error } = await auth.supabase
    .from("reports")
    .insert({
      user_id: auth.user!.id,
      title: report.title,
      report_type: report.report_type,
      topic: parsed.data.topic,
      timeframe: parsed.data.timeframe,
      content: report.content,
      insights: report.insights,
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    report: data as AIReport,
    message:
      source === "openai"
        ? "Report generated and saved with AI."
        : "Report generated and saved.",
  });
}
