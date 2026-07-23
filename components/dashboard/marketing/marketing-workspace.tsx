"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Mail,
  Megaphone,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingDashboard } from "@/components/dashboard/marketing/marketing-dashboard";
import { CampaignList } from "@/components/dashboard/marketing/campaign-list";
import { PersonaPanel } from "@/components/dashboard/marketing/persona-panel";
import { MarketingCalendar } from "@/components/dashboard/marketing/marketing-calendar";
import { AnalyticsDashboard } from "@/components/dashboard/marketing/analytics-dashboard";
import { EmailPanel } from "@/components/dashboard/marketing/email-panel";
import { AdsPanel } from "@/components/dashboard/marketing/ads-panel";
import type { MarketingCampaign, CustomerPersona, MarketingCalendarEvent } from "@/types/marketing";
import type { WorkspaceGeneration } from "@/types/database";
import type { MarketingDashboardSummary } from "@/components/dashboard/marketing/marketing-dashboard";

const StrategyWorkspace = dynamic(
  () => import("@/components/dashboard/marketing/strategy-workspace").then((m) => m.StrategyWorkspace),
  { loading: () => <div className="text-sm text-white/40">Loading AI strategy…</div> },
);

type Tab =
  | "dashboard"
  | "campaigns"
  | "personas"
  | "calendar"
  | "analytics"
  | "email"
  | "ads"
  | "strategy";

type Props = {
  initialCampaigns?: MarketingCampaign[];
  initialPersonas?: CustomerPersona[];
  initialCalendar?: MarketingCalendarEvent[];
  initialGenerations?: WorkspaceGeneration[];
  analyticsSummary?: MarketingDashboardSummary;
};

export function MarketingWorkspace({
  initialCampaigns = [],
  initialPersonas = [],
  initialCalendar = [],
  initialGenerations = [],
  analyticsSummary,
}: Props) {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(initialCampaigns[0]?.id ?? null);

  const summary = analyticsSummary ?? {
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalLeads: 0,
    totalRevenue: 0,
    totalSpend: 0,
    avgRoi: 0,
    avgEngagementRate: 0,
    recordCount: 0,
    byChannel: {},
  };

  const tabs = [
    { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { key: "campaigns" as const, label: "Campaigns", icon: Megaphone },
    { key: "personas" as const, label: "Personas", icon: Users },
    { key: "calendar" as const, label: "Calendar", icon: CalendarDays },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "email" as const, label: "Email", icon: Mail },
    { key: "ads" as const, label: "Ads", icon: Target },
    { key: "strategy" as const, label: "AI Strategy", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[100px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <MarketingDashboard campaigns={campaigns} summary={summary} />}
      {tab === "campaigns" && (
        <CampaignList
          campaigns={campaigns}
          onCampaignsChange={setCampaigns}
          selectedId={selectedCampaignId}
          onSelect={setSelectedCampaignId}
        />
      )}
      {tab === "personas" && <PersonaPanel initialPersonas={initialPersonas} />}
      {tab === "calendar" && <MarketingCalendar initialEvents={initialCalendar} />}
      {tab === "analytics" && <AnalyticsDashboard />}
      {tab === "email" && <EmailPanel />}
      {tab === "ads" && <AdsPanel />}
      {tab === "strategy" && <StrategyWorkspace initialGenerations={initialGenerations} />}
    </div>
  );
}
