"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { readSseStream } from "@/lib/api/sse-client";
import { isWebsiteIncrementalPreviewEnabled } from "@/lib/website/generation-flags";
import { tryRecoverCompletedWebsiteGeneration } from "@/lib/website/stream-recovery";
import { MAX_RECENT_PROJECTS } from "@/lib/website/constants";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { inferWebsiteOnboardingDefaults } from "@/lib/ai-core/website-builder/onboarding-inference";
import {
  BUILDER_PANEL_FEATURES,
  BUILDER_PANEL_FEATURE_I18N,
  DEFAULT_BUILDER_PANEL_FEATURES,
  hydrateBuilderPanelFeatures,
  type BuilderPanelFeatureLabel,
} from "@/lib/website/builder/feature-registry";
import { CoreProgressStepper } from "@/components/dashboard/one-prompt";
import { useCoreProgress } from "@/components/dashboard/one-prompt/use-core-progress";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import { useGenerationQueryParam } from "@/lib/hooks/use-generation-query-param";
import { useWebsitePublish } from "@/lib/hooks/use-website-publish";
import {
  AlertTriangle,
  ArrowDownToLine,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileStack,
  FolderTree,
  Globe2,
  History,
  LayoutDashboard,
  Loader2,
  Maximize2,
  MonitorSmartphone,
  Palette,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { getProductDefinition } from "@/lib/products/registry";
import type { ProductDefinition, ProductId } from "@/lib/products/types";
import type {
  GenerationMode,
  GenerationStatus,
  PromptVersion,
  WebsiteGeneration,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { AnalyticsIntelligencePanel } from "@/components/dashboard/website-builder/analytics-intelligence-panel";
import { ExperimentsPanel } from "@/components/dashboard/website-builder/experiments-panel";
import { SeoAgentPanel } from "@/components/dashboard/website-builder/seo-agent-panel";
import { DeploymentDashboardPanel } from "@/components/dashboard/website-builder/deployment-dashboard-panel";
import {
  TemplateDetailsDialog,
  TemplateSelectionPanel,
  TemplateSelectionRail,
  type TemplateUsePayload,
} from "@/components/dashboard/website-builder/template-selection-panel";
import {
  TemplateIntelligencePanel,
  type TemplateIntelligenceChoice,
} from "@/components/dashboard/website-builder/template-intelligence-panel";
import { WebsiteIntelligencePanel } from "@/components/dashboard/website-builder/website-intelligence-panel";
import { BrandKitPanel } from "@/components/dashboard/website-builder/brand-kit-panel";
import { WebsiteBuilderCanvasWorkspace } from "@/components/dashboard/website-builder/tool/website-builder-canvas-workspace";
import type { OutputTab } from "@/components/dashboard/website-builder/tool/types";
import { readWebsiteBuilderApiError, formatWebsiteBuilderApiError } from "@/lib/website/builder/client-api-error";
import type { MarketplaceTemplate } from "@/lib/ai-core/template-marketplace";
import { resolveTemplateIntelligenceForMarketplace } from "@/lib/ai-core/template-intelligence/resolve-marketplace";

type WebsiteBuilderToolProps = {
  /** Serializable product id only — never pass ProductDefinition (contains LucideIcon). */
  productId?: ProductId;
  initialGenerations?: WebsiteGeneration[];
};

type WorkspaceProject = {
  id: string;
  title: string;
  type: string;
  style: string;
  theme: string;
  language: string;
  features: string[];
  createdAt: string;
  favorite: boolean;
  description: string;
  generatedProject?: GeneratedWebsiteProject;
  build?: PreviewBuildState;
  mode?: GenerationMode;
  status?: GenerationStatus;
  errorMessage?: string | null;
  parentGenerationId?: string | null;
  projectId?: string | null;
  promptVersions?: PromptVersion[];
};

type PreviewBuildState = {
  status: "idle" | "building" | "success" | "error";
  previewUrl?: string;
  buildOutput?: string;
  error?: string;
};

const LANGUAGES = [
  "English",
  "Arabic",
  "Bilingual",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
] as const;

const LANGUAGE_KEYS: Record<(typeof LANGUAGES)[number], string> = {
  English: "english",
  Arabic: "arabic",
  Bilingual: "bilingual",
  Spanish: "spanish",
  French: "french",
  German: "german",
  Portuguese: "portuguese",
  Italian: "italian",
};

const TEMPLATES = [
  "Luxury real estate marketplace",
  "Premium SaaS landing page",
  "Clinic website with booking",
  "Restaurant ordering platform",
  "Executive portfolio website",
] as const;

const PAGES = ["Home", "About", "Services", "Pricing", "Dashboard", "Admin", "Contact"];

type GenerateProjectResponse =
  | {
      project: GeneratedWebsiteProject;
      generation: WebsiteGeneration;
      message?: string;
    }
  | { error?: string };

function formatGenerationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isGeneratedWebsiteProject(value: unknown): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

function sanitizeZipPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);

  if (
    !parts.length ||
    parts.some((part) => part === "." || part === "..") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".next/")
  ) {
    return null;
  }

  return parts.join("/");
}

function stubRunningProject(params: {
  id: string;
  title: string;
  description: string;
  type: string;
  style: string;
  theme: string;
  language: string;
  features: string[];
  mode?: GenerationMode;
}): WorkspaceProject {
  return {
    id: params.id,
    title: params.title,
    type: params.type,
    style: params.style,
    theme: params.theme,
    language: params.language,
    features: params.features,
    createdAt: formatGenerationDate(new Date().toISOString()),
    favorite: false,
    description: params.description,
    generatedProject: {
      projectKind: "website",
      title: params.title,
      description: params.description,
      pages: [],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
    },
    build: { status: "idle" },
    mode: params.mode,
    status: "running",
  };
}

function toProject(generation: WebsiteGeneration): WorkspaceProject {
  const generatedProject = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : undefined;

  return {
    id: generation.id,
    title: generation.project_name,
    type: generation.website_type,
    style: generation.design_style,
    theme: generation.color_style,
    language: generation.language,
    features: generation.features ?? [],
    createdAt: formatGenerationDate(generation.created_at),
    favorite: Boolean(generation.is_favorite),
    description: generation.business_description,
    generatedProject,
    build: { status: "idle" },
    mode: generation.mode,
    status: generation.status,
    errorMessage: generation.error_message,
    parentGenerationId: generation.parent_generation_id,
    projectId: generation.project_id,
    promptVersions: generation.prompt_versions,
  };
}

function mapIndustryToProjectType(industry: string): string | null {
  const key = industry.toLowerCase().replace(/_/g, "-");
  if (key === "restaurant") return "Restaurant";
  if (key === "healthcare" || key === "clinic") return "Clinic";
  if (key === "real-estate") return "Real Estate";
  if (key === "education") return "Education";
  if (key === "saas") return "AI SaaS";
  if (key === "ecommerce") return "E-commerce";
  if (key === "agency" || key === "luxury-business" || key === "automotive") {
    return "Business Website";
  }
  return null;
}

function buildBriefFromTemplate(
  payload: TemplateUsePayload,
  websiteLanguage: string,
): string {
  const structureOnly =
    websiteLanguage !== "English"
      ? `\n\nSTRUCTURE ONLY (do not copy English labels into the website): Template metadata below describes layout, sections, and design — NOT the output language. Every visible string in the generated site MUST be in ${websiteLanguage}.`
      : "";
  return [
    `Build a ${payload.name} website.`,
    payload.tagline,
    payload.description,
    `Industry: ${payload.industry}. Style: ${payload.style}. Layout: ${payload.layoutType}.`,
    payload.features.length
      ? `Include: ${payload.features.slice(0, 8).join(", ")}.`
      : "",
    payload.components.length
      ? `Preferred sections: ${payload.components.join(", ")}.`
      : "",
    structureOnly,
  ]
    .filter(Boolean)
    .join(" ");
}

export function WebsiteBuilderTool({
  productId,
  initialGenerations = [],
}: WebsiteBuilderToolProps) {
  const { t } = useTranslation();
  const wb = useProductT("websiteBuilder");
  const product = productId ? getProductDefinition(productId) : undefined;
  const productTemplates = product?.templates?.length
    ? product.templates
    : [...TEMPLATES];
  const [projectBrief, setProjectBrief] = useState("");
  const onePrompt = getOnePromptProduct("website-builder");
  const applyIdea = useCallback((idea: string) => {
    setProjectBrief(idea);
  }, []);
  useIdeaQueryParam(applyIdea);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [marketplaceTemplateId, setMarketplaceTemplateId] = useState<string | null>(
    null,
  );
  const [templateStyle, setTemplateStyle] = useState<string | null>(null);
  const [designPreset, setDesignPreset] = useState<string | null>(null);
  const [templateIndustry, setTemplateIndustry] = useState<string | null>(null);
  const [templateComponents, setTemplateComponents] = useState<string[]>([]);
  const [templateDesignSystem, setTemplateDesignSystem] = useState<
    TemplateUsePayload["designSystem"] | null
  >(null);
  const [templateIntelligenceId, setTemplateIntelligenceId] = useState<
    string | null
  >(null);
  const [templateIntelligenceCategory, setTemplateIntelligenceCategory] =
    useState<string | null>(null);
  const [brandIdentityId, setBrandIdentityId] = useState<string | null>(null);
  const [autoDesignHint, setAutoDesignHint] = useState<string | null>(null);
  const [catalogTemplates, setCatalogTemplates] = useState<MarketplaceTemplate[]>(
    [],
  );
  const [railDetailsTpl, setRailDetailsTpl] = useState<MarketplaceTemplate | null>(
    null,
  );
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [features, setFeatures] = useState<BuilderPanelFeatureLabel[]>([
    ...DEFAULT_BUILDER_PANEL_FEATURES,
  ]);

  // Template Marketplace handoff: ?templateId=&marketplaceTemplateId=&templateStyle=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("templateId")?.trim();
    const mid = params.get("marketplaceTemplateId")?.trim();
    const style = params.get("templateStyle")?.trim();
    const preset = params.get("designPreset")?.trim();
    if (tid) setSelectedTemplateId(tid);
    if (mid) setMarketplaceTemplateId(mid);
    if (style) setTemplateStyle(style);
    if (preset) setDesignPreset(preset);
    if (tid || mid) {
      setStreamStatus(
        mid
          ? `Marketplace template selected: ${mid}`
          : `Template selected: ${tid}`,
      );
    }
  }, []);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [outputTab, setOutputTab] = useState<OutputTab>(
    "preview",
  );
  const [previewRevision, setPreviewRevision] = useState(0);
  const [fileSearch, setFileSearch] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visualEditorDirty, setVisualEditorDirty] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [projects, setProjects] = useState<WorkspaceProject[]>(
    initialGenerations.map(toProject),
  );
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(
    initialGenerations[0] ? toProject(initialGenerations[0]) : null,
  );

  const inferredFromBrief = useMemo(
    () =>
      inferWebsiteOnboardingDefaults(
        projectBrief || activeProject?.description || "",
      ),
    [projectBrief, activeProject?.description],
  );

  const streamAbortRef = useRef<AbortController | null>(null);
  const activeStreamSessionRef = useRef<string | null>(null);
  const progressStep = useCoreProgress({
    events: streamStatus ? [`[generation] ${streamStatus}`] : [],
    active: isGenerating,
    complete: !isGenerating && !!activeProject,
  });

  const openGenerationFromQuery = useCallback(
    async (generationId: string) => {
      if (visualEditorDirty && outputTab === "canvas") {
        if (!window.confirm(wb("dialogs.unsavedEditorWarning"))) return;
        setVisualEditorDirty(false);
      }
      try {
        const response = await fetch(`/api/website-builder/${generationId}`);
        if (!response.ok) {
          toast.error(wb("errors.noProject"));
          return;
        }
        const data = (await response.json()) as { generation?: WebsiteGeneration };
        if (!data.generation) {
          toast.error(wb("errors.noProject"));
          return;
        }
        const project = toProject(data.generation);
        setProjects((items) => {
          const filtered = items.filter((item) => item.id !== project.id);
          return [project, ...filtered].slice(0, MAX_RECENT_PROJECTS);
        });
        setActiveProject(project);
        setSelectedFilePath(project.generatedProject?.files[0]?.path ?? "");
        setFileSearch("");
        setEditMode(false);
        setOutputTab("preview");
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("generation");
          window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );
        }
      } catch {
        toast.error(wb("errors.api"));
      }
    },
    [visualEditorDirty, outputTab, wb],
  );

  useGenerationQueryParam(openGenerationFromQuery, () => {
    toast.error(wb("errors.noProject"));
  });

  useEffect(() => {
    if (!visualEditorDirty || outputTab !== "canvas") return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [visualEditorDirty, outputTab]);

  function handleOutputTabChange(tab: OutputTab) {
    if (visualEditorDirty && outputTab === "canvas" && tab !== "canvas") {
      if (!window.confirm(wb("dialogs.unsavedEditorWarning"))) return;
      setVisualEditorDirty(false);
    }
    setOutputTab(tab);
  }

  function requestDelete(target: WorkspaceProject | string) {
    const project =
      typeof target === "string"
        ? projects.find((item) => item.id === target)
        : target;
    if (!project || isDeleting) return;
    setDeleteTarget(project);
    setDeleteOpen(true);
  }

  async function confirmDeleteProject() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    if (!isGenerating) {
      setElapsedSeconds(0);
      return;
    }
    setElapsedSeconds(0);
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    const active = activeProject;
    if (!active?.id || active.generatedProject?.files?.length) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/website-builder/${active.id}`);
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { generation?: WebsiteGeneration };
        if (!data.generation || cancelled) return;
        const hydrated = toProject(data.generation);
        setProjects((items) =>
          items.map((item) => (item.id === hydrated.id ? hydrated : item)),
        );
        setActiveProject(hydrated);
        setSelectedFilePath(hydrated.generatedProject?.files[0]?.path ?? "");
      } catch {
        // Keep stub until user selects again
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only hydrate once on mount when SSR stub is empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isWebsiteIncrementalPreviewEnabled() || !isGenerating) return;
    const generationId = activeProject?.id;
    if (!generationId || activeProject?.status !== "running") return;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/website-builder/${generationId}`);
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { generation?: WebsiteGeneration };
        if (!data.generation || cancelled) return;
        const hydrated = toProject(data.generation);
        setProjects((items) =>
          items.map((item) => (item.id === hydrated.id ? hydrated : item)),
        );
        setActiveProject((current) =>
          current?.id === hydrated.id ? hydrated : current,
        );
        if (hydrated.generatedProject?.files?.length) {
          setSelectedFilePath((current) =>
            current && hydrated.generatedProject?.files.some((f) => f.path === current)
              ? current
              : (hydrated.generatedProject?.files[0]?.path ?? ""),
          );
        }
      } catch {
        // Keep last checkpoint snapshot
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [previewRevision, isGenerating, activeProject?.id, activeProject?.status]);

  const currentPages = useMemo(() => {
    const featurePages = features.includes("Blog") ? ["Blog"] : [];
    const appPages = features.includes("Payments") ? ["Checkout"] : [];
    return [...PAGES, ...featurePages, ...appPages].slice(0, 8);
  }, [features]);
  const activeFiles = activeProject?.generatedProject?.files ?? [];
  const activeFile =
    activeFiles.find((file) => file.path === selectedFilePath) ?? activeFiles[0] ?? null;

  async function selectProject(
    project: WorkspaceProject,
    options?: { skipDirtyCheck?: boolean },
  ): Promise<boolean> {
    if (
      !options?.skipDirtyCheck &&
      visualEditorDirty &&
      outputTab === "canvas" &&
      activeProject?.id !== project.id
    ) {
      if (!window.confirm(wb("dialogs.unsavedEditorWarning"))) return false;
      setVisualEditorDirty(false);
    }
    const needsHydration = !project.generatedProject?.files?.length;
    if (needsHydration) {
      try {
        const response = await fetch(`/api/website-builder/${project.id}`);
        if (response.ok) {
          const data = (await response.json()) as { generation?: WebsiteGeneration };
          if (data.generation) {
            const hydrated = toProject(data.generation);
            setProjects((items) =>
              items.map((item) => (item.id === hydrated.id ? hydrated : item)),
            );
            setActiveProject(hydrated);
            if (
              hydrated.language &&
              (LANGUAGES as readonly string[]).includes(hydrated.language)
            ) {
              setLanguage(hydrated.language as (typeof LANGUAGES)[number]);
            }
            if (hydrated.features?.length) {
              setFeatures(hydrateBuilderPanelFeatures(hydrated.features));
            }
            setSelectedFilePath(hydrated.generatedProject?.files[0]?.path ?? "");
            setFileSearch("");
            return true;
          }
        }
      } catch {
        // Fall through
      }
    }
    setActiveProject(project);
    if (
      project.language &&
      (LANGUAGES as readonly string[]).includes(project.language)
    ) {
      setLanguage(project.language as (typeof LANGUAGES)[number]);
    }
    if (project.features?.length) {
      setFeatures(hydrateBuilderPanelFeatures(project.features));
    }
    setSelectedFilePath(project.generatedProject?.files[0]?.path ?? "");
    setFileSearch("");
    return true;
  }

  function updateProject(projectId: string, patch: Partial<WorkspaceProject>) {
    setProjects((items) =>
      items.map((item) => (item.id === projectId ? { ...item, ...patch } : item)),
    );
    setActiveProject((project) =>
      project?.id === projectId ? { ...project, ...patch } : project,
    );
  }


  function toggleFeature(feature: BuilderPanelFeatureLabel) {
    setFeatures((items) =>
      items.includes(feature)
        ? items.filter((item) => item !== feature)
        : [...items, feature],
    );
  }

  function patchProject(id: string, generation: WebsiteGeneration) {
    const nextProject = toProject(generation);

    setProjects((items) => items.map((item) => (item.id === id ? nextProject : item)));
    setActiveProject((project) => (project?.id === id ? nextProject : project));
    setSelectedFilePath((path) => path || nextProject.generatedProject?.files[0]?.path || "");
  }

  async function createInterfaceProject(options?: {
    regenerate?: boolean;
    continue?: boolean;
    /** Resume an incomplete / failed generation from saved partial files. */
    resume?: boolean;
    /** AI Website Optimizer Engine — audit + apply fixes */
    optimize?: boolean;
    /** Start a new project from a marketplace template selection. */
    fromTemplate?: TemplateUsePayload;
    /** Layer-specific improve instruction (strategy / design / assets). */
    continueInstruction?: string;
    layerImprove?: "strategy" | "design" | "assets";
  }) {
    const tpl = options?.fromTemplate;
    const mode = options?.resume
      ? "continue"
      : options?.continue || options?.optimize || options?.layerImprove
        ? "continue"
        : options?.regenerate
          ? "regenerate"
          : "generate";

    const layerInstruction = options?.continueInstruction?.trim();

    if (mode === "continue") {
      if (!activeProject?.id) {
        toast.error(wb("toasts.selectWebsiteFirst"));
        return;
      }
      if (
        options?.layerImprove &&
        !activeProject.generatedProject?.files?.length
      ) {
        toast.error(wb("designEngine.generateBeforeLayerImprove"));
        return;
      }
      if (
        !options?.optimize &&
        !options?.resume &&
        !layerInstruction &&
        !projectBrief.trim()
      ) {
        toast.error(wb("toasts.describeChanges"));
        setEditMode(true);
        return;
      }
    }

    const optimizeInstruction =
      "[optimize] Improve headlines, CTA buttons, service descriptions, layout structure, mobile responsiveness, conversion, and brand consistency.";
    const resumeInstruction =
      "[resume] Finish the incomplete website generation. Reuse already generated files, complete missing files, and finalize the project without starting over.";

    const resolvedLanguage =
      mode === "continue" && activeProject?.language
        ? activeProject.language
        : language;

    const templateBrief = tpl
      ? buildBriefFromTemplate(tpl, resolvedLanguage)
      : null;
    const brief =
      templateBrief ||
      projectBrief.trim() ||
      (mode === "regenerate" || options?.resume
        ? activeProject?.description.trim()
        : "") ||
      productTemplates[0] ||
      "I need a luxury real estate website with booking, clear services pages, and a premium brand look.";

    if (mode === "regenerate" && !projectBrief.trim() && activeProject?.description) {
      setProjectBrief(activeProject.description);
    }

    const resolvedTemplateId = tpl?.templateId ?? selectedTemplateId;
    const resolvedMarketplaceId =
      tpl?.marketplaceTemplateId ?? marketplaceTemplateId;
    const resolvedStyle = tpl?.style ?? templateStyle;
    const resolvedPreset = tpl?.designPreset ?? designPreset;
    const resolvedIndustry = tpl?.industry ?? templateIndustry;
    const resolvedComponents = tpl?.components?.length
      ? tpl.components
      : templateComponents;
    const resolvedDesignSystem = tpl?.designSystem ?? templateDesignSystem;
    const resolvedThemeStyle = resolvedStyle
      ? ` ${resolvedStyle}`
      : templateStyle
        ? ` ${templateStyle}`
        : "";
    const inferred = inferWebsiteOnboardingDefaults(brief);
    const resolvedProjectType =
      (tpl?.industry ? mapIndustryToProjectType(tpl.industry) : null) ||
      inferred.projectType;
    const inferredTheme = resolvedStyle
      ? `${inferred.colorTheme} ${resolvedStyle}`
      : templateStyle
        ? `${inferred.colorTheme} ${templateStyle}`
        : inferred.theme;

    setIsGenerating(true);
    setApiError(null);
    setOutputTab("preview");

    let autoTiId = templateIntelligenceId;
    let autoTiCategory = templateIntelligenceCategory;
    let autoPreset = resolvedPreset;
    let autoComponents = resolvedComponents;
    let autoTemplateId = resolvedTemplateId;
    let autoHint: string | null = autoDesignHint;

    // Phase 1 — Auto Design when no explicit template chosen
    if (
      !tpl &&
      !templateIntelligenceId &&
      mode === "generate" &&
      !options?.resume &&
      !options?.optimize
    ) {
      try {
        setStreamStatus(
          wb("stream.aiAutoDesign"),
        );
        const autoRes = await fetch("/api/website-builder/design-platform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: brief,
            language: resolvedLanguage,
            brandStyle: inferred.designStyle,
            industry: templateIndustry || inferred.industryId || undefined,
          }),
        });
        if (autoRes.ok) {
          const autoData = (await autoRes.json()) as {
            decision?: {
              templateIntelligenceId: string;
              vertical: string;
              family: string;
              reason: string;
              designPreset: string;
              components: string[];
              premiumTemplateId?: string;
            };
          };
          if (autoData.decision) {
            autoTiId = autoData.decision.templateIntelligenceId;
            autoTiCategory = autoData.decision.family;
            autoPreset = autoData.decision.designPreset || autoPreset;
            if (autoData.decision.components?.length) {
              autoComponents = autoData.decision.components;
            }
            if (autoData.decision.premiumTemplateId) {
              autoTemplateId = autoData.decision.premiumTemplateId;
            }
            autoHint = `${autoData.decision.vertical} · ${autoData.decision.family} — ${autoData.decision.reason}`;
            setTemplateIntelligenceId(autoTiId);
            setTemplateIntelligenceCategory(autoTiCategory);
            if (autoPreset) setDesignPreset(autoPreset);
            if (autoComponents.length) setTemplateComponents(autoComponents);
            if (autoTemplateId) setSelectedTemplateId(autoTemplateId);
            setAutoDesignHint(autoHint);
          }
        }
      } catch {
        // Runner still auto-designs server-side
      }
    }

    setStreamStatus(
      options?.layerImprove === "strategy"
        ? wb("designEngine.improvingStrategy")
        : options?.layerImprove === "design"
          ? wb("designEngine.improvingDesign")
          : options?.layerImprove === "assets"
            ? wb("designEngine.improvingAssets")
            : options?.optimize
              ? wb("stream.runningOptimizer")
              : options?.resume
                ? wb("stream.resuming")
                : tpl
                  ? `Creating website from template: ${tpl.name}…`
                  : autoHint || wb("stream.connecting"),
    );

    const mergedDesignSystem = {
      ...inferred.designSystem,
      ...(resolvedDesignSystem ?? {}),
    };

    const requestBody = {
      prompt: mode === "continue" ? activeProject?.description || brief : brief,
      projectType: resolvedProjectType,
      language: resolvedLanguage,
      theme: `${inferredTheme}${resolvedThemeStyle}`,
      features: [
        ...features,
        ...(product?.id ? [`product:${product.id}`] : []),
        ...(autoTemplateId ? [`template:${autoTemplateId}`] : []),
        ...(resolvedMarketplaceId
          ? [`marketplace:${resolvedMarketplaceId}`]
          : []),
        ...(autoComponents.length
          ? autoComponents.map((c) => `component:${c}`)
          : []),
      ],
      productId: product?.id ?? "website-builder",
      projectId: tpl ? undefined : activeProject?.projectId ?? undefined,
      templateId: autoTemplateId || undefined,
      marketplaceTemplateId: resolvedMarketplaceId || undefined,
      templateStyle: resolvedStyle || inferred.designStyle || undefined,
      designPreset: autoPreset || inferred.designPreset || undefined,
      industryId: resolvedIndustry || inferred.industryId || undefined,
      components: autoComponents.length ? autoComponents : undefined,
      designSystem: mergedDesignSystem,
      templateIntelligenceId: autoTiId || undefined,
      templateIntelligenceCategory: autoTiCategory || undefined,
      brandIdentityId: brandIdentityId || undefined,
      locale: resolvedLanguage || undefined,
      mode: tpl ? "generate" : mode,
      parentGenerationId:
        tpl || mode === "generate" ? undefined : activeProject?.id,
      continueInstruction:
        tpl || mode !== "continue"
          ? undefined
          : options?.resume
            ? resumeInstruction
            : layerInstruction ||
              projectBrief.trim() ||
              (options?.optimize ? optimizeInstruction : undefined),
      optimizeWithAi: Boolean(options?.optimize),
    };

    const applySavedGeneration = (
      generatedProject: GeneratedWebsiteProject,
      generation: WebsiteGeneration,
    ) => {
      const nextProject = toProject({
        ...generation,
        blueprint: generatedProject as unknown as WebsiteGeneration["blueprint"],
      });

      setActiveProject(nextProject);
      setSelectedFilePath(
        generatedProject.files.find((f) => f.path.includes("preview/"))?.path ||
          generatedProject.files[0]?.path ||
          "",
      );
      setOutputTab("preview");
      setEditMode(false);
      setProjects((items) => [nextProject, ...items.filter((p) => p.id !== nextProject.id)].slice(0, MAX_RECENT_PROJECTS));
      setStreamStatus(wb("stream.websiteSaved"));
      toast.success(
        options?.layerImprove
          ? wb("designEngine.layerImproveComplete")
          : wb("toasts.createdAndSaved"),
      );
    };

    const recoveryMessages = {
      connectionInterrupted: wb("stream.connectionInterrupted"),
      generationFailedResume: wb("stream.generationFailedResume"),
      stillGenerating: wb("stream.stillGenerating"),
      stillGeneratingWithFiles: wb("stream.stillGeneratingWithFiles"),
      finalizing: wb("stream.finalizingSavedProject"),
    };

    const tryApplyRecoveredGeneration = async (
      generationId: string,
      lastProgressMessage: string | null,
    ): Promise<boolean> => {
      const recovered = await tryRecoverCompletedWebsiteGeneration(generationId, {
        onStatus: setStreamStatus,
        messages: recoveryMessages,
        lastProgressMessage,
      });
      if (!recovered) return false;
      applySavedGeneration(recovered.project, recovered.generation);
      setPreviewRevision((n) => n + 1);
      setApiError(null);
      return true;
    };

    streamAbortRef.current?.abort();
    const streamAbort = new AbortController();
    streamAbortRef.current = streamAbort;
    activeStreamSessionRef.current = null;

    try {
      let sessionGenerationId: string | null = null;
      const streamResponse = await fetch("/api/website-builder/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
        signal: streamAbort.signal,
      });

      if (streamResponse.ok && streamResponse.body) {
        let incrementalPreview = isWebsiteIncrementalPreviewEnabled();
        let lastPreviewBumpAt = 0;

        const sseResult = await readSseStream<{
          project?: GeneratedWebsiteProject;
          generation?: WebsiteGeneration;
          generationId?: string;
          summary?: {
            title?: string;
            fileCount?: number;
            projectKind?: string;
          };
          message?: string;
          fileCount?: number;
        }>(streamResponse, {
          onProgress: (message, _progress, meta) => {
            setStreamStatus(message);
            if (meta?.generationId) {
              sessionGenerationId = meta.generationId;
              activeStreamSessionRef.current = meta.generationId;
            }
            if (!incrementalPreview) return;
            const fileCount = meta?.fileCount ?? 0;
            if (fileCount <= 0) return;
            const now = Date.now();
            if (now - lastPreviewBumpAt < 4000) return;
            lastPreviewBumpAt = now;
            setPreviewRevision((n) => n + 1);
          },
          onSession: (session) => {
            sessionGenerationId = session.generationId;
            activeStreamSessionRef.current = session.generationId;
            if (session.incrementalPreview) incrementalPreview = true;
            if (!incrementalPreview) return;
            const stub = stubRunningProject({
              id: session.generationId,
              title: wb("statuses.generating"),
              description:
                typeof requestBody.prompt === "string"
                  ? requestBody.prompt
                  : brief,
              type: resolvedProjectType,
              style: inferred.designStyle,
              theme: inferred.colorTheme,
              language: resolvedLanguage,
              features,
              mode: requestBody.mode as GenerationMode | undefined,
            });
            setActiveProject(stub);
            setProjects((items) =>
              [stub, ...items.filter((p) => p.id !== session.generationId)].slice(0, MAX_RECENT_PROJECTS),
            );
            setOutputTab("preview");
            setPreviewRevision((n) => n + 1);
          },
          onComplete: async (payload) => {
            if (payload.project && payload.generation?.id) {
              applySavedGeneration(payload.project, payload.generation);
              setPreviewRevision((n) => n + 1);
              return;
            }

            const generationId =
              payload.generationId ?? payload.generation?.id ?? sessionGenerationId;
            if (!generationId) {
              throw new Error(wb("errors.noSavedGeneration"));
            }

            const recovered = await tryApplyRecoveredGeneration(
              generationId,
              payload.message ?? null,
            );
            if (!recovered) {
              throw new Error(wb("errors.noSavedGeneration"));
            }
          },
          onError: (message) => {
            setApiError(message);
            setStreamStatus(message);
          },
        }, { signal: streamAbort.signal });

        if (sseResult.generationId) {
          sessionGenerationId = sseResult.generationId;
          activeStreamSessionRef.current = sseResult.generationId;
        }

        if (!sseResult.completed && !sseResult.aborted) {
          const recoveryId = sessionGenerationId ?? sseResult.generationId;
          if (recoveryId) {
            const recovered = await tryApplyRecoveredGeneration(
              recoveryId,
              sseResult.lastProgressMessage,
            );
            if (!recovered) {
              // Keep partial project selectable for Resume.
              try {
                const detail = await fetch(`/api/website-builder/${recoveryId}`);
                if (detail.ok) {
                  const data = (await detail.json()) as {
                    generation?: WebsiteGeneration;
                  };
                  if (data.generation) {
                    const partial = toProject(data.generation);
                    setActiveProject(partial);
                    setProjects((items) =>
                      [partial, ...items.filter((p) => p.id !== partial.id)].slice(
                        0,
                        MAX_RECENT_PROJECTS,
                      ),
                    );
                  }
                }
              } catch {
                // ignore
              }
              throw new Error(
                sseResult.error || wb("errors.generationDisconnected"),
              );
            }
          } else {
            throw new Error(
              sseResult.error || wb("errors.generationDisconnected"),
            );
          }
        } else if (!sseResult.completed && sseResult.error) {
          const recoveryId = sessionGenerationId ?? sseResult.generationId;
          if (recoveryId) {
            const recovered = await tryApplyRecoveredGeneration(
              recoveryId,
              sseResult.lastProgressMessage,
            );
            if (recovered) return;
          }
          throw new Error(sseResult.error);
        }
      } else if (
        // Only fall back when the stream route is missing — never after a charged
        // stream attempt (401/402/429/5xx), which would double-debit AI credits.
        streamResponse.status === 404 ||
        streamResponse.status === 405
      ) {
        const response = await fetch("/api/website-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const data = (await response.json()) as GenerateProjectResponse;

        if (!response.ok) {
          throw new Error(
            await readWebsiteBuilderApiError(response, t, wb),
          );
        }

        if (!("project" in data) || !data.project || !data.generation?.id) {
          throw new Error(wb("errors.noSavedGeneration"));
        }

        applySavedGeneration(data.project, data.generation);
        setPreviewRevision((n) => n + 1);
      } else {
        const detail = await readWebsiteBuilderApiError(streamResponse, t, wb);
        throw new Error(detail);
      }
    } catch (error) {
      const recoveryId = activeStreamSessionRef.current;
      if (
        recoveryId &&
        !streamAbort.signal.aborted &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        const ok = await tryApplyRecoveredGeneration(recoveryId, null);
        if (ok) return;
      }

      setApiError(
        error instanceof Error
          ? error.message
          : wb("errors.generic"),
      );
      setStreamStatus(null);
    } finally {
      if (streamAbortRef.current === streamAbort) {
        streamAbortRef.current = null;
      }
      setIsGenerating(false);
      window.setTimeout(() => setStreamStatus(null), 1200);
    }
  }

  const handleCatalogLoaded = useCallback((templates: MarketplaceTemplate[]) => {
    setCatalogTemplates(templates);
  }, []);

  function clearTemplateSelection() {
    setSelectedTemplateId(null);
    setMarketplaceTemplateId(null);
    setTemplateStyle(null);
    setDesignPreset(null);
    setTemplateIndustry(null);
    setTemplateComponents([]);
    setTemplateDesignSystem(null);
    setTemplateIntelligenceId(null);
    setTemplateIntelligenceCategory(null);
    setBrandIdentityId(null);
    setAutoDesignHint(null);
    setStreamStatus(null);
  }

  function syncTemplateIntelligenceChoice(choice: TemplateIntelligenceChoice) {
    setTemplateIntelligenceId(choice.templateIntelligenceId);
    setTemplateIntelligenceCategory(choice.category);
    if (choice.designPreset) setDesignPreset(choice.designPreset);
    if (choice.designStyle) setTemplateStyle(choice.designStyle);
    if (choice.premiumTemplateId) {
      setSelectedTemplateId(choice.premiumTemplateId);
    }
    if (choice.components.length) {
      setTemplateComponents(choice.components);
    }
  }

  function handleTemplateIntelligenceSelect(choice: TemplateIntelligenceChoice) {
    syncTemplateIntelligenceChoice(choice);
    toast.success(wb("templates.intelligenceApplied", { name: choice.name }));
  }

  async function applyTemplateIntelligenceToActiveProject(
    templateIntelligenceId: string,
  ): Promise<boolean> {
    if (!activeProject?.id) return false;
    setIsApplyingTemplate(true);
    setApiError(null);
    setStreamStatus(wb("stream.applyingEdit"));
    try {
      const res = await fetch(
        `/api/website-builder/${activeProject.id}/template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateIntelligenceId }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        generation?: unknown;
        project?: unknown;
        template?: {
          id: string;
          name: string;
          category: string;
          designPreset: string;
          designStyle: string;
          premiumTemplateId?: string;
          components: string[];
        };
      };
      if (!res.ok) {
        throw new Error(data.error || wb("panels.failedApplyTemplate"));
      }
      if (data.generation && data.project) {
        handleTemplateIntelligenceApplied({
          generation: data.generation,
          project: data.project,
          template: data.template,
        });
      }
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : wb("errors.generic");
      setApiError(message);
      toast.error(message);
      return false;
    } finally {
      setIsApplyingTemplate(false);
      window.setTimeout(() => setStreamStatus(null), 800);
    }
  }

  function handleTemplateIntelligenceApplied(payload: {
    generation: unknown;
    project: unknown;
    template?: {
      id: string;
      name: string;
      category: string;
      designPreset: string;
      designStyle: string;
      premiumTemplateId?: string;
      components: string[];
      colors?: TemplateIntelligenceChoice["colors"];
      typography?: TemplateIntelligenceChoice["typography"];
    };
  }) {
    const generation = payload.generation as WebsiteGeneration;
    const project = payload.project as GeneratedWebsiteProject;
    if (!generation?.id || !project) return;

    if (payload.template) {
      syncTemplateIntelligenceChoice({
        templateIntelligenceId: payload.template.id,
        category: payload.template.category as TemplateIntelligenceChoice["category"],
        designPreset: payload.template.designPreset,
        designStyle: payload.template.designStyle,
        premiumTemplateId: payload.template.premiumTemplateId,
        components: payload.template.components.map(String),
        colors: payload.template.colors ?? {
          primary: project.designSystem?.colors.primary ?? "#111",
          secondary: project.designSystem?.colors.secondary ?? "#333",
          accent: project.designSystem?.colors.accent ?? "#2563EB",
          background: project.designSystem?.colors.background ?? "#fff",
          foreground: project.designSystem?.colors.foreground ?? "#111",
          surface: project.designSystem?.colors.surface ?? "#f5f5f5",
        },
        typography: payload.template.typography ?? {
          display: project.typography?.[0] ?? "Inter",
          heading: project.typography?.[0] ?? "Inter",
          body: project.typography?.[1] ?? "Inter",
        },
        name: payload.template.name,
      });
    }

    const nextProject = toProject({
      ...generation,
      blueprint: project as unknown as WebsiteGeneration["blueprint"],
    });
    setActiveProject(nextProject);
    setSelectedFilePath(
      project.files.find((f) => f.path.includes("preview/"))?.path ||
        project.files[0]?.path ||
        "",
    );
    setOutputTab("preview");
    setPreviewRevision((n) => n + 1);
    setProjects((items) =>
      items.map((p) => (p.id === nextProject.id ? nextProject : p)),
    );
    toast.success(wb("toasts.templateApplied"));
  }

  async function handleUseTemplate(payload: TemplateUsePayload) {
    setSelectedTemplateId(payload.templateId);
    setMarketplaceTemplateId(payload.marketplaceTemplateId);
    setTemplateStyle(payload.style);
    setDesignPreset(payload.designPreset);
    setTemplateIndustry(payload.industry);
    setTemplateComponents(payload.components);
    setTemplateDesignSystem(payload.designSystem);
    setProjectBrief(buildBriefFromTemplate(payload, language));
    setEditMode(false);
    setRailDetailsTpl(null);
        setOutputTab("preview");

    if (activeProject?.id) {
      const templateIntelligenceId = resolveTemplateIntelligenceForMarketplace({
        style: payload.style,
        designPreset: payload.designPreset,
        marketplaceTemplateId: payload.marketplaceTemplateId,
      });
      if (!templateIntelligenceId) {
        toast.error(wb("panels.failedApplyTemplate"));
        return;
      }
      await applyTemplateIntelligenceToActiveProject(templateIntelligenceId);
      return;
    }

    toast.success(wb("templates.usingTemplate", { name: payload.name }));
    void createInterfaceProject({ fromTemplate: payload });
  }

  async function applyWebsiteEditorEdit(params: {
    generationId: string;
    command: string;
    suggestionId?: string;
  }) {
    setIsGenerating(true);
    setApiError(null);
    setStreamStatus(wb("stream.applyingEdit"));
    try {
      const response = await fetch(
        `/api/website-builder/${params.generationId}/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: params.command,
            suggestionId: params.suggestionId,
            applyAi: true,
          }),
        },
      );
      const data = (await response.json()) as {
        project?: GeneratedWebsiteProject;
        generation?: WebsiteGeneration;
        editResult?: { summary?: string };
        error?: string;
        message?: string;
      };
      if (!response.ok || !data.project || !data.generation) {
        throw new Error(
          formatWebsiteBuilderApiError({
            status: response.status,
            code: (data as { code?: string }).code,
            message: data.error,
            t,
            wb,
          }),
        );
      }
      const nextProject = toProject({
        ...data.generation,
        blueprint: data.project as unknown as WebsiteGeneration["blueprint"],
      });
      setActiveProject(nextProject);
      setSelectedFilePath(
        data.project.files.find((f) => f.path.includes("preview/"))?.path ||
          data.project.files[0]?.path ||
          "",
      );
      setOutputTab("preview");
      setProjects((items) =>
        [nextProject, ...items.filter((p) => p.id !== nextProject.id)].slice(
          0,
          24,
        ),
      );
      setStreamStatus(wb("stream.editSaved"));
      toast.success(data.editResult?.summary || data.message || wb("toasts.edited"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : wb("errors.generic");
      setApiError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
      window.setTimeout(() => setStreamStatus(null), 1200);
    }
  }

  async function toggleFavorite(id: string) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;

    try {
      const response = await fetch(`/api/website-builder/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !project.favorite }),
      });
      const data = (await response.json()) as { generation?: WebsiteGeneration; error?: string };

      if (!response.ok || !data.generation) {
        throw new Error(data.error ?? wb("errors.favorite"));
      }

      patchProject(id, data.generation);
      toast.success(project.favorite ? wb("toasts.removedFromFavorites") : wb("toasts.addedToFavorites"));
    } catch (error) {
      const message = error instanceof Error ? error.message : wb("errors.favorite");
      setActionError(message);
      toast.error(message);
    }
  }

  async function duplicateProject(project: WorkspaceProject) {
    try {
      const response = await fetch(`/api/website-builder/${project.id}`, {
        method: "POST",
      });
      const data = (await response.json()) as { generation?: WebsiteGeneration; error?: string };

      if (!response.ok || !data.generation) {
        throw new Error(data.error ?? wb("errors.duplicate"));
      }

      const copyProject = toProject(data.generation);
      setProjects((items) => [copyProject, ...items].slice(0, MAX_RECENT_PROJECTS));
      selectProject(copyProject);
      toast.success(wb("toasts.projectDuplicated"));
    } catch (error) {
      const message = error instanceof Error ? error.message : wb("errors.duplicate");
      setActionError(message);
      toast.error(message);
    }
  }

  async function deleteProject(id: string) {
    try {
      const response = await fetch(`/api/website-builder/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? wb("errors.delete"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : wb("errors.delete");
      setActionError(message);
      toast.error(message);
      return;
    }

    const nextProjects = projects.filter((project) => project.id !== id);
    setProjects(nextProjects);
    if (activeProject?.id === id) {
      const shouldAutoSelect =
        nextProjects[0] && !(visualEditorDirty && outputTab === "canvas");
      if (shouldAutoSelect) {
        await selectProject(nextProjects[0], { skipDirtyCheck: true });
      } else {
        setActiveProject(null);
        setSelectedFilePath("");
        if (visualEditorDirty) setVisualEditorDirty(false);
      }
    }
    toast.success(wb("toasts.projectDeleted"));
  }

  async function renameProject() {
    if (!activeProject || !renameValue.trim()) return;

    try {
      const response = await fetch(`/api/website-builder/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: renameValue.trim() }),
      });
      const data = (await response.json()) as { generation?: WebsiteGeneration; error?: string };

      if (!response.ok || !data.generation) {
        throw new Error(data.error ?? wb("errors.rename"));
      }

      patchProject(activeProject.id, data.generation);
      setRenameOpen(false);
      setRenameValue("");
      toast.success(wb("toasts.projectRenamed"));
    } catch (error) {
      const message = error instanceof Error ? error.message : wb("errors.rename");
      setActionError(message);
      toast.error(message);
    }
  }

  async function copyActiveFile() {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    toast.success(wb("toasts.fileCopied"));
  }

  async function downloadProject(project = activeProject) {
    if (!project?.id) return;

    try {
      // Prefer server export — always hydrates full blueprint from DB.
      const exportResponse = await fetch(
        `/api/website-builder/${project.id}/export`,
      );

      if (exportResponse.ok) {
        const blob = await exportResponse.blob();
        const disposition = exportResponse.headers.get("Content-Disposition");
        const match = disposition?.match(/filename="([^"]+)"/);
        const filename =
          match?.[1] ??
          `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "website-project"}.zip`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(wb("toasts.zipDownloadStarted"));
        return;
      }

      if (exportResponse.status === 409) {
        // Hydrate client copy, then fall back to client ZIP if files appear.
        const detail = await fetch(`/api/website-builder/${project.id}`);
        if (detail.ok) {
          const data = (await detail.json()) as {
            generation?: WebsiteGeneration;
          };
          if (data.generation) {
            patchProject(project.id, data.generation);
            const hydrated = toProject(data.generation);
            if (hydrated.generatedProject?.files?.length) {
              project = hydrated;
            }
          }
        }
      } else {
        const data = (await exportResponse.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? wb("errors.download"));
      }

      const files = project.generatedProject?.files ?? [];
      if (!files.length) {
        toast.error(
          wb("errors.download"),
        );
        return;
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let skippedFiles = 0;
      files.forEach((file) => {
        const safePath = sanitizeZipPath(file.path);
        if (!safePath) {
          skippedFiles += 1;
          return;
        }
        zip.file(safePath, file.content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(
        skippedFiles
          ? `ZIP download started. Skipped ${skippedFiles} unsafe file path${skippedFiles === 1 ? "" : "s"}.`
          : wb("toasts.zipDownloadStarted"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : wb("errors.download"),
      );
    }
  }

  async function importProject(file: File) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", file.name.replace(/\.zip$/i, ""));
      const res = await fetch("/api/website-builder/import", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        generation?: WebsiteGeneration;
        error?: string;
        warnings?: string[];
      };
      if (!res.ok || !json.generation) {
        throw new Error(json.error || "Import failed");
      }
      const imported = toProject(json.generation);
      setProjects((items) =>
        [imported, ...items].slice(0, MAX_RECENT_PROJECTS),
      );
      setActiveProject(imported);
      toast.success("Project imported successfully");
      if (json.warnings?.length) {
        toast.message(json.warnings[0]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  }

  return (
    <div className="space-y-7 lg:space-y-9">
      <DashboardPanel gold className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgb(212_175_55/0.16),transparent_55%),radial-gradient(ellipse_45%_45%_at_100%_10%,rgb(255_215_0/0.1),transparent_58%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
              <Sparkles className="size-3.5" />
              {product?.eyebrow ?? wb("meta.eyebrow")}
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              {product?.title ?? wb("meta.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
              {product?.description ?? onePrompt.valueProposition}
            </p>
            <p className="mt-3 text-[12px] font-medium text-premium-gold/80">
              {wb("hero.tagline")}
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/[0.08] bg-black/25 p-4 shadow-[0_24px_90px_rgb(0_0_0/0.35)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-premium-gold/15 bg-[linear-gradient(145deg,rgb(212_175_55/0.13),rgb(255_255_255/0.035))] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
                    {wb("sections.generationStatus")}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {isGenerating ? wb("labels.designing") : wb("labels.ready")}
                  </p>
                </div>
                <DashboardIconBox icon={MonitorSmartphone} className="size-12 rounded-2xl" />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                {isGenerating ? (
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light" />
                ) : (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all duration-700"
                    style={{ width: activeProject ? "100%" : "34%" }}
                  />
                )}
              </div>
              <p className="mt-3 text-[12px] text-white/40">
                {isGenerating
                  ? `${streamStatus ?? wb("stream.generating")} · ${formatElapsed(elapsedSeconds)}`
                  : wb("meta.connectedProvider")}
              </p>
            </div>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <DashboardPanel>
            <SectionHeader
              icon={Wand2}
              title={editMode ? wb("sections.improveWithAi") : wb("sections.websiteBrief")}
              description={
                editMode
                  ? wb("sectionDescriptions.improveWithAi")
                  : onePrompt.valueProposition
              }
            />
            {editMode && activeProject ? (
              <div className="mt-4 rounded-2xl border border-premium-gold/25 bg-premium-gold/10 px-4 py-3 text-sm text-premium-gold-light">
                {wb("editMode.editing")}{" "}
                <span className="font-semibold text-white">{activeProject.title}</span>.{" "}
                {wb("editMode.historyNote")} {wb("editMode.exampleInline")}
              </div>
            ) : null}
            {!editMode && autoDesignHint ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <p className="font-semibold text-white">{wb("hints.aiAutoDesignReady")}</p>
                <p className="text-[12px] text-white/55">{autoDesignHint}</p>
              </div>
            ) : null}
            {!editMode && (marketplaceTemplateId || selectedTemplateId) ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-premium-gold/25 bg-premium-gold/10 px-4 py-3 text-sm text-premium-gold-light">
                <div>
                  <p className="font-semibold text-white">
                    {wb("hints.marketplaceTemplateReady")}
                  </p>
                  <p className="text-[12px] text-white/55">
                    {marketplaceTemplateId || selectedTemplateId}
                    {templateStyle ? ` · ${templateStyle}` : ""}
                    {templateIndustry ? ` · ${templateIndustry}` : ""}
                    {" · "}{wb("hints.seedsPipeline")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/templates">
                    <Button size="sm" variant="outline" className="border-white/15 text-white">
                      {wb("labels.browseAll")}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white"
                    onClick={clearTemplateSelection}
                  >
                    {wb("labels.clear")}
                  </Button>
                </div>
              </div>
            ) : !editMode && templateIntelligenceId ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-premium-gold/25 bg-premium-gold/10 px-4 py-3 text-sm text-premium-gold-light">
                <div>
                  <p className="font-semibold text-white">
                    {wb("hints.templateIntelligenceSelected")}
                  </p>
                  <p className="text-[12px] text-white/55">
                    {templateIntelligenceId}
                    {templateIntelligenceCategory
                      ? ` · ${templateIntelligenceCategory}`
                      : ""}
                    {" · "}{wb("hints.autoLayoutTheme")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  onClick={() => {
                    setTemplateIntelligenceId(null);
                    setTemplateIntelligenceCategory(null);
                  }}
                >
                  {wb("labels.clear")}
                </Button>
              </div>
            ) : !editMode ? (
              <div className="mt-4">
                <Link
                  href="/dashboard/templates"
                  className="text-[12px] font-medium text-premium-gold hover:underline"
                >
                  {wb("hints.browseMarketplace")}
                </Link>
              </div>
            ) : null}
            <Textarea
              value={projectBrief}
              onChange={(event) => setProjectBrief(event.target.value)}
              placeholder={
                editMode
                  ? wb("placeholders.improve")
                  : product?.promptPlaceholder ?? onePrompt.placeholder
              }
              className="mt-5 min-h-[190px] rounded-3xl border-white/[0.08] bg-black/25 p-5 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus-visible:border-premium-gold/35 focus-visible:ring-premium-gold/15"
            />
            {!editMode ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                  {wb("labels.examples")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {onePrompt.examples.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setProjectBrief(example.prompt)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/45 transition-all hover:border-premium-gold/25 hover:text-white/75"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <BrandKitPanel
                  selectedId={brandIdentityId}
                  disabled={isGenerating || isApplyingTemplate}
                  onSelect={(kit) => {
                    setBrandIdentityId(kit?.id || null);
                    if (kit) toast.success(wb("toasts.brandKit", { name: kit.name }));
                  }}
                />
              </div>
              <div>
                <TemplateIntelligencePanel
                  selectedId={templateIntelligenceId}
                  disabled={isGenerating || isApplyingTemplate}
                  activeGenerationId={activeProject?.id || null}
                  selectionContext={{
                    businessType: inferredFromBrief.projectType,
                    industry:
                      templateIndustry ||
                      inferredFromBrief.industryId ||
                      inferredFromBrief.projectType,
                    brandStyle: inferredFromBrief.designStyle,
                    designStyle: inferredFromBrief.designStyle,
                    prompt: projectBrief,
                  }}
                  onSelect={handleTemplateIntelligenceSelect}
                  onApplied={handleTemplateIntelligenceApplied}
                />
              </div>
              <div>
                <TemplateSelectionPanel
                  selectedMarketplaceId={marketplaceTemplateId}
                  disabled={isGenerating || isApplyingTemplate}
                  activeGenerationId={activeProject?.id || null}
                  onUseTemplate={handleUseTemplate}
                  onCatalogLoaded={handleCatalogLoaded}
                />
              </div>
            </div>
            ) : activeProject?.id ? (
              <div className="mt-5 space-y-6">
                <TemplateIntelligencePanel
                  selectedId={templateIntelligenceId}
                  disabled={isGenerating || isApplyingTemplate}
                  activeGenerationId={activeProject.id}
                  selectionContext={{
                    businessType: inferredFromBrief.projectType,
                    industry:
                      templateIndustry ||
                      inferredFromBrief.industryId ||
                      inferredFromBrief.projectType,
                    brandStyle: inferredFromBrief.designStyle,
                    designStyle: inferredFromBrief.designStyle,
                    prompt: projectBrief || activeProject.description,
                  }}
                  onSelect={handleTemplateIntelligenceSelect}
                  onApplied={handleTemplateIntelligenceApplied}
                />
                <TemplateSelectionPanel
                  selectedMarketplaceId={marketplaceTemplateId}
                  disabled={isGenerating || isApplyingTemplate}
                  activeGenerationId={activeProject?.id || null}
                  onUseTemplate={handleUseTemplate}
                  onCatalogLoaded={handleCatalogLoaded}
                />
              </div>
            ) : null}
            {apiError && (
              <div
                role="alert"
                className="mt-4 space-y-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                <p>{apiError}</p>
                {activeProject?.id &&
                (activeProject.status === "failed" ||
                  activeProject.status === "running" ||
                  /resume/i.test(apiError)) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGenerating || isApplyingTemplate}
                    onClick={() => void createInterfaceProject({ resume: true })}
                    className="border-red-300/30 bg-black/20 text-red-50 hover:bg-black/35"
                  >
                    <RefreshCw className="size-3.5" />
                    {wb("stream.resumeGeneration")}
                  </Button>
                ) : null}
              </div>
            )}
            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                {actionError}
              </p>
            )}
          </DashboardPanel>

          <DashboardPanel data-onboarding="website-language">
            <SectionHeader
              icon={FileStack}
              title={wb("sections.outputLanguage")}
              description={wb("sectionDescriptions.language")}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LANGUAGES.map((item) => (
                <ChoiceCard
                  key={item}
                  label={wb(`languages.${LANGUAGE_KEYS[item]}`)}
                  active={language === item}
                  onClick={() => setLanguage(item)}
                  compact
                />
              ))}
            </div>
          </DashboardPanel>

          <Button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            variant="outline"
            className="btn-ghost-gold h-12 w-full rounded-2xl"
          >
            <Settings className="size-4" />
            {advancedOpen ? wb("labels.hideAdvanced") : wb("labels.showAdvanced")}
          </Button>

          {advancedOpen ? (
            <DashboardPanel data-onboarding="website-features">
              <SectionHeader icon={LayoutDashboard} title={wb("sections.features")} description={wb("sectionDescriptions.features")} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BUILDER_PANEL_FEATURES.map((feature) => {
                  const checked = features.includes(feature);
                  return (
                    <label
                      key={feature}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all duration-200",
                        checked
                          ? "border-premium-gold/35 bg-premium-gold/10 text-premium-gold-light shadow-[0_12px_36px_rgb(212_175_55/0.08)]"
                          : "border-white/[0.08] bg-white/[0.025] text-white/55 hover:border-premium-gold/20 hover:text-white/80",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(feature)}
                        className="size-4 rounded border-white/20 accent-[#d4af37]"
                      />
                      {wb(`features.${BUILDER_PANEL_FEATURE_I18N[feature]}`)}
                    </label>
                  );
                })}
              </div>
            </DashboardPanel>
          ) : null}

          {(isGenerating || streamStatus) && (
            <div className="space-y-4 rounded-2xl border border-premium-gold/20 bg-premium-gold/5 p-4">
              <div className="flex items-center justify-between text-[12px] text-premium-gold-light">
                <span>{streamStatus ?? wb("statuses.generating")}</span>
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>
              <CoreProgressStepper currentStep={progressStep} compact />
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light" />
              </div>
              <p className="text-[11px] text-white/40">
                {wb("workspace.pipelineHint")}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {editMode ? (
            <>
              <Button
                type="button"
                onClick={() =>
                  void createInterfaceProject(
                    projectBrief.trim()
                      ? { continue: true }
                      : { optimize: true },
                  )
                }
                disabled={isGenerating || !activeProject?.id}
                className="btn-gold h-14 w-full rounded-2xl text-base font-bold text-luxury-black shadow-[0_18px_60px_rgb(212_175_55/0.18)] sm:col-span-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    {wb("actions.improving")}
                  </>
                ) : (
                  <>
                    <Wand2 className="size-5" />
                    {wb("sections.improveWithAi")}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setProjectBrief("");
                }}
                disabled={isGenerating}
                className="btn-ghost-gold h-14 w-full rounded-2xl text-base font-semibold"
              >
                {wb("actions.cancelEdit")}
              </Button>
            </>
          ) : (
            <>
          <Button
            type="button"
            onClick={() => {
              setEditMode(false);
              void createInterfaceProject();
            }}
            disabled={isGenerating}
            className="btn-gold h-14 w-full rounded-2xl text-base font-bold text-luxury-black shadow-[0_18px_60px_rgb(212_175_55/0.18)]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                {wb("actions.creating")}
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                {product?.generateLabel ?? wb("actions.createWebsite")}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (activeProject?.description && !projectBrief.trim()) {
                setProjectBrief(activeProject.description);
              }
              setEditMode(false);
              void createInterfaceProject({ regenerate: true });
            }}
            disabled={isGenerating || !activeProject?.id}
            className="btn-ghost-gold h-14 w-full rounded-2xl text-base font-semibold"
          >
            <RefreshCw className="size-5" />
            {wb("actions.regenerate")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!activeProject?.id) {
                toast.error(wb("toasts.createOrSelectFirst"));
                return;
              }
              void createInterfaceProject({ optimize: true });
            }}
            disabled={isGenerating || !activeProject?.id}
            className="btn-ghost-gold h-14 w-full rounded-2xl text-base font-semibold sm:col-span-2 lg:col-span-1"
          >
            <Wand2 className="size-5" />
            {wb("actions.improveWithAi")}
          </Button>
          {(activeProject?.status === "failed" ||
            activeProject?.status === "running") && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void createInterfaceProject({ resume: true })}
              disabled={isGenerating || !activeProject?.id}
              className="btn-ghost-gold h-14 w-full rounded-2xl text-base font-semibold sm:col-span-2 lg:col-span-3"
            >
              <RefreshCw className="size-5" />
              {wb("actions.resumeIncomplete")}
            </Button>
          )}
            </>
          )}
          </div>
        </div>

        <PreviewAndExportPanel
          activeProject={activeProject}
          previewRevision={previewRevision}
          onDownload={downloadProject}
          onImport={importProject}
          onImprove={() => {
            if (!activeProject?.id) return;
            void createInterfaceProject({ optimize: true });
          }}
          onGoToDeploy={() => handleOutputTabChange("deploy")}
        />
      </div>

      <DesignEnginePanels
        project={activeProject?.generatedProject}
        disabled={isGenerating || !activeProject?.id}
        onImproveLayer={(prefix, hint) => {
          if (!activeProject?.id) {
            toast.error(wb("toasts.createOrSelectFirst"));
            return;
          }
          if (!activeProject.generatedProject?.files?.length) {
            toast.error(wb("designEngine.generateBeforeLayerImprove"));
            return;
          }
          const layer =
            prefix === "[strategy]"
              ? "strategy"
              : prefix === "[design]"
                ? "design"
                : "assets";
          void createInterfaceProject({
            continue: true,
            continueInstruction: `${prefix} ${hint}`.trim(),
            layerImprove: layer,
          });
        }}
        onApplyEditorSuggestion={(command, suggestionId) => {
          if (!activeProject?.id) {
            toast.error(wb("toasts.createOrSelectFirst"));
            return;
          }
          void applyWebsiteEditorEdit({
            generationId: activeProject.id,
            command,
            suggestionId,
          });
        }}
      />

      <OutputWorkspace
        activeProject={activeProject}
        outputTab={outputTab}
        onOutputTabChange={handleOutputTabChange}
        previewRevision={previewRevision}
        files={activeFiles}
        selectedFile={activeFile}
        selectedFilePath={activeFile?.path ?? selectedFilePath}
        onSelectFile={setSelectedFilePath}
        fileSearch={fileSearch}
        onFileSearch={setFileSearch}
        projects={projects}
        onSelectProject={async (project) => {
          setEditMode(false);
          const selected = await selectProject(project);
          if (selected) setOutputTab("preview");
        }}
        onDownload={downloadProject}
        onCopy={copyActiveFile}
        onRename={() => {
          setRenameValue(activeProject?.title ?? "");
          setRenameOpen(true);
        }}
        onDelete={() => {
          if (activeProject) requestDelete(activeProject);
        }}
        visualEditorDisabled={isGenerating}
        onVisualEditorDirtyChange={setVisualEditorDirty}
        onVisualEditorSaved={({ project: savedProject, generation }) => {
          const nextProject = toProject({
            ...generation,
            blueprint:
              savedProject as unknown as WebsiteGeneration["blueprint"],
          });
          setActiveProject(nextProject);
          setProjects((items) =>
            [nextProject, ...items.filter((p) => p.id !== nextProject.id)].slice(
              0,
              24,
            ),
          );
          setPreviewRevision((n) => n + 1);
          setVisualEditorDirty(false);
          setSelectedFilePath(
            savedProject.files.find((f) => f.path.includes("preview/"))?.path ||
              savedProject.files[0]?.path ||
              "",
          );
        }}
        onSeoApplied={({ project: savedProject, generation }) => {
          const nextProject = toProject({
            ...generation,
            blueprint:
              savedProject as unknown as WebsiteGeneration["blueprint"],
          });
          setActiveProject(nextProject);
          setProjects((items) =>
            [nextProject, ...items.filter((p) => p.id !== nextProject.id)].slice(
              0,
              24,
            ),
          );
          setPreviewRevision((n) => n + 1);
          toast.success(wb("toasts.seoFixApplied"));
        }}
        onIntelligenceApply={(command) => {
          if (!activeProject?.id) return;
          setEditMode(true);
          setProjectBrief(command);
          void applyWebsiteEditorEdit({
            generationId: activeProject.id,
            command,
          });
        }}
        generationStreamMessage={streamStatus}
        onCanvasAiCommand={(command) => {
          if (!activeProject?.id) return;
          setEditMode(true);
          setProjectBrief(command);
          void applyWebsiteEditorEdit({
            generationId: activeProject.id,
            command,
          });
        }}
        onFavorite={() => {
          if (activeProject) void toggleFavorite(activeProject.id);
        }}
      />

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="border-white/10 bg-[#141414]/95 text-white">
          <DialogHeader>
            <DialogTitle>{wb("dialogs.renameTitle")}</DialogTitle>
            <DialogDescription className="text-white/45">
              {wb("dialogs.renameDescriptionWorkspace")}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="h-11 rounded-xl border-white/[0.1] bg-black/25 text-white"
            placeholder={wb("placeholders.rename")}
          />
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold"
              onClick={() => setRenameOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="btn-gold text-luxury-black"
              onClick={renameProject}
              disabled={!renameValue.trim()}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !isDeleting && setDeleteOpen(open)}>
        <DialogContent className="border-white/10 bg-[#141414]/95 text-white">
          <DialogHeader>
            <DialogTitle>{wb("dialogs.deleteTitle")}</DialogTitle>
            <DialogDescription className="text-white/45">
              {deleteTarget
                ? `${wb("dialogs.deleteDescription")} (${deleteTarget.title})`
                : wb("dialogs.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => void confirmDeleteProject()}
              disabled={isDeleting || !deleteTarget}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {wb("dialogs.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomWorkspace
        projects={projects}
        catalogTemplates={catalogTemplates}
        selectedMarketplaceId={marketplaceTemplateId}
        isGenerating={isGenerating}
        onOpenTemplateDetails={setRailDetailsTpl}
        activeProject={activeProject}
        onSelect={(project) => void selectProject(project)}
        onFavorite={toggleFavorite}
        onDuplicate={duplicateProject}
        onDelete={requestDelete}
        onDownload={downloadProject}
      />

      <TemplateDetailsDialog
        template={railDetailsTpl}
        disabled={isGenerating}
        activeGenerationId={activeProject?.id || null}
        onClose={() => setRailDetailsTpl(null)}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <DashboardIconBox icon={icon} />
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-[13px] text-white/40">{description}</p>
      </div>
    </div>
  );
}

function ChoiceCard({
  label,
  active,
  onClick,
  compact,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const wb = useProductT("websiteBuilder");
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-2xl border text-left font-semibold transition-all duration-300 hover:-translate-y-0.5",
        compact ? "px-4 py-3 text-sm" : "min-h-[84px] p-4",
        active
          ? "border-premium-gold/45 bg-premium-gold/12 text-premium-gold-light shadow-[0_16px_50px_rgb(212_175_55/0.1)]"
          : "border-white/[0.08] bg-white/[0.025] text-white/60 hover:border-premium-gold/25 hover:bg-white/[0.045] hover:text-white",
      )}
    >
      <span className="block">{label}</span>
      {!compact && (
        <span className="mt-2 block text-[12px] font-normal leading-relaxed text-white/35">
          {wb("choiceCard.description")}
        </span>
      )}
    </button>
  );
}

type PreviewViewport = "desktop" | "tablet" | "mobile";

function livePreviewSrc(projectId: string | undefined, revision = 0) {
  if (!projectId) return "";
  const base = `/api/website-builder/${projectId}/live-preview`;
  return revision > 0 ? `${base}?v=${revision}` : base;
}

function WebsiteLiveFrame({
  projectId,
  title,
  className,
  viewport = "desktop",
  revision = 0,
}: {
  projectId?: string;
  title: string;
  className?: string;
  viewport?: PreviewViewport;
  revision?: number;
}) {
  const wb = useProductT("websiteBuilder");
  const src = livePreviewSrc(projectId, revision);
  const widthClass =
    viewport === "mobile" ? "max-w-[390px]" : viewport === "tablet" ? "max-w-[768px]" : "max-w-none";

  if (!src) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 px-6 text-center">
        <Globe2 className="size-10 text-premium-gold/50" />
        <p className="text-sm text-white/50">{wb("outputTabs.createPreviewHint")}</p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto w-full bg-black/40 transition-all", widthClass, className)}>
      <iframe
        key={src}
        title={title}
        src={src}
        // Static HTML preview (no scripts). allow-same-origin keeps auth cookies
        // working for /api/website-builder/:id/live-preview.
        sandbox="allow-same-origin"
        referrerPolicy="same-origin"
        className="h-full min-h-[420px] w-full bg-black"
      />
    </div>
  );
}

/** Safe live preview + export (sandboxed static HTML; npm compile builder stays off — D-004/D-017). */
function DesignEnginePanels({
  project,
  disabled,
  onImproveLayer,
  onApplyEditorSuggestion,
}: {
  project?: GeneratedWebsiteProject;
  disabled?: boolean;
  onImproveLayer: (prefix: string, hint: string) => void;
  onApplyEditorSuggestion?: (command: string, suggestionId?: string) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const strategy = project?.strategy;
  const design = project?.designSystem;
  const assets = project?.assetManifest?.items ?? [];
  const profile = project?.businessProfile;
  if (!project) return null;

  const quality = project.qualityReport;
  const scores = project.optimizationReport?.scores;
  const seoPerf = project.seoPerformanceReport;
  const conversion = project.conversionReport;
  const editorSuggestions = project.editorSuggestions?.suggestions ?? [];
  const designScore = scores?.design ?? quality?.score ?? null;
  const seoScore = seoPerf?.scores.seo ?? scores?.seo ?? null;
  const perfScore =
    seoPerf?.scores.performance ?? scores?.performance ?? null;
  const uxScore = scores?.ux ?? conversion?.score ?? null;
  const overallScore =
    scores?.overall ??
    seoPerf?.scores.overall ??
    quality?.score ??
    null;
  const recommendations = [
    ...(seoPerf?.recommendations ?? []).slice(0, 4).map((r) => r.title),
    ...(conversion?.recommendations ?? []).slice(0, 3).map((r) => r.title),
    ...(project.optimizationReport?.audit?.suggestions ?? []).slice(0, 3),
  ].filter(Boolean);
  const uniqueRecs = Array.from(new Set(recommendations)).slice(0, 6);

  return (
    <div className="space-y-4">
      {overallScore != null || designScore != null || seoScore != null ? (
        <DashboardPanel>
          <SectionHeader
            icon={Sparkles}
            title={wb("sections.quality")}
            description={
              seoPerf?.summary ||
              project.optimizationReport?.summary ||
              conversion?.summary ||
              wb("qualityScores.description")
            }
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                [wb("qualityScores.overall"), overallScore],
                [wb("qualityScores.design"), designScore],
                [wb("qualityScores.seo"), seoScore],
                [wb("qualityScores.ux"), uxScore],
                [wb("qualityScores.perf"), perfScore],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center"
              >
                <p className="text-[10px] uppercase tracking-wide text-white/40">
                  {label}
                </p>
                <p className="text-lg font-semibold text-premium-gold-light">
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>
          {seoPerf ? (
            <p className="mt-3 text-[11px] text-white/45">
              Mobile {seoPerf.scores.mobile}
              {seoPerf.keywordPlan?.primary
                ? ` · Keyword: “${seoPerf.keywordPlan.primary}”`
                : ""}
              {conversion?.goal?.goal
                ? ` · ${wb("qualityScores.goal")}: ${conversion.goal.goal}`
                : ""}
            </p>
          ) : null}
          {uniqueRecs.length ? (
            <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
              {uniqueRecs.map((rec) => (
                <li
                  key={rec}
                  className="text-[12px] leading-snug text-white/60 before:mr-2 before:text-premium-gold/70 before:content-['•']"
                >
                  {rec}
                </li>
              ))}
            </ul>
          ) : null}
          {project.optimizationReport?.appliedFixes?.length ? (
            <p className="mt-3 text-[11px] text-white/45">
              {wb("qualityScores.applied")}: {project.optimizationReport.appliedFixes.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </DashboardPanel>
      ) : null}

      {editorSuggestions.length ? (
        <DashboardPanel>
          <SectionHeader
            icon={Sparkles}
            title={wb("seoAgent.improvementSuggestions")}
            description={
              project.editorSuggestions?.summary ||
              wb("designEngine.editorSuggestionsDescription")
            }
          />
          <ul className="mt-4 space-y-2">
            {editorSuggestions.slice(0, 8).map((suggestion) => (
              <li
                key={suggestion.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-white/85">
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-premium-gold/70">
                      {suggestion.category}
                    </span>
                    {suggestion.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/50">
                    {suggestion.description}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onApplyEditorSuggestion?.(
                      suggestion.command,
                      suggestion.id,
                    )
                  }
                  className="shrink-0 rounded-lg border border-premium-gold/30 px-3 py-1.5 text-[11px] font-semibold text-premium-gold-light transition hover:bg-premium-gold/10 disabled:opacity-40"
                >
                  {wb("designEngine.apply")}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-white/40">
            {wb("designEngine.editHint")}
          </p>
        </DashboardPanel>
      ) : null}
    <div className="grid gap-4 lg:grid-cols-3">
      <DashboardPanel>
        <SectionHeader
          icon={Sparkles}
          title={wb("sections.strategy")}
          description={profile ? `${profile.industry} · ${profile.targetAudience}` : wb("sections.strategy")}
        />
        <div className="mt-4 space-y-2 text-sm text-white/65">
          <p className="text-white/85">{strategy?.positioning || wb("emptyStates.strategyPending")}</p>
          {strategy?.sitemap?.length ? (
            <p className="text-xs text-white/45">{wb("designEngine.sitemap")}: {strategy.sitemap.join(" → ")}</p>
          ) : null}
          {strategy?.ctas?.length ? (
            <p className="text-xs text-white/45">{wb("designEngine.ctas")}: {strategy.ctas.slice(0, 3).join(", ")}</p>
          ) : null}
          {strategy?.contentStrategy?.brandVoice ? (
            <p className="text-xs text-white/40">
              {wb("designEngine.voice")}: {strategy.contentStrategy.brandVoice}
            </p>
          ) : null}
          {profile?.requiredSections?.length ? (
            <p className="text-xs text-white/40">
              {wb("designEngine.sections")}: {profile.requiredSections.slice(0, 5).join(", ")}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="btn-ghost-gold mt-4 h-9 w-full rounded-xl text-xs"
          disabled={disabled}
          onClick={() =>
            onImproveLayer(
              "[strategy]",
              wb("designEngine.improveStrategyHint"),
            )
          }
        >
          {wb("designEngine.improveStrategy")}
        </Button>
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader
          icon={Palette}
          title={wb("sections.designSystem")}
          description={design?.style || wb("sections.designSystem")}
        />
        <div className="mt-4 space-y-3 text-sm text-white/65">
          {design ? (
            <>
              <div className="flex flex-wrap gap-2">
                {Object.entries(design.colors)
                  .slice(0, 6)
                  .map(([token, hex]) => (
                    <span
                      key={token}
                      className="size-7 rounded-full border border-white/15"
                      style={{ background: hex }}
                      title={`${token}: ${hex}`}
                    />
                  ))}
              </div>
              <p className="text-xs text-white/45">
                {design.typography.headingFont} / {design.typography.bodyFont}
              </p>
              <p className="text-xs text-white/45">
                {wb("designEngine.preset")}: {design.stylePreset ?? "modern"} · {wb("designEngine.pattern")}:{" "}
                {design.industryPattern}
              </p>
              {design.layoutStyle ? (
                <p className="text-xs text-white/40">{design.layoutStyle}</p>
              ) : null}
            </>
          ) : (
            <p>{wb("panels.designTokensPending")}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="btn-ghost-gold mt-4 h-9 w-full rounded-xl text-xs"
          disabled={disabled}
          onClick={() =>
            onImproveLayer(
              "[design]",
              wb("designEngine.improveDesignHint"),
            )
          }
        >
          {wb("designEngine.improveDesign")}
        </Button>
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader
          icon={FileStack}
          title={wb("labels.assets")}
          description={
            project.assetManifest?.provider
              ? `${wb("designEngine.provider")}: ${project.assetManifest.provider}`
              : wb("labels.heroVisuals")
          }
        />
        <div className="mt-4 space-y-2">
          {assets.length ? (
            assets.slice(0, 4).map((asset) => (
              <div key={asset.id} className="flex items-center gap-3">
                {asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.alt}
                    className="size-10 rounded-lg object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="size-10 rounded-lg bg-white/5" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white/80">{asset.name}</p>
                  <p className="truncate text-[11px] text-white/40">
                    {asset.role} · {asset.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/55">{wb("panels.assetsPending")}</p>
          )}
          {quality?.weakSections?.length ? (
            <p className="pt-2 text-[11px] text-amber-200/70">
              {wb("designEngine.qa")}: {quality.weakSections.slice(0, 2).join("; ")}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="btn-ghost-gold mt-4 h-9 w-full rounded-xl text-xs"
          disabled={disabled}
          onClick={() =>
            onImproveLayer(
              "[assets]",
              wb("designEngine.improveAssetsHint"),
            )
          }
        >
          {wb("designEngine.improveAssets")}
        </Button>
      </DashboardPanel>
    </div>
    </div>
  );
}

function PreviewAndExportPanel({
  activeProject,
  previewRevision = 0,
  onDownload,
  onImport,
  onImprove,
  onGoToDeploy,
}: {
  activeProject: WorkspaceProject | null;
  previewRevision?: number;
  onDownload: (project?: WorkspaceProject | null) => void;
  onImport?: (file: File) => void;
  onImprove: () => void;
  onGoToDeploy: () => void;
}) {
  const wb = useProductT("websiteBuilder");
  const { t } = useTranslation();
  const generated = activeProject?.generatedProject;
  const fileCount = generated?.files.length ?? 0;
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [liveOpen, setLiveOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const publish = useWebsitePublish(activeProject?.id ?? null);

  return (
    <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
      <DashboardPanel gold className="overflow-hidden">
        <div className="flex items-center gap-3">
          <DashboardIconBox icon={MonitorSmartphone} />
          <div>
            <h3 className="font-bold text-white">{wb("preview.title")}</h3>
            <p className="text-[13px] text-white/40">
              {wb("workspace.viewGeneratedInside")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["desktop", MonitorSmartphone],
              ["tablet", LayoutDashboard],
              ["mobile", Smartphone],
            ] as const
          ).map(([key, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewport(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold capitalize",
                viewport === key
                  ? "border-premium-gold/35 bg-premium-gold/12 text-premium-gold-light"
                  : "border-white/10 text-white/45 hover:text-white/75",
              )}
            >
              <Icon className="size-3.5" />
              {key === "desktop"
                ? wb("preview.deviceDesktop")
                : key === "tablet"
                  ? wb("preview.deviceTablet")
                  : wb("preview.deviceMobile")}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <WebsiteLiveFrame
            projectId={activeProject?.id}
            title={wb("preview.title")}
            viewport={viewport}
            revision={previewRevision}
            className="h-[420px]"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="btn-ghost-gold h-10 rounded-xl"
            onClick={() => setLiveOpen(true)}
            disabled={!activeProject?.id}
          >
            <Maximize2 className="size-4" />
            {wb("previewExport.openLivePreview")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="btn-ghost-gold h-10 rounded-xl"
            onClick={onImprove}
            disabled={!activeProject}
          >
            <Wand2 className="size-4" />
            {wb("actions.improveWithAi")}
          </Button>
          <Button
            type="button"
            className="btn-gold h-10 rounded-xl font-bold text-luxury-black"
            onClick={() => onDownload(activeProject)}
            disabled={!activeProject}
          >
            <Download className="size-4" />
            {wb("labels.downloadZip")}
          </Button>
          {onImport ? (
            <>
              <input
                ref={importRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold h-10 rounded-xl"
                onClick={() => importRef.current?.click()}
              >
                {t("common.import")}
              </Button>
            </>
          ) : null}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          {wb("previewExport.sandboxHint")}
        </p>
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader
          icon={Globe2}
          title={wb("publish.title")}
          description={wb("publish.description")}
        />
        <div className="mt-5 space-y-3">
          <InfoTile label={wb("labels.website")} value={activeProject?.title ?? wb("labels.notCreatedYet")} />
          <InfoTile label={wb("labels.files")} value={String(fileCount)} />
          <InfoTile
            label={wb("labels.status")}
            value={
              publish.status === "none"
                ? wb("publish.notPublished")
                : publish.status
            }
          />
          <InfoTile
            label={wb("labels.publicUrl")}
            value={publish.publicUrl ?? wb("publish.notPublished")}
          />
          {publish.quality?.blockers[0] ? (
            <p className="text-[11px] text-amber-200/80">{publish.quality.blockers[0]}</p>
          ) : null}
          <div className="flex flex-col gap-2">
            {publish.status === "published" && publish.publicUrl ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold h-10 w-full rounded-xl"
                onClick={() =>
                  window.open(
                    publish.publicUrl!.startsWith("http")
                      ? publish.publicUrl!
                      : publish.publicUrl!,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <Maximize2 className="size-4" />
                {wb("previewExport.openPublicUrl")}
              </Button>
            ) : null}
            <Button
              type="button"
              className="btn-gold h-10 w-full rounded-xl font-bold text-luxury-black"
              onClick={onGoToDeploy}
              disabled={!activeProject?.id}
            >
              <Rocket className="size-4" />
              {wb("workspace.deploy")}
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-white/40">
            {wb("panels.deploymentDescription")}
          </p>
        </div>
      </DashboardPanel>

      <Dialog open={liveOpen} onOpenChange={setLiveOpen}>
        <DialogContent className="max-h-[92vh] w-[min(1100px,96vw)] max-w-none border-white/10 bg-[#0c0c0c] p-0 text-white">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <DialogTitle className="text-base font-bold">
                {activeProject?.title ?? wb("preview.title")}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/45">
                {wb("previewExport.liveDialogDescription")}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold h-9 rounded-xl"
                onClick={onImprove}
              >
                <Wand2 className="size-4" />
                {wb("previewExport.improve")}
              </Button>
              <Button
                type="button"
                className="btn-gold h-9 rounded-xl font-bold text-luxury-black"
                onClick={() => onDownload(activeProject)}
              >
                <Download className="size-4" />
                {wb("previewExport.zip")}
              </Button>
            </div>
          </div>
          <div className="h-[min(78vh,820px)] bg-black">
            <WebsiteLiveFrame
              projectId={activeProject?.id}
              title={wb("preview.openInNewTab")}
              viewport="desktop"
              revision={previewRevision}
              className="h-full min-h-[78vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
      <p className="text-[11px] text-white/35">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function OutputWorkspace({
  activeProject,
  outputTab,
  onOutputTabChange,
  previewRevision = 0,
  files,
  selectedFile,
  selectedFilePath,
  onSelectFile,
  fileSearch,
  onFileSearch,
  projects,
  onSelectProject,
  onDownload,
  onCopy,
  onRename,
  onDelete,
  onFavorite,
  visualEditorDisabled,
  onVisualEditorDirtyChange,
  onVisualEditorSaved,
  onSeoApplied,
  onIntelligenceApply,
  generationStreamMessage,
  onCanvasAiCommand,
}: {
  activeProject: WorkspaceProject | null;
  outputTab: OutputTab;
  onOutputTabChange: (tab: OutputTab) => void;
  previewRevision?: number;
  files: GeneratedProjectFile[];
  selectedFile: GeneratedProjectFile | null;
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  fileSearch: string;
  onFileSearch: (value: string) => void;
  projects: WorkspaceProject[];
  onSelectProject: (project: WorkspaceProject) => void;
  onDownload: (project?: WorkspaceProject | null) => void;
  onCopy: () => void;
  onRename: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  visualEditorDisabled?: boolean;
  onVisualEditorDirtyChange?: (dirty: boolean) => void;
  onVisualEditorSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
  onSeoApplied: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
  onIntelligenceApply?: (command: string) => void;
  generationStreamMessage?: string | null;
  onCanvasAiCommand?: (command: string, useStream?: boolean) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const filteredFiles = files.filter((file) =>
    file.path.toLowerCase().includes(fileSearch.toLowerCase()),
  );
  const openTabs = files.slice(0, 5);

  return (
    <DashboardPanel className="overflow-hidden p-0">
      <ProjectToolbar
        activeProject={activeProject}
        selectedFile={selectedFile}
        onDownload={onDownload}
        onCopy={onCopy}
        onRename={onRename}
        onDelete={onDelete}
        onFavorite={onFavorite}
      />
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2">
        <button
          type="button"
          onClick={() => onOutputTabChange("preview")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "preview"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.livePreview")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("canvas")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "canvas"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.visualEditor")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("code")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "code"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.sourceFiles")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("analytics")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "analytics"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.analytics")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("experiments")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "experiments"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.experiments")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("intelligence")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "intelligence"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.intelligence")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("seo")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "seo"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.seoAgent")}
        </button>
        <button
          type="button"
          onClick={() => onOutputTabChange("deploy")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            outputTab === "deploy"
              ? "bg-premium-gold/15 text-premium-gold-light"
              : "text-white/45 hover:text-white/75",
          )}
        >
          {wb("outputTabs.publish")}
        </button>
      </div>
      {outputTab === "canvas" ? (
        <div className="min-h-[760px]">
          {activeProject?.id && files.length ? (
            <WebsiteBuilderCanvasWorkspace
              generationId={activeProject.id}
              files={files}
              project={activeProject.generatedProject!}
              disabled={visualEditorDisabled}
              promptHint={activeProject.description}
              aiLoading={visualEditorDisabled}
              aiStreamMessage={generationStreamMessage}
              onAiCommand={onCanvasAiCommand}
              onDirtyChange={onVisualEditorDirtyChange}
              onOpenWorkspaceTab={onOutputTabChange}
              onSaved={onVisualEditorSaved}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
              {wb("outputTabs.openEditorHint")}
            </div>
          )}
        </div>
      ) : outputTab === "analytics" ? (
        <div className="min-h-[760px] overflow-y-auto">
          <AnalyticsIntelligencePanel generationId={activeProject?.id ?? null} />
        </div>
      ) : outputTab === "experiments" ? (
        <div className="min-h-[760px] overflow-y-auto">
          <ExperimentsPanel generationId={activeProject?.id ?? null} />
        </div>
      ) : outputTab === "seo" ? (
        <div className="min-h-[760px] overflow-y-auto">
          <SeoAgentPanel
            generationId={activeProject?.id ?? null}
            onApplied={onSeoApplied}
          />
        </div>
      ) : outputTab === "intelligence" ? (
        <div className="min-h-[760px] overflow-y-auto p-4">
          <WebsiteIntelligencePanel
            generationId={activeProject?.id ?? null}
            disabled={visualEditorDisabled}
            onApplySuggestion={onIntelligenceApply}
          />
        </div>
      ) : outputTab === "deploy" ? (
        <div className="min-h-[760px] overflow-y-auto">
          <DeploymentDashboardPanel
            generationId={activeProject?.id ?? null}
          />
        </div>
      ) : (
      <div className="grid min-h-[760px] lg:grid-cols-[290px_minmax(0,1fr)_330px]">
        <ProjectLeftSidebar
          activeProject={activeProject}
          files={filteredFiles}
          allFileCount={files.length}
          selectedFilePath={selectedFilePath}
          onSelectFile={onSelectFile}
          fileSearch={fileSearch}
          onFileSearch={onFileSearch}
          projects={projects}
          onSelectProject={onSelectProject}
        />
        <div className="min-w-0 border-x border-white/[0.08] bg-[#050505]">
          {outputTab === "preview" ? (
            <WebsiteLiveFrame
              projectId={activeProject?.id}
              title={wb("preview.title")}
              viewport="desktop"
              revision={previewRevision}
              className="h-full min-h-[720px]"
            />
          ) : (
            <CodeEditorWorkspace
              files={files}
              openTabs={openTabs}
              selectedFile={selectedFile}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
            />
          )}
        </div>
        <ProjectRightSidebar
          activeProject={activeProject}
          selectedFile={selectedFile}
          onDownload={onDownload}
          onFavorite={onFavorite}
          onRename={onRename}
        />
      </div>
      )}
    </DashboardPanel>
  );
}

function ProjectToolbar({
  activeProject,
  selectedFile,
  onDownload,
  onCopy,
  onRename,
  onDelete,
  onFavorite,
}: {
  activeProject: WorkspaceProject | null;
  selectedFile: GeneratedProjectFile | null;
  onDownload: (project?: WorkspaceProject | null) => void;
  onCopy: () => void;
  onRename: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}) {
  const { t } = useTranslation();
  const wb = useProductT("websiteBuilder");
  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.08] bg-black/25 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
          {wb("workspace.title")}
        </p>
        <h3 className="mt-1 truncate text-lg font-bold text-white">
          {activeProject?.title ?? wb("emptyStates.noProjectSelected")}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeProject?.id ? (
          <Link href={`/dashboard/website-builder/${activeProject.id}`}>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
            >
              <LayoutDashboard className="size-4" />
              {wb("actions.manageWebsite")}
            </Button>
          </Link>
        ) : null}
        <Button
          type="button"
          className="btn-gold rounded-xl font-bold text-luxury-black"
          onClick={() => onDownload(activeProject)}
          disabled={!activeProject}
        >
          <Download className="size-4" />
          {wb("labels.downloadZip")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="btn-ghost-gold rounded-xl"
          onClick={onCopy}
          disabled={!selectedFile}
        >
          <Copy className="size-4" />
          {t("common.copy")}
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={onRename} disabled={!activeProject}>
          {wb("labels.rename")}
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={onFavorite} disabled={!activeProject}>
          <Star className={cn("size-4", activeProject?.favorite && "fill-premium-gold text-premium-gold")} />
          {wb("labels.favorite")}
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={() => onDownload(activeProject)} disabled={!activeProject}>
          <ArrowDownToLine className="size-4" />
          {t("common.export")}
        </Button>
        <Button type="button" variant="outline" className="rounded-xl border-red-400/20 text-red-300 hover:bg-red-400/10" onClick={onDelete} disabled={!activeProject}>
          <Trash2 className="size-4" />
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

function ProjectLeftSidebar({
  activeProject,
  files,
  allFileCount,
  selectedFilePath,
  onSelectFile,
  fileSearch,
  onFileSearch,
  projects,
  onSelectProject,
}: {
  activeProject: WorkspaceProject | null;
  files: GeneratedProjectFile[];
  allFileCount: number;
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  fileSearch: string;
  onFileSearch: (value: string) => void;
  projects: WorkspaceProject[];
  onSelectProject: (project: WorkspaceProject) => void;
}) {
  const wb = useProductT("websiteBuilder");
  return (
    <aside className="space-y-5 bg-black/20 p-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <FolderTree className="size-4 text-premium-gold" />
          {wb("workspace.projectFiles")}
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={fileSearch}
            onChange={(event) => onFileSearch(event.target.value)}
            placeholder={wb("placeholders.searchFiles")}
            className="h-10 rounded-xl border-white/[0.08] bg-black/25 pl-9 text-white"
          />
        </label>
        <div className="mt-3 max-h-[300px] space-y-1 overflow-auto">
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              onClick={() => onSelectFile(file.path)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-all",
                selectedFilePath === file.path
                  ? "bg-premium-gold/12 text-premium-gold-light ring-1 ring-premium-gold/25"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80",
              )}
            >
              <span className="truncate">{file.path}</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/35">
                {file.language}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          {wb("workspace.projectInfo")}
        </p>
        <p className="mt-2 truncate font-semibold text-white">{activeProject?.title ?? wb("emptyStates.noProject")}</p>
        <p className="mt-1 text-[12px] text-white/40">{activeProject?.type ?? wb("emptyStates.generateProject")}</p>
        <p className="mt-3 text-[12px] text-premium-gold-light">{wb("workspace.fileCount", { count: allFileCount })}</p>
      </div>

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
              onClick={() => onSelectProject(project)}
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
    </aside>
  );
}

function highlightCode(code: string) {
  const escaped = code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return escaped
    .replace(/\b(import|export|const|let|function|return|type|interface|from|default|async|await)\b/g, '<span class="text-[#F4D56A]">$1</span>')
    .replace(/\b(className|href|src|metadata|children)\b/g, '<span class="text-sky-300">$1</span>')
    .replace(/(&quot;.*?&quot;|".*?")/g, '<span class="text-emerald-300">$1</span>')
    .replace(/(\/\/.*)$/gm, '<span class="text-white/35">$1</span>');
}

function CodeEditorWorkspace({
  files,
  openTabs,
  selectedFile,
  selectedFilePath,
  onSelectFile,
}: {
  files: GeneratedProjectFile[];
  openTabs: GeneratedProjectFile[];
  selectedFile: GeneratedProjectFile | null;
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const tabs = openTabs.length ? openTabs : files.slice(0, 1);

  return (
    <div className="flex h-full min-h-[760px] flex-col">
      <div className="flex min-h-12 overflow-x-auto border-b border-white/[0.08] bg-white/[0.025]">
        {tabs.map((file) => (
          <button
            key={file.path}
            type="button"
            onClick={() => onSelectFile(file.path)}
            className={cn(
              "min-w-[160px] border-r border-white/[0.08] px-4 py-3 text-left text-[12px] transition-colors",
              selectedFilePath === file.path
                ? "bg-[#050505] text-premium-gold-light"
                : "text-white/45 hover:bg-white/[0.03] hover:text-white/75",
            )}
          >
            <span className="block truncate">{file.path}</span>
          </button>
        ))}
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-5 text-[13px] leading-relaxed text-white/75">
        <code
          dangerouslySetInnerHTML={{
            __html: selectedFile
              ? highlightCode(selectedFile.content)
              : wb("emptyStates.selectFile"),
          }}
        />
      </pre>
    </div>
  );
}

function ProjectRightSidebar({
  activeProject,
  selectedFile,
  onDownload,
  onFavorite,
  onRename,
}: {
  activeProject: WorkspaceProject | null;
  selectedFile: GeneratedProjectFile | null;
  onDownload: (project?: WorkspaceProject | null) => void;
  onFavorite: () => void;
  onRename: () => void;
}) {
  const wb = useProductT("websiteBuilder");
  const project = activeProject?.generatedProject;

  return (
    <aside className="space-y-5 bg-black/20 p-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          {wb("workspace.projectDetails")}
        </p>
        <h4 className="mt-2 font-bold text-white">{activeProject?.title ?? wb("emptyStates.noProject")}</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-white/45">
          {activeProject?.description ?? wb("emptyStates.noProjectDescription")}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          {wb("workspaceMeta.promptUsed")}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          {project?.prompt ?? wb("emptyStates.promptMetadata")}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          {wb("workspaceMeta.generationMetadata")}
        </p>
        <div className="mt-3 space-y-2 text-[13px] text-white/55">
          <p>{wb("workspaceMeta.kind")}: {project?.projectKind ?? wb("workspaceMeta.unknown")}</p>
          <p>{wb("workspaceMeta.generated")}: {project?.generatedAt ? formatGenerationDate(project.generatedAt) : wb("workspaceMeta.unknown")}</p>
          <p>{wb("workspace.selectedFile")}: {selectedFile?.path ?? wb("workspace.none")}</p>
          <p>{wb("workspaceMeta.fileCount")}: {project?.files.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Settings className="size-4 text-premium-gold" />
          <p className="font-semibold text-white">{wb("sections.projectSettings")}</p>
        </div>
        <div className="space-y-2 text-[13px] text-white/55">
          <p>{wb("workspaceMeta.framework")}: {project?.settings?.framework ?? wb("workspaceMeta.defaultFramework")}</p>
          <p>{wb("workspaceMeta.styling")}: {project?.settings?.styling ?? wb("workspaceMeta.defaultStyling")}</p>
          <p>{wb("workspaceMeta.packageManager")}: {project?.settings?.packageManager ?? "npm"}</p>
          <p>{wb("workspaceMeta.deployTarget")}: {project?.settings?.deploymentTarget ?? wb("workspaceMeta.defaultDeploy")}</p>
        </div>
        <Button asChild variant="outline" className="btn-ghost-gold mt-4 w-full rounded-xl">
          <Link href="/dashboard/website-builder/settings">
            {wb("workspaceMeta.openSettingsPage")}
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-premium-gold/15 bg-premium-gold/[0.06] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
          {wb("workspaceMeta.aiActions")}
        </p>
        <div className="mt-4 grid gap-2">
          <Button className="btn-gold rounded-xl font-bold text-luxury-black" onClick={() => onDownload(activeProject)} disabled={!activeProject}>
            <Download className="size-4" />
            {wb("labels.downloadZip")}
          </Button>
          <Button variant="outline" className="btn-ghost-gold rounded-xl" onClick={onRename} disabled={!activeProject}>
            {wb("workspaceMeta.renameProject")}
          </Button>
          <Button variant="outline" className="btn-ghost-gold rounded-xl" onClick={onFavorite} disabled={!activeProject}>
            {wb("workspaceMeta.toggleFavorite")}
          </Button>
        </div>
      </div>
    </aside>
  );
}

function BottomWorkspace({
  projects,
  catalogTemplates,
  selectedMarketplaceId,
  isGenerating,
  onOpenTemplateDetails,
  activeProject,
  onSelect,
  onFavorite,
  onDuplicate,
  onDelete,
  onDownload,
}: {
  projects: WorkspaceProject[];
  catalogTemplates: MarketplaceTemplate[];
  selectedMarketplaceId?: string | null;
  isGenerating?: boolean;
  onOpenTemplateDetails: (tpl: MarketplaceTemplate) => void;
  activeProject: WorkspaceProject | null;
  onSelect: (project: WorkspaceProject) => void;
  onFavorite: (id: string) => void;
  onDuplicate: (project: WorkspaceProject) => void;
  onDelete: (id: string) => void;
  onDownload: (project?: WorkspaceProject | null) => void;
}) {
  const { t } = useTranslation();
  const wb = useProductT("websiteBuilder");
  const favorites = projects.filter((project) => project.favorite);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <DashboardPanel>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader icon={History} title={wb("sections.recentProjects")} description={wb("sectionDescriptions.recentProjects")} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onDownload(activeProject)}
              disabled={!activeProject}
            >
              <ArrowDownToLine className="size-4" />
              {t("common.export")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onDownload(activeProject)}
              disabled={!activeProject}
            >
              <Download className="size-4" />
              {t("common.download")}
            </Button>
          </div>
        </div>

        {projects.length > 0 ? (
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
                <button type="button" className="block w-full text-left" onClick={() => onSelect(project)}>
                  <p className="truncate font-semibold text-white">{project.title}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/40">
                    {project.description}
                  </p>
                  <p className="mt-3 text-[12px] text-premium-gold-light/80">
                    {project.type} · {project.createdAt}
                  </p>
                </button>
                <div className="mt-4 flex flex-wrap gap-2">
                  <IconAction icon={Star} label={wb("labels.favorite")} active={project.favorite} onClick={() => onFavorite(project.id)} />
                  <IconAction icon={Copy} label={wb("labels.duplicate")} onClick={() => onDuplicate(project)} />
                  <IconAction icon={Download} label={wb("labels.downloadZip")} onClick={() => onDownload(project)} />
                  <IconAction icon={Trash2} label={wb("labels.delete")} danger onClick={() => onDelete(project.id)} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/[0.1] p-8 text-center">
            <Globe2 className="mx-auto size-10 text-premium-gold" />
            <p className="mt-4 font-bold text-white">{wb("emptyStates.noRecentProjects")}</p>
            <p className="mt-2 text-sm text-white/40">
              Generate an interface concept to populate your recent projects, favorites and history.
            </p>
          </div>
        )}
      </DashboardPanel>

      <div className="space-y-6">
        <DashboardPanel>
          <SectionHeader
            icon={LayoutDashboard}
            title={wb("labels.templates")}
            description={wb("sectionDescriptions.templates")}
          />
          <TemplateSelectionRail
            templates={catalogTemplates}
            selectedMarketplaceId={selectedMarketplaceId}
            disabled={isGenerating}
            onOpenDetails={onOpenTemplateDetails}
          />
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeader icon={Star} title={wb("labels.favorites")} description={wb("sectionDescriptions.favorites")} />
          <div className="mt-5 space-y-3">
            {favorites.length > 0 ? (
              favorites.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelect(project)}
                  className="w-full rounded-2xl border border-premium-gold/20 bg-premium-gold/[0.06] p-3 text-left text-sm font-semibold text-premium-gold-light"
                >
                  {project.title}
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white/40">
                {wb("emptyStates.favoriteProjectsHere")}
              </p>
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        danger
          ? "border-red-400/15 text-red-300 hover:bg-red-400/10"
          : active
            ? "border-premium-gold/25 bg-premium-gold/10 text-premium-gold-light"
            : "border-white/[0.08] text-white/45 hover:border-premium-gold/25 hover:text-premium-gold-light",
      )}
    >
      <Icon className={cn("size-3.5", active && "fill-current")} />
      {label}
    </button>
  );
}
