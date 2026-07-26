import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
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
    return apiErrorResponse(
      API_ERROR_CODES.MIGRATION_REQUIRED,
      503,
      "Growth engine tables are missing. Apply migration 029_growth_engine.sql.",
    );
  }

  return NextResponse.json({ growth: payload });
}
