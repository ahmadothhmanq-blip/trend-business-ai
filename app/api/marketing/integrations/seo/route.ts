import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getMarketingSeoInsights } from "@/lib/marketing/integrations/seo-bridge";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  topic: z.string().trim().min(2),
  content: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const insights = getMarketingSeoInsights(parsed.data);
  return NextResponse.json({ insights });
}
