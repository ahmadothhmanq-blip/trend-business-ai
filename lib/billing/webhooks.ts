import { getBillingAdapter } from "@/lib/billing/adapters";
import { createBillingManager } from "@/lib/billing/manager";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import type { BillingProviderId } from "@/types/billing";

export async function recordWebhookEvent(params: {
  provider: BillingProviderId;
  eventId: string;
  eventType: string;
  payload: unknown;
}) {
  const admin = createAdminClient();
  const client = admin;
  if (!client) {
    logger.warn("Service role missing — webhook event not persisted", "billing.webhook");
    return { duplicate: false, alreadyProcessed: false, client: null };
  }

  const { error } = await client.from("billing_webhook_events").insert({
    provider: params.provider,
    event_id: params.eventId,
    event_type: params.eventType,
    payload: params.payload as object,
    processed: false,
  });

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await client
        .from("billing_webhook_events")
        .select("processed")
        .eq("provider", params.provider)
        .eq("event_id", params.eventId)
        .maybeSingle();
      return {
        duplicate: true,
        alreadyProcessed: Boolean(existing?.processed),
        client,
      };
    }
    logger.error("Failed to store webhook event", "billing.webhook", undefined, error);
  }

  return { duplicate: false, alreadyProcessed: false, client };
}

export async function markWebhookProcessed(
  client: NonNullable<ReturnType<typeof createAdminClient>>,
  provider: BillingProviderId,
  eventId: string,
  errorMessage?: string,
) {
  await client
    .from("billing_webhook_events")
    .update({
      processed: !errorMessage,
      error: errorMessage ?? null,
    })
    .eq("provider", provider)
    .eq("event_id", eventId);
}

export async function handleBillingWebhook(params: {
  provider: BillingProviderId;
  headers: Headers;
  rawBody: string;
}) {
  const adapter = getBillingAdapter(params.provider);
  const verified = (await adapter.verifyWebhook?.(params.headers, params.rawBody)) ?? false;
  if (!verified) {
    return { ok: false as const, status: 401, error: "Invalid webhook signature." };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(params.rawBody);
  } catch {
    return { ok: false as const, status: 400, error: "Invalid JSON payload." };
  }

  const event = adapter.parseWebhook?.(payload) ?? null;
  if (!event) {
    return { ok: true as const, status: 200, ignored: true };
  }

  const { duplicate, alreadyProcessed, client } = await recordWebhookEvent({
    provider: params.provider,
    eventId: event.eventId,
    eventType: event.eventType,
    payload,
  });

  if (duplicate && alreadyProcessed) {
    return { ok: true as const, status: 200, duplicate: true };
  }

  const admin = client ?? createAdminClient();
  if (!admin) {
    return {
      ok: false as const,
      status: 503,
      error: "Billing webhooks require SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  try {
    const manager = createBillingManager(admin);
    // Prefer capture-completed only to avoid double-fulfill from APPROVED + COMPLETED.
    const actionable = event.eventType === "PAYMENT.CAPTURE.COMPLETED" ||
      event.eventType === "CHECKOUT.ORDER.COMPLETED";

    if (actionable) {
      if (event.providerSessionId) {
        await manager.fulfillByProviderOrder(event.providerSessionId, event.providerPaymentId);
      } else if (event.customId) {
        await manager.completeCheckoutSession(event.customId);
      }
    }

    await markWebhookProcessed(admin, params.provider, event.eventId);
    return { ok: true as const, status: 200, eventType: event.eventType };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    await markWebhookProcessed(admin, params.provider, event.eventId, message);
    logger.error("Webhook processing failed", "billing.webhook", { eventType: event.eventType }, error);
    return { ok: false as const, status: 500, error: "Webhook processing failed." };
  }
}
