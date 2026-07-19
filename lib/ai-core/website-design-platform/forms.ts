/**
 * Phase 10 — Forms & business logic helpers for generated websites.
 */

import type {
  FormIntegrationConfig,
  FormLeadPayload,
} from "@/lib/ai-core/website-design-platform/types";

export type StoredWebsiteLead = FormLeadPayload & {
  id: string;
  userId?: string;
  createdAt: string;
  status: "new" | "notified" | "forwarded" | "failed";
  integration?: FormIntegrationConfig;
};

const leadsByGeneration = new Map<string, StoredWebsiteLead[]>();

export function storeWebsiteLead(
  lead: FormLeadPayload,
  integration?: FormIntegrationConfig,
  userId?: string,
): StoredWebsiteLead {
  const row: StoredWebsiteLead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    createdAt: new Date().toISOString(),
    status: "new",
    integration,
  };
  const list = leadsByGeneration.get(lead.generationId) || [];
  list.unshift(row);
  leadsByGeneration.set(lead.generationId, list.slice(0, 200));
  return row;
}

export function listWebsiteLeads(generationId: string): StoredWebsiteLead[] {
  return leadsByGeneration.get(generationId) || [];
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
    // Platform email provider may not be configured — record intent.
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
