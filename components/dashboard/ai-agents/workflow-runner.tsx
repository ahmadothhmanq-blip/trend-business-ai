"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { AgentWorkflow } from "@/types/agents";

export function WorkflowRunner() {
  const pt = useProductT("aiAgents");
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    void fetch("/api/ai-agents/workflows?limit=50").then((r) => r.json()).then((d) => {
      setWorkflows(d.workflows ?? []);
      if (d.workflows?.[0]) setSelectedId(d.workflows[0].id);
    }).catch(() => undefined);
  }, []);

  const run = async () => {
    if (!selectedId) return toast.error(pt("panels.workflow.selectWorkflow"));
    setLoading(true);
    try {
      const res = await fetch("/api/ai-agents/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", workflowId: selectedId, input: { task: "Run workflow" } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? pt("toasts.failed"));
      setResult(data.result);
      toast.success(pt("panels.workflow.executed"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : pt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
        {workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <Button onClick={() => void run()} disabled={loading || !selectedId}>
        {loading ? pt("panels.workflow.running") : pt("panels.workflow.runWorkflow")}
      </Button>
      {result ? <pre className="max-h-96 overflow-auto rounded-xl border border-white/5 p-4 text-xs text-white/60">{JSON.stringify(result, null, 2)}</pre> : null}
    </div>
  );
}
