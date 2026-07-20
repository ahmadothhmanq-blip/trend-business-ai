import { NextResponse } from "next/server";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  processPendingRenderJobs,
  processVideoStudioBackgroundQueue,
} from "@/lib/ai-core/video-production-platform";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(5),
  /** If true, only process jobs for the authenticated user */
  mineOnly: z.boolean().optional().default(true),
  /** Resume queued/processing jobs and retry recent failures */
  fullQueue: z.boolean().optional().default(false),
  retryFailed: z.boolean().optional().default(true),
});

/**
 * POST — background worker: resume processing/queued render jobs.
 * Call from cron, dashboard "Process queue", or after async provider accepts jobs.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid worker request" },
      { status: 400 },
    );
  }

  try {
    if (parsed.data.fullQueue) {
      const result = await processVideoStudioBackgroundQueue({
        supabase: auth.supabase,
        userId: parsed.data.mineOnly ? auth.user!.id : undefined,
        limit: parsed.data.limit,
        pollRounds: 16,
        retryFailed: parsed.data.retryFailed,
      });
      return NextResponse.json({
        message: `Processed ${result.processed} render job(s) (${result.resumed} resumed, ${result.retried} retried).`,
        ...result,
      });
    }

    const result = await processPendingRenderJobs({
      supabase: auth.supabase,
      userId: parsed.data.mineOnly ? auth.user!.id : undefined,
      limit: parsed.data.limit,
      pollRounds: 12,
    });

    return NextResponse.json({
      message: `Processed ${result.processed} render job(s).`,
      ...result,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.jobs.process",
      error,
      "Unable to process render jobs.",
    );
  }
}

/**
 * GET — list recent render jobs for the user.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const { data, error } = await auth.supabase
      .from("video_render_jobs")
      .select("id,generation_id,status,provider,mode,progress,updated_at,created_at")
      .eq("user_id", auth.user!.id)
      .order("updated_at", { ascending: false })
      .limit(40);

    if (error) {
      if (
        error.code === "42P01" ||
        (typeof error.message === "string" && error.message.includes("relation"))
      ) {
        return NextResponse.json({
          jobs: [],
          message: "Apply migration 044_video_studio_media.sql for render jobs.",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data ?? [] });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.jobs.list",
      error,
      "Unable to list render jobs.",
    );
  }
}
