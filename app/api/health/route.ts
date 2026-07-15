import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, "ok" | "degraded" | "down"> = {};

  try {
    const { url, anonKey } = getSupabaseEnv();
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(5000),
    });
    checks.database = res.ok ? "ok" : "degraded";
  } catch {
    checks.database = "down";
  }

  checks.deepseek = process.env.DEEPSEEK_API_KEY ? "ok" : "degraded";

  const allOk = Object.values(checks).every((v) => v === "ok");
  const anyDown = Object.values(checks).some((v) => v === "down");

  return NextResponse.json(
    {
      status: anyDown ? "unhealthy" : allOk ? "healthy" : "degraded",
      version: process.env.npm_package_version ?? "0.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - start,
      checks,
    },
    { status: anyDown ? 503 : 200 },
  );
}
