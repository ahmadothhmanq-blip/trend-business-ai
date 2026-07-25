"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Globe,
  History,
  Lightbulb,
  LineChart,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { DashboardListSkeleton } from "@/components/dashboard/ui/dashboard-skeleton";
import {
  dashboardFilterSelectClass,
  dashboardInputClass,
} from "@/components/dashboard/ui/dashboard-styles";
import type { HistoryItem, HistoryItemType } from "@/types/database";
import { getHistoryItemEndpoint } from "@/lib/workspace/history";
import { useTranslation } from "@/lib/i18n/client";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { cn } from "@/lib/utils";

type HistoryListProps = {
  initialItems: HistoryItem[];
};

type HistoryFilter = "all" | HistoryItemType;
type HistorySort = "newest" | "oldest";

const TYPE_ICONS: Record<HistoryItemType, LucideIcon> = {
  idea: Lightbulb,
  analysis: LineChart,
  report: FileText,
  website: Globe,
  workspace: Sparkles,
};

const TYPE_ENDPOINTS: Record<HistoryItemType, string> = {
  idea: "/api/ideas",
  analysis: "/api/market-analysis",
  report: "/api/reports",
  website: "/api/website-builder",
  workspace: "/api/workspaces/brand",
};

function matchesSearch(item: HistoryItem, search: string, typeLabel: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [item.title, item.description, item.detail, typeLabel]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function HistoryList({ initialItems }: HistoryListProps) {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatter();
  const [items, setItems] = useState(initialItems);
  const [typeFilter, setTypeFilter] = useState<HistoryFilter>("all");
  const [sort, setSort] = useState<HistorySort>("newest");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const typeMeta = useMemo(
    () =>
      (["idea", "analysis", "report", "website", "workspace"] as const).reduce(
        (acc, type) => {
          acc[type] = {
            label: t(`dashboard.history.types.${type}`),
            icon: TYPE_ICONS[type],
            endpoint: TYPE_ENDPOINTS[type],
          };
          return acc;
        },
        {} as Record<HistoryItemType, { label: string; icon: LucideIcon; endpoint: string }>,
      ),
    [t],
  );

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => matchesSearch(item, search, typeMeta[item.type].label))
      .sort((a, b) => {
        const delta =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "newest" ? delta : -delta;
      });
  }, [items, search, sort, typeFilter, typeMeta]);

  const totalByType = useMemo(() => {
    return items.reduce<Record<HistoryFilter, number>>(
      (acc, item) => {
        acc.all += 1;
        acc[item.type] += 1;
        return acc;
      },
      { all: 0, idea: 0, analysis: 0, report: 0, website: 0, workspace: 0 },
    );
  }, [items]);

  const isFiltering = search.trim() || typeFilter !== "all";

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setDeleteError(null);

    const endpoint = getHistoryItemEndpoint(deleteTarget);

    try {
      const res = await fetch(`${endpoint}/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("dashboard.history.deleteFailed"));
      }

      setItems((current) =>
        current.filter(
          (item) =>
            !(item.id === deleteTarget.id && item.type === deleteTarget.type),
        ),
      );
      toast.success(data.message || t("dashboard.history.deleted"));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : t("dashboard.history.deleteFailed"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6 lg:space-y-8">
        <DashboardPanel gold className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgb(255_215_0_/_0.09),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1">
                <History className="size-3.5 text-premium-gold-light" />
                <span className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
                  {t("dashboard.history.badge")}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t("dashboard.history.title")}
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
                {t("dashboard.history.description")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
              {(["idea", "analysis", "report", "website", "workspace"] as const).map((type) => (
                <div
                  key={type}
                  className="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2"
                >
                  <p className="text-[11px] text-white/35">{typeMeta[type].label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">
                    {totalByType[type]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("dashboard.history.searchPlaceholder")}
                className={`pl-9 ${dashboardInputClass}`}
                aria-label={t("dashboard.history.searchAria")}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as HistoryFilter)}
              className={dashboardFilterSelectClass}
              aria-label={t("dashboard.history.filterAria")}
            >
              <option value="all">{t("dashboard.history.allTypes")}</option>
              <option value="idea">{t("dashboard.history.filters.idea")}</option>
              <option value="analysis">{t("dashboard.history.filters.analysis")}</option>
              <option value="report">{t("dashboard.history.filters.report")}</option>
              <option value="website">{t("dashboard.history.filters.website")}</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as HistorySort)}
              className={dashboardFilterSelectClass}
              aria-label={t("dashboard.history.sortAria")}
            >
              <option value="newest">{t("dashboard.history.newestFirst")}</option>
              <option value="oldest">{t("dashboard.history.oldestFirst")}</option>
            </select>
          </div>
        </DashboardPanel>

        {deletingId && <DashboardListSkeleton count={1} />}

        {filteredItems.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredItems.map((item) => {
              const meta = typeMeta[item.type];
              const Icon = meta.icon;
              const deleting = deletingId === item.id;

              return (
                <article
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    "rounded-2xl border border-white/[0.08] glass-panel glass-panel-premium p-5 transition-all duration-300 hover:border-premium-gold/25 hover:shadow-gold-sm",
                    deleting && "pointer-events-none opacity-55",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <DashboardIconBox icon={Icon} className="size-10" />
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[11px] font-semibold text-premium-gold-light">
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-white/35">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <h3 className="truncate text-lg font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/48">
                          {item.description}
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-white/35">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-white/45 hover:bg-red-400/10 hover:text-red-300"
                        onClick={() => {
                          setDeleteTarget(item);
                          setDeleteError(null);
                        }}
                        disabled={Boolean(deletingId)}
                        aria-label={t("dashboard.history.deleteAria", { title: item.title })}
                      >
                        {deleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-white/45 hover:bg-premium-gold/10 hover:text-premium-gold-light"
                        asChild
                      >
                        <Link href={item.href} aria-label={t("dashboard.history.openAria", { title: item.title })}>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <DashboardEmptyState
            icon={isFiltering ? Search : History}
            title={isFiltering ? t("dashboard.history.noMatching") : t("dashboard.history.emptyTitle")}
            description={
              isFiltering
                ? t("dashboard.history.noMatchingDescription")
                : t("dashboard.history.emptyDescription")
            }
          />
        )}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#141414]/95 text-white">
          <DialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-red-400/10 ring-1 ring-red-400/20">
              <AlertTriangle className="size-5 text-red-300" aria-hidden="true" />
            </div>
            <DialogTitle>{t("dashboard.history.deleteTitle")}</DialogTitle>
            <DialogDescription className="text-white/50">
              {t("dashboard.history.deleteDescription", {
                title: deleteTarget?.title ?? t("dashboard.history.deleteFallback"),
              })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {deleteError}
            </p>
          )}
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
              disabled={Boolean(deletingId)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
