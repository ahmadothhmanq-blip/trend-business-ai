/**
 * Owner-configured lead integrations — never accept from public submitters.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormIntegrationConfig } from "@/lib/ai-core/website-design-platform/types";
import { assertSafeOutboundUrl } from "@/lib/website/url-safety";

type PublicationIntegrationRow = {
  metadata?: Record<string, unknown> | null;
};

/**
 * Load lead notification config for a generation from owner publication metadata.
 * Public form POST must never supply webhook/email directly.
 */
export async function loadOwnerLeadIntegration(
  client: SupabaseClient,
  generationId: string,
): Promise<FormIntegrationConfig | undefined> {
  const { data } = await client
    .from("website_publications")
    .select("metadata")
    .eq("generation_id", generationId)
    .maybeSingle();

  const meta = (data as PublicationIntegrationRow | null)?.metadata;
  if (!meta || typeof meta !== "object") return undefined;

  const leads = meta.leads as Record<string, unknown> | undefined;
  if (!leads || typeof leads !== "object") return undefined;

  const webhookRaw =
    typeof leads.webhookUrl === "string" ? leads.webhookUrl : undefined;
  const emailRaw = typeof leads.emailTo === "string" ? leads.emailTo : undefined;
  const webhookUrl = webhookRaw ? assertSafeOutboundUrl(webhookRaw) : undefined;
  const emailTo = emailRaw?.trim() || undefined;

  if (!webhookUrl && !emailTo) return undefined;

  return {
    webhookUrl: webhookUrl ?? undefined,
    emailTo,
    crmProvider: webhookUrl ? "webhook" : emailTo ? "email" : "none",
    notifyOnSubmit: true,
  };
}
