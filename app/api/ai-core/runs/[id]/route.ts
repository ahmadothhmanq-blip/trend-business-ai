import { requireUser } from "@/lib/api/helpers";
import { getAiCoreRun } from "@/lib/ai-core/runs/service";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/ai-core/runs/[id] — fetch a persisted AI Core run.
 */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Run id is required." }, { status: 400 });
  }

  const result = await getAiCoreRun(auth.supabase, auth.user!.id, id);
  if (result.missingTable) {
    return NextResponse.json(
      {
        error: "AI Core runs table not found. Apply migration 033_ai_runs.sql.",
      },
      { status: 503 },
    );
  }
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  if (!result.run) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json({ run: result.run });
}
