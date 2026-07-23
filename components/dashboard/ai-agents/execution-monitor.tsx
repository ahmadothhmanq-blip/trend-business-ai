"use client";

import { useEffect, useState } from "react";
import type { AgentExecution } from "@/types/agents";

export function ExecutionMonitor({ initialExecutions = [] }: { initialExecutions?: AgentExecution[] }) {
  const [executions, setExecutions] = useState(initialExecutions);
  const [selected, setSelected] = useState<AgentExecution | null>(null);

  useEffect(() => {
    void fetch("/api/ai-agents/executions?limit=20").then((r) => r.json()).then((d) => setExecutions(d.executions ?? [])).catch(() => undefined);
  }, []);

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/ai-agents/executions/${id}`);
    const data = await res.json();
    if (data.execution) setSelected(data.execution);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Recent Runs</p>
        <ul className="space-y-2">
          {executions.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => void loadDetail(e.id)} className="w-full rounded-lg border border-white/5 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5">
                {e.task_name} · <span className={e.status === "completed" ? "text-emerald-400" : e.status === "failed" ? "text-rose-400" : "text-white/40"}>{e.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Execution Detail</p>
        {selected ? (
          <pre className="max-h-96 overflow-auto text-xs text-white/60">{JSON.stringify(selected, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">Select an execution.</p>
        )}
      </div>
    </div>
  );
}
