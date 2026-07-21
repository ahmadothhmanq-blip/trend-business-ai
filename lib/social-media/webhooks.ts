/**
 * Webhook event handling foundation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function logWebhookEvent(
  supabase: SupabaseClient,
  args: { platform: string; eventType: string; payload: Record<string, unknown> },
) {
  return supabase.from("social_webhook_events").insert({
    platform: args.platform,
    event_type: args.eventType,
    payload: args.payload,
    processed: false,
  });
}

export function verifyMetaWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null,
  verifyToken: string,
): string | null {
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }
  return null;
}

export type WebhookParseResult = {
  eventType: string;
  messages: Array<Record<string, unknown>>;
  statusUpdates: Array<Record<string, unknown>>;
};

export function parseMetaWebhookPayload(payload: Record<string, unknown>): WebhookParseResult {
  const entry = (payload.entry as Array<Record<string, unknown>>) ?? [];
  const messages: Array<Record<string, unknown>> = [];
  const statusUpdates: Array<Record<string, unknown>> = [];

  for (const e of entry) {
    const changes = (e.changes as Array<Record<string, unknown>>) ?? [];
    for (const change of changes) {
      const value = (change.value as Record<string, unknown>) ?? {};
      const field = String(change.field ?? "");
      if (field === "messages" || value.messages) {
        messages.push(...((value.messages as Array<Record<string, unknown>>) ?? []));
      }
      if (value.statuses) {
        statusUpdates.push(...((value.statuses as Array<Record<string, unknown>>) ?? []));
      }
    }
    const messaging = (e.messaging as Array<Record<string, unknown>>) ?? [];
    for (const m of messaging) {
      if (m.message) messages.push(m);
      if (m.delivery || m.read) statusUpdates.push(m);
    }
  }

  return {
    eventType: messages.length ? "message" : statusUpdates.length ? "status" : "unknown",
    messages,
    statusUpdates,
  };
}
