"use client";

import {
  Copy,
  Download,
  Globe2,
  History,
  Star,
  Trash2,
} from "lucide-react";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";
import { useWebsiteBuilderProjects } from "@/components/dashboard/website-builder/workspace-projects-context";

function IconAction({
  icon: Icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: typeof Star;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border transition-all",
        danger
          ? "border-red-400/20 text-red-300 hover:bg-red-400/10"
          : active
            ? "border-premium-gold/30 bg-premium-gold/15 text-premium-gold-light"
            : "border-white/[0.08] text-white/45 hover:border-premium-gold/25 hover:text-premium-gold-light",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/** Bottom workspace — Recent Projects card grid (reads live `projects` from context). */
export function RecentProjectsGrid({
  onSelect,
  onFavorite,
  onDuplicate,
  onDelete,
  onDownload,
}: {
  onSelect: (projectId: string) => void;
  onFavorite: (id: string) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (id: string) => void;
  onDownload: (projectId: string) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const { projects, activeProject } = useWebsiteBuilderProjects();

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/[0.1] p-8 text-center">
        <Globe2 className="mx-auto size-10 text-premium-gold" />
        <p className="mt-4 font-bold text-white">{wb("emptyStates.noRecentProjects")}</p>
        <p className="mt-2 text-sm text-white/40">
          Generate an interface concept to populate your recent projects, favorites and history.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {projects.map((project) => (
        <article
          key={project.id}
          className={cn(
            "rounded-2xl border bg-black/20 p-4 transition-all duration-300 hover:border-premium-gold/25",
            activeProject?.id === project.id
              ? "border-premium-gold/35"
              : "border-white/[0.08]",
          )}
        >
          <button
            type="button"
            className="block w-full text-left"
            onClick={() => onSelect(project.id)}
          >
            <p className="truncate font-semibold text-white">{project.title}</p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/40">
              {project.description}
            </p>
            <p className="mt-3 text-[12px] text-premium-gold-light/80">
              {project.type} · {project.createdAt}
            </p>
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
            <IconAction
              icon={Star}
              label={wb("labels.favorite")}
              active={project.favorite}
              onClick={() => onFavorite(project.id)}
            />
            <IconAction
              icon={Copy}
              label={wb("labels.duplicate")}
              onClick={() => onDuplicate(project.id)}
            />
            <IconAction
              icon={Download}
              label={wb("labels.downloadZip")}
              onClick={() => onDownload(project.id)}
            />
            <IconAction
              icon={Trash2}
              label={wb("labels.delete")}
              danger
              onClick={() => onDelete(project.id)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

/** Output workspace sidebar — project history list (reads live `projects` from context). */
export function RecentProjectsHistory({
  onSelect,
}: {
  onSelect: (projectId: string) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const { projects, activeProject } = useWebsiteBuilderProjects();

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <History className="size-4 text-premium-gold" />
        {wb("workspace.history")}
      </div>
      <div className="max-h-[260px] space-y-2 overflow-auto">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-all",
              activeProject?.id === project.id
                ? "border-premium-gold/30 bg-premium-gold/10"
                : "border-white/[0.08] bg-white/[0.02] hover:border-premium-gold/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">{project.title}</p>
              {project.mode && project.mode !== "generate" ? (
                <span className="shrink-0 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2 py-0.5 text-[10px] text-premium-gold-light">
                  {project.mode}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] text-white/35">
              {project.createdAt}
              {project.parentGenerationId ? ` · ${wb("workspace.linkedVersion")}` : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
