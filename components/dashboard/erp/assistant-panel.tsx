"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ErpAssistantAction } from "@/types/erp";

const ACTIONS: { key: ErpAssistantAction; label: string }[] = [
  { key: "analyze_financial_data", label: "Analyze finances" },
  { key: "generate_reports", label: "Reports" },
  { key: "forecast_revenue", label: "Forecast" },
  { key: "predict_inventory", label: "Inventory" },
  { key: "recommend_actions", label: "Recommend" },
  { key: "summarize_performance", label: "Summarize" },
];

export function AssistantPanel() {
  const [text, setText] = useState("");
  const [action, setAction] = useState<ErpAssistantAction>("analyze_financial_data");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return toast.error("Enter ERP context");
    setLoading(true);
    try {
      const res = await fetch("/api/erp/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.result);
      toast.success("AI analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">AI ERP Assistant</p>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Financial/operational context…" className="border-white/10 bg-white/5 text-white" />
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setAction(key)} className={`rounded-lg px-3 py-1.5 text-xs ${action === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40"}`}>
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
        <p className="mb-3 text-xs uppercase text-white/40">Results</p>
        {result ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm text-white/70">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">Run an action to see insights.</p>
        )}
      </div>
    </div>
  );
}
