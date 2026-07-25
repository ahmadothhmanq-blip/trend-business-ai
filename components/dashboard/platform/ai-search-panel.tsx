"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  FileJson2,
  Gauge,
  Layers3,
  Lightbulb,
  Loader2,
  Radar,
  Search,
  Sparkles,
  Swords,
  TrendingUp,
  Wand2,
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
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";
import type {
  AeoAnalyzeResult,
  AiSearchDashboardPayload,
  ContentOptimizeResult,
  GeoAnalyzeResult,
  SchemaValidationResult,
} from "@/types/ai-search";

type TabId =
  | "visibility"
  | "aeo"
  | "geo"
  | "schema"
  | "optimize"
  | "analytics"
  | "programmatic"
  | "knowledge"
  | "competitors"
  | "recommendations";

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

function ScoreTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <DashboardPanel gold className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-premium-gold-light/80">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </DashboardPanel>
  );
}

export function AiSearchPanel() {
  const wt = useWorkspaceT("platform");
  const [tab, setTab] = useState<TabId>("visibility");
  const [data, setData] = useState<AiSearchDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("AI Website Builder for Startups");
  const [description, setDescription] = useState(
    "Plan and generate startup website structure, messaging and launch direction with Trend Business AI.",
  );
  const [path, setPath] = useState("/use-cases/startup-website");
  const [content, setContent] = useState(
    "What is an AI website builder for startups?\nTrend Business AI helps founders define positioning, page architecture and conversion messaging before they build.\n\nHow does it work?\nDescribe your product, generate structured website plans, then refine in your authenticated dashboard.",
  );
  const [useAi, setUseAi] = useState(false);
  const [schemaJson, setSchemaJson] = useState("");

  const [aeoResult, setAeoResult] = useState<AeoAnalyzeResult | null>(null);
  const [geoResult, setGeoResult] = useState<GeoAnalyzeResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<SchemaValidationResult | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<ContentOptimizeResult | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/ai-search/dashboard");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? wt("aiSearch.loadFailed"));
      setData(null);
      return;
    }
    setData(json.dashboard as AiSearchDashboardPayload);
  }, [wt]);

  const tabs: Array<{ id: TabId; label: string; icon: typeof Radar }> = [
    { id: "visibility", label: wt("aiSearch.tabs.visibility"), icon: Gauge },
    { id: "aeo", label: wt("aiSearch.tabs.aeo"), icon: Search },
    { id: "geo", label: wt("aiSearch.tabs.geo"), icon: Brain },
    { id: "schema", label: wt("aiSearch.tabs.schema"), icon: FileJson2 },
    { id: "optimize", label: wt("aiSearch.tabs.optimize"), icon: Wand2 },
    { id: "analytics", label: wt("aiSearch.tabs.analytics"), icon: TrendingUp },
    { id: "programmatic", label: wt("aiSearch.tabs.programmatic"), icon: Layers3 },
    { id: "knowledge", label: wt("aiSearch.tabs.knowledge"), icon: BookOpen },
    { id: "competitors", label: wt("aiSearch.tabs.competitors"), icon: Swords },
    { id: "recommendations", label: wt("aiSearch.tabs.recommendations"), icon: Lightbulb },
  ];

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  async function runAnalyze(mode: "aeo" | "geo" | "schema" | "optimize") {
    setBusy(true);
    setError(null);
    try {
      let payload: Record<string, unknown> = { mode, useAi };
      if (mode === "schema") {
        let jsonLd: unknown;
        if (schemaJson.trim()) {
          try {
            jsonLd = JSON.parse(schemaJson);
          } catch {
            setError(wt("aiSearch.invalidSchemaJson"));
            return;
          }
        }
        payload = { mode, path, pageType: "generic", jsonLd };
      } else {
        payload = {
          mode,
          title,
          description,
          path,
          content,
          useAi,
          faqs:
            mode === "aeo"
              ? [
                  {
                    question: "What is Trend Business AI?",
                    answer:
                      "Trend Business AI is an authenticated AI business workspace for websites, branding, content and strategy.",
                  },
                ]
              : undefined,
          headings: content
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.endsWith("?") || l.length < 80)
            .slice(0, 8),
          internalLinkCount: 4,
          keywords: ["AI website builder", "startup"],
        };
      }

      const res = await fetch("/api/ai-search/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? wt("aiSearch.analyzeFailed"));
        return;
      }
      if (mode === "aeo") setAeoResult(json.result as AeoAnalyzeResult);
      if (mode === "geo") setGeoResult(json.result as GeoAnalyzeResult);
      if (mode === "schema") setSchemaResult(json.result as SchemaValidationResult);
      if (mode === "optimize") setOptimizeResult(json.result as ContentOptimizeResult);
    } catch {
      setError(wt("aiSearch.analyzeRequestFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white/60">
        <Loader2 className="size-5 animate-spin text-premium-gold" />
        {wt("aiSearch.loading")}
      </div>
    );
  }

  if (!data) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{wt("aiSearch.unavailable")}</DashboardCardTitle>
          <DashboardCardDescription>{error ?? wt("aiSearch.unableToLoad")}</DashboardCardDescription>
        </DashboardCardHeader>
      </DashboardCard>
    );
  }

  const { visibility, analytics, programmatic, knowledge, competitors, recommendations, readinessScore } =
    data;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition",
                active
                  ? "border-premium-gold/40 bg-premium-gold/15 text-premium-gold-light shadow-gold-sm"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:border-premium-gold/25 hover:text-white/80",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "visibility" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ScoreTile label={wt("aiSearch.visibility.aiVisibility")} value={visibility.scores.overall} hint={wt("common.grade", { grade: visibility.scores.grade })} />
            <ScoreTile label={wt("aiSearch.visibility.seo")} value={visibility.scores.seo} />
            <ScoreTile label={wt("aiSearch.visibility.aeo")} value={visibility.scores.aeo} />
            <ScoreTile label={wt("aiSearch.visibility.geo")} value={visibility.scores.geo} />
            <ScoreTile label={wt("aiSearch.visibility.technicalSeo")} value={visibility.scores.technical} />
            <ScoreTile label={wt("aiSearch.visibility.contentQuality")} value={visibility.scores.contentQuality} />
            <ScoreTile label={wt("aiSearch.visibility.structuredData")} value={visibility.scores.structuredData} />
            <ScoreTile label={wt("aiSearch.visibility.aiSearchReadiness")} value={readinessScore} hint={visibility.siteUrl} />
          </div>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle className="flex items-center gap-2">
                <Radar className="size-4 text-premium-gold" /> {wt("aiSearch.visibility.engineCoverage")}
              </DashboardCardTitle>
              <DashboardCardDescription>
                {wt("aiSearch.visibility.engineCoverageDescription")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="grid gap-3 md:grid-cols-2">
              {visibility.engineCoverage.map((engine) => {
                const Icon = STATUS_ICON[engine.status];
                return (
                  <div
                    key={engine.engine}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{engine.engine}</p>
                      <span className={cn("inline-flex items-center gap-1 text-sm", STATUS_COLOR[engine.status])}>
                        <Icon className="size-3.5" />
                        {engine.readiness}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/50">{engine.notes}</p>
                  </div>
                );
              })}
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("aiSearch.visibility.visibilityChecks")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2">
              {visibility.checks.slice(0, 18).map((check) => {
                const Icon = STATUS_ICON[check.status];
                return (
                  <div
                    key={check.id}
                    className="flex items-start gap-3 rounded-lg border border-white/8 bg-black/20 px-3 py-2.5"
                  >
                    <Icon className={cn("mt-0.5 size-4 shrink-0", STATUS_COLOR[check.status])} />
                    <div>
                      <p className="text-sm text-white">{check.label}</p>
                      <p className="text-xs text-white/45">{check.detail}</p>
                    </div>
                  </div>
                );
              })}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {(tab === "aeo" || tab === "geo" || tab === "optimize") && (
        <div className="space-y-6">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>
                {tab === "aeo" ? wt("aiSearch.analyzer.aeoTitle") : tab === "geo" ? wt("aiSearch.analyzer.geoTitle") : wt("aiSearch.analyzer.optimizeTitle")}
              </DashboardCardTitle>
              <DashboardCardDescription>
                {tab === "aeo"
                  ? wt("aiSearch.analyzer.aeoDescription")
                  : tab === "geo"
                    ? wt("aiSearch.analyzer.geoDescription")
                    : wt("aiSearch.analyzer.optimizeDescription")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <input className={dashboardInputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={wt("aiSearch.analyzer.titlePlaceholder")} />
              <input className={dashboardInputClass} value={path} onChange={(e) => setPath(e.target.value)} placeholder={wt("aiSearch.analyzer.pathPlaceholder")} />
              <textarea
                className={dashboardTextareaClass}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={wt("aiSearch.analyzer.metaDescriptionPlaceholder")}
              />
              <textarea
                className={dashboardTextareaClass}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={wt("aiSearch.analyzer.pageContentPlaceholder")}
              />
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
                {wt("aiSearch.analyzer.enrichWithAi")}
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAnalyze(tab === "optimize" ? "optimize" : tab)}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {tab === "optimize" ? wt("aiSearch.analyzer.runOptimizer") : wt("aiSearch.analyzer.runMode", { mode: tab.toUpperCase() })}
              </button>
            </DashboardCardContent>
          </DashboardCard>

          {tab === "aeo" && aeoResult && (
            <ResultScoreCard
              wt={wt}
              title={wt("aiSearch.results.aeoResult")}
              score={aeoResult.score}
              grade={aeoResult.grade}
              strengths={aeoResult.strengths}
              issues={aeoResult.issues}
              recommendations={aeoResult.recommendations}
              aiInsights={aeoResult.aiInsights}
              metrics={Object.entries(aeoResult.metrics).map(([k, v]) => `${k}: ${String(v)}`)}
            />
          )}
          {tab === "geo" && geoResult && (
            <ResultScoreCard
              wt={wt}
              title={wt("aiSearch.results.geoResult")}
              score={geoResult.score}
              grade={geoResult.grade}
              strengths={geoResult.strengths}
              issues={geoResult.issues}
              recommendations={geoResult.recommendations}
              aiInsights={geoResult.aiInsights}
              metrics={[
                ...Object.entries(geoResult.metrics).map(([k, v]) => `${k}: ${String(v)}`),
                `entities: ${geoResult.entitiesDetected.join(", ") || wt("aiSearch.results.noneDetected")}`,
                `clusters: ${geoResult.topicClusters.join(", ")}`,
              ]}
            />
          )}
          {tab === "optimize" && optimizeResult && (
            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>{wt("aiSearch.results.optimizedOutputs", { source: optimizeResult.source })}</DashboardCardTitle>
              </DashboardCardHeader>
              <DashboardCardContent className="space-y-4 text-sm">
                <Field label={wt("aiSearch.results.seoTitle")} value={optimizeResult.title} />
                <Field label={wt("aiSearch.results.metaDescription")} value={optimizeResult.metaDescription} />
                <Field label={wt("aiSearch.results.openGraphTitle")} value={optimizeResult.openGraph.title} />
                <Field label={wt("aiSearch.results.openGraphDescription")} value={optimizeResult.openGraph.description} />
                <Field label={wt("aiSearch.results.aiSummary")} value={optimizeResult.aiSummary} />
                <Field label={wt("aiSearch.results.cta")} value={optimizeResult.callToAction} />
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">{wt("aiSearch.results.faq")}</p>
                  <ul className="space-y-2">
                    {optimizeResult.faq.map((f) => (
                      <li key={f.question} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="font-medium text-white">{f.question}</p>
                        <p className="mt-1 text-white/55">{f.answer}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">{wt("aiSearch.results.internalLinks")}</p>
                  <ul className="space-y-1 text-white/70">
                    {optimizeResult.internalLinks.map((l) => (
                      <li key={l.href}>
                        <span className="text-premium-gold-light">{l.label}</span> — {l.href}
                      </li>
                    ))}
                  </ul>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/70">
                  {JSON.stringify(optimizeResult.schema, null, 2)}
                </pre>
              </DashboardCardContent>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "schema" && (
        <div className="space-y-6">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("aiSearch.schema.title")}</DashboardCardTitle>
              <DashboardCardDescription>
                {wt("aiSearch.schema.description")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <textarea
                className={dashboardTextareaClass}
                rows={8}
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                placeholder={wt("aiSearch.schema.jsonLdPlaceholder")}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAnalyze("schema")}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <FileJson2 className="size-4" />}
                {wt("aiSearch.schema.validate")}
              </button>
            </DashboardCardContent>
          </DashboardCard>

          {(schemaResult ?? null) && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <ScoreTile label={wt("aiSearch.schema.schemaScore")} value={schemaResult!.score} hint={wt("common.grade", { grade: schemaResult!.grade })} />
                <ScoreTile label={wt("aiSearch.schema.errors")} value={schemaResult!.errors.length} />
                <ScoreTile label={wt("aiSearch.schema.warnings")} value={schemaResult!.warnings.length} />
              </div>
              <DashboardCard>
                <DashboardCardHeader>
                  <DashboardCardTitle>{wt("aiSearch.schema.platformCoverage")}</DashboardCardTitle>
                </DashboardCardHeader>
                <DashboardCardContent className="grid gap-2 md:grid-cols-2">
                  {schemaResult!.platformCoverage.map((item) => {
                    const Icon = STATUS_ICON[item.status];
                    return (
                      <div key={item.type} className="flex gap-3 rounded-lg border border-white/10 p-3">
                        <Icon className={cn("mt-0.5 size-4", STATUS_COLOR[item.status])} />
                        <div>
                          <p className="text-sm text-white">{item.type}</p>
                          <p className="text-xs text-white/45">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </DashboardCardContent>
              </DashboardCard>
            </>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title={wt("aiSearch.analytics.mostSearchedTopics")} items={analytics.mostSearchedTopics.map((t) => wt("aiSearch.analytics.topicSignal", { topic: t.topic, signal: t.signal }))} emptyLabel={wt("common.noItems")} />
            <ListCard title={wt("aiSearch.analytics.topPerformingPages")} items={analytics.topPerformingPages.map((p) => wt("aiSearch.analytics.pageScore", { score: p.score, path: p.path }))} emptyLabel={wt("common.noItems")} />
            <ListCard title={wt("aiSearch.analytics.aiReadyPages")} items={analytics.aiReadyPages.map((p) => wt("aiSearch.analytics.pageTitle", { score: p.score, title: p.title }))} emptyLabel={wt("common.noItems")} />
            <ListCard title={wt("aiSearch.analytics.weakPages")} items={analytics.weakPages.map((p) => wt("aiSearch.analytics.pageScore", { score: p.score, path: p.path }))} emptyLabel={wt("common.noItems")} />
            <ListCard title={wt("aiSearch.analytics.contentOpportunities")} items={analytics.contentOpportunities.map((o) => wt("aiSearch.analytics.opportunity", { priority: o.priority, title: o.title }))} emptyLabel={wt("common.noItems")} />
            <ListCard title={wt("aiSearch.analytics.keywordOpportunities")} items={analytics.keywordOpportunities.map((k) => wt("aiSearch.analytics.keyword", { coverage: k.coverage, keyword: k.keyword }))} emptyLabel={wt("common.noItems")} />
          </div>
          <ListCard title={wt("aiSearch.analytics.searchTrends")} items={analytics.searchTrends.map((t) => wt("aiSearch.analytics.trend", { direction: t.direction.toUpperCase(), label: t.label, detail: t.detail }))} emptyLabel={wt("common.noItems")} />
        </div>
      )}

      {tab === "programmatic" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {programmatic.clusters.map((c) => (
              <ScoreTile key={c.id} label={c.label} value={c.published} hint={wt("aiSearch.programmatic.draftHint", { draft: c.draft })} />
            ))}
          </div>
          {programmatic.duplicates.length > 0 && (
            <ListCard
              title={wt("aiSearch.programmatic.duplicatePrevention")}
              items={programmatic.duplicates.map((d) => wt("aiSearch.programmatic.duplicateRow", { path: d.path, conflictWith: d.conflictWith, reason: d.reason }))}
              emptyLabel={wt("common.noItems")}
            />
          )}
          <ListCard title={wt("aiSearch.programmatic.qualityGates")} items={programmatic.qualityGates.map((g) => wt("aiSearch.programmatic.qualityGateRow", { status: g.status.toUpperCase(), label: g.label, detail: g.detail }))} emptyLabel={wt("common.noItems")} />
          <ListCard title={wt("aiSearch.programmatic.recommendations")} items={programmatic.recommendations} emptyLabel={wt("common.noItems")} />
        </div>
      )}

      {tab === "knowledge" && (
        <div className="space-y-6">
          <ListCard title={wt("aiSearch.knowledge.hubs")} items={knowledge.hubs.map((h) => wt("aiSearch.knowledge.hubRow", { title: h.title, path: h.path }))} emptyLabel={wt("common.noItems")} />
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(knowledge.byKind).map(([kind, bucket]) => (
              <ListCard
                key={kind}
                title={wt("aiSearch.knowledge.kindBucket", { kind, published: bucket.published, draft: bucket.draft })}
                items={
                  bucket.entries.length
                    ? bucket.entries.map((e) => wt("aiSearch.knowledge.entryRow", { status: e.status, title: e.title }))
                    : [wt("aiSearch.knowledge.noEntries")]
                }
                emptyLabel={wt("common.noItems")}
              />
            ))}
          </div>
          <ListCard title={wt("aiSearch.knowledge.gaps")} items={knowledge.gaps.map((g) => wt("aiSearch.knowledge.gapRow", { priority: g.priority, kind: g.kind, message: g.message }))} emptyLabel={wt("common.noItems")} />
        </div>
      )}

      {tab === "competitors" && (
        <div className="space-y-6">
          <ListCard title={wt("aiSearch.competitors.ourCoverage")} items={competitors.ourCoverage} emptyLabel={wt("common.noItems")} />
          <div className="grid gap-4 lg:grid-cols-2">
            {competitors.competitors.map((c) => (
              <DashboardCard key={c.name}>
                <DashboardCardHeader>
                  <DashboardCardTitle>{c.name}</DashboardCardTitle>
                  <DashboardCardDescription>{c.category}</DashboardCardDescription>
                </DashboardCardHeader>
                <DashboardCardContent className="space-y-3 text-sm text-white/65">
                  <p><span className="text-premium-gold-light">{wt("aiSearch.competitors.overlap")}</span> {c.overlap.join(", ") || wt("common.none")}</p>
                  <p><span className="text-premium-gold-light">{wt("aiSearch.competitors.missingVsUs")}</span> {c.missingVsUs.slice(0, 5).join(", ")}</p>
                  <p><span className="text-premium-gold-light">{wt("aiSearch.competitors.opportunities")}</span> {c.opportunities.join(" · ") || wt("common.emDash")}</p>
                </DashboardCardContent>
              </DashboardCard>
            ))}
          </div>
          <ListCard title={wt("aiSearch.competitors.platformGaps")} items={competitors.platformGaps} emptyLabel={wt("common.noItems")} />
        </div>
      )}

      {tab === "recommendations" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-premium-gold" />
              {wt("aiSearch.recommendationsEngine.title")}
            </DashboardCardTitle>
            <DashboardCardDescription>
              {wt("aiSearch.recommendationsEngine.description")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-premium-gold/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-premium-gold-light">
                    {rec.priority}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-white/40">{rec.category}</span>
                </div>
                <p className="mt-2 font-medium text-white">{rec.title}</p>
                <p className="mt-1 text-sm text-white/55">{rec.detail}</p>
                {rec.actionHref ? (
                  <p className="mt-1 text-xs text-premium-gold-light/80">{rec.actionHref}</p>
                ) : null}
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-premium-gold-light/80">{label}</p>
      <p className="mt-1 text-white/80">{value}</p>
    </div>
  );
}

function ListCard({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{title}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent>
        <ul className="space-y-2 text-sm text-white/65">
          {items.length === 0 ? <li className="text-white/35">{emptyLabel}</li> : null}
          {items.map((item) => (
            <li key={item} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </DashboardCardContent>
    </DashboardCard>
  );
}

function ResultScoreCard({
  wt,
  title,
  score,
  grade,
  strengths,
  issues,
  recommendations,
  aiInsights,
  metrics,
}: {
  wt: ReturnType<typeof useWorkspaceT>;
  title: string;
  score: number;
  grade: string;
  strengths: string[];
  issues: Array<{ id: string; severity: string; message: string; recommendation: string }>;
  recommendations: string[];
  aiInsights?: string;
  metrics: string[];
}) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>
          {wt("aiSearch.results.scoreGrade", { title, score, grade })}
        </DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4 text-sm">
        <ListBlock label={wt("aiSearch.results.metrics")} items={metrics} />
        <ListBlock label={wt("aiSearch.results.strengths")} items={strengths} />
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">{wt("aiSearch.results.issues")}</p>
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li key={issue.id} className="rounded-lg border border-white/10 p-3">
                <p className="text-white">
                  <span className="text-premium-gold-light">[{issue.severity}]</span> {issue.message}
                </p>
                <p className="mt-1 text-white/50">{issue.recommendation}</p>
              </li>
            ))}
          </ul>
        </div>
        <ListBlock label={wt("aiSearch.results.recommendations")} items={recommendations} />
        {aiInsights ? <Field label={wt("aiSearch.results.aiInsights")} value={aiInsights} /> : null}
      </DashboardCardContent>
    </DashboardCard>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">{label}</p>
      <ul className="space-y-1 text-white/65">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
