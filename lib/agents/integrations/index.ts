import type { SupabaseClient } from "@supabase/supabase-js";
import { getCrmContacts, getCrmDeals, getCustomerSummary } from "../tools/crm";
import { getErpInvoices, getInventorySummary } from "../tools/erp";
import { getBmProjects, getBmKpis } from "../tools/business-manager";
import { getMarketingCampaigns } from "../tools/marketing";
import { getBiMetrics } from "../tools/bi";
import { getSocialAnalyticsSummary } from "../tools/social";

export async function getCalendarEvents(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("marketing_calendar_events")
    .select("id, title, scheduled_at, event_type")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: false })
    .limit(20);
  return { events: data ?? [] };
}

export async function collectAgentIntegrations(supabase: SupabaseClient, userId: string) {
  const [crm, erp, bm, marketing, bi, social, calendar] = await Promise.all([
    getCustomerSummary(supabase, userId).catch(() => ({ contactCount: 0, dealCount: 0, openDeals: 0, convertedLeads: 0 })),
    getErpInvoices(supabase, userId).catch(() => ({ invoices: [], totalRevenueCents: 0 })),
    getBmProjects(supabase, userId).catch(() => ({ projects: [], count: 0 })),
    getMarketingCampaigns(supabase, userId).catch(() => ({ campaigns: [], active: 0 })),
    getBiMetrics(supabase, userId).catch(() => ({ metrics: {} })),
    getSocialAnalyticsSummary(supabase, userId).catch(() => ({ totalImpressions: 0, totalEngagements: 0 })),
    getCalendarEvents(supabase, userId).catch(() => ({ events: [] })),
  ]);
  return { crm, erp, bm, marketing, bi, social, calendar };
}

export { getCrmContacts, getCrmDeals, getCustomerSummary, getErpInvoices, getInventorySummary, getBmProjects, getBmKpis, getMarketingCampaigns, getBiMetrics, getSocialAnalyticsSummary };
