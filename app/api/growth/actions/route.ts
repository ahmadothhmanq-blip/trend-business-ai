import { NextResponse } from "next/server";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import {
  automationUpsertSchema,
  campaignUpsertSchema,
  experimentUpsertSchema,
} from "@/lib/growth/schemas";

type Kind = "campaign" | "automation" | "experiment" | "claim-leads";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const kind = (body as { kind?: Kind }).kind;
  if (!kind) {
    return apiValidationError();
  }

  if (kind === "claim-leads") {
    const isAdmin = auth.user!.app_metadata?.role === "admin";
    if (!isAdmin) {
      return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403);
    }

    const { data, error } = await auth.supabase.rpc("claim_platform_growth_leads", {
      p_limit: 100,
    });
    if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
      return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503);
    }
    if (error?.message?.includes("FORBIDDEN")) {
      return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403);
    }
    if (error) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
    }
    return NextResponse.json({ claimed: data ?? 0 });
  }

  if (kind === "campaign") {
    const parsed = campaignUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message);
    }

    const row = {
      user_id: auth.user!.id,
      name: parsed.data.name,
      subject: parsed.data.subject,
      preview_text: parsed.data.previewText ?? "",
      body_html: parsed.data.bodyHtml ?? "",
      body_text: parsed.data.bodyText ?? "",
      segment: parsed.data.segment ?? "all",
      status: parsed.data.status ?? "draft",
      scheduled_at: parsed.data.scheduledAt ?? null,
      updated_at: new Date().toISOString(),
    };

    const query = parsed.data.id
      ? auth.supabase
          .from("growth_email_campaigns")
          .update(row)
          .eq("id", parsed.data.id)
          .eq("user_id", auth.user!.id)
      : auth.supabase.from("growth_email_campaigns").insert(row);

    const { data, error } = await query.select("*").single();
    if (error) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
    }
    return NextResponse.json({ campaign: data });
  }

  if (kind === "automation") {
    const parsed = automationUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message);
    }

    const row = {
      user_id: auth.user!.id,
      name: parsed.data.name,
      trigger_event: parsed.data.triggerEvent,
      status: parsed.data.status ?? "active",
      steps: parsed.data.steps ?? [],
      updated_at: new Date().toISOString(),
    };

    const query = parsed.data.id
      ? auth.supabase
          .from("growth_automations")
          .update(row)
          .eq("id", parsed.data.id)
          .eq("user_id", auth.user!.id)
      : auth.supabase.from("growth_automations").insert(row);

    const { data, error } = await query.select("*").single();
    if (error) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
    }
    return NextResponse.json({ automation: data });
  }

  if (kind === "experiment") {
    const parsed = experimentUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message);
    }

    const variants = parsed.data.variants ?? [
      { id: "a", label: "a", value: "a", weight: 50 },
      { id: "b", label: "b", value: "b", weight: 50 },
    ];

    const row = {
      user_id: auth.user!.id,
      name: parsed.data.name,
      hypothesis: parsed.data.hypothesis ?? "",
      target_type: parsed.data.targetType,
      status: parsed.data.status ?? "draft",
      variants,
      traffic_allocation: Object.fromEntries(variants.map((v) => [v.id, v.weight])),
      started_at: parsed.data.status === "running" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const query = parsed.data.id
      ? auth.supabase
          .from("growth_experiments")
          .update(row)
          .eq("id", parsed.data.id)
          .eq("user_id", auth.user!.id)
      : auth.supabase.from("growth_experiments").insert(row);

    const { data, error } = await query.select("*").single();
    if (error) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
    }
    return NextResponse.json({ experiment: data });
  }

  return apiValidationError();
}
