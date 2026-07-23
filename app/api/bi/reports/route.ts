import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listBiReports, createBiReport, listScheduledReports, createScheduledReport } from "@/lib/bi/reports";
import { logBiAudit } from "@/lib/bi/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "scheduled") {
    const { data, error } = await listScheduledReports(auth.supabase, auth.user!.id);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("bi.scheduled.list", error);
    return NextResponse.json({ scheduledReports: data ?? [] });
  }
  const { data, error } = await listBiReports(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ reports: [] });
    return databaseErrorResponse("bi.reports.list", error);
  }
  return NextResponse.json({ reports: data ?? [] });
}

const reportSchema = z.object({ title: z.string().min(1), reportType: z.string().default("custom"), payload: z.record(z.string(), z.unknown()).optional() });
const scheduleSchema = z.object({ title: z.string().min(1), frequency: z.enum(["daily", "weekly", "monthly"]), reportId: z.string().uuid().optional() });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const sched = scheduleSchema.safeParse(body);
  if (sched.success) {
    const { data, error } = await createScheduledReport(auth.supabase, {
      user_id: auth.user!.id,
      title: sched.data.title,
      frequency: sched.data.frequency,
      report_id: sched.data.reportId ?? null,
    });
    if (error) return databaseErrorResponse("bi.scheduled.create", error);
    await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "schedule", entity_type: "scheduled_report", entity_id: data?.id });
    return NextResponse.json({ scheduledReport: data });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createBiReport(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    report_type: parsed.data.reportType,
    payload: parsed.data.payload ?? {},
  });
  if (error) return databaseErrorResponse("bi.reports.create", error);
  await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "report", entity_id: data?.id });
  return NextResponse.json({ report: data });
}
