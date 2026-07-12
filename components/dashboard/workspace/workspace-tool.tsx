"use client";

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
import { WorkspaceGeneratorForm } from "@/components/dashboard/workspace/workspace-generator-form";
import { WorkspaceHero } from "@/components/dashboard/workspace/workspace-hero";
import { WorkspaceOutputPreview } from "@/components/dashboard/workspace/workspace-output-preview";
import { WorkspaceProjectsList } from "@/components/dashboard/workspace/workspace-projects-list";
import { useWorkspaceTool } from "@/lib/hooks/use-workspace-tool";
import type { ProductDefinition } from "@/lib/products/types";
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import type { WorkspaceGeneration } from "@/types/database";

type WorkspaceToolProps = {
  definition: WorkspaceDefinition;
  product?: ProductDefinition;
  initialGenerations?: WorkspaceGeneration[];
  initialTotal?: number;
};

export function WorkspaceTool({
  definition,
  product,
  initialGenerations = [],
  initialTotal = 0,
}: WorkspaceToolProps) {
  const tool = useWorkspaceTool({
    definition,
    product,
    initialGenerations,
    initialTotal,
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <WorkspaceHero metadata={tool.metadata} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <WorkspaceGeneratorForm
          metadata={tool.metadata}
          prompt={tool.prompt}
          onPromptChange={tool.setPrompt}
          selectedTemplate={tool.selectedTemplate}
          onTemplateChange={tool.setSelectedTemplate}
          language={tool.language}
          onLanguageChange={tool.setLanguage}
          theme={tool.theme}
          onThemeChange={tool.setTheme}
          depth={tool.depth}
          onDepthChange={tool.setDepth}
          selectedOutputs={tool.selectedOutputs}
          onToggleOutput={tool.toggleOutputFeature}
          advancedOpen={tool.advancedOpen}
          onAdvancedOpenChange={tool.setAdvancedOpen}
          isGenerating={tool.isGenerating}
          isStreaming={tool.isStreaming}
          streamStatus={tool.streamStatus}
          progress={tool.progress}
          apiError={tool.apiError}
          onGenerate={tool.generate}
          onRetry={tool.retryFailed}
          attachments={tool.attachments}
          uploading={tool.uploading}
          onUploadFiles={tool.uploadFiles}
          onRemoveAttachment={tool.removeAttachment}
          promptVersions={tool.activeProject?.promptVersions ?? []}
          onRestorePromptVersion={tool.restorePromptVersion}
          autosaveState={tool.autosaveState}
        />

        <WorkspaceOutputPreview
          project={tool.activeProject}
          isStreaming={tool.isStreaming}
          streamStatus={tool.streamStatus}
          actionLoading={tool.actionLoading}
          onCopy={tool.copyProject}
          onExportMarkdown={(project) => tool.exportProject(project, "markdown")}
          onExportJson={(project) => tool.exportProject(project, "json")}
          onExportPdf={(project) => tool.exportProject(project, "pdf")}
          onExportDocx={(project) => tool.exportProject(project, "docx")}
          onRename={tool.openRename}
          onRegenerate={tool.regenerate}
          onContinue={() => tool.continueGeneration()}
          onRetry={tool.retryFailed}
          onToggleFavorite={tool.toggleFavorite}
        />
      </div>

      <WorkspaceProjectsList
        projects={tool.projects}
        activeProjectId={tool.activeProject?.id ?? null}
        loading={tool.pagination.loading}
        actionLoading={tool.actionLoading}
        page={tool.pagination.page}
        total={tool.pagination.total}
        totalPages={tool.pagination.totalPages}
        search={tool.pagination.search}
        favoriteFilter={tool.pagination.favoriteFilter}
        onSearchApply={tool.pagination.applyFilters}
        onPageChange={tool.pagination.goToPage}
        onSelect={tool.setActiveProject}
        onToggleFavorite={tool.toggleFavorite}
        onDuplicate={tool.duplicateProject}
        onDelete={tool.deleteProject}
        onExportMarkdown={(project) => tool.exportProject(project, "markdown")}
        onExportJson={(project) => tool.exportProject(project, "json")}
      />

      <Dialog open={tool.renameOpen} onOpenChange={tool.setRenameOpen}>
        <DialogContent className="border-white/10 bg-luxury-black text-white">
          <DialogHeader>
            <DialogTitle>Save project</DialogTitle>
            <DialogDescription className="text-white/45">
              Rename and keep this generation in your workspace project history.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={tool.renameValue}
            onChange={(event) => tool.setRenameValue(event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => tool.setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="btn-gold text-luxury-black" onClick={tool.saveRename}>
              Save project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
