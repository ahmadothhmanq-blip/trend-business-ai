import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { CalendarEntry } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  content_type: z.string().trim().default("blog-post"),
  description: z.string().trim().default(""),
  scheduled_date: z.string().trim().min(1, "Date is required."),
  scheduled_time: z.string().trim().nullable().default(null),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  category: z.string().trim().default("General"),
  tags: z.array(z.string().trim()).default([]),
  platform: z.string().trim().default(""),
  generation_id: z.string().uuid().nullable().default(null),
  notes: z.string().trim().default(""),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  let query = auth.supabase
    .from("content_calendar")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("scheduled_date", { ascending: true });

  if (month && year) {
    const start = `${year}-${month.padStart(2, "0")}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
    query = query.gte("scheduled_date", start).lt("scheduled_date", end);
  }

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ entries: [] });
    }
    return databaseErrorResponse("content-calendar.list", error);
  }

  return NextResponse.json({ entries: data as CalendarEntry[] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { data, error } = await auth.supabase
    .from("content_calendar")
    .insert({ user_id: auth.user!.id, ...parsed.data })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Content Calendar table not found. Please apply migration 019.");
    }
    return databaseErrorResponse("content-calendar.insert", error);
  }

  return NextResponse.json({ entry: data as CalendarEntry, message: "Calendar entry created." });
}
