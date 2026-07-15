import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public health probe — intentionally minimal to avoid information leakage.
 * Detailed checks are available only when HEALTH_DETAILED=true (internal use).
 */
export async function GET() {
  const detailed = process.env.HEALTH_DETAILED === "true";

  if (!detailed) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const start = Date.now();
  const checks: Record<string, "ok" | "degraded" | "down"> = {};

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anonKey) {
      checks.database = "degraded";
    } else {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.database = res.ok ? "ok" : "degraded";
    }
  } catch {
    checks.database = "down";
  }

  checks.ai = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY ? "ok" : "degraded";

  const allOk = Object.values(checks).every((v) => v === "ok");
  const anyDown = Object.values(checks).some((v) => v === "down");

  return NextResponse.json(
    {
      status: anyDown ? "unhealthy" : allOk ? "healthy" : "degraded",
      responseMs: Date.now() - start,
      checks,
    },
    { status: anyDown ? 503 : 200 },
  );
}
