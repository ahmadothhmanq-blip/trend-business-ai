import type { SupabaseClient } from "@supabase/supabase-js";
import { getCrmContacts } from "./tools/crm";
import { getCrmDeals } from "./tools/crm";
import { createCrmTask } from "./tools/crm";
import { getCustomerSummary } from "./tools/crm";
import { getErpInvoices, getErpExpenses, getInventorySummary } from "./tools/erp";
import { getBmProjects, getBmTasks, getBmKpis } from "./tools/business-manager";
import { getMarketingCampaigns, getMarketingAnalytics } from "./tools/marketing";
import { getBiMetrics, getBiDashboards } from "./tools/bi";
import { getSocialAnalyticsSummary } from "./tools/social";
import { hasAgentPermission } from "./permissions";

export type ToolInvokeContext = {
  supabase: SupabaseClient;
  userId: string;
  agentId?: string;
  args?: Record<string, unknown>;
};

export type ToolInvokeResult = {
  toolKey: string;
  success: boolean;
  data: unknown;
  error?: string;
};

const BUILTIN_TOOLS: Record<string, { kind: "read" | "action"; handler: (ctx: ToolInvokeContext) => Promise<unknown> }> = {
  "crm.get_contacts": { kind: "read", handler: (ctx) => getCrmContacts(ctx.supabase, ctx.userId) },
  "crm.get_deals": { kind: "read", handler: (ctx) => getCrmDeals(ctx.supabase, ctx.userId) },
  "crm.customer_summary": { kind: "read", handler: (ctx) => getCustomerSummary(ctx.supabase, ctx.userId) },
  "crm.create_task": { kind: "action", handler: (ctx) => createCrmTask(ctx.supabase, ctx.userId, ctx.args ?? {}) },
  "erp.invoices": { kind: "read", handler: (ctx) => getErpInvoices(ctx.supabase, ctx.userId) },
  "erp.expenses": { kind: "read", handler: (ctx) => getErpExpenses(ctx.supabase, ctx.userId) },
  "erp.inventory_summary": { kind: "read", handler: (ctx) => getInventorySummary(ctx.supabase, ctx.userId) },
  "bm.projects": { kind: "read", handler: (ctx) => getBmProjects(ctx.supabase, ctx.userId) },
  "bm.tasks": { kind: "read", handler: (ctx) => getBmTasks(ctx.supabase, ctx.userId) },
  "bm.kpis": { kind: "read", handler: (ctx) => getBmKpis(ctx.supabase, ctx.userId) },
  "marketing.campaigns": { kind: "read", handler: (ctx) => getMarketingCampaigns(ctx.supabase, ctx.userId) },
  "marketing.analytics": { kind: "read", handler: (ctx) => getMarketingAnalytics(ctx.supabase, ctx.userId) },
  "bi.metrics": { kind: "read", handler: (ctx) => getBiMetrics(ctx.supabase, ctx.userId) },
  "bi.dashboards": { kind: "read", handler: (ctx) => getBiDashboards(ctx.supabase, ctx.userId) },
  "social.analytics_summary": { kind: "read", handler: (ctx) => getSocialAnalyticsSummary(ctx.supabase, ctx.userId) },
};

export const PLATFORM_TOOL_KEYS = Object.keys(BUILTIN_TOOLS);

export function mapLegacyToolId(toolId: string): string | null {
  const map: Record<string, string> = {
    "business-suite": "crm.customer_summary",
    "market-research": "crm.customer_summary",
    "social-media": "social.analytics_summary",
    "content-studio": "marketing.campaigns",
  };
  return map[toolId] ?? null;
}

export async function invokeTool(toolKey: string, ctx: ToolInvokeContext): Promise<ToolInvokeResult> {
  const builtin = BUILTIN_TOOLS[toolKey];
  if (!builtin) {
    return { toolKey, success: false, data: null, error: `Unknown tool: ${toolKey}` };
  }

  if (builtin.kind === "action") {
    if (ctx.agentId) {
      const allowed = await hasAgentPermission(ctx.supabase, ctx.userId, ctx.agentId, "run");
      if (!allowed) {
        return { toolKey, success: false, data: null, error: "Permission denied for action tool" };
      }
    }
  }

  try {
    const data = await builtin.handler(ctx);
    return { toolKey, success: true, data };
  } catch (e) {
    return { toolKey, success: false, data: null, error: e instanceof Error ? e.message : "Tool failed" };
  }
}

export async function invokeToolsForAgent(toolKeys: string[], ctx: ToolInvokeContext): Promise<ToolInvokeResult[]> {
  const keys = new Set<string>();
  for (const k of toolKeys) {
    keys.add(k);
    const mapped = mapLegacyToolId(k);
    if (mapped) keys.add(mapped);
  }
  return Promise.all([...keys].map((toolKey) => invokeTool(toolKey, ctx)));
}
