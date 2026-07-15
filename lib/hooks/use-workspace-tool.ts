"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiMutation, usePaginatedResource } from "@/lib/hooks/use-paginated-resource";
import type { ProductDefinition } from "@/lib/products/types";
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
  getWorkspaceStreamEndpoint,
  type WorkspaceExportFormat,
} from "@/lib/workspace/export";
import {
  toWorkspaceProject,
  type WorkspaceProject,
} from "@/lib/workspace/project";
import type {
  GenerationAttachmentMeta,
  GenerationMode,
  PromptVersion,
  WorkspaceGeneration,
} from "@/types/database";
import type { WorkspaceMetadata } from "@/lib/workspace/metadata";
import type { WorkspaceOutput, WorkspaceSection } from "@/lib/workspace/types";

export type GenerationDepth = "focused" | "standard" | "deep";

type UseWorkspaceToolOptions = {
  definition: WorkspaceDefinition;
  product?: ProductDefinition;
  initialGenerations?: WorkspaceGeneration[];
  initialTotal?: number;
};

function mergeMetadata(
  base: WorkspaceMetadata,
  product?: ProductDefinition,
): WorkspaceMetadata {
  if (!product) return base;
  return {
    ...base,
    title: product.title,
    eyebrow: product.eyebrow,
    description: product.description,
    icon: product.icon,
    promptLabel: product.promptLabel,
    promptPlaceholder: product.promptPlaceholder,
    generateLabel: product.generateLabel,
    templates: product.templates,
    outputs: product.outputs,
    metrics: product.metrics,
    dashboardHref: product.href,
    label: product.title,
  };
}

function matchesProduct(generation: WorkspaceGeneration, productId?: string) {
  if (!productId) return true;
  if (generation.product_id === productId) return true;
  if (generation.output?.productId === productId) return true;
  const productTags = (generation.features ?? []).filter((feature) =>
    feature.startsWith("product:"),
  );
  if (productTags.length === 0) return true;
  return productTags.includes(`product:${productId}`);
}

async function streamSections(
  sections: WorkspaceSection[],
  onUpdate: (visible: WorkspaceSection[], summaryDone: boolean) => void,
  signal: { cancelled: boolean },
) {
  onUpdate([], false);
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (signal.cancelled) return;
  onUpdate([], true);

  const visible: WorkspaceSection[] = [];
  for (const section of sections) {
    if (signal.cancelled) return;
    await new Promise((resolve) => setTimeout(resolve, 140));
    visible.push(section);
    onUpdate([...visible], true);
  }
}

async function readSseStream(
  response: Response,
  handlers: {
    onProgress: (message: string, progress: number | null) => void;
    onComplete: (payload: {
      generation: WorkspaceGeneration;
      message?: string;
    }) => Promise<void> | void;
    onError: (message: string) => void;
  },
) {
  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      try {
        const payload = JSON.parse(data) as {
          message?: string;
          progress?: number | null;
          generation?: WorkspaceGeneration;
          error?: string;
        };

        if (event === "progress") {
          handlers.onProgress(payload.message ?? "Working...", payload.progress ?? null);
        } else if (event === "complete" && payload.generation) {
          await handlers.onComplete({
            generation: payload.generation,
            message: payload.message,
          });
        } else if (event === "error") {
          handlers.onError(payload.error ?? "Generation failed.");
        }
      } catch {
        // ignore malformed event
      }
    }
  }
}

export function useWorkspaceTool({
  definition,
  product,
  initialGenerations = [],
  initialTotal = 0,
}: UseWorkspaceToolOptions) {
  const endpoint = getWorkspaceApiEndpoint(definition.type);
  const streamEndpoint = getWorkspaceStreamEndpoint(definition.type);
  const metadata = useMemo(
    () => mergeMetadata(definition.metadata, product),
    [definition.metadata, product],
  );
  const productId = product?.id;

  const seedGenerations = useMemo(
    () =>
      productId
        ? initialGenerations.filter((item) => matchesProduct(item, productId))
        : initialGenerations,
    [initialGenerations, productId],
  );

  const pagination = usePaginatedResource<WorkspaceGeneration>({
    endpoint,
    dataKey: "generations",
    initialData: seedGenerations,
    initialTotal: productId ? seedGenerations.length : initialTotal,
    queryParams: productId ? { productId } : undefined,
  });

  const projects = useMemo(
    () => pagination.items.map(toWorkspaceProject),
    [pagination.items],
  );

  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(metadata.templates[0] ?? "");
  const [language, setLanguage] = useState<WorkspaceLanguage>("English");
  const [theme, setTheme] = useState<WorkspaceTheme>("Gold");
  const [depth, setDepth] = useState<GenerationDepth>("standard");
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(
    () => metadata.outputs.slice(0, 3),
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(18);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(
    seedGenerations[0] ? toWorkspaceProject(seedGenerations[0]) : null,
  );
  const [streamedOutput, setStreamedOutput] = useState<WorkspaceOutput | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [attachments, setAttachments] = useState<GenerationAttachmentMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle");
  const lastBriefRef = useRef("");
  const streamSignalRef = useRef({ cancelled: false });
  const autosaveTimerRef = useRef<number | null>(null);
  const lastFailedPayloadRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 92 ? 34 : value + 7));
    }, 900);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    return () => {
      streamSignalRef.current.cancelled = true;
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Autosave draft prompt against the active generation.
  useEffect(() => {
    if (!activeProject?.id || isGenerating) return;
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(async () => {
      setAutosaveState("saving");
      try {
        await fetch(`${endpoint}/${activeProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_prompt: prompt }),
        });
        setAutosaveState("saved");
      } catch {
        setAutosaveState("idle");
      }
    }, 1200);
  }, [prompt, activeProject?.id, endpoint, isGenerating]);

  function toggleOutputFeature(feature: string) {
    setSelectedOutputs((items) =>
      items.includes(feature)
        ? items.filter((item) => item !== feature)
        : [...items, feature],
    );
  }

  async function applyStreamedProject(project: WorkspaceProject) {
    streamSignalRef.current.cancelled = true;
    streamSignalRef.current = { cancelled: false };
    const signal = streamSignalRef.current;

    setIsStreaming(true);
    setStreamedOutput({
      ...project.output,
      summary: "",
      sections: [],
    });

    const events = project.output.progressEvents ?? [
      "Analyzing brief...",
      "Generating structured output...",
      "Finalizing project...",
    ];

    for (const event of events.slice(0, 4)) {
      if (signal.cancelled) return;
      setStreamStatus(event);
      setProgress((value) => Math.min(96, value + 12));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await streamSections(
      project.output.sections,
      (sections, summaryDone) => {
        if (signal.cancelled) return;
        setStreamedOutput({
          ...project.output,
          summary: summaryDone ? project.output.summary : "",
          sections,
        });
      },
      signal,
    );

    if (signal.cancelled) return;
    setStreamedOutput(project.output);
    setActiveProject(project);
    setIsStreaming(false);
    setStreamStatus(null);
  }

  async function generate(options?: {
    regenerate?: boolean;
    continue?: boolean;
    retry?: boolean;
    continueInstruction?: string;
  }) {
    const mode: GenerationMode = options?.retry
      ? "retry"
      : options?.continue
        ? "continue"
        : options?.regenerate
          ? "regenerate"
          : "generate";

    const brief = options?.regenerate || options?.retry
      ? lastBriefRef.current || prompt.trim() || selectedTemplate.trim()
      : options?.continue
        ? activeProject?.brief || lastBriefRef.current || prompt.trim()
        : prompt.trim() || selectedTemplate.trim();

    const features =
      selectedOutputs.length > 0 ? selectedOutputs : metadata.outputs.slice(0, 3);

    const payload = {
      prompt: brief,
      template: selectedTemplate,
      language,
      theme,
      features,
      productId,
      depth,
      mode,
      parentGenerationId:
        options?.continue || options?.regenerate || options?.retry
          ? activeProject?.id
          : undefined,
      projectId: activeProject?.projectId ?? undefined,
      continueInstruction: options?.continueInstruction,
      attachments,
      stream: true,
    };

    const parsed = definition.inputSchema.safeParse(payload);

    if (!parsed.success) {
      setApiError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    lastBriefRef.current = parsed.data.prompt;
    lastFailedPayloadRef.current = parsed.data;
    setApiError(null);
    setIsGenerating(true);
    setIsStreaming(true);
    setProgress(16);
    setStreamStatus("Connecting to AI engine...");
    setStreamedOutput(null);

    try {
      const response = await fetch(streamEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        // Fallback to non-streaming endpoint
        const fallback = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = (await fallback.json()) as {
          generation?: WorkspaceGeneration;
          error?: string;
          message?: string;
        };
        if (!fallback.ok || !body.generation) {
          throw new Error(body.error ?? "Generation failed.");
        }
        const project = toWorkspaceProject(body.generation);
        await applyStreamedProject(project);
        toast.success(body.message ?? "Project generated and saved.");
      } else {
        let completed = false;
        await readSseStream(response, {
          onProgress: (message, value) => {
            setStreamStatus(message);
            if (typeof value === "number") setProgress(value);
            else setProgress((current) => Math.min(90, current + 4));
          },
          onComplete: async ({ generation, message }) => {
            completed = true;
            lastFailedPayloadRef.current = null;
            const project = toWorkspaceProject(generation);
            await applyStreamedProject(project);
            toast.success(message ?? "Project generated and saved.");
          },
          onError: (message) => {
            throw new Error(message);
          },
        });
        if (!completed) {
          throw new Error("Stream ended before generation completed.");
        }
      }

      if (!options?.regenerate && !options?.continue && !options?.retry) {
        setPrompt("");
        setAttachments([]);
      }
      setProgress(100);
      pagination.refresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Generation failed.");
      setIsStreaming(false);
      setStreamStatus(null);
      toast.error(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function regenerate() {
    if (!lastBriefRef.current && !prompt.trim() && !selectedTemplate.trim()) {
      if (activeProject?.brief) {
        lastBriefRef.current = activeProject.brief;
        setPrompt(activeProject.brief);
      } else {
        setApiError("Generate a project first, then regenerate.");
        return;
      }
    }
    await generate({ regenerate: true });
  }

  async function continueGeneration(instruction?: string) {
    if (!activeProject) {
      setApiError("Select a saved project to continue generation.");
      return;
    }
    await generate({
      continue: true,
      continueInstruction:
        instruction ||
        prompt.trim() ||
        "Continue with more depth, examples, and next actions.",
    });
  }

  async function retryFailed() {
    if (activeProject?.status === "failed" && activeProject.brief) {
      lastBriefRef.current = activeProject.brief;
      setPrompt(activeProject.brief);
      await generate({ retry: true });
      return;
    }
    if (lastFailedPayloadRef.current) {
      await generate({ retry: true });
      return;
    }
    setApiError("Nothing to retry. Run a generation first.");
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const uploaded: GenerationAttachmentMeta[] = [];
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/uploads", {
          method: "POST",
          body: form,
        });
        const payload = (await response.json()) as {
          attachment?: GenerationAttachmentMeta;
          error?: string;
        };
        if (!response.ok || !payload.attachment) {
          throw new Error(payload.error ?? `Failed to upload ${file.name}`);
        }
        uploaded.push(payload.attachment);
      }
      setAttachments((current) => [...current, ...uploaded]);
      toast.success(
        uploaded.length === 1 ? "File uploaded." : `${uploaded.length} files uploaded.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  function restorePromptVersion(version: PromptVersion) {
    setPrompt(version.prompt);
    lastBriefRef.current = version.prompt;
    toast.success("Prompt version restored.");
  }

  async function toggleFavorite(project: WorkspaceProject) {
    setActionLoading(project.id);
    try {
      await apiMutation(`${endpoint}/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !project.favorite }),
      });
      if (activeProject?.id === project.id) {
        setActiveProject({ ...project, favorite: !project.favorite });
      }
      pagination.refresh();
      toast.success(project.favorite ? "Removed from favorites." : "Added to favorites.");
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
        setStreamedOutput(null);
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

  async function exportProject(project: WorkspaceProject, format: WorkspaceExportFormat) {
    let target = project;
    const needsHydration =
      !project.output?.sections?.length && !project.output?.deliverables?.length;
    if (needsHydration) {
      try {
        const res = await fetch(`${endpoint}/${project.id}`);
        if (res.ok) {
          const data = (await res.json()) as { generation?: WorkspaceGeneration };
          if (data.generation) {
            target = toWorkspaceProject(data.generation);
          }
        }
      } catch {
        // Fall through with list payload
      }
    }
    downloadWorkspaceProject(target, format);
    toast.success(`Exported ${format.toUpperCase()} file.`);
  }

  async function loadProjectIntoEditor(project: WorkspaceProject) {
    const needsHydration =
      !project.output?.sections?.length &&
      !project.output?.deliverables?.length;

    if (needsHydration) {
      try {
        const res = await fetch(`${endpoint}/${project.id}`);
        if (res.ok) {
          const data = (await res.json()) as { generation?: WorkspaceGeneration };
          if (data.generation) {
            const hydrated = toWorkspaceProject(data.generation);
            setActiveProject(hydrated);
            setStreamedOutput(hydrated.output);
            setPrompt(hydrated.draftPrompt || hydrated.brief);
            lastBriefRef.current = hydrated.brief;
            if (hydrated.template) setSelectedTemplate(hydrated.template);
            setLanguage((hydrated.language as WorkspaceLanguage) || "English");
            setTheme((hydrated.theme as WorkspaceTheme) || "Gold");
            setAttachments(hydrated.attachments ?? []);
            return;
          }
        }
      } catch {
        // Fall through to list payload
      }
    }

    setActiveProject(project);
    setStreamedOutput(project.output);
    setPrompt(project.draftPrompt || project.brief);
    lastBriefRef.current = project.brief;
    if (project.template) setSelectedTemplate(project.template);
    setLanguage((project.language as WorkspaceLanguage) || "English");
    setTheme((project.theme as WorkspaceTheme) || "Gold");
    setAttachments(project.attachments ?? []);
  }

  const previewProject = useMemo(() => {
    if (!activeProject && !streamedOutput) return null;
    if (!activeProject) return null;
    if (!streamedOutput) return activeProject;
    return { ...activeProject, output: streamedOutput };
  }, [activeProject, streamedOutput]);

  return {
    metadata,
    endpoint,
    productId,
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
    depth,
    setDepth,
    selectedOutputs,
    toggleOutputFeature,
    advancedOpen,
    setAdvancedOpen,
    isGenerating,
    isStreaming,
    streamStatus,
    progress,
    apiError,
    activeProject: previewProject,
    setActiveProject: loadProjectIntoEditor,
    actionLoading,
    renameOpen,
    setRenameOpen,
    renameValue,
    setRenameValue,
    projects,
    pagination,
    attachments,
    uploading,
    autosaveState,
    uploadFiles,
    removeAttachment,
    restorePromptVersion,
    generate: () => generate(),
    regenerate,
    continueGeneration,
    retryFailed,
    toggleFavorite,
    deleteProject,
    duplicateProject,
    openRename,
    saveRename,
    copyProject,
    exportProject,
  };
}
