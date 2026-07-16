"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Loader2,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardTextareaClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import type { SeoAnalyzeResult } from "@/lib/seo/analyzer";
import type { SeoHealthReport } from "@/lib/seo/health";

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_COLOR = {
  pass: "text-emerald-400",
  warn: "text-amber-400",
  fail: "text-red-400",
} as const;

export function SeoHealthPanel() {
  const [report, setReport] = useState<SeoHealthReport | null>(null);
  const [analysis, setAnalysis] = useState<SeoAnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [analyzing, setAnalyzing] = useState(false);

  const [title, setTitle] = useState("AI Website Builder for Startups");
  const [description, setDescription] = useState(
    "Plan and generate startup website structure, messaging and launch direction with Trend Business AI.",
  );
  const [path, setPath] = useState("/use-cases/startup-website");
  const [content, setContent] = useState("");
  const [useAi, setUseAi] = useState(false);

  const loadHealth = useCallback(() => {
    startTransition(async () => {
      try {
        setError(null);
        const res = await fetch("/api/seo/health");
        if (!res.ok) {
          setError("Failed to load SEO health report.");
          return;
        }
        const data = await res.json();
        setReport(data.report as SeoHealthReport);
      } catch {
        setError("Failed to load SEO health report.");
      }
    });
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  async function runAnalyzer() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          path,
          content: content || undefined,
          hasCanonical: true,
          hasOpenGraph: true,
          hasTwitterCard: true,
          hasJsonLd: true,
          hasH1: true,
          internalLinkCount: 4,
          useAi,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analyzer failed.");
        return;
      }
      setAnalysis(data.analysis as SeoAnalyzeResult);
    } catch {
      setError("Analyzer request failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <DashboardPanel className="border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </DashboardPanel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Gauge className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">
            {report?.score ?? (pending ? "…" : "—")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Health score
          </span>
        </DashboardPanel>
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Activity className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">
            {report?.counts.sitemapUrls ?? "—"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Sitemap URLs
          </span>
        </DashboardPanel>
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Search className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">
            {report?.counts.publicRoutes ?? "—"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Public routes
          </span>
        </DashboardPanel>
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Sparkles className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">
            {report?.counts.programmaticPublished ?? "—"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Programmatic pages
          </span>
        </DashboardPanel>
      </div>

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Sitewide SEO checks</DashboardCardTitle>
          <DashboardCardDescription>
            Coverage across sitemaps, content registries, analytics and hreflang foundations.
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {!report ? (
            <div className="flex items-center gap-2 py-8 text-sm text-white/40">
              <Loader2 className="size-4 animate-spin" /> Loading health report…
            </div>
          ) : (
            <ul className="space-y-3">
              {report.checks.map((check) => {
                const Icon = STATUS_ICON[check.status];
                return (
                  <li
                    key={check.id}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                  >
                    <Icon className={cn("mt-0.5 size-4 shrink-0", STATUS_COLOR[check.status])} />
                    <div>
                      <p className="text-sm font-medium text-white/90">{check.label}</p>
                      <p className="mt-0.5 text-xs text-white/40">{check.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {report?.recommendations?.length ? (
            <div className="mt-6 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                Recommendations
              </p>
              {report.recommendations.map((item) => (
                <p key={item} className="text-xs text-white/55">
                  • {item}
                </p>
              ))}
            </div>
          ) : null}
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>AI SEO Analyzer</DashboardCardTitle>
          <DashboardCardDescription>
            Score titles, descriptions and page signals. Optionally enrich with AI recommendations.
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5 text-xs text-white/50">
              Title
              <input
                className={dashboardInputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="space-y-1.5 text-xs text-white/50">
              Path
              <input
                className={dashboardInputClass}
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-xs text-white/50">
            Meta description
            <textarea
              className={cn(dashboardTextareaClass, "min-h-[72px]")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-xs text-white/50">
            Content sample (optional)
            <textarea
              className={cn(dashboardTextareaClass, "min-h-[96px]")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste page body text for thin-content and keyword checks…"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="rounded border-white/20"
              />
              Enrich with AI insights
            </label>
            <button
              type="button"
              onClick={runAnalyzer}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black transition hover:brightness-110 disabled:opacity-60"
            >
              {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Analyze
            </button>
          </div>

          {analysis && (
            <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-white">{analysis.score}</span>
                <span className="pb-1 text-sm text-white/50">
                  Grade {analysis.grade} · {analysis.source}
                </span>
              </div>
              {analysis.strengths.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">
                    Strengths
                  </p>
                  <ul className="mt-2 space-y-1">
                    {analysis.strengths.map((item) => (
                      <li key={item} className="text-xs text-white/55">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.issues.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">
                    Issues
                  </p>
                  <ul className="mt-2 space-y-2">
                    {analysis.issues.map((issue) => (
                      <li key={issue.id} className="text-xs text-white/60">
                        <span className="font-semibold text-white/80">[{issue.severity}]</span>{" "}
                        {issue.message} — {issue.recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                    Suggested title
                  </p>
                  <p className="mt-1 text-sm text-white/80">{analysis.suggestions.title}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                    Suggested description
                  </p>
                  <p className="mt-1 text-sm text-white/80">{analysis.suggestions.description}</p>
                </div>
              </div>
              {analysis.aiInsights && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-premium-gold-light">
                    AI insights
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                    {analysis.aiInsights}
                  </p>
                </div>
              )}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
