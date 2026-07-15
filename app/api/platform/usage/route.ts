import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { UsageRecord } from "@/types/platform";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30") || 30;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  const { data, error } = await auth.supabase
    .from("usage_records")
    .select("*")
    .eq("user_id", auth.user!.id)
    .gte("period_start", since)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ records: [], summary: { totalTokens: 0, totalGenerations: 0, byResource: {} } });
    return databaseErrorResponse("usage.list", error);
  }

  const records = (data ?? []) as UsageRecord[];
  const totalTokens = records.reduce((s, r) => s + r.tokens_used, 0);
  const totalGenerations = records.reduce((s, r) => s + r.generations_count, 0);
  const byResource: Record<string, { tokens: number; generations: number }> = {};
  for (const r of records) {
    if (!byResource[r.resource]) byResource[r.resource] = { tokens: 0, generations: 0 };
    byResource[r.resource].tokens += r.tokens_used;
    byResource[r.resource].generations += r.generations_count;
  }

  return NextResponse.json({ records, summary: { totalTokens, totalGenerations, byResource } });
}
