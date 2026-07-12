"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiMutation, usePaginatedResource } from "@/lib/hooks/use-paginated-resource";
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import {
  WORKSPACE_LANGUAGES,
  WORKSPACE_THEMES,
  type WorkspaceLanguage,
  type WorkspaceTheme,
} from "@/lib/workspace/metadata";
import {
  copyWorkspaceSummary,
  downloadWorkspaceProject,
  getWorkspaceApiEndpoint,
} from "@/lib/workspace/export";
import {
  toWorkspaceProject,
  type WorkspaceProject,
} from "@/lib/workspace/project";
import type { WorkspaceGeneration } from "@/types/database";

type UseWorkspaceToolOptions = {
  definition: WorkspaceDefinition;
  initialGenerations?: WorkspaceGeneration[];
  initialTotal?: number;
};

export function useWorkspaceTool({
  definition,
  initialGenerations = [],
  initialTotal = 0,
}: UseWorkspaceToolOptions) {
  const endpoint = getWorkspaceApiEndpoint(definition.type);
  const metadata = definition.metadata;

  const pagination = usePaginatedResource<WorkspaceGeneration>({
    endpoint,
    dataKey: "generations",
    initialData: initialGenerations,
    initialTotal,
  });

  const projects = useMemo(
    () => pagination.items.map(toWorkspaceProject),
    [pagination.items],
  );

  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(metadata.templates[0] ?? "");
  const [language, setLanguage] = useState<WorkspaceLanguage>("English");
  const [theme, setTheme] = useState<WorkspaceTheme>("Gold");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(18);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(
    initialGenerations[0] ? toWorkspaceProject(initialGenerations[0]) : null,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 92 ? 34 : value + 9));
    }, 700);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  async function generate() {
    const brief = prompt.trim() || selectedTemplate.trim();
    const parsed = definition.inputSchema.safeParse({
      prompt: brief,
      template: selectedTemplate,
      language,
      theme,
      features: metadata.outputs.slice(0, 3),
    });

    if (!parsed.success) {
      setApiError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setApiError(null);
    setIsGenerating(true);
    setProgress(24);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as {
        generation?: WorkspaceGeneration;
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed.");
      }

      if (payload.generation) {
        setActiveProject(toWorkspaceProject(payload.generation));
      }

      setPrompt("");
      setProgress(100);
      toast.success(payload.message ?? "Project generated successfully.");
      pagination.refresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function toggleFavorite(project: WorkspaceProject) {
    setActionLoading(project.id);
    try {
      await apiMutation(`${endpoint}/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !project.favorite }),
      });
      pagination.refresh();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteProject(id: string) {
    setActionLoading(id);
    try {
      await apiMutation(`${endpoint}/${id}`, { method: "DELETE" });
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      pagination.refresh();
    } finally {
      setActionLoading(null);
    }
  }

  async function duplicateProject(id: string) {
    setActionLoading(id);
    try {
      await apiMutation(`${endpoint}/${id}`, { method: "POST" }, "Project duplicated.");
      pagination.refresh();
    } finally {
      setActionLoading(null);
    }
  }

  function openRename(project: WorkspaceProject) {
    setRenameValue(project.title);
    setRenameOpen(true);
  }

  async function saveRename() {
    if (!activeProject || !renameValue.trim()) return;
    setActionLoading(activeProject.id);
    try {
      await apiMutation(
        `${endpoint}/${activeProject.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: renameValue.trim() }),
        },
        "Project renamed.",
      );
      setRenameOpen(false);
      pagination.refresh();
    } finally {
      setActionLoading(null);
    }
  }

  async function copyProject(project: WorkspaceProject) {
    await copyWorkspaceSummary(project);
    toast.success("Copied to clipboard.");
  }

  function exportProject(project: WorkspaceProject, format: "markdown" | "json") {
    downloadWorkspaceProject(project, format);
    toast.success(`Exported ${format.toUpperCase()} file.`);
  }

  return {
    metadata,
    endpoint,
    languages: WORKSPACE_LANGUAGES,
    themes: WORKSPACE_THEMES,
    prompt,
    setPrompt,
    selectedTemplate,
    setSelectedTemplate,
    language,
    setLanguage,
    theme,
    setTheme,
    isGenerating,
    progress,
    apiError,
    activeProject,
    setActiveProject,
    actionLoading,
    renameOpen,
    setRenameOpen,
    renameValue,
    setRenameValue,
    projects,
    pagination,
    generate,
    toggleFavorite,
    deleteProject,
    duplicateProject,
    openRename,
    saveRename,
    copyProject,
    exportProject,
  };
}
