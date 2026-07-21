import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverErrorResponse } from "@/lib/api/errors";
import { processScheduledJobs } from "@/lib/social-media/publishing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorizeWorker(request: Request): boolean {
  const secret = process.env.SOCIAL_PUBLISH_CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = request.headers.get("x-social-publish-cron-secret")?.trim() || "";
  return bearer === secret || header === secret;
}

async function runWorker(request: Request) {
  if (!authorizeWorker(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Set SOCIAL_PUBLISH_CRON_SECRET and pass Bearer token." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required for publish worker." },
      { status: 503 },
    );
  }

  try {
    const url = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20));
    const results = await processScheduledJobs(admin, limit);
    return NextResponse.json({
      message: `Processed ${results.length} publish job(s).`,
      processed: results.length,
      jobs: results.map((r) => ({
        id: r.job.id,
        status: r.job.status,
        ok: r.result.ok,
        platformPostId: r.result.platformPostId,
        error: r.result.error,
      })),
    });
  } catch (error) {
    return serverErrorResponse("social-media.worker.process", error, "Publish worker failed.");
  }
}

export async function GET(request: Request) {
  return runWorker(request);
}

export async function POST(request: Request) {
  return runWorker(request);
}
