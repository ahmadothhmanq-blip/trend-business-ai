import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FALLBACK_PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Get started with AI credits",
    price_monthly: 0,
    price_yearly: 0,
    features: ["Starter AI credits", "Core product access"],
    limits: { credits_monthly: 50 },
    is_active: true,
    sort_order: 0,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    price_monthly: 79,
    price_yearly: 790,
    features: ["More AI credits", "Priority generation"],
    limits: { credits_monthly: 500 },
    is_active: true,
    sort_order: 1,
  },
];

/**
 * Public pricing probe — returns active plans when DB is available,
 * otherwise a safe static fallback (does not require auth).
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anon) {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        plans: FALLBACK_PLANS,
        message: "Supabase public env missing — returning static plans.",
      },
      { status: 200 },
    );
  }

  try {
    const supabase = createClient(url, anon);
    const { data, error } = await supabase
      .from("subscription_plans")
      .select(
        "id, name, description, price_monthly, price_yearly, features, limits, is_active, sort_order",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json(
        {
          ok: true,
          source: "fallback",
          plans: FALLBACK_PLANS,
          message: error
            ? "Plans unavailable from database — returning static plans."
            : "No active plans in database — returning static plans.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { ok: true, source: "database", plans: data },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        plans: FALLBACK_PLANS,
        message: "Pricing lookup failed — returning static plans.",
      },
      { status: 200 },
    );
  }
}
