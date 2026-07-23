import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { createThreatReport } from "@/lib/cyber/threats";
import { listReports } from "@/lib/cyber/reports";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listReports(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.reports.list", error);
  return NextResponse.json({ reports: data ?? [] });
}

const schema = z.object({ title: z.string().min(1), summary: z.string().optional(), recommendations: z.array(z.string()).optional() });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createThreatReport(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    summary: parsed.data.summary,
    recommendations: parsed.data.recommendations,
  });
  if (error) return databaseErrorResponse("cyber.reports.create", error);
  return NextResponse.json({ report: data });
}
