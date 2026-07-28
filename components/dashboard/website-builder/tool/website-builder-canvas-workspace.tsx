"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { CopilotCommandPanel } from "@/components/dashboard/website-builder/copilot-command-panel";
import { useCopilotCommand } from "@/components/dashboard/website-builder/hooks/use-copilot-command";
import type { CopilotSelectionContext } from "@/lib/ai-core/website-copilot/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import type { OutputTab } from "@/components/dashboard/website-builder/tool/types";

const BuilderWorkspace = dynamic(
  () =>
    import("@/components/dashboard/website-builder/builder-workspace").then(
      (m) => m.BuilderWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-premium-gold" />
      </div>
    ),
  },
);

type WebsiteBuilderCanvasWorkspaceProps = {
  generationId: string;
  files: GeneratedProjectFile[];
  project: GeneratedWebsiteProject;
  disabled?: boolean;
  promptHint?: string | null;
  aiLoading?: boolean;
  aiStreamMessage?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (selection: CopilotSelectionContext | null) => void;
  onAiCommand?: (command: string, useStream?: boolean) => void;
  onOpenWorkspaceTab?: (tab: OutputTab) => void;
  onSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
};

export function WebsiteBuilderCanvasWorkspace({
  generationId,
  files,
  project,
  disabled,
  promptHint,
  aiLoading,
  aiStreamMessage,
  onDirtyChange,
  onSelectionChange,
  onAiCommand,
  onOpenWorkspaceTab,
  onSaved,
}: WebsiteBuilderCanvasWorkspaceProps) {
  const copilotControl = useCopilotCommand({
    generationId,
    onApplied: (payload) => {
      onSaved({
        project: payload.project,
        generation: payload.generation,
      });
    },
  });

  const copilotSlot = useMemo(
    () => (
      <CopilotCommandPanel
        generationId={generationId}
        disabled={disabled}
        selectionContext={null}
        control={copilotControl}
        onApplied={(payload) => {
          onSaved({
            project: payload.project,
            generation: payload.generation,
          });
        }}
      />
    ),
    [copilotControl, disabled, generationId, onSaved],
  );

  const handleOpenTab = (tab: "analytics" | "experiments" | "deploy") => {
    onOpenWorkspaceTab?.(tab);
  };

  return (
    <BuilderWorkspace
      generationId={generationId}
      files={files}
      project={project}
      disabled={disabled}
      promptHint={promptHint}
      managementHref={`/dashboard/website-builder/${generationId}`}
      copilotSlot={copilotSlot}
      aiLoading={aiLoading || copilotControl.loading}
      aiStreamMessage={aiStreamMessage ?? copilotControl.streamMessage}
      onDirtyChange={onDirtyChange}
      onSelectionChange={onSelectionChange}
      onAiCommand={(command, useStream) => {
        if (onAiCommand) {
          onAiCommand(command, useStream);
          return;
        }
        void copilotControl.submit(command, { forceStream: useStream });
      }}
      onOpenWorkspaceTab={handleOpenTab}
      onSaved={onSaved}
    />
  );
}
