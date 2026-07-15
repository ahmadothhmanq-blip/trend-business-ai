import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** Billing mutations require service-role after Phase 18 RLS lockdown. */
export function requireBillingWriteClient():
  | { client: SupabaseClient; response: null }
  | { client: null; response: NextResponse } {
  const client = createAdminClient();
  if (!client) {
    return {
      client: null,
      response: NextResponse.json(
        {
          error:
            "Billing writes require SUPABASE_SERVICE_ROLE_KEY on the server.",
        },
        { status: 503 },
      ),
    };
  }
  return { client, response: null };
}
