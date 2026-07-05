"use client";

import { useState } from "react";
import {
  Loader2,
  LineChart,
  TrendingUp,
  AlertTriangle,
  Target,
  Star,
  Trash2,
} from "lucide-react";
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
import { MarketAnalysisChart } from "@/components/dashboard/market-analysis-chart";
import { apiMutation, usePaginatedResource } from "@/lib/hooks/use-paginated-resource";
import type { MarketAnalysis } from "@/types/database";
import { cn } from "@/lib/utils";

type MarketAnalysisToolProps = {
  initialAnalyses?: MarketAnalysis[];
  initialTotal?: number;
};

function AnalysisView({
  result,
  onToggleFavorite,
  onDelete,
  actionLoading,
}: {
  result: MarketAnalysis;
  onToggleFavorite: (analysis: MarketAnalysis) => void;
  onDelete: (id: string) => void;
  actionLoading: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard className="glass-panel glass-panel-premium">
          <DashboardCardHeader className="pb-2">
            <DashboardCardDescription>Market Size (TAM)</DashboardCardDescription>
            <DashboardCardTitle className="text-xl text-white">{result.market_size}</DashboardCardTitle>
          </DashboardCardHeader>
        </DashboardCard>
        <DashboardCard className="glass-panel glass-panel-premium">
          <DashboardCardHeader className="pb-2">
            <DashboardCardDescription>Growth Rate</DashboardCardDescription>
            <DashboardCardTitle className="flex items-center gap-2 text-xl text-emerald-400">
              <TrendingUp className="size-5" />
              {result.growth_rate}
            </DashboardCardTitle>
          </DashboardCardHeader>
        </DashboardCard>
      </div>

      <MarketAnalysisChart
        opportunities={result.opportunities}
        risks={result.risks}
        competitors={result.competitors}
      />

      <DashboardCard className="glass-panel glass-panel-premium">
        <DashboardCardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              {result.is_favorite && (
                <Badge className={cn("mb-2", dashboardBadgeGold)}>Favorite</Badge>
              )}
              <DashboardCardTitle>
                {result.industry} — {result.region}
              </DashboardCardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className={dashboardIconButtonClass}
                onClick={() => onToggleFavorite(result)}
                disabled={actionLoading}
                aria-label={result.is_favorite ? "Remove from favorites" : "Add to favorites"}
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Star
                    className={cn(
                      "size-4",
                      result.is_favorite && "fill-premium-gold text-premium-gold",
                    )}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(dashboardIconButtonClass, "text-destructive hover:text-destructive")}
                onClick={() => onDelete(result.id)}
                disabled={actionLoading}
                aria-label="Delete analysis"
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <DashboardCardDescription className="text-[15px] text-white/65">
            {result.summary}
          </DashboardCardDescription>
        </DashboardCardHeader>
      </DashboardCard>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard className="glass-panel glass-panel-premium">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-blue-500" />
              Opportunities
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <ul className="space-y-2">
              {result.opportunities.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <Badge variant="secondary" className="shrink-0 border-white/10 bg-white/[0.06] text-white/70">{i + 1}</Badge>
                  <span className="text-white/75">{item}</span>
                </li>
              ))}
            </ul>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard className="glass-panel glass-panel-premium">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              Risks
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <ul className="space-y-2">
              {result.risks.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 border-white/15 text-white/65">{i + 1}</Badge>
                  <span className="text-white/75">{item}</span>
                </li>
              ))}
            </ul>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard className="glass-panel glass-panel-premium">
          <DashboardCardHeader>
            <DashboardCardTitle className="text-base">Competitors</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <ul className="space-y-2">
              {result.competitors.map((item, i) => (
                <li key={i} className="text-sm text-white/70">• {item}</li>
              ))}
            </ul>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </>
  );
}

export function MarketAnalysisTool({
  initialAnalyses = [],
  initialTotal = 0,
}: MarketAnalysisToolProps) {
  const {
    items: analyses,
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
  } = usePaginatedResource<MarketAnalysis>({
    endpoint: "/api/market-analysis",
    dataKey: "analyses",
    initialData: initialAnalyses,
    initialTotal,
  });

  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const industries = [...new Set(analyses.map((a) => a.industry))];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      industry: formData.get("industry") as string,
      region: formData.get("region") as string,
      targetAudience: formData.get("targetAudience") as string,
    };

    try {
      await apiMutation(
        "/api/market-analysis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        "Market analysis saved.",
      );
      refresh();
    } catch {
      // handled
    } finally {
      setGenerating(false);
    }
  }

  async function toggleFavorite(analysis: MarketAnalysis) {
    setActionLoading(analysis.id);
    try {
      await apiMutation(`/api/market-analysis/${analysis.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !analysis.is_favorite }),
      });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteAnalysis(id: string) {
    setActionLoading(id);
    try {
      await apiMutation(`/api/market-analysis/${id}`, { method: "DELETE" });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  const showEmptyState = !generating && !loading && analyses.length === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <DashboardCard className="glass-panel glass-panel-premium lg:sticky lg:top-28 lg:self-start">
        <DashboardCardHeader>
          <DashboardCardTitle className="flex items-center gap-3">
            <DashboardIconBox icon={LineChart} className="size-9" />
            Market Parameters
          </DashboardCardTitle>
          <DashboardCardDescription>
            Define your market scope for AI-powered analysis
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                placeholder="e.g. FinTech, HealthTech, E-commerce..."
                className={dashboardInputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g. North America, Europe, Global..."
                className={dashboardInputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target audience</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                placeholder="e.g. SMBs, Enterprise, Consumers..."
                className={cn(dashboardInputClass, dashboardSelectClass)}
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
                  Analyzing...
                </>
              ) : (
                <>
                  <LineChart className="size-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </form>
        </DashboardCardContent>
      </DashboardCard>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {analyses.length > 0
              ? `${total} Analysis${total === 1 ? "" : "es"} Saved`
              : "Market analyses will appear here"}
          </h2>
          <ListFilters
            search={search}
            favoriteFilter={favoriteFilter}
            extraFilter={extraFilter}
            extraLabel="Industries"
            extraOptions={industries}
            onApply={applyFilters}
          />
        </div>

        {(generating || loading) && <DashboardListSkeleton count={2} />}

        {!generating &&
          !loading &&
          analyses.map((analysis) => (
            <div key={analysis.id} className="space-y-4">
              <AnalysisView
                result={analysis}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteAnalysis}
                actionLoading={actionLoading === analysis.id}
              />
            </div>
          ))}

        {showEmptyState && (
          <DashboardEmptyState
            icon={LineChart}
            title="No analyses yet"
            description="Enter market parameters and run analysis to get comprehensive industry insights."
          />
        )}

        <PaginationControls page={page} totalPages={totalPages} total={total} onPageChange={goToPage} />
      </div>
    </div>
  );
}
