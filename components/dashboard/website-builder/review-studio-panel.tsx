"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  History,
  Loader2,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";
import type { ReviewStudioResult, VersionComparison } from "@/lib/website/review-studio";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

type ReviewResponse = {
  review: ReviewStudioResult;
  projectName?: string;
  persistedState?: {
    versions: Array<{
      id: string;
      versionNumber: number;
      createdAt: string;
      improvementTitles: string[];
      qualityScores: { overall: number };
    }>;
  } | null;
};

type StudioView = "dashboard" | "improvements" | "versions" | "compare" | "reports";

const SCORE_KEYS = [
  { key: "overall", labelKey: "reviewStudio.scores.overall" },
  { key: "visualDesign", labelKey: "reviewStudio.scores.design" },
  { key: "userExperience", labelKey: "reviewStudio.scores.ux" },
  { key: "business", labelKey: "reviewStudio.scores.business" },
  { key: "seo", labelKey: "reviewStudio.scores.seo" },
  { key: "performance", labelKey: "reviewStudio.scores.performance" },
  { key: "accessibility", labelKey: "reviewStudio.scores.accessibility" },
  { key: "content", labelKey: "reviewStudio.scores.content" },
  { key: "localization", labelKey: "reviewStudio.scores.localization" },
] as const;

function priorityClass(priority: string): string {
  switch (priority) {
    case "critical":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "high":
      return "border-orange-500/40 bg-orange-500/10 text-orange-300";
    case "medium":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";
    case "low":
      return "border-blue-500/40 bg-blue-500/10 text-blue-300";
    default:
      return "border-white/15 bg-white/5 text-white/60";
  }
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  return (
    <DashboardPanel className="p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold", color)}>{score}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 75 ? "bg-emerald-500/70" : score >= 60 ? "bg-amber-500/70" : "bg-red-500/70",
          )}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </DashboardPanel>
  );
}

export function ReviewStudioPanel(props: {
  generationId: string | null;
  disabled?: boolean;
  onApplied?: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
}) {
  const { wb, dir } = useBuilderLocale();
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<StudioView>("dashboard");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [reportDialog, setReportDialog] = useState<
    "executive" | "technical" | "developer" | "benchmark" | null
  >(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/website-builder/${props.generationId}/review`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || wb("reviewStudio.failedLoad"));
      }
      setData((await res.json()) as ReviewResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : wb("reviewStudio.failedLoad"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId, wb]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = data?.review;
  const scores = review?.review.categoryScores;
  const improvements = review?.review.improvements ?? [];

  const versions = useMemo(() => {
    const live = review?.versions ?? [];
    const persisted = data?.persistedState?.versions ?? [];
    if (live.length > 0) return live;
    return persisted.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      createdAt: v.createdAt,
      improvementTitles: v.improvementTitles,
      qualityScores: v.qualityScores,
      sessionId: props.generationId ?? "",
      files: [],
      appliedImprovements: [],
    }));
  }, [review?.versions, data?.persistedState, props.generationId]);

  const toggleImprovement = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applySelected = async () => {
    if (!props.generationId || selectedIds.size === 0) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/review/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ improvementIds: [...selectedIds] }),
        },
      );
      const body = (await res.json()) as {
        error?: string;
        review?: ReviewStudioResult;
        comparison?: VersionComparison;
        project?: GeneratedWebsiteProject;
        generation?: WebsiteGeneration;
      };
      if (!res.ok) throw new Error(body.error || wb("reviewStudio.applyFailed"));
      if (body.review) setData({ review: body.review, projectName: data?.projectName });
      if (body.comparison) {
        setComparison(body.comparison);
        setView("compare");
      }
      setSelectedIds(new Set());
      if (body.project && body.generation && props.onApplied) {
        props.onApplied({ project: body.project, generation: body.generation });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : wb("reviewStudio.applyFailed"));
    } finally {
      setApplying(false);
    }
  };

  const rollback = async (versionId: string) => {
    if (!props.generationId) return;
    setRollingBack(versionId);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/review/rollback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId }),
        },
      );
      const body = (await res.json()) as {
        error?: string;
        review?: ReviewStudioResult;
        project?: GeneratedWebsiteProject;
        generation?: WebsiteGeneration;
      };
      if (!res.ok) throw new Error(body.error || wb("reviewStudio.rollbackFailed"));
      if (body.review) setData({ review: body.review, projectName: data?.projectName });
      if (body.project && body.generation && props.onApplied) {
        props.onApplied({ project: body.project, generation: body.generation });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : wb("reviewStudio.rollbackFailed"));
    } finally {
      setRollingBack(null);
    }
  };

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        {wb("reviewStudio.selectWebsite")}
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center gap-2 text-white/40">
        <Loader2 className="size-4 animate-spin" />
        {wb("reviewStudio.running")}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-3 text-sm text-red-400/80">
        <p>{error}</p>
        <Button variant="outline" className="border-white/15 text-white" onClick={() => void load()}>
          {wb("panels.reAnalyze")}
        </Button>
      </div>
    );
  }

  if (!review || !scores) return null;

  const navItems: { id: StudioView; label: string }[] = [
    { id: "dashboard", label: wb("reviewStudio.tabs.dashboard") },
    { id: "improvements", label: wb("reviewStudio.tabs.improvements") },
    { id: "versions", label: wb("reviewStudio.tabs.versions") },
    { id: "compare", label: wb("reviewStudio.tabs.compare") },
    { id: "reports", label: wb("reviewStudio.tabs.reports") },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6" dir={dir}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            <Sparkles className="size-3" />
            {wb("reviewStudio.badge")}
          </div>
          <h3 className="text-lg font-bold text-white">
            {wb("reviewStudio.title", { name: data?.projectName || wb("labels.website") })}
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            {review.review.insights.overallReview}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white/15 text-white"
            disabled={loading || props.disabled}
            onClick={() => void load()}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {wb("panels.reAnalyze")}
          </Button>
          <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
              {wb("reviewStudio.scores.overall")}
            </p>
            <p className="text-2xl font-bold text-white">{scores.overall}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              view === item.id
                ? "bg-white/10 text-white"
                : "text-white/45 hover:text-white/70",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
          {error}
        </div>
      ) : null}

      {view === "dashboard" ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SCORE_KEYS.map(({ key, labelKey }) => (
              <ScoreRing
                key={key}
                score={scores[key as keyof typeof scores]}
                label={wb(labelKey)}
              />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardPanel className="p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="size-4 text-emerald-400" />
                {wb("reviewStudio.strengths")}
              </h4>
              <ul className="mt-3 space-y-1.5 text-[12px] text-white/65">
                {review.review.insights.strengths.length > 0
                  ? review.review.insights.strengths.map((s) => <li key={s}>· {s}</li>)
                  : <li className="text-white/35">{wb("reviewStudio.noStrengths")}</li>}
              </ul>
            </DashboardPanel>
            <DashboardPanel className="p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="size-4 text-amber-400" />
                {wb("reviewStudio.weaknesses")}
              </h4>
              <ul className="mt-3 space-y-1.5 text-[12px] text-white/65">
                {review.review.insights.weaknesses.map((w) => (
                  <li key={w}>· {w}</li>
                ))}
              </ul>
            </DashboardPanel>
          </div>

          {review.review.expectedResults.length > 0 ? (
            <DashboardPanel className="p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp className="size-4 text-violet-400" />
                {wb("reviewStudio.estimatedGain")}
              </h4>
              <ul className="mt-3 space-y-1 text-[12px] text-white/55">
                {review.review.expectedResults.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </DashboardPanel>
          ) : null}
        </div>
      ) : null}

      {view === "improvements" ? (
        <div className="space-y-3">
          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-400/5 p-3">
              <span className="text-[12px] text-white/60">
                {wb("reviewStudio.selectedCount", { count: selectedIds.size })}
              </span>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500"
                disabled={applying || props.disabled}
                onClick={() => void applySelected()}
              >
                {applying ? <Loader2 className="size-4 animate-spin" /> : null}
                {wb("reviewStudio.applySelected")}
              </Button>
            </div>
          ) : null}

          {improvements.map((imp) => (
            <DashboardPanel key={imp.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                        priorityClass(imp.priority),
                      )}
                    >
                      {imp.priority}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-white/35">
                      {imp.area}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-white">{imp.title}</h4>
                  <p className="mt-1 text-[12px] text-white/50">{imp.description}</p>
                  <p className="mt-2 text-[12px] text-white/65">{imp.recommendation}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/40">
                    <span>+{imp.impact.qualityGain} {wb("reviewStudio.quality")}</span>
                    <span>+{imp.impact.seoGain} SEO</span>
                    <span>+{imp.impact.conversionGain} {wb("reviewStudio.conversion")}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {imp.impact.estimatedTimeMinutes}m
                    </span>
                    <span>{wb("reviewStudio.risk")}: {imp.impact.estimatedRisk}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={selectedIds.has(imp.id) ? "default" : "outline"}
                  className={cn(
                    "shrink-0",
                    selectedIds.has(imp.id)
                      ? "bg-violet-600 hover:bg-violet-500"
                      : "border-white/15 text-white",
                  )}
                  disabled={
                    imp.patchType === "targeted-regen" || applying || props.disabled
                  }
                  title={
                    imp.patchType === "targeted-regen"
                      ? wb("reviewStudio.targetedRegenHint")
                      : undefined
                  }
                  onClick={() => toggleImprovement(imp.id)}
                >
                  {selectedIds.has(imp.id)
                    ? wb("reviewStudio.selected")
                    : wb("reviewStudio.apply")}
                </Button>
              </div>
            </DashboardPanel>
          ))}
        </div>
      ) : null}

      {view === "versions" ? (
        <div className="space-y-2">
          {versions.length === 0 ? (
            <p className="text-[12px] text-white/40">{wb("reviewStudio.noVersions")}</p>
          ) : (
            versions.map((v, i) => (
              <DashboardPanel key={v.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {i > 0 ? <ChevronRight className="size-4 text-white/25" /> : null}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {wb("reviewStudio.version")} {v.versionNumber}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {new Date(v.createdAt).toLocaleString()} · {v.qualityScores.overall}/100
                    </p>
                    {v.improvementTitles?.length > 0 ? (
                      <p className="mt-1 text-[11px] text-white/50">
                        {v.improvementTitles.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  {v.versionNumber > 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 text-white"
                      disabled={rollingBack === v.id || props.disabled}
                      onClick={() => void rollback(v.id)}
                    >
                      {rollingBack === v.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      {wb("reviewStudio.rollback")}
                    </Button>
                  ) : null}
                </div>
              </DashboardPanel>
            ))
          )}
        </div>
      ) : null}

      {view === "compare" ? (
        <div className="space-y-4">
          {comparison ? (
            <>
              <DashboardPanel className="p-4">
                <p className="text-sm font-semibold text-white">{comparison.summary}</p>
                <p className="mt-2 text-2xl font-bold text-violet-300">
                  {comparison.qualityDifference >= 0 ? "+" : ""}
                  {comparison.qualityDifference} {wb("reviewStudio.points")}
                </p>
              </DashboardPanel>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "SEO", value: comparison.seoDifference },
                  { label: wb("reviewStudio.conversion"), value: comparison.conversionDifference },
                  { label: wb("reviewStudio.scores.accessibility"), value: comparison.accessibilityDifference },
                  { label: wb("reviewStudio.scores.performance"), value: comparison.performanceDifference },
                  { label: wb("reviewStudio.scores.content"), value: comparison.contentDifference },
                ].map((item) => (
                  <DashboardPanel key={item.label} className="p-3">
                    <p className="text-[11px] text-white/40">{item.label}</p>
                    <p className={cn("mt-1 text-lg font-bold", item.value >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {item.value >= 0 ? "+" : ""}{item.value}
                    </p>
                  </DashboardPanel>
                ))}
              </div>
              <DashboardPanel className="p-4">
                <h4 className="text-sm font-semibold text-white">{wb("reviewStudio.appliedChanges")}</h4>
                <ul className="mt-2 space-y-1 text-[12px] text-white/60">
                  {comparison.appliedChanges.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </DashboardPanel>
            </>
          ) : (
            <p className="text-[12px] text-white/40">{wb("reviewStudio.noComparison")}</p>
          )}
        </div>
      ) : null}

      {view === "reports" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { id: "executive" as const, label: wb("reviewStudio.reports.executive"), icon: FileText },
              { id: "technical" as const, label: wb("reviewStudio.reports.technical"), icon: Sparkles },
              { id: "developer" as const, label: wb("reviewStudio.reports.developer"), icon: History },
              { id: "benchmark" as const, label: wb("reviewStudio.reports.benchmark"), icon: TrendingUp },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setReportDialog(id)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-start transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5 text-violet-400" />
                <span className="text-sm font-medium text-white">{label}</span>
              </div>
              <ArrowRight className="size-4 text-white/30" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={reportDialog !== null} onOpenChange={() => setReportDialog(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-white/10 bg-[#141414]/95 text-white">
          <DialogHeader>
            <DialogTitle>
              {reportDialog === "executive"
                ? wb("reviewStudio.reports.executive")
                : reportDialog === "technical"
                  ? wb("reviewStudio.reports.technical")
                  : reportDialog === "developer"
                    ? wb("reviewStudio.reports.developer")
                    : wb("reviewStudio.reports.benchmark")}
            </DialogTitle>
            <DialogDescription className="text-white/45">
              {review.review.insights.overallReview}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-[12px] text-white/70">
            {reportDialog === "executive" ? (
              <>
                <p className="font-semibold text-white">{wb("reviewStudio.strengths")}</p>
                <ul>{review.review.insights.strengths.map((s) => <li key={s}>· {s}</li>)}</ul>
                <p className="font-semibold text-white">{wb("reviewStudio.weaknesses")}</p>
                <ul>{review.review.insights.weaknesses.map((w) => <li key={w}>· {w}</li>)}</ul>
                <p className="font-semibold text-white">{wb("reviewStudio.reports.priorityActions")}</p>
                <ul>
                  {improvements
                    .filter((i) => i.priority === "critical" || i.priority === "high")
                    .slice(0, 5)
                    .map((i) => (
                      <li key={i.id}>· {i.recommendation}</li>
                    ))}
                </ul>
              </>
            ) : null}
            {reportDialog === "technical" ? (
              <>
                <p className="font-semibold text-white">{wb("reviewStudio.reports.technicalInsights")}</p>
                <ul>{review.review.insights.technicalInsights.map((t) => <li key={t}>· {t}</li>)}</ul>
                <p className="font-semibold text-white">{wb("reviewStudio.reports.designInsights")}</p>
                <ul>{review.review.insights.designInsights.map((d) => <li key={d}>· {d}</li>)}</ul>
                <p className="font-semibold text-white">{wb("reviewStudio.reports.businessInsights")}</p>
                <ul>{review.review.insights.businessInsights.map((b) => <li key={b}>· {b}</li>)}</ul>
              </>
            ) : null}
            {reportDialog === "developer" ? (
              <ul>
                {improvements.map((i) => (
                  <li key={i.id} className="mb-2">
                    <strong>{i.title}</strong> — {i.recommendation}
                    <br />
                    <span className="text-white/40">
                      {i.targetFiles.join(", ") || wb("reviewStudio.reports.noFiles")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {reportDialog === "benchmark" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {SCORE_KEYS.map(({ key, labelKey }) => (
                  <div key={key} className="rounded-lg border border-white/10 p-2">
                    <span className="text-white/40">{wb(labelKey)}</span>
                    <span className="ms-2 font-bold text-white">
                      {scores[key as keyof typeof scores]}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
