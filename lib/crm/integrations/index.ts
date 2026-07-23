export { importFromGrowthEngine } from "./growth-bridge";
export { getMarketingLeadBridge } from "./marketing-bridge";
export { getSocialInteractionBridge } from "./social-bridge";
export { getBusinessManagerTaskBridge } from "./business-manager-bridge";
export { getCalendarMeetingsBridge } from "./calendar-bridge";
export { getEmailCommunicationBridge } from "./email-bridge";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getMarketingLeadBridge } from "./marketing-bridge";
import { getSocialInteractionBridge } from "./social-bridge";
import { getBusinessManagerTaskBridge } from "./business-manager-bridge";
import { getCalendarMeetingsBridge } from "./calendar-bridge";
import { getEmailCommunicationBridge } from "./email-bridge";

export async function getAllCrmIntegrations(supabase: SupabaseClient, userId: string) {
  const [marketing, social, businessManager, calendar, email] = await Promise.all([
    getMarketingLeadBridge(supabase, userId).catch(() => ({ campaigns: [], campaignCount: 0 })),
    getSocialInteractionBridge(supabase, userId).catch(() => ({ posts: [], postCount: 0 })),
    getBusinessManagerTaskBridge(supabase, userId).catch(() => ({ tasks: [], taskCount: 0 })),
    getCalendarMeetingsBridge(supabase, userId).catch(() => ({ events: [] })),
    getEmailCommunicationBridge(supabase, userId).catch(() => ({ campaigns: [] })),
  ]);
  return { marketing, social, businessManager, calendar, email, readOnly: true };
}
