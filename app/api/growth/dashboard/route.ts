import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { loadGrowthDashboard } from "@/lib/growth/engine";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const payload = await loadGrowthDashboard(
    auth.supabase,
    auth.user!.id,
    auth.user!.email,
  );

  if (!payload) {
    return NextResponse.json(
      {
        error: "Growth engine tables are missing. Apply migration 029_growth_engine.sql.",
        code: "MIGRATION_REQUIRED",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ growth: payload });
}
