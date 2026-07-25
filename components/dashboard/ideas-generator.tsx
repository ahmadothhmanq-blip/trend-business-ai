"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  Star,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/dashboard/ui/dashboard-styles";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListFilters } from "@/components/dashboard/list-filters";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { apiMutation, usePaginatedResource } from "@/lib/hooks/use-paginated-resource";
import type { BusinessIdea } from "@/types/database";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";

type IdeasGeneratorProps = {
  initialIdeas?: BusinessIdea[];
  initialTotal?: number;
};

export function IdeasGenerator({
  initialIdeas = [],
  initialTotal = 0,
}: IdeasGeneratorProps) {
  const pt = useProductT("ideas");
  const {
    items: ideas,
    page,
    total,
    totalPages,
    search,
    favoriteFilter,
    loading,
    refresh,
    applyFilters,
    goToPage,
  } = usePaginatedResource<BusinessIdea>({
    endpoint: "/api/ideas",
    dataKey: "ideas",
    initialData: initialIdeas,
    initialTotal,
  });

  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState<BusinessIdea | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      interests: formData.get("interests") as string,
      skills: formData.get("skills") as string,
      budget: formData.get("budget") as string,
      industry: formData.get("industry") as string,
    };

    try {
      await apiMutation(
        "/api/ideas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        pt("toasts.generated"),
      );
      refresh();
    } catch {
      // toast handled in apiMutation
    } finally {
      setGenerating(false);
    }
  }

  async function copyIdea(idea: BusinessIdea) {
    const text = pt("copy.template", {
      title: idea.title,
      description: idea.description,
      industry: idea.industry,
      target: idea.target_market,
      revenue: idea.revenue_model,
    });
    await navigator.clipboard.writeText(text);
    setCopied(idea.id);
    toast.success(pt("toasts.copied"));
    setTimeout(() => setCopied(null), 2000);
  }

  async function toggleFavorite(idea: BusinessIdea) {
    setActionLoading(idea.id);
    try {
      await apiMutation(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !idea.is_favorite }),
      });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteIdea(id: string) {
    setActionLoading(id);
    try {
      await apiMutation(`/api/ideas/${id}`, { method: "DELETE" });
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    setActionLoading(editing.id);

    try {
      await apiMutation(
        `/api/ideas/${editing.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.get("title"),
            description: formData.get("description"),
            industry: formData.get("industry"),
            target_market: formData.get("target_market"),
            revenue_model: formData.get("revenue_model"),
          }),
        },
        pt("toasts.updated"),
      );
      setEditing(null);
      refresh();
    } catch {
      // handled
    } finally {
      setActionLoading(null);
    }
  }

  const showEmptyState = !generating && !loading && ideas.length === 0;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <DashboardCard className="glass-panel glass-panel-premium lg:sticky lg:top-28 lg:self-start">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-3">
              <DashboardIconBox icon={Sparkles} className="size-9" />
              {pt("profileCard.title")}
            </DashboardCardTitle>
            <DashboardCardDescription>
              {pt("profileCard.description")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">{pt("profileCard.interests")}</Label>
                <Textarea
                  id="interests"
                  name="interests"
                  placeholder={pt("profileCard.interestsPlaceholder")}
                  className={dashboardInputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">{pt("profileCard.skills")}</Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder={pt("profileCard.skillsPlaceholder")}
                  className={dashboardInputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">{pt("profileCard.budget")}</Label>
                <Input
                  id="budget"
                  name="budget"
                  placeholder={pt("profileCard.budgetPlaceholder")}
                  className={dashboardInputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{pt("profileCard.industry")}</Label>
                <Input
                  id="industry"
                  name="industry"
                  placeholder={pt("profileCard.industryPlaceholder")}
                  className={dashboardInputClass}
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
                    {pt("profileCard.generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {pt("profileCard.generate")}
                  </>
                )}
              </Button>
            </form>
          </DashboardCardContent>
        </DashboardCard>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {ideas.length > 0
                ? pt(total === 1 ? "list.ideaSaved" : "list.ideasSaved", { count: total })
                : pt("list.emptyHeading")}
            </h2>
            <ListFilters
              search={search}
              favoriteFilter={favoriteFilter}
              onApply={applyFilters}
            />
          </div>

          {(generating || loading) && <DashboardListSkeleton count={3} />}

          {!generating &&
            !loading &&
            ideas.map((idea, index) => (
              <DashboardCard
                key={idea.id}
                className="glass-panel glass-panel-premium transition-all duration-300 hover:border-premium-gold/20 hover:shadow-gold-sm"
              >
                <DashboardCardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="border-white/10 bg-white/[0.06] text-white/60">
                          {pt("list.ideaNumber", { number: index + 1 })}
                        </Badge>
                        {idea.is_favorite && (
                          <Badge className={dashboardBadgeGold}>{pt("list.favorite")}</Badge>
                        )}
                      </div>
                      <DashboardCardTitle>{idea.title}</DashboardCardTitle>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={dashboardIconButtonClass}
                        onClick={() => setEditing(idea)}
                        aria-label={pt("aria.edit")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={dashboardIconButtonClass}
                        onClick={() => toggleFavorite(idea)}
                        disabled={actionLoading === idea.id}
                        aria-label={
                          idea.is_favorite
                            ? pt("aria.removeFavorite")
                            : pt("aria.addFavorite")
                        }
                      >
                        {actionLoading === idea.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Star
                            className={cn(
                              "size-4",
                              idea.is_favorite &&
                                "fill-premium-gold text-premium-gold",
                            )}
                          />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={dashboardIconButtonClass}
                        onClick={() => copyIdea(idea)}
                        aria-label={pt("aria.copy")}
                      >
                        {copied === idea.id ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteIdea(idea.id)}
                        disabled={actionLoading === idea.id}
                        aria-label={pt("aria.delete")}
                        className="text-destructive hover:text-destructive"
                      >
                        {actionLoading === idea.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <DashboardCardDescription className="text-[15px] text-white/65">
                    {idea.description}
                  </DashboardCardDescription>
                </DashboardCardHeader>
                <DashboardCardContent className="grid gap-4 rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">{pt("list.industry")}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{idea.industry}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">{pt("list.targetMarket")}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{idea.target_market}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">{pt("list.revenueModel")}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{idea.revenue_model}</p>
                  </div>
                </DashboardCardContent>
              </DashboardCard>
            ))}

          {showEmptyState && (
            <DashboardEmptyState
              icon={Sparkles}
              title={pt("empty.title")}
              description={pt("empty.description")}
            />
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pt("edit.title")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">{pt("edit.titleLabel")}</Label>
                <Input id="edit-title" name="title" defaultValue={editing.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">{pt("edit.description")}</Label>
                <Textarea id="edit-description" name="description" defaultValue={editing.description} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-industry">{pt("edit.industry")}</Label>
                <Input id="edit-industry" name="industry" defaultValue={editing.industry} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target">{pt("edit.targetMarket")}</Label>
                <Input id="edit-target" name="target_market" defaultValue={editing.target_market} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-revenue">{pt("edit.revenueModel")}</Label>
                <Input id="edit-revenue" name="revenue_model" defaultValue={editing.revenue_model} required />
              </div>
              <Button type="submit" className="btn-gold rounded-xl font-bold text-luxury-black" disabled={actionLoading === editing.id}>
                {actionLoading === editing.id ? pt("edit.saving") : pt("edit.save")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
