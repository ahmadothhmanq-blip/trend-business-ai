import { requireUser } from "@/lib/api/helpers";
import { INTEGRATION_PROVIDERS, SAFE_INTEGRATION_SELECT } from "@/lib/marketing/integrations/providers";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data } = await auth.supabase
    .from("marketing_integrations")
    .select(SAFE_INTEGRATION_SELECT)
    .eq("user_id", auth.user!.id);

  return NextResponse.json({
    providers: Object.values(INTEGRATION_PROVIDERS).map((p) => ({
      provider: p.provider,
      label: p.label,
      authType: p.authType,
      configured: Boolean(
        p.apiKeyEnv ? process.env[p.apiKeyEnv] : process.env[p.clientIdEnv ?? ""],
      ),
    })),
    connections: data ?? [],
  });
}
