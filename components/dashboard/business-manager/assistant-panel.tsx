"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessAssistantAction } from "@/types/business-manager";

const ACTIONS: { key: BusinessAssistantAction; label: string }[] = [
  { key: "analyze", label: "Analyze" },
  { key: "improve", label: "Improve" },
  { key: "summarize", label: "Summarize" },
  { key: "recommend", label: "Recommend" },
];

export function AssistantPanel() {
  const [text, setText] = useState("");
  const [action, setAction] = useState<BusinessAssistantAction>("analyze");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return toast.error("Enter business context.");
    setLoading(true);
    try {
      const res = await fetch("/api/business-manager/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.result);
      toast.success("Analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">AI Business Assistant</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe business performance, goals, blockers, team context..."
          rows={6}
          className="border-white/10 bg-white/5 text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAction(key)}
              className={`rounded-lg px-3 py-1.5 text-xs ${action === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={() => void run()} disabled={loading}>
          <Sparkles className="mr-2 size-4" />
          {loading ? "Running…" : "Run AI action"}
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">Results</p>
        {result ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm text-white/70">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-white/30">Run an AI action to see insights, recommendations, and bottlenecks.</p>
        )}
      </div>
    </div>
  );
}
