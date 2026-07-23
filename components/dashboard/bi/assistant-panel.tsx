"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BiAssistantAction } from "@/types/bi";

const ACTIONS: { key: BiAssistantAction; label: string; placeholder: string }[] = [
  { key: "analyze_performance", label: "Analyze", placeholder: "Analyze overall business performance this quarter…" },
  { key: "explain_kpi", label: "Explain KPI", placeholder: "Why did revenue drop this month?" },
  { key: "detect_trends", label: "Trends", placeholder: "Which product has the highest growth?" },
  { key: "detect_anomalies", label: "Anomalies", placeholder: "Find unusual patterns in sales data…" },
  { key: "forecast_revenue", label: "Forecast", placeholder: "Forecast revenue for next quarter…" },
  { key: "generate_executive_report", label: "Executive report", placeholder: "Generate an executive summary…" },
  { key: "natural_language_query", label: "Ask data", placeholder: "Which channel drives the most conversions?" },
];

export function BiAssistantPanel() {
  const [text, setText] = useState("");
  const [action, setAction] = useState<BiAssistantAction>("natural_language_query");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return toast.error("Enter a question or context");
    setLoading(true);
    try {
      const res = await fetch("/api/bi/actions", {
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

  const active = ACTIONS.find((a) => a.key === action);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">BI AI Assistant</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={active?.placeholder ?? "Ask about your business data…"}
          className="border-white/10 bg-white/5 text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAction(key)}
              className={`rounded-lg px-3 py-1.5 text-xs ${action === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={() => void run()} disabled={loading}>
          <Sparkles className="mr-2 size-4" />
          {loading ? "Running…" : "Run AI analysis"}
        </Button>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Insights</p>
        {result ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm text-white/70">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">Ask questions like &quot;Why did sales drop this month?&quot;</p>
        )}
      </div>
    </div>
  );
}
