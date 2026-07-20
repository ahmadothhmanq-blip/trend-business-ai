import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { buildAppBuilderHealthReport } from "@/lib/ai-core/app-design-platform/production-health";

export const dynamic = "force-dynamic";

/**
 * GET — App Builder production health.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const report = await buildAppBuilderHealthReport(auth.supabase);
    return NextResponse.json(report);
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.health",
      error,
      "Unable to load App Builder health.",
    );
  }
}
