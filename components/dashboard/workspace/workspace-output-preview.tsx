"use client";

import {
  ArrowDownToLine,
  Copy,
  Download,
  FileText,
  Heart,
  Pencil,
  RefreshCw,
  Sparkles,
  StepForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import type { WorkspaceProject } from "@/lib/workspace/project";
import { formatGenerationMeta } from "@/lib/workspace/export-meta";
import { cn } from "@/lib/utils";

type WorkspaceOutputPreviewProps = {
  project: WorkspaceProject | null;
  isStreaming?: boolean;
  streamStatus?: string | null;
  actionLoading?: string | null;
  onCopy: (project: WorkspaceProject) => void;
  onExportMarkdown: (project: WorkspaceProject) => void;
  onExportJson: (project: WorkspaceProject) => void;
  onExportPdf?: (project: WorkspaceProject) => void;
  onExportDocx?: (project: WorkspaceProject) => void;
  onRename?: (project: WorkspaceProject) => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onRetry?: () => void;
  onToggleFavorite?: (project: WorkspaceProject) => void;
};

export function WorkspaceOutputPreview({
  project,
  isStreaming,
  streamStatus,
  actionLoading,
  onCopy,
  onExportMarkdown,
  onExportJson,
  onExportPdf,
  onExportDocx,
  onRename,
  onRegenerate,
  onContinue,
  onRetry,
  onToggleFavorite,
}: WorkspaceOutputPreviewProps) {
  const meta = project ? formatGenerationMeta(project.output) : "";

  return (
    <DashboardPanel>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <DashboardIconBox icon={FileText} />
          <div>
            <h3 className="font-bold text-white">Streaming Output</h3>
            <p className="text-[13px] text-white/40">
              {isStreaming
                ? streamStatus ?? "Streaming project output..."
                : project
                  ? meta || "Saved to your workspace project history"
                  : "Generate to stream live output"}
            </p>
          </div>
        </div>
        {isStreaming ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1 text-[11px] font-semibold text-premium-gold-light">
            <span className="size-1.5 animate-pulse rounded-full bg-premium-gold" />
            Live
          </span>
        ) : null}
      </div>

      {project ? (
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h4 className="text-lg font-bold text-white">{project.title}</h4>
              <div className="flex flex-wrap gap-2">
                {project.status === "failed" ? (
                  <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-200">
                    Failed
                  </span>
                ) : null}
                {project.favorite ? (
                  <span className="rounded-full border border-premium-gold/30 bg-premium-gold/10 px-2.5 py-1 text-[11px] text-premium-gold-light">
                    Favorite
                  </span>
                ) : null}
              </div>
            </div>
            <p
              className={cn(
                "mt-2 text-[14px] leading-relaxed text-white/55 transition-opacity",
                !project.output.summary && isStreaming && "opacity-40",
              )}
            >
              {project.output.summary ||
                (isStreaming ? "Composing executive summary..." : "")}
            </p>
            {meta ? (
              <p className="mt-2 text-[11px] text-white/30">{meta}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            {project.output.sections.map((section) => (
              <div
                key={section.heading}
                className="animate-in fade-in slide-in-from-bottom-1 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 duration-300"
              >
                <p className="font-semibold text-white">{section.heading}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                  {section.content}
                </p>
              </div>
            ))}
            {isStreaming && project.output.sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-premium-gold/20 bg-premium-gold/5 p-4 text-[13px] text-premium-gold-light/80">
                Streaming structured sections...
              </div>
            ) : null}
          </div>

          {project.output.deliverables?.length ? (
            <div className="flex flex-wrap gap-2">
              {project.output.deliverables.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-white/45"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {onRegenerate ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={onRegenerate}
                disabled={Boolean(isStreaming)}
              >
                <RefreshCw className="size-4" />
                Regenerate
              </Button>
            ) : null}
            {onContinue ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={onContinue}
                disabled={Boolean(isStreaming) || project.status === "failed"}
              >
                <StepForward className="size-4" />
                Continue
              </Button>
            ) : null}
            {project.status === "failed" && onRetry ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={onRetry}
                disabled={Boolean(isStreaming)}
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            ) : null}
            {onToggleFavorite ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={() => onToggleFavorite(project)}
                disabled={actionLoading === project.id}
              >
                <Heart
                  className={cn("size-4", project.favorite && "fill-premium-gold text-premium-gold")}
                />
                {project.favorite ? "Favorited" : "Favorite"}
              </Button>
            ) : null}
            {onRename ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={() => onRename(project)}
              >
                <Pencil className="size-4" />
                Rename / Save
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onCopy(project)}
            >
              <Copy className="size-4" />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onExportMarkdown(project)}
            >
              <Download className="size-4" />
              Export MD
            </Button>
            {onExportPdf ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={() => onExportPdf(project)}
              >
                <FileText className="size-4" />
                Export PDF
              </Button>
            ) : null}
            {onExportDocx ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={() => onExportDocx(project)}
              >
                <ArrowDownToLine className="size-4" />
                Export DOCX
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onExportJson(project)}
            >
              <ArrowDownToLine className="size-4" />
              Export JSON
            </Button>
          </div>
        </div>
      ) : (
        <DashboardEmptyState
          icon={Sparkles}
          title="No project selected"
          description="Generate your first workspace project to stream structured output here. Every run is saved to your user workspace history."
        />
      )}
    </DashboardPanel>
  );
}
