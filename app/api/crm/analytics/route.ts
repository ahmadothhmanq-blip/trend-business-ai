import { requireUser } from "@/lib/api/helpers";
import { getCrmAnalytics } from "@/lib/crm/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { summary, error } = await getCrmAnalytics(auth.supabase, auth.user!.id);
  if (error && /relation/i.test(error.message ?? "")) {
    return NextResponse.json({ summary: null, message: "Migration 066 not applied." });
  }
  return NextResponse.json({ summary });
}
