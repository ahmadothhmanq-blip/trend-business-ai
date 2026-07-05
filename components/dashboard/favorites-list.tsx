"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Globe,
  Lightbulb,
  LineChart,
  Loader2,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { DashboardListSkeleton } from "@/components/dashboard/ui/dashboard-skeleton";
import {
  dashboardFilterSelectClass,
  dashboardInputClass,
} from "@/components/dashboard/ui/dashboard-styles";
import type { HistoryItem, HistoryItemType } from "@/types/database";
import { cn } from "@/lib/utils";

type FavoritesListProps = {
  initialItems: HistoryItem[];
};

type FavoriteFilter = "all" | HistoryItemType;
type FavoriteSort = "newest" | "oldest";

const TYPE_META: Record<
  HistoryItemType,
  { label: string; icon: LucideIcon; endpoint: string }
> = {
  idea: {
    label: "Business Idea",
    icon: Lightbulb,
    endpoint: "/api/ideas",
  },
  analysis: {
    label: "Market Analysis",
    icon: LineChart,
    endpoint: "/api/market-analysis",
  },
  report: {
    label: "AI Report",
    icon: FileText,
    endpoint: "/api/reports",
  },
  website: {
    label: "Website Blueprint",
    icon: Globe,
    endpoint: "/api/website-builder",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function matchesSearch(item: HistoryItem, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [item.title, item.description, item.detail, TYPE_META[item.type].label]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function FavoritesList({ initialItems }: FavoritesListProps) {
  const [items, setItems] = useState(initialItems);
  const [typeFilter, setTypeFilter] = useState<FavoriteFilter>("all");
  const [sort, setSort] = useState<FavoriteSort>("newest");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => matchesSearch(item, search))
      .sort((a, b) => {
        const delta =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "newest" ? delta : -delta;
      });
  }, [items, search, sort, typeFilter]);

  const totalByType = useMemo(() => {
    return items.reduce<Record<FavoriteFilter, number>>(
      (acc, item) => {
        acc.all += 1;
        acc[item.type] += 1;
        return acc;
      },
      { all: 0, idea: 0, analysis: 0, report: 0, website: 0 },
    );
  }, [items]);

  const isFiltering = search.trim() || typeFilter !== "all";

  async function removeFavorite(item: HistoryItem) {
    const meta = TYPE_META[item.type];
    setRemovingId(item.id);

    try {
      const res = await fetch(`${meta.endpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: false }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove favorite");
      }

      setItems((current) =>
        current.filter(
          (favorite) => !(favorite.id === item.id && favorite.type === item.type),
        ),
      );
      toast.success(data.message || "Removed from favorites.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove this favorite.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardPanel gold className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgb(255_215_0_/_0.09),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1">
              <Star className="size-3.5 fill-premium-gold text-premium-gold-light" />
              <span className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
                Favorite assets
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Your best generated work
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
              Keep high-value ideas, analyses, reports, and website blueprints
              easy to find while you plan your next move.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
            {(["idea", "analysis", "report", "website"] as const).map((type) => {
              const meta = TYPE_META[type];
              return (
                <div
                  key={type}
                  className="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2"
                >
                  <p className="text-[11px] text-white/35">{meta.label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">
                    {totalByType[type]}
                  </p>
                </div>
              );
            })}
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
              placeholder="Search favorites..."
              className={`pl-9 ${dashboardInputClass}`}
              aria-label="Search favorites"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as FavoriteFilter)}
            className={dashboardFilterSelectClass}
            aria-label="Filter favorites by type"
          >
            <option value="all">All types</option>
            <option value="idea">Business Ideas</option>
            <option value="analysis">Market Analysis</option>
            <option value="report">AI Reports</option>
            <option value="website">Website Blueprints</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as FavoriteSort)}
            className={dashboardFilterSelectClass}
            aria-label="Sort favorites"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </DashboardPanel>

      {removingId && <DashboardListSkeleton count={1} />}

      {filteredItems.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const removing = removingId === item.id;

            return (
              <article
                key={`${item.type}-${item.id}`}
                className={cn(
                  "rounded-2xl border border-white/[0.08] glass-panel glass-panel-premium p-5 transition-all duration-300 hover:border-premium-gold/25 hover:shadow-gold-sm",
                  removing && "pointer-events-none opacity-55",
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
                          {formatDate(item.createdAt)}
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
                      className="text-premium-gold hover:bg-premium-gold/10 hover:text-premium-gold-light"
                      onClick={() => removeFavorite(item)}
                      disabled={Boolean(removingId)}
                      aria-label={`Remove ${item.title} from favorites`}
                    >
                      {removing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Star className="size-4 fill-premium-gold" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-white/45 hover:bg-premium-gold/10 hover:text-premium-gold-light"
                      asChild
                    >
                      <Link href={item.href} aria-label={`Open ${item.title}`}>
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
          icon={isFiltering ? Search : Star}
          title={isFiltering ? "No matching favorites" : "No favorites yet"}
          description={
            isFiltering
              ? "Adjust your search, type filter, or sort order to find saved favorites."
              : "Mark your best ideas, analyses, reports, and website blueprints as favorites to collect them here."
          }
        />
      )}
    </div>
  );
}
