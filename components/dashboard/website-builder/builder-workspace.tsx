"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  VisualWebsiteEditor,
  type VisualWebsiteEditorHandle,
} from "@/components/dashboard/visual-editor/visual-website-editor";
import { BuilderPagesSidebar } from "@/components/dashboard/website-builder/builder-pages-sidebar";
import { BuilderSectionsPanel } from "@/components/dashboard/website-builder/builder-sections-panel";
import {
  BuilderToolRail,
  type BuilderToolId,
} from "@/components/dashboard/website-builder/builder-tool-rail";
import { DesignSystemPanel } from "@/components/dashboard/website-builder/design-system-panel";
import { BlocksPanel } from "@/components/dashboard/website-builder/blocks-panel";
import { AiBuilderPanel } from "@/components/dashboard/website-builder/ai-builder-panel";
import { ProfessionalPanel } from "@/components/dashboard/website-builder/professional-panel";
import { BusinessHubPanel } from "@/components/dashboard/website-builder/business-hub-panel";
import { PublishingHubPanel } from "@/components/dashboard/website-builder/publishing-hub-panel";
import { EnterprisePanel } from "@/components/dashboard/website-builder/enterprise-panel";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import type { VisualDesignTokens, VisualViewport } from "@/lib/ai-core/visual-editor/types";
import {
  listBuilderVersionSnapshots,
  pushBuilderVersionSnapshot,
  resolveBuilderDesignTokens,
  resolveBuilderWorkspaceStructure,
  sectionToCopilotSelection,
  type BuilderAutosaveState,
  type BuilderBlockView,
  type BuilderVersionSnapshot,
} from "@/lib/website/builder";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type BuilderWorkspaceProps = {
  generationId: string;
  files: GeneratedProjectFile[];
  project: GeneratedWebsiteProject;
  disabled?: boolean;
  promptHint?: string | null;
  managementHref?: string;
  copilotSlot: ReactNode;
  aiLoading?: boolean;
  aiStreamMessage?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (selection: {
    nodeId: string;
    nodeLabel: string;
    sectionKind?: string;
    componentExportName?: string;
  } | null) => void;
  onAiCommand?: (command: string, useStream?: boolean) => void;
  onOpenWorkspaceTab?: (tab: "analytics" | "experiments" | "deploy") => void;
  onSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
};

export function BuilderWorkspace({
  generationId,
  files,
  project,
  disabled,
  promptHint,
  managementHref = "",
  copilotSlot,
  aiLoading,
  aiStreamMessage,
  onDirtyChange,
  onSelectionChange,
  onAiCommand,
  onOpenWorkspaceTab,
  onSaved,
}: BuilderWorkspaceProps) {
  const { wb, dir } = useBuilderLocale();
  const editorRef = useRef<VisualWebsiteEditorHandle>(null);
  const [activeTool, setActiveTool] = useState<BuilderToolId>("structure");
  const [selectedPageRoute, setSelectedPageRoute] = useState("/");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [autosaveState, setAutosaveState] = useState<BuilderAutosaveState>("idle");
  const [versions, setVersions] = useState<BuilderVersionSnapshot[]>([]);
  const [tokens, setTokens] = useState<VisualDesignTokens>(() =>
    resolveBuilderDesignTokens(project),
  );
  const [viewport, setViewport] = useState<VisualViewport>("desktop");
  const [backingUp, setBackingUp] = useState(false);
  const [, setStructureKey] = useState(0);

  const structure = resolveBuilderWorkspaceStructure({
    generationId,
    project,
    promptHint,
    selectedPageRoute,
  });

  useEffect(() => {
    setVersions(listBuilderVersionSnapshots(generationId));
  }, [generationId]);

  const handleSelectPage = useCallback(
    (route: string) => {
      const page = structure.pages.find((p) => p.route === route);
      if (!page?.editableInCanvas) {
        toast.message(wb("builder.workspace.openManagementHint"));
        return;
      }
      setSelectedPageRoute(route);
    },
    [structure.pages, wb],
  );

  const handleSelectSection = useCallback(
    (sectionId: string) => {
      setSelectedSectionId(sectionId);
      editorRef.current?.selectNode(sectionId);
      const section = structure.sections.find((s) => s.id === sectionId);
      if (section) onSelectionChange?.(sectionToCopilotSelection(section));
    },
    [onSelectionChange, structure.sections],
  );

  const handleReorderSection = useCallback((fromIndex: number, toIndex: number) => {
    editorRef.current?.moveSection(fromIndex, toIndex);
    setStructureKey((k) => k + 1);
  }, []);

  const handleEditorSelection = useCallback(
    (
      selection: {
        nodeId: string;
        nodeLabel: string;
        sectionKind?: string;
        componentExportName?: string;
      } | null,
    ) => {
      setSelectedSectionId(selection?.nodeId ?? null);
      onSelectionChange?.(selection);
    },
    [onSelectionChange],
  );

  const handleSaved = useCallback(
    (payload: { project: GeneratedWebsiteProject; generation: WebsiteGeneration }) => {
      pushBuilderVersionSnapshot({
        generationId,
        project: payload.project,
        label:
          autosaveState === "saving"
            ? wb("builder.workspace.autosaveSaving")
            : wb("builder.publishing.backup"),
      });
      setVersions(listBuilderVersionSnapshots(generationId));
      setStructureKey((k) => k + 1);
      onSaved(payload);
    },
    [autosaveState, generationId, onSaved],
  );

  const restoreVersion = useCallback(
    (snapshot: BuilderVersionSnapshot) => {
      onSaved({
        project: snapshot.project as GeneratedWebsiteProject,
        generation: {
          id: generationId,
          updated_at: snapshot.createdAt,
        } as WebsiteGeneration,
      });
      toast.success(wb("builder.workspace.restored", { label: snapshot.label }));
    },
    [generationId, onSaved, wb],
  );

  const saveServerBackup = useCallback(async () => {
    setBackingUp(true);
    try {
      const res = await fetch(
        `/api/website-builder/${generationId}/builder/snapshots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: wb("builder.publishing.backup") }),
        },
      );
      if (!res.ok) throw new Error(wb("builder.workspace.backupFailed"));
      toast.success(wb("builder.workspace.backupSaved"));
    } catch {
      toast.error(wb("builder.workspace.backupFailed"));
    } finally {
      setBackingUp(false);
    }
  }, [generationId, wb]);

  const handleTokensChange = useCallback((patch: Partial<VisualDesignTokens>) => {
    editorRef.current?.updateTokens(patch);
    setTokens((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleViewportChange = useCallback((v: VisualViewport) => {
    editorRef.current?.setViewport(v);
    setViewport(v);
  }, []);

  const handleInsertBlock = useCallback((block: BuilderBlockView) => {
    editorRef.current?.insertBlock({
      exportName: block.exportName,
      path: block.path,
      sectionKind: block.sectionKind,
      name: block.name,
    });
    setStructureKey((k) => k + 1);
  }, []);

  const renderLeftPanel = () => {
    if (activeTool === "design") {
      return (
        <DesignSystemPanel
          tokens={tokens}
          viewport={viewport}
          disabled={disabled}
          onTokensChange={handleTokensChange}
          onViewportChange={handleViewportChange}
        />
      );
    }
    if (activeTool === "blocks") {
      return (
        <BlocksPanel
          disabled={disabled}
          onInsert={handleInsertBlock}
        />
      );
    }
    if (activeTool === "ai") {
      return (
        <AiBuilderPanel
          disabled={disabled}
          loading={aiLoading}
          streamMessage={aiStreamMessage}
          onRun={(command, useStream) => onAiCommand?.(command, useStream)}
        />
      );
    }
    if (activeTool === "professional") {
      return (
        <ProfessionalPanel
          managementHref={managementHref}
          disabled={disabled}
          onCopilotCommand={(command) => onAiCommand?.(command, true)}
        />
      );
    }
    if (activeTool === "business") {
      return (
        <BusinessHubPanel
          managementHref={managementHref}
          disabled={disabled}
          onOpenWorkspaceTab={onOpenWorkspaceTab}
          onCopilotCommand={(command) => onAiCommand?.(command, true)}
        />
      );
    }
    if (activeTool === "publish") {
      return (
        <PublishingHubPanel
          files={files}
          disabled={disabled}
          onOpenDeploy={() => onOpenWorkspaceTab?.("deploy")}
          onBackup={() => void saveServerBackup()}
          backingUp={backingUp}
        />
      );
    }
    if (activeTool === "enterprise") {
      return <EnterprisePanel generationId={generationId} disabled={disabled} />;
    }
    return (
      <>
        <BuilderPagesSidebar
          pages={structure.pages}
          selectedRoute={structure.selectedPageRoute}
          managementHref={managementHref}
          onSelectPage={handleSelectPage}
        />
        <BuilderSectionsPanel
          sections={structure.sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleSelectSection}
          onReorderSection={handleReorderSection}
        />
      </>
    );
  };

  const leftIsStructure = activeTool === "structure";

  return (
    <div
      dir={dir}
      className="flex min-h-[760px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050505]"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-3 py-2">
        <p className="me-auto text-xs font-semibold text-white/70">
          {wb("builder.workspace.title")}
        </p>
        {autosaveState !== "idle" ? (
          <span className="text-[10px] text-white/45">
            {autosaveState === "pending"
              ? wb("builder.workspace.autosavePending")
              : autosaveState === "saving"
                ? wb("builder.workspace.autosaveSaving")
                : autosaveState === "saved"
                  ? wb("builder.workspace.autosaveSaved")
                  : wb("builder.workspace.autosaveError")}
          </span>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-white/15 text-white"
              disabled={!versions.length}
            >
              <History className="size-3.5" aria-hidden />
              {wb("builder.workspace.versions")} ({versions.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
            {versions.map((snapshot) => (
              <DropdownMenuItem key={snapshot.id} onClick={() => restoreVersion(snapshot)}>
                <span className="block text-xs font-medium">{snapshot.label}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {new Date(snapshot.createdAt).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {autosaveState === "saving" ? (
          <Loader2 className="size-4 animate-spin text-premium-gold" />
        ) : null}
      </div>

      <BuilderToolRail active={activeTool} onChange={setActiveTool} />

      <div
        className={cn(
          "grid min-h-0 flex-1",
          leftIsStructure
            ? "lg:grid-cols-[200px_180px_minmax(0,1fr)_minmax(280px,320px)]"
            : "lg:grid-cols-[240px_minmax(0,1fr)_minmax(280px,320px)]",
        )}
      >
        {leftIsStructure ? (
          renderLeftPanel()
        ) : (
          <div className="border-r border-white/[0.08] bg-black/30">{renderLeftPanel()}</div>
        )}
        <div className="min-h-[680px] min-w-0">
          <VisualWebsiteEditor
            ref={editorRef}
            chrome="workspace"
            generationId={generationId}
            files={files}
            project={project}
            disabled={disabled}
            autosaveEnabled
            onAutosaveStateChange={setAutosaveState}
            onDirtyChange={onDirtyChange}
            onSelectionChange={handleEditorSelection}
            onTokensChange={setTokens}
            onSaved={handleSaved}
          />
        </div>
        <aside className="min-h-0 overflow-y-auto border-l border-white/[0.08] bg-black/20 p-3">
          {copilotSlot}
        </aside>
      </div>
    </div>
  );
}
