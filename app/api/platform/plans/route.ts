import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { SubscriptionPlan } from "@/types/platform";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({
        plans: [
          { id: "free", name: "Free", description: "Get started", price_monthly: 0, price_yearly: 0, features: ["5 generations/day"], limits: { generations_per_day: 5 }, is_active: true, sort_order: 0 },
          { id: "pro", name: "Pro", description: "For teams", price_monthly: 79, price_yearly: 790, features: ["Unlimited generations"], limits: { generations_per_day: 999 }, is_active: true, sort_order: 2 },
        ],
      });
    }
    return databaseErrorResponse("plans.list", error);
  }

  return NextResponse.json(
    { plans: data as SubscriptionPlan[] },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
