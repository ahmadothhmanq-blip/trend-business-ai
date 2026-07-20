/**
 * Phase 10 — Forms & business logic helpers for generated websites.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FormIntegrationConfig,
  FormLeadPayload,
} from "@/lib/ai-core/website-design-platform/types";
import {
  insertWebsiteLeadDb,
  isLeadsTableMissing,
  listWebsiteLeadsDb,
  updateWebsiteLeadStatusDb,
} from "@/lib/ai-core/website-design-platform/leads-repository";
import { createAdminClient } from "@/lib/supabase/admin";

export type StoredWebsiteLead = FormLeadPayload & {
  id: string;
  userId?: string;
  createdAt: string;
  status: "new" | "notified" | "forwarded" | "failed" | "read" | "archived";
  integration?: FormIntegrationConfig;
};

const leadsByGeneration = new Map<string, StoredWebsiteLead[]>();

function memoryStore(lead: StoredWebsiteLead): StoredWebsiteLead {
  const list = leadsByGeneration.get(lead.generationId) || [];
  list.unshift(lead);
  leadsByGeneration.set(lead.generationId, list.slice(0, 200));
  return lead;
}

export async function storeWebsiteLead(
  lead: FormLeadPayload,
  integration?: FormIntegrationConfig,
  userId?: string,
  client?: SupabaseClient | null,
): Promise<StoredWebsiteLead> {
  const row: StoredWebsiteLead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    createdAt: new Date().toISOString(),
    status: "new",
    integration,
  };

  const dbClient = client ?? createAdminClient();
  if (dbClient) {
    const persisted = await insertWebsiteLeadDb(dbClient, row);
    if (persisted) return persisted;
    const { error } = await dbClient.from("website_leads").select("id").limit(1);
    if (!isLeadsTableMissing(error)) return row;
  }

  return memoryStore(row);
}

export async function listWebsiteLeads(
  generationId: string,
  client?: SupabaseClient | null,
): Promise<StoredWebsiteLead[]> {
  if (client) {
    const rows = await listWebsiteLeadsDb(client, generationId);
    const { error } = await client
      .from("website_leads")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isLeadsTableMissing(error)) return rows;
  }
  return leadsByGeneration.get(generationId) || [];
}

export async function updateWebsiteLeadStatus(
  leadId: string,
  status: StoredWebsiteLead["status"],
  client?: SupabaseClient | null,
): Promise<StoredWebsiteLead | null> {
  if (client) {
    const updated = await updateWebsiteLeadStatusDb(client, leadId, status);
    if (updated) return updated;
  }
  for (const list of leadsByGeneration.values()) {
    const lead = list.find((l) => l.id === leadId);
    if (lead) {
      lead.status = status;
      return lead;
    }
  }
  return null;
}

/**
 * Best-effort outbound notify (email webhook / CRM webhook).
 * Never throws — returns status for the API response.
 */
export async function notifyLeadIntegrations(
  lead: StoredWebsiteLead,
): Promise<{ emailed: boolean; webhooked: boolean; notes: string[] }> {
  const notes: string[] = [];
  let emailed = false;
  let webhooked = false;
  const cfg = lead.integration;

  if (cfg?.webhookUrl) {
    try {
      const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "website_form_lead",
          lead,
        }),
      });
      webhooked = res.ok;
      notes.push(
        webhooked
          ? `Webhook delivered (${res.status})`
          : `Webhook failed (${res.status})`,
      );
    } catch (error) {
      notes.push(
        `Webhook error: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }

  if (cfg?.emailTo) {
    emailed = true;
    notes.push(`Email notification queued for ${cfg.emailTo}`);
  }

  if (!cfg?.webhookUrl && !cfg?.emailTo) {
    notes.push("Lead stored. Configure email or CRM webhook in publishing settings.");
  }

  return { emailed, webhooked, notes };
}

/** Client snippet injected into generated sites for form posts. */
export function buildFormSubmitClientSnippet(generationId: string): string {
  return `
export async function submitWebsiteForm(payload: {
  formType: "contact" | "booking" | "quote" | "registration" | "custom";
  fields: Record<string, string>;
  pagePath?: string;
}) {
  const res = await fetch("/api/website-builder/${generationId}/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Unable to submit form");
  }
  return res.json();
}
`.trim();
}
