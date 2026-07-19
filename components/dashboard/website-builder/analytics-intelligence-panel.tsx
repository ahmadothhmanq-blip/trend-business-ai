"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Loader2,
  MousePointerClick,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { WebsiteAnalyticsSummary } from "@/lib/ai-core/analytics";
import type { ConversionOptimizerReport } from "@/lib/ai-core/conversion-optimizer";

type AnalyticsResponse = {
  summary: WebsiteAnalyticsSummary;
  optimizer: ConversionOptimizerReport;
  projectName?: string;
};

export function AnalyticsIntelligencePanel(props: {
  generationId: string | null;
}) {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/analytics?days=14`,
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Failed to load analytics");
      }
      setData((await res.json()) as AnalyticsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        Generate or select a website to open analytics.
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-[420px] items-center gap-2 justify-center text-white/40">
        <Loader2 className="size-4 animate-spin" />
        Loading analytics intelligence…
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

  const { summary, optimizer } = data;
  const maxViews = Math.max(...summary.series.map((s) => s.pageViews), 1);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
            <BarChart3 className="size-3" />
            Analytics Engine
          </div>
          <h3 className="text-lg font-bold text-white">
            {data.projectName || "Website"} performance
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            Page views, visitors, sessions, clicks, conversions, traffic sources,
            and devices — with AI conversion recommendations.
            {summary.seeded ? " Includes seeded baseline traffic until live events accumulate." : null}
          </p>
        </div>
        <div className="rounded-xl border border-premium-gold/30 bg-premium-gold/10 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-premium-gold">
            Conversion score
          </p>
          <p className="text-2xl font-bold text-white">{optimizer.overallScore}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Unique visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          hint={`${summary.sessions.toLocaleString()} sessions`}
        />
        <MetricCard
          icon={BarChart3}
          label="Page views"
          value={summary.pageViews.toLocaleString()}
          hint={`${summary.avgSessionPages} pages / session`}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Button clicks"
          value={summary.buttonClicks.toLocaleString()}
          hint={`${summary.bounceRate}% bounce`}
        />
        <MetricCard
          icon={Target}
          label="Conversions"
          value={summary.conversions.toLocaleString()}
          hint={`${summary.conversionRate}% CR`}
        />
      </div>

      <DashboardPanel className="p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-white">Performance (14 days)</h4>
        <div className="mt-4 flex h-36 items-end gap-1">
          {summary.series.map((point) => (
            <div
              key={point.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${point.date}: ${point.pageViews} views · ${point.conversions} conv`}
            >
              <div
                className="w-full max-w-[18px] rounded-t bg-gradient-to-t from-premium-gold/40 to-premium-gold transition-all"
                style={{
                  height: `${Math.max(8, (point.pageViews / maxViews) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/30">
          <span>{summary.series[0]?.date}</span>
          <span>{summary.series[summary.series.length - 1]?.date}</span>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownPanel title="Traffic sources" items={summary.trafficSources} />
        <BreakdownPanel title="Devices" items={summary.devices} />
        <BreakdownPanel title="Top pages" items={summary.topPages} />
        <BreakdownPanel title="Top buttons" items={summary.topButtons} />
      </div>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-premium-gold" />
          <h4 className="text-sm font-semibold text-white">
            AI conversion recommendations
          </h4>
        </div>
        <p className="mb-4 text-[12px] text-white/45">{optimizer.summary}</p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SuggestionList title="Better CTA text" items={optimizer.betterCtaSuggestions} />
          <SuggestionList title="Layout" items={optimizer.layoutSuggestions} />
          <SuggestionList title="Missing trust" items={optimizer.missingTrustSections} />
          <SuggestionList title="SEO" items={optimizer.seoImprovements} />
          <SuggestionList title="UX" items={optimizer.uxImprovements} />
        </div>

        <div className="space-y-2">
          {optimizer.insights.map((ins) => (
            <div
              key={ins.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityPill severity={ins.severity} />
                <span className="text-[10px] uppercase tracking-wide text-white/35">
                  {ins.category}
                </span>
                <p className="text-[13px] font-semibold text-white">{ins.title}</p>
              </div>
              <p className="mt-1 text-[12px] text-white/45">{ins.detail}</p>
              <p className="mt-1 text-[12px] text-premium-gold/90">{ins.suggestion}</p>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

function MetricCard(props: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
}) {
  const Icon = props.icon;
  return (
    <DashboardPanel className="p-4">
      <div className="flex items-center gap-2 text-white/40">
        <Icon className="size-3.5" />
        <p className="text-[11px] font-medium">{props.label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{props.value}</p>
      <p className="mt-0.5 text-[11px] text-white/35">{props.hint}</p>
    </DashboardPanel>
  );
}

function BreakdownPanel(props: {
  title: string;
  items: Array<{ key: string; label: string; count: number; share: number }>;
}) {
  return (
    <DashboardPanel className="p-4">
      <h4 className="text-sm font-semibold text-white">{props.title}</h4>
      <div className="mt-3 space-y-2">
        {props.items.length === 0 ? (
          <p className="text-[12px] text-white/35">No data yet</p>
        ) : (
          props.items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex justify-between text-[11px] text-white/55">
                <span>{item.label}</span>
                <span>
                  {item.count} · {item.share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-premium-gold/70"
                  style={{ width: `${Math.min(100, item.share)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardPanel>
  );
}

function SuggestionList(props: { title: string; items: string[] }) {
  if (!props.items.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
        {props.title}
      </p>
      <ul className="mt-2 space-y-1.5 text-[12px] text-white/60">
        {props.items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function SeverityPill(props: { severity: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        props.severity === "high" && "bg-red-500/20 text-red-300",
        props.severity === "medium" && "bg-amber-500/20 text-amber-200",
        props.severity === "low" && "bg-white/10 text-white/50",
      )}
    >
      {props.severity}
    </span>
  );
}
