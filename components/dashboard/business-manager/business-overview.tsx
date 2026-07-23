"use client";

import type { BusinessAnalyticsSummary } from "@/lib/business-manager/analytics";
import type { BusinessProject, Task } from "@/types/business-manager";

type Props = {
  summary: BusinessAnalyticsSummary;
  projects: BusinessProject[];
  tasks: Task[];
};

export function BusinessOverview({ summary, projects, tasks }: Props) {
  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Projects", value: summary.activeProjects },
          { label: "Task Completion", value: `${summary.taskCompletionRate}%` },
          { label: "Teams", value: summary.totalTeams },
          { label: "Pending Approvals", value: summary.pendingApprovals },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/40">Operations snapshot</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Avg project progress", value: `${summary.avgProjectProgress}%` },
              { label: "Overdue tasks", value: summary.overdueTasks },
              { label: "Urgent tasks", value: urgentTasks },
              { label: "Active workflows", value: summary.activeWorkflows },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-lg font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/40">Recent projects</p>
          <div className="mt-3 space-y-2">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{p.name}</span>
                <span className="text-white/40">{p.progress}%</span>
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-white/30">No projects yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
