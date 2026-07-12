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
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import type { WorkspaceGeneration } from "@/types/database";

type WorkspaceToolProps = {
  definition: WorkspaceDefinition;
  initialGenerations?: WorkspaceGeneration[];
  initialTotal?: number;
};

export function WorkspaceTool({
  definition,
  initialGenerations = [],
  initialTotal = 0,
}: WorkspaceToolProps) {
  const tool = useWorkspaceTool({
    definition,
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
          isGenerating={tool.isGenerating}
          progress={tool.progress}
          apiError={tool.apiError}
          onGenerate={tool.generate}
        />

        <WorkspaceOutputPreview
          project={tool.activeProject}
          onCopy={tool.copyProject}
          onExportMarkdown={(project) => tool.exportProject(project, "markdown")}
          onExportJson={(project) => tool.exportProject(project, "json")}
          onRename={tool.openRename}
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
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription className="text-white/45">
              Update the saved project title.
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
