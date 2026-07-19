import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { z } from "zod";
import {
  storeWebsiteLead,
  listWebsiteLeads,
  notifyLeadIntegrations,
} from "@/lib/ai-core/website-design-platform";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const leadSchema = z.object({
  formType: z.enum([
    "contact",
    "booking",
    "quote",
    "registration",
    "custom",
  ]),
  fields: z.record(z.string(), z.string()),
  pagePath: z.string().trim().optional(),
  locale: z.string().trim().optional(),
  emailTo: z.string().email().optional(),
  webhookUrl: z.string().url().optional(),
});

/**
 * GET — List leads for a website generation (dashboard).
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("id")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  return NextResponse.json({
    leads: listWebsiteLeads(parsedId.id),
    generationId: parsedId.id,
  });
}

/**
 * POST — Submit contact / booking / quote / registration lead (Phase 10).
 * Accepts authenticated dashboard previews and published-site form posts.
 */
export async function POST(request: Request, { params }: Params) {
  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid lead" },
      { status: 400 },
    );
  }

  const auth = await requireUser();
  const userId = auth.response ? undefined : auth.user?.id;

  if (!auth.response && auth.user) {
    const { data } = await auth.supabase
      .from("website_generations")
      .select("id")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: "Website not found." }, { status: 404 });
    }
  }

  const lead = storeWebsiteLead(
    {
      generationId: parsedId.id,
      formType: parsed.data.formType,
      fields: parsed.data.fields,
      pagePath: parsed.data.pagePath,
      locale: parsed.data.locale,
    },
    {
      emailTo: parsed.data.emailTo,
      webhookUrl: parsed.data.webhookUrl,
      crmProvider: parsed.data.webhookUrl
        ? "webhook"
        : parsed.data.emailTo
          ? "email"
          : "none",
      notifyOnSubmit: true,
    },
    userId,
  );

  const notify = await notifyLeadIntegrations(lead);
  lead.status = notify.webhooked || notify.emailed ? "notified" : "new";

  return NextResponse.json({
    ok: true,
    lead,
    notify,
    message: "Form submitted successfully.",
  });
}
