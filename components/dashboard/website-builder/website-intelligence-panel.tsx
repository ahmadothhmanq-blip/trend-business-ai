"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WebsiteIntelligenceReport } from "@/lib/ai-core/website-design-platform";

export function WebsiteIntelligencePanel(props: {
  generationId: string | null;
  disabled?: boolean;
  onApplySuggestion?: (command: string) => void;
}) {
  const [report, setReport] = useState<WebsiteIntelligenceReport | null>(null);
  const [performance, setPerformance] = useState<{
    score: number;
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/intelligence`,
      );
      const data = (await res.json()) as {
        error?: string;
        intelligence?: WebsiteIntelligenceReport;
        performance?: { score: number; recommendations: string[] };
      };
      if (!res.ok) throw new Error(data.error || "Failed to analyze");
      setReport(data.intelligence || null);
      setPerformance(data.performance || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [props.generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!props.generationId) {
    return (
      <p className="text-sm text-white/45">
        Generate a website to run Website Intelligence.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            Website Intelligence
          </p>
          <p className="text-[11px] text-white/35">
            Missing sections · layout · CTA · SEO · conversion
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/15 text-white"
          disabled={props.disabled || loading}
          onClick={() => void load()}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Re-analyze
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : null}

      {report ? (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div>
              <p className="text-[11px] text-white/40">Score</p>
              <p className="text-3xl font-semibold text-premium-gold">
                {report.score}
                <span className="text-base text-white/40">/100</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/40">Grade</p>
              <p className="text-2xl font-semibold text-white">{report.grade}</p>
            </div>
            {performance ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-white/40" />
                <div>
                  <p className="text-[11px] text-white/40">Performance</p>
                  <p className="text-lg font-semibold text-white">
                    {performance.score}/100
                  </p>
                </div>
              </div>
            ) : null}
            <p className="w-full text-[13px] text-white/55">{report.summary}</p>
          </div>

          {report.strengths.length ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Strengths
              </p>
              <div className="flex flex-wrap gap-1.5">
                {report.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {report.suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-white/[0.08] bg-black/20 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-white">
                      {s.title}
                    </p>
                    <p className="mt-1 text-[12px] text-white/45">
                      {s.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] uppercase",
                      s.priority === "high" || s.priority === "critical"
                        ? "bg-amber-500/15 text-amber-200"
                        : "bg-white/10 text-white/50",
                    )}
                  >
                    {s.priority}
                  </span>
                </div>
                {s.command && props.onApplySuggestion ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-white/15 text-white"
                    disabled={props.disabled}
                    onClick={() => props.onApplySuggestion?.(s.command!)}
                  >
                    Apply with AI
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : loading ? (
        <div className="flex items-center gap-2 py-8 text-white/40">
          <Loader2 className="size-4 animate-spin" />
          Analyzing website…
        </div>
      ) : null}
    </div>
  );
}
