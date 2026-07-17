import { NextResponse } from "next/server";
import { createGrowthWriteClient } from "@/lib/growth/client";
import { newsletterSchema } from "@/lib/growth/schemas";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/helpers";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";

  const rateLimited = await enforceMutationRateLimitAsync(
    `growth-newsletter:${ip}`,
  );
  // Prod without Upstash fail-closes growth-* keys with 503 — do not block signup.
  if (rateLimited) {
    if (rateLimited.status >= 500) {
      console.error(
        "growth newsletter rate limit unavailable; continuing ingest",
        await rateLimited
          .clone()
          .json()
          .catch(() => null),
      );
    } else {
      return rateLimited;
    }
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email" },
      { status: 400 },
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const { client } = createGrowthWriteClient();
  const email = parsed.data.email.toLowerCase();

  const { error } = await client.from("growth_subscribers").upsert(
    {
      email,
      name: parsed.data.name ?? null,
      source: parsed.data.source,
      status: "subscribed",
      owner_user_id: null,
      unsubscribed_at: null,
    },
    { onConflict: "email,coalesce(owner_user_id, '00000000-0000-0000-0000-000000000000')" },
  );

  // Upsert on expression unique index may not work with onConflict string — fallback insert
  if (error) {
    const inserted = await client.from("growth_subscribers").insert({
      email,
      name: parsed.data.name ?? null,
      source: parsed.data.source,
      status: "subscribed",
      owner_user_id: null,
    });

    if (inserted.error?.code === "42P01") {
      return NextResponse.json(
        { error: "Growth engine migration not applied. Run migration 029." },
        { status: 503 },
      );
    }

    if (inserted.error && inserted.error.code !== "23505") {
      return NextResponse.json({ error: inserted.error.message }, { status: 500 });
    }
  }

  await client.from("growth_events").insert({
    event_name: "newsletter_subscribe",
    event_category: "conversion",
    metadata: { email },
  });

  await client.from("growth_leads").insert({
    email,
    name: parsed.data.name ?? null,
    source: "newsletter",
    score: 25,
    owner_user_id: null,
    status: "new",
  });

  return NextResponse.json({ ok: true });
}
