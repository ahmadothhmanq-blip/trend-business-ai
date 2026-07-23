import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getBusinessAnalytics } from "@/lib/business-manager";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const { summary, error } = await getBusinessAnalytics(auth.supabase, auth.user!.id);
    if (error && /relation/i.test(error.message ?? "")) {
      return NextResponse.json({ summary: null, message: "Migration 065 not applied." });
    }
    if (error) return databaseErrorResponse("business-manager.analytics", error);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analytics failed" },
      { status: 500 },
    );
  }
}
