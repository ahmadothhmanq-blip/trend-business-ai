"use client";

import { memo } from "react";
import {
  ArrowDownToLine,
  Clock3,
  Copy,
  Download,
  History,
  Star,
  Trash2,
} from "lucide-react";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { DashboardListSkeleton } from "@/components/dashboard/ui/dashboard-skeleton";
import { ListFilters } from "@/components/dashboard/list-filters";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { useTranslation } from "@/lib/i18n/client";
import type { WorkspaceProject } from "@/lib/workspace/project";
import { cn } from "@/lib/utils";

type WorkspaceProjectsListProps = {
  projects: WorkspaceProject[];
  activeProjectId: string | null;
  loading: boolean;
  actionLoading: string | null;
  page: number;
  total: number;
  totalPages: number;
  search: string;
  favoriteFilter: "" | "true" | "false";
  onSearchApply: (search: string, favorite: "" | "true" | "false") => void;
  onPageChange: (page: number) => void;
  onSelect: (project: WorkspaceProject) => void;
  onToggleFavorite: (project: WorkspaceProject) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExportMarkdown: (project: WorkspaceProject) => void;
  onExportJson: (project: WorkspaceProject) => void;
};

export const WorkspaceProjectsList = memo(function WorkspaceProjectsList({
  projects,
  activeProjectId,
  loading,
  actionLoading,
  page,
  total,
  totalPages,
  search,
  favoriteFilter,
  onSearchApply,
  onPageChange,
  onSelect,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onExportMarkdown,
  onExportJson,
}: WorkspaceProjectsListProps) {
  const { t } = useTranslation();

  return (
    <DashboardPanel>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <DashboardIconBox icon={History} />
          <div>
            <h3 className="font-bold text-white">{t("dashboard.workspaceProjects.title")}</h3>
            <p className="text-[13px] text-white/40">
              {t("dashboard.workspaceProjects.description")}
            </p>
          </div>
        </div>
        <ListFilters
          search={search}
          favoriteFilter={favoriteFilter}
          onApply={onSearchApply}
        />
      </div>

      {loading ? (
        <DashboardListSkeleton count={4} />
      ) : projects.length === 0 ? (
        <DashboardEmptyState
          icon={Clock3}
          title={t("dashboard.workspaceProjects.listEmptyTitle")}
          description={t("dashboard.workspaceProjects.listEmptyDescription")}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className={cn(
                  "group rounded-2xl border bg-black/20 p-4 transition-all",
                  activeProjectId === project.id
                    ? "border-premium-gold/35 bg-premium-gold/[0.04]"
                    : "border-white/[0.08] hover:border-premium-gold/25 hover:bg-premium-gold/[0.035]",
                )}
              >
                <button
                  type="button"
                  className="w-full text-start"
                  onClick={() => onSelect(project)}
                >
                  <p className="font-semibold text-white transition-colors group-hover:text-premium-gold-light">
                    {project.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/40">
                    {project.output.summary}
                  </p>
                </button>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-white/30">{project.createdAt}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actionLoading === project.id}
                      onClick={() => onToggleFavorite(project)}
                      className={cn(
                        "rounded-lg border p-2 transition-colors",
                        project.favorite
                          ? "border-premium-gold/30 bg-premium-gold/15 text-premium-gold"
                          : "border-white/[0.08] text-white/30 hover:border-premium-gold/25 hover:text-premium-gold",
                      )}
                      aria-label={
                        project.favorite
                          ? t("dashboard.workspaceProjects.removeFavorite")
                          : t("dashboard.workspaceProjects.addFavorite")
                      }
                    >
                      <Star className={cn("size-4", project.favorite && "fill-current")} />
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === project.id}
                      onClick={() => onExportMarkdown(project)}
                      className="rounded-lg border border-white/[0.08] p-2 text-white/30 transition-colors hover:border-premium-gold/25 hover:text-premium-gold"
                      aria-label={t("dashboard.workspaceProjects.downloadMarkdown")}
                    >
                      <Download className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === project.id}
                      onClick={() => onExportJson(project)}
                      className="rounded-lg border border-white/[0.08] p-2 text-white/30 transition-colors hover:border-premium-gold/25 hover:text-premium-gold"
                      aria-label={t("dashboard.workspaceProjects.downloadJson")}
                    >
                      <ArrowDownToLine className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === project.id}
                      onClick={() => onDuplicate(project.id)}
                      className="rounded-lg border border-white/[0.08] p-2 text-white/30 transition-colors hover:border-premium-gold/25 hover:text-premium-gold"
                      aria-label={t("dashboard.workspaceProjects.duplicateProject")}
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === project.id}
                      onClick={() => onDelete(project.id)}
                      className="rounded-lg border border-white/[0.08] p-2 text-white/30 transition-colors hover:border-red-400/30 hover:text-red-300"
                      aria-label={t("dashboard.workspaceProjects.deleteProject")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <PaginationControls
              page={page}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </DashboardPanel>
  );
});
