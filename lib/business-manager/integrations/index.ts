export { getCrmBridgeSummary } from "./crm-bridge";
export { getErpBridgeSummary } from "./erp-bridge";
export { getMarketingBridgeSummary } from "./marketing-bridge";
export { getSocialBridgeSummary } from "./social-bridge";
export { getCalendarBridgeEvents } from "./calendar-bridge";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getCrmBridgeSummary } from "./crm-bridge";
import { getErpBridgeSummary } from "./erp-bridge";
import { getMarketingBridgeSummary } from "./marketing-bridge";
import { getSocialBridgeSummary } from "./social-bridge";
import { getCalendarBridgeEvents } from "./calendar-bridge";

export async function getAllIntegrationBridges(supabase: SupabaseClient, userId: string) {
  const [crm, erp, marketing, social, calendar] = await Promise.all([
    getCrmBridgeSummary(supabase, userId).catch(() => ({
      contacts: 0,
      deals: 0,
      openDeals: 0,
      recentContacts: [],
    })),
    getErpBridgeSummary(supabase, userId).catch(() => ({
      invoices: 0,
      recentInvoices: [],
    })),
    getMarketingBridgeSummary(supabase, userId).catch(() => ({
      campaigns: 0,
      activeCampaigns: 0,
      recentCampaigns: [],
    })),
    getSocialBridgeSummary(supabase, userId).catch(() => ({
      posts: 0,
      scheduled: 0,
      recentPosts: [],
    })),
    getCalendarBridgeEvents(supabase, userId).catch(() => []),
  ]);

  return { crm, erp, marketing, social, calendar };
}
