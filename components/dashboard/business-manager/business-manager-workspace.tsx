"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Briefcase,
  Building2,
  CheckSquare,
  LayoutDashboard,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessOverview } from "@/components/dashboard/business-manager/business-overview";
import { OrganizationsPanel } from "@/components/dashboard/business-manager/organizations-panel";
import { TeamsPanel } from "@/components/dashboard/business-manager/teams-panel";
import { ProjectsPanel } from "@/components/dashboard/business-manager/projects-panel";
import { KpisPanel } from "@/components/dashboard/business-manager/kpis-panel";
import { OperationsPanel } from "@/components/dashboard/business-manager/operations-panel";
import { AnalyticsDashboard } from "@/components/dashboard/business-manager/analytics-dashboard";
import { AssistantPanel } from "@/components/dashboard/business-manager/assistant-panel";
import type { BusinessAnalyticsSummary } from "@/lib/business-manager/analytics";
import type {
  Organization,
  Team,
  Role,
  BusinessProject,
  Task,
  Milestone,
  Workflow as WorkflowType,
  Approval,
  KPI,
} from "@/types/business-manager";
import type { WorkspaceGeneration } from "@/types/database";

const StrategyWorkspace = dynamic(
  () => import("@/components/dashboard/business-manager/strategy-workspace").then((m) => m.StrategyWorkspace),
  { loading: () => <div className="text-sm text-white/40">Loading AI strategy…</div> },
);

type Tab =
  | "overview"
  | "organizations"
  | "teams"
  | "projects"
  | "kpis"
  | "operations"
  | "analytics"
  | "assistant"
  | "strategy";

type Props = {
  initialOrganizations?: Organization[];
  initialTeams?: Team[];
  initialRoles?: Role[];
  initialProjects?: BusinessProject[];
  initialTasks?: Task[];
  initialMilestones?: Milestone[];
  initialWorkflows?: WorkflowType[];
  initialApprovals?: Approval[];
  initialKpis?: KPI[];
  initialGenerations?: WorkspaceGeneration[];
  analyticsSummary?: BusinessAnalyticsSummary;
};

export function BusinessManagerWorkspace({
  initialOrganizations = [],
  initialTeams = [],
  initialRoles = [],
  initialProjects = [],
  initialTasks = [],
  initialMilestones = [],
  initialWorkflows = [],
  initialApprovals = [],
  initialKpis = [],
  initialGenerations = [],
  analyticsSummary,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const summary =
    analyticsSummary ?? {
      totalProjects: 0,
      activeProjects: 0,
      archivedProjects: 0,
      avgProjectProgress: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      taskCompletionRate: 0,
      totalTeams: 0,
      totalOrganizations: 0,
      pendingApprovals: 0,
      activeWorkflows: 0,
      kpiOnTrack: 0,
      kpiOffTrack: 0,
    };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "organizations" as const, label: "Organizations", icon: Building2 },
    { key: "teams" as const, label: "Teams", icon: Users },
    { key: "projects" as const, label: "Projects", icon: Briefcase },
    { key: "kpis" as const, label: "KPIs", icon: Target },
    { key: "operations" as const, label: "Operations", icon: Workflow },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "assistant" as const, label: "AI Assistant", icon: CheckSquare },
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
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[90px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <BusinessOverview summary={summary} projects={initialProjects} tasks={initialTasks} />
      )}
      {tab === "organizations" && <OrganizationsPanel initialOrganizations={initialOrganizations} />}
      {tab === "teams" && (
        <TeamsPanel organizations={initialOrganizations} initialTeams={initialTeams} initialRoles={initialRoles} />
      )}
      {tab === "projects" && (
        <ProjectsPanel
          initialProjects={initialProjects}
          initialTasks={initialTasks}
          initialMilestones={initialMilestones}
        />
      )}
      {tab === "kpis" && <KpisPanel initialKpis={initialKpis} />}
      {tab === "operations" && (
        <OperationsPanel initialWorkflows={initialWorkflows} initialApprovals={initialApprovals} />
      )}
      {tab === "analytics" && <AnalyticsDashboard initialSummary={summary} />}
      {tab === "assistant" && <AssistantPanel />}
      {tab === "strategy" && <StrategyWorkspace initialGenerations={initialGenerations} />}
    </div>
  );
}
