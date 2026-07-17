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

const TABS: Array<{ id: TabId; label: string; icon: typeof Radar }> = [
  { id: "visibility", label: "Visibility", icon: Gauge },
  { id: "aeo", label: "AEO", icon: Search },
  { id: "geo", label: "GEO", icon: Brain },
  { id: "schema", label: "Schema", icon: FileJson2 },
  { id: "optimize", label: "Optimizer", icon: Wand2 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "programmatic", label: "Programmatic", icon: Layers3 },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "competitors", label: "Competitors", icon: Swords },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
];

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
      setError(json.error ?? "Failed to load AI Search Center");
      setData(null);
      return;
    }
    setData(json.dashboard as AiSearchDashboardPayload);
  }, []);

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
            setError("Schema JSON is invalid.");
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
        setError(json.error ?? "Analyze failed");
        return;
      }
      if (mode === "aeo") setAeoResult(json.result as AeoAnalyzeResult);
      if (mode === "geo") setGeoResult(json.result as GeoAnalyzeResult);
      if (mode === "schema") setSchemaResult(json.result as SchemaValidationResult);
      if (mode === "optimize") setOptimizeResult(json.result as ContentOptimizeResult);
    } catch {
      setError("Analyze request failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white/60">
        <Loader2 className="size-5 animate-spin text-premium-gold" />
        Loading AI Search Center…
      </div>
    );
  }

  if (!data) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>AI Search Center unavailable</DashboardCardTitle>
          <DashboardCardDescription>{error ?? "Unable to load dashboard."}</DashboardCardDescription>
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
        {TABS.map((item) => {
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
            <ScoreTile label="AI Visibility" value={visibility.scores.overall} hint={`Grade ${visibility.scores.grade}`} />
            <ScoreTile label="SEO" value={visibility.scores.seo} />
            <ScoreTile label="AEO" value={visibility.scores.aeo} />
            <ScoreTile label="GEO" value={visibility.scores.geo} />
            <ScoreTile label="Technical SEO" value={visibility.scores.technical} />
            <ScoreTile label="Content Quality" value={visibility.scores.contentQuality} />
            <ScoreTile label="Structured Data" value={visibility.scores.structuredData} />
            <ScoreTile label="AI Search Readiness" value={readinessScore} hint={visibility.siteUrl} />
          </div>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle className="flex items-center gap-2">
                <Radar className="size-4 text-premium-gold" /> Engine coverage
              </DashboardCardTitle>
              <DashboardCardDescription>
                Readiness for Google, AI Mode, ChatGPT, Gemini, Claude, Perplexity and Copilot
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
              <DashboardCardTitle>Visibility checks</DashboardCardTitle>
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
                {tab === "aeo" ? "AEO Analyzer" : tab === "geo" ? "GEO Analyzer" : "AI Content Optimizer"}
              </DashboardCardTitle>
              <DashboardCardDescription>
                {tab === "aeo"
                  ? "Answer Engine Optimization for FAQs, direct answers and question coverage"
                  : tab === "geo"
                    ? "Generative Engine Optimization for entities, clusters and citation readiness"
                    : "Generate SEO title, meta, OpenGraph, FAQ, schema, summary, CTA and internal links"}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <input className={dashboardInputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <input className={dashboardInputClass} value={path} onChange={(e) => setPath(e.target.value)} placeholder="/path" />
              <textarea
                className={dashboardTextareaClass}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meta description"
              />
              <textarea
                className={dashboardTextareaClass}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Page content"
              />
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
                Enrich with AI insights (uses AI quota)
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAnalyze(tab === "optimize" ? "optimize" : tab)}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Run {tab === "optimize" ? "Optimizer" : tab.toUpperCase()}
              </button>
            </DashboardCardContent>
          </DashboardCard>

          {tab === "aeo" && aeoResult && (
            <ResultScoreCard
              title="AEO result"
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
              title="GEO result"
              score={geoResult.score}
              grade={geoResult.grade}
              strengths={geoResult.strengths}
              issues={geoResult.issues}
              recommendations={geoResult.recommendations}
              aiInsights={geoResult.aiInsights}
              metrics={[
                ...Object.entries(geoResult.metrics).map(([k, v]) => `${k}: ${String(v)}`),
                `entities: ${geoResult.entitiesDetected.join(", ") || "none"}`,
                `clusters: ${geoResult.topicClusters.join(", ")}`,
              ]}
            />
          )}
          {tab === "optimize" && optimizeResult && (
            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>Optimized outputs ({optimizeResult.source})</DashboardCardTitle>
              </DashboardCardHeader>
              <DashboardCardContent className="space-y-4 text-sm">
                <Field label="SEO Title" value={optimizeResult.title} />
                <Field label="Meta Description" value={optimizeResult.metaDescription} />
                <Field label="OpenGraph Title" value={optimizeResult.openGraph.title} />
                <Field label="OpenGraph Description" value={optimizeResult.openGraph.description} />
                <Field label="AI Summary" value={optimizeResult.aiSummary} />
                <Field label="CTA" value={optimizeResult.callToAction} />
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">FAQ</p>
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
                  <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">Internal links</p>
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
              <DashboardCardTitle>Schema Validator</DashboardCardTitle>
              <DashboardCardDescription>
                Validate Organization, Product, SoftwareApplication, FAQ, Article, Breadcrumb, WebSite, SearchAction, HowTo and Review
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <textarea
                className={dashboardTextareaClass}
                rows={8}
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                placeholder='Optional page JSON-LD… e.g. { "@type": "FAQPage", "mainEntity": [] }'
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAnalyze("schema")}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <FileJson2 className="size-4" />}
                Validate schema
              </button>
            </DashboardCardContent>
          </DashboardCard>

          {(schemaResult ?? null) && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <ScoreTile label="Schema score" value={schemaResult!.score} hint={`Grade ${schemaResult!.grade}`} />
                <ScoreTile label="Errors" value={schemaResult!.errors.length} />
                <ScoreTile label="Warnings" value={schemaResult!.warnings.length} />
              </div>
              <DashboardCard>
                <DashboardCardHeader>
                  <DashboardCardTitle>Platform coverage</DashboardCardTitle>
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
            <ListCard title="Most searched topics" items={analytics.mostSearchedTopics.map((t) => `${t.topic} · signal ${t.signal}`)} />
            <ListCard title="Top performing pages" items={analytics.topPerformingPages.map((p) => `${p.score} · ${p.path}`)} />
            <ListCard title="AI-ready pages" items={analytics.aiReadyPages.map((p) => `${p.score} · ${p.title}`)} />
            <ListCard title="Weak pages" items={analytics.weakPages.map((p) => `${p.score} · ${p.path}`)} />
            <ListCard title="Content opportunities" items={analytics.contentOpportunities.map((o) => `[${o.priority}] ${o.title}`)} />
            <ListCard title="Keyword opportunities" items={analytics.keywordOpportunities.map((k) => `${k.coverage} · ${k.keyword}`)} />
          </div>
          <ListCard title="Search trends" items={analytics.searchTrends.map((t) => `${t.direction.toUpperCase()} · ${t.label}: ${t.detail}`)} />
        </div>
      )}

      {tab === "programmatic" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {programmatic.clusters.map((c) => (
              <ScoreTile key={c.id} label={c.label} value={c.published} hint={`${c.draft} draft`} />
            ))}
          </div>
          {programmatic.duplicates.length > 0 && (
            <ListCard
              title="Duplicate / conflict prevention"
              items={programmatic.duplicates.map((d) => `${d.path} ↔ ${d.conflictWith}: ${d.reason}`)}
            />
          )}
          <ListCard title="Quality gates" items={programmatic.qualityGates.map((g) => `${g.status.toUpperCase()} · ${g.label}: ${g.detail}`)} />
          <ListCard title="Recommendations" items={programmatic.recommendations} />
        </div>
      )}

      {tab === "knowledge" && (
        <div className="space-y-6">
          <ListCard title="Knowledge hubs" items={knowledge.hubs.map((h) => `${h.title} · ${h.path}`)} />
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(knowledge.byKind).map(([kind, bucket]) => (
              <ListCard
                key={kind}
                title={`${kind} (${bucket.published} published / ${bucket.draft} draft)`}
                items={
                  bucket.entries.length
                    ? bucket.entries.map((e) => `${e.status} · ${e.title}`)
                    : ["No entries yet"]
                }
              />
            ))}
          </div>
          <ListCard title="Gaps" items={knowledge.gaps.map((g) => `[${g.priority}] ${g.kind}: ${g.message}`)} />
        </div>
      )}

      {tab === "competitors" && (
        <div className="space-y-6">
          <ListCard title="Our coverage" items={competitors.ourCoverage} />
          <div className="grid gap-4 lg:grid-cols-2">
            {competitors.competitors.map((c) => (
              <DashboardCard key={c.name}>
                <DashboardCardHeader>
                  <DashboardCardTitle>{c.name}</DashboardCardTitle>
                  <DashboardCardDescription>{c.category}</DashboardCardDescription>
                </DashboardCardHeader>
                <DashboardCardContent className="space-y-3 text-sm text-white/65">
                  <p><span className="text-premium-gold-light">Overlap:</span> {c.overlap.join(", ") || "None"}</p>
                  <p><span className="text-premium-gold-light">Missing vs us:</span> {c.missingVsUs.slice(0, 5).join(", ")}</p>
                  <p><span className="text-premium-gold-light">Opportunities:</span> {c.opportunities.join(" · ") || "—"}</p>
                </DashboardCardContent>
              </DashboardCard>
            ))}
          </div>
          <ListCard title="Platform gaps" items={competitors.platformGaps} />
        </div>
      )}

      {tab === "recommendations" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-premium-gold" />
              AI Recommendations Engine
            </DashboardCardTitle>
            <DashboardCardDescription>
              Continuous suggestions from visibility, schema, programmatic, knowledge and competitor intelligence
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

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{title}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent>
        <ul className="space-y-2 text-sm text-white/65">
          {items.length === 0 ? <li className="text-white/35">No items</li> : null}
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
  title,
  score,
  grade,
  strengths,
  issues,
  recommendations,
  aiInsights,
  metrics,
}: {
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
          {title}: {score}/100 ({grade})
        </DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4 text-sm">
        <ListBlock label="Metrics" items={metrics} />
        <ListBlock label="Strengths" items={strengths} />
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-premium-gold-light/80">Issues</p>
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
        <ListBlock label="Recommendations" items={recommendations} />
        {aiInsights ? <Field label="AI insights" value={aiInsights} /> : null}
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
