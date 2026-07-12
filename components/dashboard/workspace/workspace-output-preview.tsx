import {
  ArrowDownToLine,
  Copy,
  Download,
  FileText,
  Pencil,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import type { WorkspaceProject } from "@/lib/workspace/project";

type WorkspaceOutputPreviewProps = {
  project: WorkspaceProject | null;
  onCopy: (project: WorkspaceProject) => void;
  onExportMarkdown: (project: WorkspaceProject) => void;
  onExportJson: (project: WorkspaceProject) => void;
  onRename?: (project: WorkspaceProject) => void;
};

export function WorkspaceOutputPreview({
  project,
  onCopy,
  onExportMarkdown,
  onExportJson,
  onRename,
}: WorkspaceOutputPreviewProps) {
  return (
    <DashboardPanel>
      <div className="mb-5 flex items-center gap-3">
        <DashboardIconBox icon={FileText} />
        <div>
          <h3 className="font-bold text-white">Output Preview</h3>
          <p className="text-[13px] text-white/40">
            {project ? "Latest generated project" : "Generate to preview output"}
          </p>
        </div>
      </div>

      {project ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold text-white">{project.title}</h4>
            <p className="mt-2 text-[14px] leading-relaxed text-white/55">
              {project.output.summary}
            </p>
          </div>
          <div className="space-y-3">
            {project.output.sections.slice(0, 3).map((section) => (
              <div
                key={section.heading}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
              >
                <p className="font-semibold text-white">{section.heading}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {onRename ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold rounded-xl"
                onClick={() => onRename(project)}
              >
                <Pencil className="size-4" />
                Rename
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
              Download MD
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onExportJson(project)}
            >
              <ArrowDownToLine className="size-4" />
              Download JSON
            </Button>
          </div>
        </div>
      ) : (
        <DashboardEmptyState
          icon={Sparkles}
          title="No project selected"
          description="Generate your first workspace project to preview structured output here."
        />
      )}
    </DashboardPanel>
  );
}
