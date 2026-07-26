import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { AgentExecution } from "@/types/agents";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const { data, error } = await auth.supabase
    .from("agent_executions")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Execution not found.");
    }
    return databaseErrorResponse("executions.get", error);
  }

  return NextResponse.json({ execution: data as AgentExecution });
}
