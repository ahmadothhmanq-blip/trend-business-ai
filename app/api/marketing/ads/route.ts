import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listAdsDrafts, createAdsDraft } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  platform: z.enum(["google_ads", "meta_ads"]),
  name: z.string().trim().min(1),
  objective: z.string().default("conversions"),
  budget: z.number().nullable().optional(),
  campaignId: z.string().uuid().nullable().optional(),
  audience: z.record(z.string(), z.unknown()).optional(),
  creative: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const platform = new URL(request.url).searchParams.get("platform") as "google_ads" | "meta_ads" | null;
  const { data, error } = await listAdsDrafts(auth.supabase, auth.user!.id, platform ?? undefined);

  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ drafts: [] });
    return databaseErrorResponse("marketing.ads.list", error);
  }

  return NextResponse.json({ drafts: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createAdsDraft(auth.supabase, {
    user_id: auth.user!.id,
    campaign_id: parsed.data.campaignId ?? null,
    platform: parsed.data.platform,
    name: parsed.data.name,
    objective: parsed.data.objective,
    budget: parsed.data.budget ?? null,
    audience: parsed.data.audience ?? {},
    creative: parsed.data.creative ?? {},
    status: "draft",
  });

  if (error) return databaseErrorResponse("marketing.ads.insert", error);
  return NextResponse.json({ draft: data });
}
