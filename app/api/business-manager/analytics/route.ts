import { requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
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
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, e instanceof Error ? e.message : undefined);
  }
}
