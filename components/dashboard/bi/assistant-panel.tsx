"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BiAssistantAction } from "@/types/bi";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

const ACTIONS: BiAssistantAction[] = [
  "analyze_performance",
  "explain_kpi",
  "detect_trends",
  "detect_anomalies",
  "forecast_revenue",
  "generate_executive_report",
  "natural_language_query",
];

export function BiAssistantPanel() {
  const wt = useWorkspaceT("bi");
  const [text, setText] = useState("");
  const [action, setAction] = useState<BiAssistantAction>("natural_language_query");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return toast.error(wt("toasts.contextRequired"));
    setLoading(true);
    try {
      const res = await fetch("/api/bi/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setResult(data.result);
      toast.success(wt("toasts.analysisComplete"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{wt("assistant.title")}</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={wt(`assistant.placeholders.${action}`)}
          className="border-white/10 bg-white/5 text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAction(key)}
              className={`rounded-lg px-3 py-1.5 text-xs ${action === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40"}`}
            >
              {wt(`assistant.actions.${key}`)}
            </button>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={() => void run()} disabled={loading}>
          <Sparkles className="mr-2 size-4" />
          {loading ? wt("assistant.running") : wt("assistant.runAnalysis")}
        </Button>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{wt("assistant.insights")}</p>
        {result ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm text-white/70">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">{wt("assistant.emptyResults")}</p>
        )}
      </div>
    </div>
  );
}
