"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { AGENT_TYPES, AGENT_TOOLS, AGENT_CATEGORIES } from "@/lib/constants/ai-agents";
import { CheckboxToggle } from "@/components/dashboard/builder-shared";
import type { Agent } from "@/types/agents";

type Props = { agent?: Agent | null; onSaved?: () => void; onCancel?: () => void };

export function AgentEditor({ agent, onSaved, onCancel }: Props) {
  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [agentType, setAgentType] = useState(agent?.agent_type ?? "custom");
  const [category, setCategory] = useState(agent?.category ?? "general");
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? "");
  const [tools, setTools] = useState<string[]>((agent?.tools as string[]) ?? []);
  const [temperature, setTemperature] = useState(String(agent?.temperature ?? 0.7));
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) return toast.error("Name required");
    setLoading(true);
    try {
      if (agent?.id) {
        const res = await fetch(`/api/ai-agents/${agent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, system_prompt: systemPrompt, tools, temperature: parseFloat(temperature) }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
        toast.success("Agent updated");
      } else {
        const res = await fetch("/api/ai-agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-agent",
            name, description, agentType, category, systemPrompt, tools,
            temperature: parseFloat(temperature),
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
        toast.success("Agent created");
      }
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs uppercase text-white/40">{agent ? "Edit Agent" : "Agent Builder"}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" className={dashboardInputClass} />
        <select value={agentType} onChange={(e) => setAgentType(e.target.value)} className={dashboardSelectClass}>
          {AGENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={dashboardInputClass} />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className={dashboardSelectClass}>
        {AGENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} placeholder="System prompt" className={dashboardInputClass} />
      <div className="flex flex-wrap gap-2">
        {AGENT_TOOLS.map((tool) => (
          <CheckboxToggle key={tool.id} label={tool.label} checked={tools.includes(tool.id)}
            onChange={(c) => setTools((p) => c ? [...p, tool.id] : p.filter((x) => x !== tool.id))} />
        ))}
      </div>
      <div className="flex gap-2">
        {onCancel ? <Button variant="outline" onClick={onCancel}>Cancel</Button> : null}
        <Button onClick={() => void save()} disabled={loading}>{loading ? "Saving…" : "Save Agent"}</Button>
      </div>
    </div>
  );
}
