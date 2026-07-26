import { NextResponse } from "next/server";

import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";

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

import {

  enforceWebsitePublicRateLimit,

  getRequestClientIp,

  isPublishedWebsiteGeneration,

  verifyOptionalCaptchaToken,

} from "@/lib/website/public-endpoints";

import { loadOwnerLeadIntegration } from "@/lib/website/lead-integrations";



export const dynamic = "force-dynamic";

export const runtime = "nodejs";



type Params = { params: Promise<{ id: string }> };



const MAX_LEAD_FIELDS = 20;

const MAX_FIELD_KEY_LEN = 80;

const MAX_FIELD_VALUE_LEN = 2000;



const leadSchema = z.object({

  formType: z.enum([

    "contact",

    "booking",

    "quote",

    "registration",

    "custom",

  ]),

  fields: z

    .record(z.string().max(MAX_FIELD_KEY_LEN), z.string().max(MAX_FIELD_VALUE_LEN))

    .refine((fields) => Object.keys(fields).length <= MAX_LEAD_FIELDS, {

      message: `Too many fields (max ${MAX_LEAD_FIELDS}).`,

    }),

  pagePath: z.string().trim().max(500).optional(),

  locale: z.string().trim().max(20).optional(),

  honeypot: z.string().max(200).optional(),

  captchaToken: z.string().trim().max(500).optional(),

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

    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);

  }

  if (!data) {

    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");

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

  const ip = getRequestClientIp(request);

  const rateLimited = await enforceWebsitePublicRateLimit("leads", ip);

  if (rateLimited) return rateLimited;



  const { id: rawId } = await params;

  const parsedId = parseUuidParam(rawId, "generation id");

  if (parsedId instanceof NextResponse) return parsedId;



  const body = await parseJsonBody<unknown>(request);

  if (body instanceof NextResponse) return body;



  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {

    return apiValidationError(parsed.error.issues[0]?.message);

  }



  if (parsed.data.honeypot?.trim()) {

    return NextResponse.json({ ok: true, ignored: true });

  }



  const captcha = await verifyOptionalCaptchaToken(parsed.data.captchaToken);

  if (!captcha.ok) {

    return apiValidationError(captcha.reason);

  }



  const admin = createAdminClient();

  if (!admin) {

    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 503, "Lead storage unavailable.");

  }



  const published = await isPublishedWebsiteGeneration(admin, parsedId.id);

  if (!published) {

    return apiErrorResponse(

      API_ERROR_CODES.FORBIDDEN,

      403,

      "Form submissions are only accepted for published websites.",

    );

  }



  const auth = await requireUser();

  const userId = auth.response ? undefined : auth.user?.id;

  const ownerIntegration = await loadOwnerLeadIntegration(admin, parsedId.id);



  const lead = await storeWebsiteLead(

    {

      generationId: parsedId.id,

      formType: parsed.data.formType,

      fields: parsed.data.fields,

      pagePath: parsed.data.pagePath,

      locale: parsed.data.locale,

    },

    ownerIntegration,

    userId,

    admin,

  );



  const notify = await notifyLeadIntegrations(lead);

  if (notify.webhooked || notify.emailed) {

    await updateWebsiteLeadStatus(lead.id, "notified", admin);

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



  const { data: owned } = await auth.supabase

    .from("website_generations")

    .select("id")

    .eq("id", parsedId.id)

    .eq("user_id", auth.user!.id)

    .maybeSingle();

  if (!owned) {

    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");

  }



  const body = await parseJsonBody<unknown>(request);

  if (body instanceof NextResponse) return body;



  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {

    return apiValidationError("Invalid status update");

  }



  const updated = await updateWebsiteLeadStatus(

    parsed.data.leadId,

    parsed.data.status,

    auth.supabase,

  );

  if (!updated || updated.generationId !== parsedId.id) {

    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Lead not found.");

  }



  return NextResponse.json({ ok: true, lead: updated });

}


