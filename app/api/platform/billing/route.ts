import { requireUser } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { createBillingManager } from "@/lib/billing";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const manager = createBillingManager(auth.supabase);
    const status = await manager.getStatus(auth.user!.id);
    return NextResponse.json(status);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "42P01") {
      return NextResponse.json({
        currentPlanId: "free",
        subscription: null,
        credits: {
          user_id: auth.user!.id,
          balance: 50,
          lifetime_purchased: 0,
          lifetime_used: 0,
          updated_at: new Date().toISOString(),
        },
        invoices: [],
        creditPacks: [],
        providersConfigured: [],
        billingConfigured: false,
        migrationRequired: true,
      });
    }
    return serverErrorResponse("billing.status", error);
  }
}
