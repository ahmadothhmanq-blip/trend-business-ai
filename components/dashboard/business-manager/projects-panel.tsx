"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, List, GanttChart, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { groupTasksByStatus, TASK_STATUSES } from "@/lib/business-manager/tasks";
import type { BusinessProject, Task, Milestone } from "@/types/business-manager";

type View = "kanban" | "list" | "timeline";

type Props = {
  initialProjects?: BusinessProject[];
  initialTasks?: Task[];
  initialMilestones?: Milestone[];
};

export function ProjectsPanel({
  initialProjects = [],
  initialTasks = [],
  initialMilestones = [],
}: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [view, setView] = useState<View>("kanban");
  const [selectedId, setSelectedId] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const selected = projects.find((p) => p.id === selectedId) ?? null;
  const projectTasks = useMemo(
    () => (selected ? tasks.filter((t) => t.project_id === selected.id) : []),
    [tasks, selected],
  );
  const projectMilestones = useMemo(
    () => (selected ? milestones.filter((m) => m.project_id === selected.id) : []),
    [milestones, selected],
  );
  const kanban = useMemo(() => groupTasksByStatus(projectTasks), [projectTasks]);

  const generateProject = async () => {
    if (!brief.trim()) return toast.error("Enter a project brief.");
    setGenerating(true);
    try {
      const res = await fetch("/api/business-manager/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brief.slice(0, 60), brief, generate: true, status: "active" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setProjects([data.project, ...projects]);
      setSelectedId(data.project.id);
      setBrief("");
      toast.success("Project created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const addTask = async () => {
    if (!selected || !newTaskTitle.trim()) return;
    const res = await fetch("/api/business-manager/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, projectId: selected.id, status: "todo" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setTasks([data.task, ...tasks]);
    setNewTaskTitle("");
  };

  const moveTask = async (taskId: string, status: Task["status"]) => {
    const res = await fetch(`/api/business-manager/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));
  };

  const archiveProject = async () => {
    if (!selected) return;
    const res = await fetch(`/api/business-manager/projects/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setProjects(projects.map((p) => (p.id === selected.id ? data.project : p)));
    toast.success("Project archived");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs font-medium uppercase text-white/40">AI project planner</p>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe goals, timeline, team, deliverables..."
            rows={3}
            className="border-white/10 bg-white/5 text-white"
          />
          <Button className="mt-2 w-full" onClick={() => void generateProject()} disabled={generating}>
            <Sparkles className="mr-2 size-4" />
            {generating ? "Creating…" : "Create project"}
          </Button>
        </div>
        <div className="space-y-2">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm",
                selectedId === p.id
                  ? "border-premium-gold/40 bg-premium-gold/10 text-premium-gold-light"
                  : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/5",
              )}
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-xs capitalize text-white/40">
                {p.status} · {p.progress}%
              </p>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
              <p className="text-sm text-white/40">{selected.description || "No description"}</p>
            </div>
            <div className="flex gap-1">
              {(
                [
                  { key: "kanban" as const, icon: LayoutGrid, label: "Kanban" },
                  { key: "list" as const, icon: List, label: "List" },
                  { key: "timeline" as const, icon: GanttChart, label: "Timeline" },
                ] as const
              ).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs",
                    view === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => void archiveProject()}>
                Archive
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title"
              className="border-white/10 bg-white/5 text-white"
            />
            <Button onClick={() => void addTask()}>
              <Plus className="size-4" />
            </Button>
          </div>

          {view === "kanban" && (
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {TASK_STATUSES.map((status) => (
                <div key={status} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="mb-2 text-xs font-medium uppercase text-white/40">{status.replace("_", " ")}</p>
                  <div className="space-y-2">
                    {kanban[status].map((task) => (
                      <div key={task.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-sm">
                        <p className="text-white">{task.title}</p>
                        <p className="text-xs capitalize text-white/40">{task.priority}</p>
                        {status !== "done" && (
                          <button
                            type="button"
                            className="mt-1 text-xs text-premium-gold-light"
                            onClick={() => void moveTask(task.id, status === "todo" ? "in_progress" : "done")}
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "list" && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3 last:border-0"
                >
                  <div>
                    <p className="text-white">{task.title}</p>
                    <p className="text-xs text-white/40">
                      {task.assignee_name || "Unassigned"} · {task.priority}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-white/50">{task.status}</span>
                </div>
              ))}
              {projectTasks.length === 0 && (
                <p className="p-4 text-sm text-white/30">No tasks yet.</p>
              )}
            </div>
          )}

          {view === "timeline" && (
            <div className="space-y-3">
              {projectMilestones.map((m) => (
                <div key={m.id} className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="size-2 rounded-full bg-premium-gold" />
                  <div className="flex-1">
                    <p className="font-medium text-white">{m.title}</p>
                    <p className="text-xs text-white/40">
                      {m.target_date ?? "No date"} · {m.status}
                    </p>
                  </div>
                </div>
              ))}
              {projectTasks
                .filter((t) => t.due_date)
                .map((t) => (
                  <div key={t.id} className="ml-6 flex items-center gap-4 rounded-lg border border-white/[0.06] px-4 py-2">
                    <p className="text-sm text-white">{t.title}</p>
                    <p className="text-xs text-white/40">{t.due_date?.slice(0, 10)}</p>
                  </div>
                ))}
              {projectMilestones.length === 0 && projectTasks.length === 0 && (
                <p className="text-sm text-white/30">Add tasks with due dates or milestones for timeline view.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-white/30">
          Select or create a project
        </div>
      )}
    </div>
  );
}
