"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  CheckSquare,
  Contact,
  Handshake,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrmOverview } from "@/components/dashboard/crm/crm-overview";
import { AccountsPanel } from "@/components/dashboard/crm/accounts-panel";
import { ContactsPanel } from "@/components/dashboard/crm/contacts-panel";
import { LeadsPanel } from "@/components/dashboard/crm/leads-panel";
import { DealsPipeline } from "@/components/dashboard/crm/deals-pipeline";
import { TasksPanel } from "@/components/dashboard/crm/tasks-panel";
import { ActivitiesPanel } from "@/components/dashboard/crm/activities-panel";
import { AnalyticsDashboard } from "@/components/dashboard/crm/analytics-dashboard";
import { AssistantPanel } from "@/components/dashboard/crm/assistant-panel";
import type { CrmAnalyticsSummary } from "@/lib/crm/analytics";
import type {
  CRMAccount,
  CRMActivity,
  CRMContact,
  CRMDeal,
  CRMLead,
  CRMTask,
} from "@/types/crm";

type Tab =
  | "overview"
  | "accounts"
  | "contacts"
  | "leads"
  | "deals"
  | "tasks"
  | "activities"
  | "analytics"
  | "assistant";

type Props = {
  initialAccounts?: CRMAccount[];
  initialContacts?: CRMContact[];
  initialLeads?: CRMLead[];
  initialDeals?: CRMDeal[];
  initialTasks?: CRMTask[];
  initialActivities?: CRMActivity[];
  analyticsSummary?: CrmAnalyticsSummary;
};

export function CrmWorkspace({
  initialAccounts = [],
  initialContacts = [],
  initialLeads = [],
  initialDeals = [],
  initialTasks = [],
  initialActivities = [],
  analyticsSummary,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [leads, setLeads] = useState(initialLeads);
  const [deals, setDeals] = useState(initialDeals);

  const summary =
    analyticsSummary ?? {
      pipelineValueCents: 0,
      wonValueCents: 0,
      openDeals: 0,
      totalLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      winRate: 0,
      avgSalesCycleDays: 0,
      forecastCents: 0,
      byStage: {},
    };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "accounts" as const, label: "Accounts", icon: Building2 },
    { key: "contacts" as const, label: "Contacts", icon: Contact },
    { key: "leads" as const, label: "Leads", icon: Target },
    { key: "deals" as const, label: "Deals", icon: Handshake },
    { key: "tasks" as const, label: "Tasks", icon: ListTodo },
    { key: "activities" as const, label: "Activities", icon: CheckSquare },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "assistant" as const, label: "AI Assistant", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[90px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && <CrmOverview summary={summary} deals={deals} leads={leads} />}
      {tab === "accounts" && <AccountsPanel initialAccounts={initialAccounts} />}
      {tab === "contacts" && <ContactsPanel initialContacts={initialContacts} />}
      {tab === "leads" && <LeadsPanel initialLeads={leads} onLeadsChange={setLeads} />}
      {tab === "deals" && <DealsPipeline initialDeals={deals} onDealsChange={setDeals} />}
      {tab === "tasks" && <TasksPanel initialTasks={initialTasks} />}
      {tab === "activities" && <ActivitiesPanel initialActivities={initialActivities} />}
      {tab === "analytics" && <AnalyticsDashboard initialSummary={summary} />}
      {tab === "assistant" && <AssistantPanel />}
    </div>
  );
}
