"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { Agent } from "@/types/agents";

type Memory = { id: string; agent_id: string; memory_type: string; key: string; content: string };

export function MemoryViewer({ agents = [] }: { agents?: Agent[] }) {
  const pt = useProductT("aiAgents");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState("");
  const [key, setKey] = useState("");

  const load = () => {
    if (!agentId) return;
    void fetch(`/api/ai-agents/memory?agentId=${agentId}`).then((r) => r.json()).then((d) => setMemories(d.memories ?? [])).catch(() => undefined);
  };

  useEffect(() => { load(); }, [agentId]);

  const save = async () => {
    if (!agentId || !content.trim()) return toast.error(pt("panels.memory.selectAgentContent"));
    const res = await fetch("/api/ai-agents/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, content, key }),
    });
    if (!res.ok) return toast.error(pt("toasts.failed"));
    setContent(""); setKey("");
    load();
    toast.success(pt("panels.memory.saved"));
  };

  return (
    <div className="space-y-4">
      <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={dashboardInputClass}>
        {agents.filter((a) => !a.is_template).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <div className="flex gap-2">
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder={pt("panels.memory.keyPlaceholder")} className={dashboardInputClass} />
        <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder={pt("panels.memory.contentPlaceholder")} className={dashboardInputClass} />
        <Button onClick={() => void save()}>{pt("panels.memory.save")}</Button>
      </div>
      <ul className="space-y-2 text-sm text-white/60">
        {memories.map((m) => (
          <li key={m.id} className="rounded-lg border border-white/5 px-3 py-2">
            <span className="text-white/40">{m.memory_type}{m.key ? `:${m.key}` : ""}</span> — {m.content}
          </li>
        ))}
        {memories.length === 0 && <li className="text-white/30">{pt("panels.memory.empty")}</li>}
      </ul>
    </div>
  );
}
