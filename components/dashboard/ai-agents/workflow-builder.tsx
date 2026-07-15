"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, GitBranch, Plus, Play, Settings2, Trash2, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard, DashboardCardContent, DashboardCardHeader,
  DashboardCardTitle, DashboardCardDescription, DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { WORKFLOW_TRIGGERS, WORKFLOW_STEP_TYPES, AGENT_TOOLS, getToolLabel } from "@/lib/constants/ai-agents";
import type { AgentWorkflow, WorkflowStep } from "@/types/agents";

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([]);
  const [editing, setEditing] = useState<AgentWorkflow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-agents/workflows?limit=50");
      if (!res.ok) return;
      const d = await res.json();
      setWorkflows(d.workflows ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const addStep = () => {
    const id = `step-${steps.length + 1}`;
    setSteps((p) => [...p, {
      id, name: "", type: "agent", config: {}, input_mapping: {},
      output_key: id, on_error: "stop", max_retries: 0,
      position: { x: 0, y: steps.length * 100 }, next_steps: [],
    }]);
  };

  const updateStep = (idx: number, updates: Partial<WorkflowStep>) => {
    setSteps((p) => p.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const removeStep = (idx: number) => {
    setSteps((p) => p.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Workflow name is required"); return; }
    if (steps.length === 0) { toast.error("Add at least one step"); return; }

    const res = await fetch("/api/ai-agents/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, triggerType, steps }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? "Failed"); return; }
    toast.success("Workflow created");
    setName(""); setDescription(""); setSteps([]); setShowCreate(false);
    fetchWorkflows();
  };

  if (showCreate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40" onClick={() => setShowCreate(false)}>
          <ChevronLeft className="size-3" /> Back
        </Button>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><GitBranch className="size-5 text-premium-gold-light" /><DashboardCardTitle>Create Workflow</DashboardCardTitle></div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow" className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Trigger</label>
                  <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className={dashboardSelectClass}>
                    {WORKFLOW_TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this workflow does..." className={dashboardInputClass} />
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* Steps */}
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Steps ({steps.length})</DashboardCardTitle>
              <Button onClick={addStep} size="sm" className="btn-gold gap-1 rounded-lg text-xs font-bold text-luxury-black">
                <Plus className="size-3" /> Add Step
              </Button>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {steps.length === 0 ? (
              <DashboardPanel className="py-8 text-center">
                <Workflow className="mx-auto size-8 text-white/10" />
                <p className="mt-3 text-xs text-white/30">No steps added yet</p>
              </DashboardPanel>
            ) : (
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <DashboardPanel key={step.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-premium-gold/15 text-[10px] font-bold text-premium-gold-light">{idx + 1}</span>
                        <span className="text-xs font-bold text-white/70">Step {idx + 1}</span>
                      </span>
                      <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-red-400" onClick={() => removeStep(idx)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-white/40">Step Name</label>
                        <Input value={step.name} onChange={(e) => updateStep(idx, { name: e.target.value })} placeholder="Step name" className={dashboardInputClass} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-white/40">Type</label>
                        <select value={step.type} onChange={(e) => updateStep(idx, { type: e.target.value as WorkflowStep["type"] })} className={dashboardSelectClass}>
                          {WORKFLOW_STEP_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-white/40">On Error</label>
                        <select value={step.on_error} onChange={(e) => updateStep(idx, { on_error: e.target.value as "stop" | "skip" | "retry" })} className={dashboardSelectClass}>
                          <option value="stop">Stop</option>
                          <option value="skip">Skip</option>
                          <option value="retry">Retry</option>
                        </select>
                      </div>
                    </div>
                    {step.type === "service" && (
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-white/40">Service</label>
                        <select value={step.service ?? ""} onChange={(e) => updateStep(idx, { service: e.target.value })} className={dashboardSelectClass}>
                          <option value="">Select service...</option>
                          {AGENT_TOOLS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>
                    )}
                  </DashboardPanel>
                ))}
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 text-white/50" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button size="sm" className="btn-gold rounded-xl font-bold text-luxury-black" onClick={handleSave}>Save Workflow</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Workflow className="size-5 text-premium-gold-light" /><h2 className="text-sm font-bold text-white/80">Workflows</h2></div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="btn-gold gap-1.5 rounded-xl text-xs font-bold text-luxury-black">
          <Plus className="size-3" /> Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <DashboardPanel className="py-10 text-center">
          <GitBranch className="mx-auto size-8 text-white/10" />
          <p className="mt-3 text-xs text-white/30">No workflows created yet</p>
          <p className="mt-1 text-[10px] text-white/20">Create multi-step automation workflows</p>
        </DashboardPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {workflows.map((wf) => (
            <DashboardPanel key={wf.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-white/90">{wf.name}</p>
                  <p className="text-[10px] text-white/30">{wf.trigger_type} · {(wf.steps as WorkflowStep[]).length} steps · {wf.total_runs} runs</p>
                </div>
                <div className={cn("size-2 rounded-full", wf.is_active ? "bg-green-400" : "bg-white/20")} />
              </div>
              {wf.description && <p className="text-[11px] text-white/40">{wf.description}</p>}
            </DashboardPanel>
          ))}
        </div>
      )}
    </div>
  );
}
