import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listEmailCampaigns, listEmailTemplates, listAudienceLists } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const [campaigns, templates, audiences] = await Promise.all([
    listEmailCampaigns(auth.supabase, auth.user!.id),
    listEmailTemplates(auth.supabase, auth.user!.id),
    listAudienceLists(auth.supabase, auth.user!.id),
  ]);

  return NextResponse.json({
    campaigns: campaigns.data ?? [],
    templates: templates.data ?? [],
    audiences: audiences.data ?? [],
  });
}

const createSchema = z.object({
  name: z.string().trim().min(1),
  subject: z.string().default(""),
  bodyHtml: z.string().default(""),
  bodyText: z.string().default(""),
  campaignId: z.string().uuid().nullable().optional(),
  audienceListId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("marketing_email_campaigns")
    .insert({
      user_id: auth.user!.id,
      campaign_id: parsed.data.campaignId ?? null,
      name: parsed.data.name,
      subject: parsed.data.subject,
      body_html: parsed.data.bodyHtml,
      body_text: parsed.data.bodyText,
      audience_list_id: parsed.data.audienceListId ?? null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) return databaseErrorResponse("marketing.email.insert", error);
  return NextResponse.json({ campaign: data });
}
