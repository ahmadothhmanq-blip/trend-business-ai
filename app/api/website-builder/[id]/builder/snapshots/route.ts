import { NextResponse } from "next/server";
import { z } from "zod";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiNotFoundError,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import type { WebsiteGeneration } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const snapshotBodySchema = z.object({
  label: z.string().trim().min(1).max(120).default("Backup"),
});

const MAX_SNAPSHOTS = 24;

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const access = await assertBuilderAccess(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
    "manage",
  );
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const { data, error } = await auth.supabase!
    .from("website_builder_snapshots")
    .select("id, label, created_at")
    .eq("generation_id", parsedId.id)
    .order("created_at", { ascending: false })
    .limit(MAX_SNAPSHOTS);

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }

  return NextResponse.json({ snapshots: data ?? [] });
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const access = await assertBuilderAccess(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
    "manage",
  );
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const { data: generation, error: genError } = await auth.supabase!
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .maybeSingle();

  if (genError) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, genError.message);
  }
  if (!generation) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = snapshotBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const gen = generation as WebsiteGeneration;
  const { data, error } = await auth.supabase
    .from("website_builder_snapshots")
    .insert({
      generation_id: parsedId.id,
      user_id: auth.user!.id,
      label: parsed.data.label,
      blueprint: gen.blueprint ?? {},
    })
    .select("id, label, created_at")
    .single();

  if (error) {
    return serverErrorResponse("website-builder-snapshots", error);
  }

  const { data: stale } = await auth.supabase
    .from("website_builder_snapshots")
    .select("id")
    .eq("generation_id", parsedId.id)
    .order("created_at", { ascending: false })
    .range(MAX_SNAPSHOTS, 999);

  if (stale?.length) {
    await auth.supabase
      .from("website_builder_snapshots")
      .delete()
      .in(
        "id",
        stale.map((row) => row.id),
      );
  }

  return NextResponse.json({ snapshot: data });
}
