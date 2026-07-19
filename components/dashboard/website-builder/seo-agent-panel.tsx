"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  SearchCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { SeoAgentReport } from "@/lib/ai-core/seo-agent";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

type SeoResponse = {
  report: SeoAgentReport;
  projectName?: string;
};

export function SeoAgentPanel(props: {
  generationId: string | null;
  onApplied?: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
}) {
  const [data, setData] = useState<SeoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/seo`,
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Failed to load SEO Agent");
      }
      setData((await res.json()) as SeoResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEO");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFix = async (fixId: string) => {
    if (!props.generationId) return;
    setApplyingId(fixId);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/seo/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fixId, applyEditor: true }),
        },
      );
      const body = (await res.json()) as {
        error?: string;
        message?: string;
        report?: SeoAgentReport;
        project?: GeneratedWebsiteProject;
        generation?: WebsiteGeneration;
      };
      if (!res.ok) throw new Error(body.error || "Apply failed");
      if (body.report) {
        setData({
          report: body.report,
          projectName: data?.projectName,
        });
      }
      if (body.project && body.generation && props.onApplied) {
        props.onApplied({
          project: body.project,
          generation: body.generation,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setApplyingId(null);
    }
  };

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        Generate or select a website to open the AI SEO Agent.
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center gap-2 text-white/40">
        <Loader2 className="size-4 animate-spin" />
        Running AI SEO Agent…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-red-400/80">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { report } = data;
  const { analysis, optimizer, aiSearch } = report;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
            <SearchCheck className="size-3" />
            AI SEO Agent
          </div>
          <h3 className="text-lg font-bold text-white">
            {data.projectName || "Website"} SEO intelligence
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            Google Search, AI Overviews, ChatGPT Search, Gemini, and Perplexity —
            titles, meta, headings, keywords, schema, and Apply Fix actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white/15 text-white"
            disabled={loading}
            onClick={() => void load()}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Re-analyze
          </Button>
          <div className="rounded-xl border border-premium-gold/30 bg-premium-gold/10 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-premium-gold">
              SEO Score
            </p>
            <p className="text-2xl font-bold text-white">{report.seoScore}</p>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-white/50">{report.summary}</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {analysis.areaScores.slice(0, 8).map((area) => (
          <DashboardPanel key={area.area} className="p-3">
            <p className="text-[11px] text-white/40">{area.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{area.score}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-premium-gold/70"
                style={{ width: `${area.score}%` }}
              />
            </div>
          </DashboardPanel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel className="p-4">
          <h4 className="text-sm font-semibold text-white">Optimized assets</h4>
          <dl className="mt-3 space-y-2 text-[12px]">
            <div>
              <dt className="text-white/35">SEO title</dt>
              <dd className="text-white/80">{optimizer.assets.seoTitle}</dd>
            </div>
            <div>
              <dt className="text-white/35">Meta description</dt>
              <dd className="text-white/70">{optimizer.assets.metaDescription}</dd>
            </div>
            <div>
              <dt className="text-white/35">Target keywords</dt>
              <dd className="text-white/70">
                {optimizer.assets.targetKeywords.slice(0, 8).join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="text-white/35">Schema</dt>
              <dd className="text-white/70">
                {optimizer.assets.structuredDataTypes.join(", ")}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Blog / content suggestions
            </p>
            <ul className="mt-2 space-y-1 text-[12px] text-white/55">
              {optimizer.assets.blogSuggestions.slice(0, 4).map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
        </DashboardPanel>

        <DashboardPanel className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">AI Search optimization</h4>
            <span className="text-[12px] font-semibold text-premium-gold">
              {aiSearch.readinessScore}/100
            </span>
          </div>
          <p className="mt-2 text-[12px] text-white/45">{aiSearch.summary}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Targets
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {aiSearch.targets.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Entity optimization
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-white/55">
            {aiSearch.entityOptimization.slice(0, 4).map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Brand knowledge signals
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-white/55">
            {aiSearch.brandKnowledgeSignals.slice(0, 4).map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </DashboardPanel>
      </div>

      <DashboardPanel className="p-4">
        <h4 className="text-sm font-semibold text-white">Keyword tracking</h4>
        <div className="mt-3 space-y-2">
          {report.keywordTracking.map((kw) => (
            <div
              key={kw.keyword}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <div>
                <p className="text-[13px] font-medium text-white">{kw.keyword}</p>
                <p className="text-[11px] text-white/35">{kw.intent}</p>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="text-white/60">{kw.visibility}</span>
                {kw.trend === "up" ? (
                  <TrendingUp className="size-3.5 text-emerald-400" />
                ) : kw.trend === "down" ? (
                  <TrendingDown className="size-3.5 text-red-400" />
                ) : (
                  <Minus className="size-3.5 text-white/35" />
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-premium-gold" />
          <h4 className="text-sm font-semibold text-white">
            Issues & AI recommendations
          </h4>
        </div>
        {error ? (
          <p className="mb-3 text-[12px] text-red-400">{error}</p>
        ) : null}
        <div className="space-y-2">
          {report.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityPill severity={rec.severity} />
                  <span className="text-[10px] uppercase tracking-wide text-white/35">
                    {rec.source}
                  </span>
                  <p className="text-[13px] font-semibold text-white">{rec.title}</p>
                </div>
                <p className="mt-1 text-[12px] text-white/45">{rec.detail}</p>
              </div>
              {rec.fixId ? (
                <Button
                  size="sm"
                  className="shrink-0 bg-premium-gold text-black hover:bg-premium-gold/90"
                  disabled={applyingId === rec.fixId}
                  onClick={() => void applyFix(rec.fixId!)}
                >
                  {applyingId === rec.fixId ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Apply Fix
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            FAQ preview
          </p>
          <ul className="space-y-2 text-[12px] text-white/55">
            {optimizer.assets.faqItems.slice(0, 3).map((f) => (
              <li key={f.question}>
                <span className="font-medium text-white/75">{f.question}</span>
                <span className="block text-white/45">{f.answer}</span>
              </li>
            ))}
          </ul>
        </div>
      </DashboardPanel>
    </div>
  );
}

function SeverityPill(props: {
  severity: "critical" | "major" | "minor" | "opportunity";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        props.severity === "critical" && "bg-red-500/25 text-red-300",
        props.severity === "major" && "bg-orange-500/20 text-orange-200",
        props.severity === "minor" && "bg-amber-500/20 text-amber-200",
        props.severity === "opportunity" && "bg-white/10 text-white/50",
      )}
    >
      {props.severity}
    </span>
  );
}
