import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { z } from "zod";
import {
  storeWebsiteLead,
  listWebsiteLeads,
  notifyLeadIntegrations,
  updateWebsiteLeadStatus,
} from "@/lib/ai-core/website-design-platform";
import { leadsToCsv } from "@/lib/ai-core/website-design-platform/leads-repository";
import { createAdminClient } from "@/lib/supabase/admin";

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

const statusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["new", "notified", "forwarded", "failed", "read", "archived"]),
});

/**
 * GET — List leads for a website generation (dashboard) or export CSV.
 */
export async function GET(request: Request, { params }: Params) {
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

  const leads = await listWebsiteLeads(parsedId.id, auth.supabase);
  const format = new URL(request.url).searchParams.get("format");

  if (format === "csv") {
    return new NextResponse(leadsToCsv(leads), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${parsedId.id}.csv"`,
      },
    });
  }

  return NextResponse.json({
    leads,
    generationId: parsedId.id,
    count: leads.length,
  });
}

/**
 * POST — Submit contact / booking / quote / registration lead.
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
  const admin = createAdminClient();

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
  } else {
    const client = admin ?? auth.supabase;
    const { data: pub } = await client
      .from("website_publications")
      .select("generation_id")
      .eq("generation_id", parsedId.id)
      .eq("status", "published")
      .maybeSingle();
    if (!pub) {
      return NextResponse.json(
        { error: "Form submissions are only accepted for published websites." },
        { status: 403 },
      );
    }
  }

  const lead = await storeWebsiteLead(
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
    admin ?? auth.supabase,
  );

  const notify = await notifyLeadIntegrations(lead);
  if (notify.webhooked || notify.emailed) {
    await updateWebsiteLeadStatus(lead.id, "notified", admin ?? auth.supabase);
    lead.status = "notified";
  }

  return NextResponse.json({
    ok: true,
    lead,
    notify,
    message: "Form submitted successfully.",
  });
}

/**
 * PATCH — Update lead status (dashboard).
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
  }

  const updated = await updateWebsiteLeadStatus(
    parsed.data.leadId,
    parsed.data.status,
    auth.supabase,
  );
  if (!updated || updated.generationId !== parsedId.id) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated });
}
