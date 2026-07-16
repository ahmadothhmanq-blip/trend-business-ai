import { NextResponse } from "next/server";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { contactUpsertSchema, dealUpsertSchema } from "@/lib/growth/schemas";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = contactUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid contact" },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("growth_contacts")
    .upsert(
      {
        user_id: auth.user!.id,
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name ?? null,
        company: parsed.data.company ?? null,
        phone: parsed.data.phone ?? null,
        lifecycle_stage: parsed.data.lifecycleStage ?? "lead",
        score: parsed.data.score ?? 40,
        tags: parsed.data.tags ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,email" },
    )
    .select("*")
    .single();

  if (error?.code === "42P01") {
    return NextResponse.json({ error: "Migration 029 required." }, { status: 503 });
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = dealUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid deal" },
      { status: 400 },
    );
  }

  const payload = {
    user_id: auth.user!.id,
    title: parsed.data.title,
    contact_id: parsed.data.contactId ?? null,
    stage: parsed.data.stage ?? "new",
    value_cents: parsed.data.valueCents ?? 0,
    probability: parsed.data.probability ?? 10,
    expected_close_at: parsed.data.expectedCloseAt ?? null,
    notes: parsed.data.notes ?? "",
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { data, error } = await auth.supabase
      .from("growth_deals")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", auth.user!.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deal: data });
  }

  const { data, error } = await auth.supabase
    .from("growth_deals")
    .insert(payload)
    .select("*")
    .single();

  if (error?.code === "42P01") {
    return NextResponse.json({ error: "Migration 029 required." }, { status: 503 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deal: data });
}
