"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { buildWorkspaceSnapshot } from "@/lib/website/workspace/file-contracts";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebsiteGeneration } from "@/types/database";
import { CopilotCommandPanel } from "@/components/dashboard/website-builder/copilot-command-panel";
import { ProWorkspaceFileTree } from "@/components/dashboard/website-builder/pro-workspace-file-tree";
import { ProWorkspacePreviewPane } from "@/components/dashboard/website-builder/pro-workspace-preview-pane";
import { VisualWebsiteEditor } from "@/components/dashboard/visual-editor/visual-website-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProWorkspaceShellProps = {
  generationId: string;
  project: GeneratedWebsiteProject;
  onProjectChange?: (project: GeneratedWebsiteProject) => void;
};

function defaultSelectedPath(files: GeneratedProjectFile[]): string {
  return (
    files.find((f) => f.path.includes("preview/"))?.path ||
    files.find((f) => f.path.endsWith("page.tsx"))?.path ||
    files[0]?.path ||
    ""
  );
}

/**
 * Pro workspace layout (WB_PRO_WORKSPACE) — file tree + editor/code + live preview + agent.
 */
export function ProWorkspaceShell({
  generationId,
  project,
  onProjectChange,
}: ProWorkspaceShellProps) {
  const [localProject, setLocalProject] = useState(project);
  const [selectedPath, setSelectedPath] = useState(() =>
    defaultSelectedPath(project.files ?? []),
  );
  const [fileDraft, setFileDraft] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewRevision, setPreviewRevision] = useState(0);
  const [centerMode, setCenterMode] = useState<"visual" | "code">("visual");

  useEffect(() => {
    setLocalProject(project);
    if (!project.files?.some((f) => f.path === selectedPath)) {
      setSelectedPath(defaultSelectedPath(project.files ?? []));
    }
  }, [project, selectedPath]);

  const files = localProject.files ?? [];
  const snapshot = useMemo(
    () => buildWorkspaceSnapshot(files, previewRevision),
    [files, previewRevision],
  );
  const selectedFile = files.find((f) => f.path === selectedPath) ?? null;

  useEffect(() => {
    setFileDraft(selectedFile?.content ?? "");
    setIsDirty(false);
  }, [selectedFile?.path, selectedFile?.content]);

  const applyProjectUpdate = useCallback(
    (next: GeneratedWebsiteProject) => {
      setLocalProject(next);
      onProjectChange?.(next);
      setPreviewRevision((n) => n + 1);
      setIsDirty(false);
    },
    [onProjectChange],
  );

  const handleCopilotApplied = useCallback(
    (payload: {
      project: GeneratedWebsiteProject;
      generation: WebsiteGeneration;
    }) => {
      void payload.generation;
      applyProjectUpdate(payload.project);
    },
    [applyProjectUpdate],
  );

  const handleFileSelect = useCallback(
    (path: string) => {
      if (path === selectedPath) return;
      if (isDirty) {
        const discard = window.confirm(
          "You have unsaved changes. Discard and switch files?",
        );
        if (!discard) return;
        setIsDirty(false);
      }
      setSelectedPath(path);
      setCenterMode(
        path.includes("preview/") || path.endsWith("page.tsx")
          ? "visual"
          : "code",
      );
    },
    [isDirty, selectedPath],
  );

  const saveFile = useCallback(async () => {
    if (!selectedPath || !isDirty) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedPath, content: fileDraft }),
      });
      const data = (await res.json()) as {
        error?: string;
        project?: GeneratedWebsiteProject;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save file");
      }
      if (data.project) applyProjectUpdate(data.project);
      toast.success("File saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [
    applyProjectUpdate,
    fileDraft,
    generationId,
    isDirty,
    selectedPath,
  ]);

  return (
    <div className="flex min-h-[75vh] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setCenterMode("visual")}
          className={cn(
            "rounded-lg px-3 py-1.5 font-semibold transition-colors",
            centerMode === "visual"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/70",
          )}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={() => setCenterMode("code")}
          className={cn(
            "rounded-lg px-3 py-1.5 font-semibold transition-colors",
            centerMode === "code"
              ? "bg-cyan-400/15 text-cyan-200"
              : "text-white/45 hover:text-white/70",
          )}
        >
          Source
        </button>
        {centerMode === "code" && isDirty ? (
          <Button
            type="button"
            size="sm"
            className="ml-auto h-8 rounded-lg bg-cyan-500 text-xs text-white hover:bg-cyan-600"
            disabled={isSaving}
            onClick={() => void saveFile()}
          >
            {isSaving ? "Saving…" : "Save file"}
          </Button>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_1fr_300px]">
        <aside className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-black/30 p-3 lg:min-h-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
            Files
          </p>
          <ProWorkspaceFileTree
            files={snapshot.files}
            selectedPath={selectedPath}
            onSelect={handleFileSelect}
          />
        </aside>

        <main className="grid min-h-[420px] min-w-0 gap-3 lg:min-h-0 lg:grid-cols-2">
          <div className="min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {centerMode === "visual" ? (
              <VisualWebsiteEditor
                generationId={generationId}
                project={localProject}
                files={files}
                chrome="workspace"
                onSaved={({ project: savedProject }) => applyProjectUpdate(savedProject)}
              />
            ) : (
              <div className="flex h-full min-h-[320px] flex-col">
                <div className="border-b border-white/10 px-3 py-2 text-xs text-white/45">
                  {selectedFile?.path ?? "Select a file"}
                </div>
                <textarea
                  value={fileDraft}
                  onChange={(e) => {
                    setFileDraft(e.target.value);
                    setIsDirty(true);
                  }}
                  className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[12px] leading-relaxed text-white/85 outline-none"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
          <ProWorkspacePreviewPane
            generationId={generationId}
            title={localProject.title || "Preview"}
            revision={previewRevision}
            className="min-h-[320px]"
          />
        </main>

        <aside className="min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-black/30 lg:min-h-0">
          <CopilotCommandPanel
            generationId={generationId}
            onApplied={handleCopilotApplied}
          />
        </aside>
      </div>
    </div>
  );
}
