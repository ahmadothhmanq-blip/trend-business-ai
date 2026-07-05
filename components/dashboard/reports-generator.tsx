"use client";

import { useState } from "react";
import { Loader2, FileText, Download, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardListSkeleton } from "@/components/dashboard/ui/dashboard-skeleton";
import {
  dashboardBadgeGold,
  dashboardIconButtonClass,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/ui/dashboard-styles";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { Badge } from "@/components/ui/badge";
import { ListFilters } from "@/components/dashboard/list-filters";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { REPORT_TYPES } from "@/lib/validations/reports";
import { apiMutation, usePaginatedResource } from "@/lib/hooks/use-paginated-resource";
import { downloadMarkdownReport, downloadPdfReport } from "@/lib/export/report-export";
import type { AIReport } from "@/types/database";
import { cn } from "@/lib/utils";

type ReportsGeneratorProps = {
  initialReports?: AIReport[];
  initialTotal?: number;
};

export function ReportsGenerator({
  initialReports = [],
  initialTotal = 0,
}: ReportsGeneratorProps) {
  const {
    items: reports,
    page,
    total,
    totalPages,
    search,
    favoriteFilter,
    extraFilter,
    loading,
    refresh,
    applyFilters,
    goToPage,
  } = usePaginatedResource<AIReport>({
    endpoint: "/api/reports",
    dataKey: "reports",
    initialData: initialReports,
    initialTotal,
  });

  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      topic: formData.get("topic") as string,
      reportType: formData.get("reportType") as string,
      timeframe: formData.get("timeframe") as string,
    };

    try {
      await apiMutation(
        "/api/reports",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        "Report generated and saved.",
      );
      refresh();
    } catch {
      // handled
    } finally {
      setGenerating(false);
    }
  }

  async function toggleFavorite(report: AIReport) {
    setActionLoading(report.id);
    try {
      await apiMutation(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !report.is_favorite }),
      });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReport(id: string) {
    setActionLoading(id);
    try {
      await apiMutation(`/api/reports/${id}`, { method: "DELETE" });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  const showEmptyState = !generating && !loading && reports.length === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <DashboardCard className="glass-panel glass-panel-premium lg:sticky lg:top-28 lg:self-start">
        <DashboardCardHeader>
          <DashboardCardTitle className="flex items-center gap-3">
            <DashboardIconBox icon={FileText} className="size-9" />
            Report Settings
          </DashboardCardTitle>
          <DashboardCardDescription>
            Configure your AI-generated business report
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Report topic</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g. Q1 Growth Strategy, Product Launch..."
                className={dashboardInputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportType">Report type</Label>
              <select
                id="reportType"
                name="reportType"
                className={dashboardSelectClass}
                required
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Input
                id="timeframe"
                name="timeframe"
                placeholder="e.g. Q1 2026, Annual, 6-month..."
                className={dashboardInputClass}
                required
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl btn-gold font-bold text-luxury-black"
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </DashboardCardContent>
      </DashboardCard>

      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {reports.length > 0
              ? `${total} Report${total === 1 ? "" : "s"} Saved`
              : "Generated reports will appear here"}
          </h2>
          <ListFilters
            search={search}
            favoriteFilter={favoriteFilter}
            extraFilter={extraFilter}
            extraLabel="Report types"
            extraOptions={[...REPORT_TYPES]}
            onApply={applyFilters}
          />
        </div>

        {(generating || loading) && <DashboardListSkeleton count={2} />}

        {!generating &&
          !loading &&
          reports.map((report) => (
            <div key={report.id} className="space-y-4">
              <DashboardCard className="glass-panel glass-panel-premium transition-all duration-300 hover:border-premium-gold/20 hover:shadow-gold-sm">
                <DashboardCardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="mb-0 border-white/10 bg-white/[0.06] text-white/75">
                          {report.report_type}
                        </Badge>
                        {report.is_favorite && (
                          <Badge className={dashboardBadgeGold}>Favorite</Badge>
                        )}
                      </div>
                      <DashboardCardTitle>{report.title}</DashboardCardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={dashboardIconButtonClass}
                        onClick={() => toggleFavorite(report)}
                        disabled={actionLoading === report.id}
                        aria-label="Toggle favorite"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Star className={cn("size-4", report.is_favorite && "fill-premium-gold text-premium-gold")} />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-premium-gold/30 bg-black/20 text-premium-gold hover:bg-premium-gold/10 hover:text-premium-gold"
                        onClick={() => downloadMarkdownReport(report)}
                      >
                        <Download className="size-4" />
                        MD
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-premium-gold/30 bg-black/20 text-premium-gold hover:bg-premium-gold/10 hover:text-premium-gold"
                        onClick={() => downloadPdfReport(report)}
                      >
                        <Download className="size-4" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteReport(report.id)}
                        disabled={actionLoading === report.id}
                        className={cn(dashboardIconButtonClass, "text-destructive hover:text-destructive")}
                        aria-label="Delete report"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <DashboardCardDescription className="text-[15px] text-white/60">
                    AI-generated business report
                  </DashboardCardDescription>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-relaxed text-white/80 dark:prose-invert">
                    {report.content.replace(/^#+\s/gm, "").trim()}
                  </div>
                </DashboardCardContent>
              </DashboardCard>

              <DashboardCard className="glass-panel glass-panel-premium">
                <DashboardCardHeader>
                  <DashboardCardTitle className="text-base">Key Insights</DashboardCardTitle>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <ul className="space-y-3">
                    {report.insights.map((insight, i) => (
                      <li key={i} className="flex gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-sm text-white/80">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-premium-gold/15 text-xs font-bold text-premium-gold">
                          {i + 1}
                        </span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </DashboardCardContent>
              </DashboardCard>
            </div>
          ))}

        {showEmptyState && (
          <DashboardEmptyState
            icon={FileText}
            title="No reports yet"
            description="Configure your report settings and generate comprehensive AI business intelligence reports."
          />
        )}

        <PaginationControls page={page} totalPages={totalPages} total={total} onPageChange={goToPage} />
      </div>
    </div>
  );
}
