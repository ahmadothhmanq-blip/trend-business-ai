export { getCrmDealsForErp, getCrmContactsForErp } from "./crm-bridge";
export { getBusinessManagerBridge } from "./business-manager-bridge";
export { getMarketingBridge } from "./marketing-bridge";
export { getSocialBridge } from "./social-bridge";
export { getBillingBridge } from "./billing-bridge";
export { getCalendarBridge } from "./calendar-bridge";
export { getErpBridgeSummary } from "./legacy-bridge";
export type { ErpBridgeSummary } from "./legacy-bridge";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getCrmDealsForErp, getCrmContactsForErp } from "./crm-bridge";
import { getBusinessManagerBridge } from "./business-manager-bridge";
import { getMarketingBridge } from "./marketing-bridge";
import { getSocialBridge } from "./social-bridge";
import { getBillingBridge } from "./billing-bridge";
import { getCalendarBridge } from "./calendar-bridge";

export async function getAllErpIntegrations(supabase: SupabaseClient, userId: string) {
  const [crmDeals, crmContacts, businessManager, marketing, social, billing, calendar] = await Promise.all([
    getCrmDealsForErp(supabase, userId).catch(() => ({ deals: [], dealCount: 0 })),
    getCrmContactsForErp(supabase, userId).catch(() => ({ contacts: [], contactCount: 0 })),
    getBusinessManagerBridge(supabase, userId).catch(() => ({ projects: [], tasks: [], projectCount: 0, taskCount: 0 })),
    getMarketingBridge(supabase, userId).catch(() => ({ campaigns: [], campaignCount: 0, totalBudgetCents: 0 })),
    getSocialBridge(supabase, userId).catch(() => ({ posts: [], postCount: 0 })),
    getBillingBridge(supabase, userId).catch(() => ({ platformInvoices: 0, recentPlatformInvoices: [], note: "" })),
    getCalendarBridge(supabase, userId).catch(() => ({ events: [] })),
  ]);
  return { crm: { deals: crmDeals, contacts: crmContacts }, businessManager, marketing, social, billing, calendar, readOnly: true };
}
