import { requireUser, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { AgentExecution } from "@/types/agents";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const agentId = searchParams.get("agent");
  const status = searchParams.get("status");

  let query = auth.supabase
    .from("agent_executions")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (agentId) query = query.eq("agent_id", agentId);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ executions: [], total: 0, page, limit, totalPages: 1 });
    return databaseErrorResponse("executions.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ executions: data as AgentExecution[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
}
