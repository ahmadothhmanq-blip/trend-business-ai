import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { getAllCrmIntegrations, importFromGrowthEngine } from "@/lib/crm/integrations";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const bridges = await getAllCrmIntegrations(auth.supabase, auth.user!.id);
  return NextResponse.json({ bridges, readOnly: true });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ action?: string }>(request);
  if (body instanceof NextResponse) return body;

  if (body.action === "import-growth") {
    const result = await importFromGrowthEngine(auth.supabase, auth.user!.id);
    return NextResponse.json({ result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
