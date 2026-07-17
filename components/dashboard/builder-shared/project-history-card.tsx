"use client";

import { Clock3, Code2, RefreshCw, Star, Trash2, Wand2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";

export type ProjectHistoryItem = {
  id: string;
  name: string;
  typeLabel: string;
  description: string;
  status: string;
  is_favorite: boolean;
  created_at: string;
  has_blueprint: boolean;
  tags?: string[];
};

function getStatusColor(status: string) {
  if (status === "completed") return "text-emerald-400";
  if (status === "failed") return "text-red-400";
  if (status === "generating") return "text-amber-400";
  return "text-white/40";
}

export function ProjectHistoryCard({
  item,
  icon: Icon,
  onFavorite,
  onDelete,
  onView,
  onRegenerate,
  onContinue,
}: {
  item: ProjectHistoryItem;
  icon: LucideIcon;
  onFavorite: () => void;
  onDelete: () => void;
  onView: () => void;
  onRegenerate: () => void;
  /** Natural-language AI edit / improve (D-016). */
  onContinue?: () => void;
}) {
  return (
    <DashboardPanel className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/10 text-premium-gold-light">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-xs text-white/40">{item.typeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              item.is_favorite
                ? "text-premium-gold-light"
                : "text-white/30 hover:text-premium-gold-light",
            )}
            onClick={onFavorite}
          >
            <Star className={cn("size-3.5", item.is_favorite && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-white/30 hover:text-red-400"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-white/50">{item.description}</p>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((t) => (
            <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">{t}</span>
          ))}
          {item.tags.length > 4 && (
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">+{item.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-white/30">
        <span className={getStatusColor(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 className="size-3" />
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-1 flex gap-2">
        {item.has_blueprint && item.status === "completed" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
              onClick={onView}
            >
              <Code2 className="size-3" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-white/20"
              onClick={onRegenerate}
            >
              <RefreshCw className="size-3" />
              Regenerate
            </Button>
            {onContinue ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-premium-gold/20 text-xs text-premium-gold-light hover:border-premium-gold/40"
                onClick={onContinue}
              >
                <Wand2 className="size-3" />
                Improve
              </Button>
            ) : null}
          </>
        )}
        {item.status === "failed" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg border-red-500/20 text-xs text-red-400 hover:border-red-500/40"
            onClick={onRegenerate}
          >
            <RefreshCw className="size-3" />
            Retry
          </Button>
        )}
      </div>
    </DashboardPanel>
  );
}
