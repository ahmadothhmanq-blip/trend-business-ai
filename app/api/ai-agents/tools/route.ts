import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { PLATFORM_TOOL_KEYS, invokeTool } from "@/lib/agents/tool-registry";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  return NextResponse.json({ tools: PLATFORM_TOOL_KEYS });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ toolKey?: string; args?: Record<string, unknown> }>(request);
  if (body instanceof NextResponse) return body;
  if (!body.toolKey) return NextResponse.json({ error: "toolKey required" }, { status: 400 });
  const result = await invokeTool(body.toolKey, { supabase: auth.supabase, userId: auth.user!.id, args: body.args });
  return NextResponse.json({ result });
}
