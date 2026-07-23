import type { SupabaseClient } from "@supabase/supabase-js";
import { getCrmBiData } from "./crm-bridge";
import { getErpBiData } from "./erp-bridge";
import { getMarketingBiData } from "./marketing-bridge";
import { getSocialBiData } from "./social-bridge";
import { getBusinessManagerBiData } from "./business-manager-bridge";
import { getWebsiteBiData } from "./website-bridge";
import { getBillingBiData } from "./billing-bridge";

export type IntegratedMetricSnapshot = {
  crm: Awaited<ReturnType<typeof getCrmBiData>>;
  erp: Awaited<ReturnType<typeof getErpBiData>>;
  marketing: Awaited<ReturnType<typeof getMarketingBiData>>;
  social: Awaited<ReturnType<typeof getSocialBiData>>;
  businessManager: Awaited<ReturnType<typeof getBusinessManagerBiData>>;
  website: Awaited<ReturnType<typeof getWebsiteBiData>>;
  billing: Awaited<ReturnType<typeof getBillingBiData>>;
};

export async function collectIntegratedMetrics(supabase: SupabaseClient, userId: string): Promise<IntegratedMetricSnapshot> {
  const [crm, erp, marketing, social, businessManager, website, billing] = await Promise.all([
    getCrmBiData(supabase, userId).catch(() => ({
      contacts: [], deals: [], leads: [], contactCount: 0, dealCount: 0, pipelineValueCents: 0, conversionRate: 0,
    })),
    getErpBiData(supabase, userId).catch(() => ({
      invoices: [], expenses: [], revenueCents: 0, expensesCents: 0, inventoryValueCents: 0,
    })),
    getMarketingBiData(supabase, userId).catch(() => ({ campaigns: [], campaignCount: 0, totalBudgetCents: 0, activeCampaigns: 0 })),
    getSocialBiData(supabase, userId).catch(() => ({ analytics: [], totalImpressions: 0, totalEngagements: 0 })),
    getBusinessManagerBiData(supabase, userId).catch(() => ({ projects: [], tasks: [], kpis: [], completedTasks: 0, totalTasks: 0 })),
    getWebsiteBiData(supabase, userId).catch(() => ({ events: [], pageViews: 0, eventCount: 0 })),
    getBillingBiData(supabase, userId).catch(() => ({ invoices: [], platformRevenueCents: 0, note: "" })),
  ]);
  return { crm, erp, marketing, social, businessManager, website, billing };
}

export { getCrmBiData, getErpBiData, getMarketingBiData, getSocialBiData, getBusinessManagerBiData, getWebsiteBiData, getBillingBiData };
