"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { readSseStream } from "@/lib/api/sse-client";
import { isWebsiteIncrementalPreviewEnabled } from "@/lib/website/generation-flags";
import { tryRecoverCompletedWebsiteGeneration } from "@/lib/website/stream-recovery";
import { useTranslation } from "@/lib/i18n/client";
import { translateOption } from "@/lib/i18n/product-options";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { CoreProgressStepper } from "@/components/dashboard/one-prompt";
import { useCoreProgress } from "@/components/dashboard/one-prompt/use-core-progress";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import {
  dashboardColorThemeToDesignSystem,
  dashboardDesignStyleToPreset,
} from "@/lib/website/style-resolution";
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
import type { GeneratedProjectFile, GeneratedWebsiteProject } from "@/lib/website-generator";
import { getProductDefinition } from "@/lib/products/registry";
import type { ProductDefinition, ProductId } from "@/lib/products/types";
import type {
  GenerationMode,
  GenerationStatus,
  PromptVersion,
  WebsiteGeneration,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { VisualWebsiteEditor } from "@/components/dashboard/visual-editor/visual-website-editor";
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
import type { MarketplaceTemplate } from "@/lib/ai-core/template-marketplace";
import { resolveTemplateIntelligenceForMarketplace } from "@/lib/ai-core/template-intelligence/resolve-marketplace";

type OutputTab =
  | "preview"
  | "code"
  | "canvas"
  | "analytics"
  | "experiments"
  | "seo"
  | "deploy"
  | "intelligence";

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

const PROJECT_TYPES = [
  "Business Website",
  "Web Application",
  "E-commerce",
  "Landing Page",
  "Portfolio",
  "Restaurant",
  "Clinic",
  "Real Estate",
  "Education",
  "AI SaaS",
  "CRM",
  "ERP",
  "Mobile App",
] as const;

const PROJECT_TYPE_KEYS: Record<(typeof PROJECT_TYPES)[number], string> = {
  "Business Website": "businessWebsite",
  "Web Application": "webApplication",
  "E-commerce": "eCommerce",
  "Landing Page": "landingPage",
  Portfolio: "portfolio",
  Restaurant: "restaurant",
  Clinic: "clinic",
  "Real Estate": "realEstate",
  Education: "education",
  "AI SaaS": "aiSaas",
  CRM: "crm",
  ERP: "erp",
  "Mobile App": "mobileApp",
};

const DESIGN_STYLES = ["Luxury", "Minimal", "Corporate", "Startup", "Modern", "Glass", "Dark", "Light"] as const;
const COLOR_THEMES = ["Gold", "Blue", "Purple", "Green", "Custom"] as const;
const LANGUAGES = [
  "English",
  "Arabic",
  "Bilingual",
  "Spanish",
  "French",
  "German",
  "Portuguese",
] as const;
const FEATURES = [
  "Authentication",
  "Dashboard",
  "CMS",
  "Blog",
  "Payments",
  "Booking",
  "Chat",
  "Notifications",
  "Analytics",
  "CRM",
  "Admin Panel",
] as const;

const COLOR_THEME_KEYS: Record<(typeof COLOR_THEMES)[number], string> = {
  Gold: "gold",
  Blue: "blue",
  Purple: "purple",
  Green: "green",
  Custom: "custom",
};

const LANGUAGE_KEYS: Record<(typeof LANGUAGES)[number], string> = {
  English: "english",
  Arabic: "arabic",
  Bilingual: "bilingual",
  Spanish: "spanish",
  French: "french",
  German: "german",
  Portuguese: "portuguese",
};

const FEATURE_KEYS: Record<(typeof FEATURES)[number], string> = {
  Authentication: "authentication",
  Dashboard: "dashboard",
  CMS: "cms",
  Blog: "blog",
  Payments: "payments",
  Booking: "booking",
  Chat: "chat",
  Notifications: "notifications",
  Analytics: "analytics",
  CRM: "crm",
  "Admin Panel": "adminPanel",
};

const TEMPLATES = [
  "Luxury real estate marketplace",
  "Premium SaaS landing page",
  "Clinic website with booking",
  "Restaurant ordering platform",
  "Executive portfolio website",
] as const;

const PAGES = ["Home", "About", "Services", "Pricing", "Dashboard", "Admin", "Contact"];
const LIVE_PREVIEW_ENABLED = false;

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
    features: generation.features,
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

function resolveInitialProjectType(
  product?: ProductDefinition,
): (typeof PROJECT_TYPES)[number] {
  const candidate = product?.defaultProjectType;
  if (candidate && (PROJECT_TYPES as readonly string[]).includes(candidate)) {
    return candidate as (typeof PROJECT_TYPES)[number];
  }
  return "Web Application";
}

function mapMarketplaceStyleToDesignStyle(
  style: string,
): (typeof DESIGN_STYLES)[number] | null {
  const key = style.toLowerCase().replace(/_/g, "-");
  if (key === "luxury") return "Luxury";
  if (key === "minimal") return "Minimal";
  if (key === "corporate") return "Corporate";
  if (key === "modern" || key === "creative") return "Modern";
  if (key === "premium-saas" || key === "technology") return "Startup";
  return null;
}

function mapIndustryToProjectType(
  industry: string,
): (typeof PROJECT_TYPES)[number] | null {
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

function buildBriefFromTemplate(payload: TemplateUsePayload): string {
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
  const [projectType, setProjectType] = useState<(typeof PROJECT_TYPES)[number]>(
    () => resolveInitialProjectType(product),
  );
  const [designStyle, setDesignStyle] = useState<(typeof DESIGN_STYLES)[number]>("Luxury");
  const [colorTheme, setColorTheme] = useState<(typeof COLOR_THEMES)[number]>("Gold");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [features, setFeatures] = useState<string[]>(["Dashboard", "Booking", "Admin Panel"]);

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
    if (style) {
      setTemplateStyle(style);
      const mapped = mapMarketplaceStyleToDesignStyle(style);
      if (mapped) setDesignStyle(mapped);
    }
    if (preset) setDesignPreset(preset);
    if (tid || mid) {
      setStreamStatus(
        mid
          ? `Marketplace template selected: ${mid}`
          : `Template selected: ${tid}`,
      );
    }
  }, []);
  const [advancedOpen, setAdvancedOpen] = useState(true);
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [projects, setProjects] = useState<WorkspaceProject[]>(
    initialGenerations.map(toProject),
  );
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(
    initialGenerations[0] ? toProject(initialGenerations[0]) : null,
  );
  const streamAbortRef = useRef<AbortController | null>(null);
  const activeStreamSessionRef = useRef<string | null>(null);
  const progressStep = useCoreProgress({
    events: streamStatus ? [`[generation] ${streamStatus}`] : [],
    active: isGenerating,
    complete: !isGenerating && !!activeProject,
  });

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

  async function selectProject(project: WorkspaceProject) {
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
            setSelectedFilePath(hydrated.generatedProject?.files[0]?.path ?? "");
            setFileSearch("");
            return;
          }
        }
      } catch {
        // Fall through
      }
    }
    setActiveProject(project);
    setSelectedFilePath(project.generatedProject?.files[0]?.path ?? "");
    setFileSearch("");
  }

  function updateProject(projectId: string, patch: Partial<WorkspaceProject>) {
    setProjects((items) =>
      items.map((item) => (item.id === projectId ? { ...item, ...patch } : item)),
    );
    setActiveProject((project) =>
      project?.id === projectId ? { ...project, ...patch } : project,
    );
  }

  async function buildGeneratedProject(project: WorkspaceProject) {
    if (!project.generatedProject) return;

    updateProject(project.id, { build: { status: "building" } });

    try {
      const response = await fetch("/api/website-builder/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          files: project.generatedProject.files,
        }),
      });
      const data = (await response.json()) as
        | {
            ok: true;
            previewId: string;
            previewUrl: string;
            buildOutput?: string;
          }
        | {
            ok: false;
            error?: string;
          };

      if (!response.ok || !data.ok) {
        throw new Error("error" in data ? data.error : wb("errors.build"));
      }

      updateProject(project.id, {
        build: {
          status: "success",
          previewUrl: `${data.previewUrl}?v=${Date.now()}`,
          buildOutput: data.buildOutput,
        },
      });
    } catch (error) {
      updateProject(project.id, {
        build: {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : wb("errors.build"),
        },
      });
    }
  }

  function toggleFeature(feature: string) {
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
  }) {
    const tpl = options?.fromTemplate;
    const mode = options?.resume
      ? "continue"
      : options?.continue || options?.optimize
        ? "continue"
        : options?.regenerate
          ? "regenerate"
          : "generate";

    if (mode === "continue") {
      if (!activeProject?.id) {
        toast.error(wb("toasts.selectWebsiteFirst"));
        return;
      }
      if (
        !options?.optimize &&
        !options?.resume &&
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

    const templateBrief = tpl ? buildBriefFromTemplate(tpl) : null;
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
    const resolvedProjectType =
      (tpl?.industry ? mapIndustryToProjectType(tpl.industry) : null) ||
      projectType;

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
            language,
            brandStyle: designStyle,
            industry: templateIndustry || undefined,
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
      options?.optimize
        ? wb("stream.runningOptimizer")
        : options?.resume
          ? wb("stream.resuming")
          : tpl
            ? `Creating website from template: ${tpl.name}…`
            : autoHint || wb("stream.connecting"),
    );

    const pickerDesignSystem = dashboardColorThemeToDesignSystem(colorTheme, designStyle);
    const pickerPreset = dashboardDesignStyleToPreset(designStyle);
    const mergedDesignSystem = {
      ...pickerDesignSystem,
      ...(resolvedDesignSystem ?? {}),
    };

    const requestBody = {
      prompt: mode === "continue" ? activeProject?.description || brief : brief,
      projectType: resolvedProjectType,
      language,
      theme: `${colorTheme} ${designStyle}${resolvedThemeStyle}`,
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
      templateStyle: resolvedStyle || designStyle || undefined,
      designPreset: autoPreset || pickerPreset || undefined,
      industryId: resolvedIndustry || undefined,
      components: autoComponents.length ? autoComponents : undefined,
      designSystem: mergedDesignSystem,
      templateIntelligenceId: autoTiId || undefined,
      templateIntelligenceCategory: autoTiCategory || undefined,
      brandIdentityId: brandIdentityId || undefined,
      locale: language || undefined,
      mode: tpl ? "generate" : mode,
      parentGenerationId:
        tpl || mode === "generate" ? undefined : activeProject?.id,
      continueInstruction:
        tpl || mode !== "continue"
          ? undefined
          : options?.resume
            ? resumeInstruction
            : projectBrief.trim() ||
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
      setProjects((items) => [nextProject, ...items.filter((p) => p.id !== nextProject.id)].slice(0, 24));
      setStreamStatus(wb("stream.websiteSaved"));
      toast.success(wb("toasts.createdAndSaved"));
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
          message?: string;
          generationId?: string;
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
              style: designStyle,
              theme: colorTheme,
              language,
              features,
              mode: requestBody.mode as GenerationMode | undefined,
            });
            setActiveProject(stub);
            setProjects((items) =>
              [stub, ...items.filter((p) => p.id !== session.generationId)].slice(0, 24),
            );
            setOutputTab("preview");
            setPreviewRevision((n) => n + 1);
          },
          onComplete: (payload) => {
            if (!payload.project || !payload.generation?.id) {
              throw new Error(wb("errors.noSavedGeneration"));
            }
            applySavedGeneration(payload.project, payload.generation);
            setPreviewRevision((n) => n + 1);
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
                        24,
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
          throw new Error("error" in data ? data.error : wb("errors.generic"));
        }

        if (!("project" in data) || !data.project || !data.generation?.id) {
          throw new Error(wb("errors.noSavedGeneration"));
        }

        applySavedGeneration(data.project, data.generation);
        setPreviewRevision((n) => n + 1);
      } else {
        let detail = `Unable to generate website (${streamResponse.status}).`;
        try {
          const errBody = (await streamResponse.json()) as { error?: string };
          if (errBody.error) detail = errBody.error;
        } catch {
          // keep status-based message
        }
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
    if (choice.designStyle) {
      const mapped = mapMarketplaceStyleToDesignStyle(choice.designStyle);
      if (mapped) setDesignStyle(mapped);
      else setTemplateStyle(choice.designStyle);
    }
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
    setProjectBrief(buildBriefFromTemplate(payload));
    setEditMode(false);
    setRailDetailsTpl(null);
    const mappedStyle = mapMarketplaceStyleToDesignStyle(payload.style);
    if (mappedStyle) setDesignStyle(mappedStyle);
    const mappedType = mapIndustryToProjectType(payload.industry);
    if (mappedType) setProjectType(mappedType);
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
        throw new Error(data.error ?? wb("errors.generic"));
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
      setProjects((items) => [copyProject, ...items].slice(0, 8));
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
      if (nextProjects[0]) {
        selectProject(nextProjects[0]);
      } else {
        setActiveProject(null);
        setSelectedFilePath("");
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

  function refreshPreview() {
    if (!activeProject) return;
    // Prefer in-platform static live preview (D-017). npm compile builder stays off.
    if (!LIVE_PREVIEW_ENABLED) {
      setPreviewRevision((n) => n + 1);
      return;
    }
    void buildGeneratedProject(activeProject);
  }

  function openPreviewInNewTab() {
    const previewUrl =
      activeProject?.build?.previewUrl ||
      (activeProject?.id ? livePreviewSrc(activeProject.id) : "");

    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
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
                    businessType: projectType,
                    industry: templateIndustry || projectType,
                    brandStyle: designStyle,
                    designStyle,
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
                    businessType: projectType,
                    industry: templateIndustry || projectType,
                    brandStyle: designStyle,
                    designStyle,
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
            <>
          <DashboardPanel>
            <SectionHeader
              icon={Globe2}
              title={wb("sections.projectType")}
              description={wb("sectionDescriptions.projectType")}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_TYPES.map((type) => (
                <ChoiceCard
                  key={type}
                  label={wb(`projectTypes.${PROJECT_TYPE_KEYS[type]}`)}
                  active={projectType === type}
                  onClick={() => setProjectType(type)}
                />
              ))}
            </div>
          </DashboardPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardPanel>
              <SectionHeader icon={Palette} title={wb("sections.designStyle")} description={wb("sectionDescriptions.designStyle")} />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {DESIGN_STYLES.map((style) => (
                  <ChoiceCard
                    key={style}
                    label={translateOption(t, "designStyles", style)}
                    active={designStyle === style}
                    onClick={() => setDesignStyle(style)}
                    compact
                  />
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeader icon={Sparkles} title={wb("sections.colorTheme")} description={wb("sectionDescriptions.colorTheme")} />
              <div className="mt-5 grid gap-3">
                {COLOR_THEMES.map((theme) => (
                  <ThemeButton
                    key={theme}
                    label={wb(`colorThemes.${COLOR_THEME_KEYS[theme]}`)}
                    active={colorTheme === theme}
                    onClick={() => setColorTheme(theme)}
                  />
                ))}
              </div>
            </DashboardPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <DashboardPanel>
              <SectionHeader icon={FileStack} title={wb("sections.outputLanguage")} description={wb("sectionDescriptions.language")} />
              <div className="mt-5 space-y-3">
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

            <DashboardPanel>
              <SectionHeader icon={LayoutDashboard} title={wb("sections.features")} description={wb("sectionDescriptions.features")} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => {
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
                      {wb(`features.${FEATURE_KEYS[feature]}`)}
                    </label>
                  );
                })}
              </div>
            </DashboardPanel>
          </div>
            </>
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

        {LIVE_PREVIEW_ENABLED ? (
          <RightPreview
            activeProject={activeProject}
            currentPages={currentPages}
            projectType={projectType}
            designStyle={designStyle}
            colorTheme={colorTheme}
            language={language}
            isGenerating={isGenerating}
            streamStatus={streamStatus}
            elapsedSeconds={elapsedSeconds}
            onRefreshPreview={refreshPreview}
            onOpenPreview={openPreviewInNewTab}
          />
        ) : (
          <PreviewAndExportPanel
            activeProject={activeProject}
            previewRevision={previewRevision}
            onDownload={downloadProject}
            onImprove={() => {
              if (!activeProject?.id) return;
              void createInterfaceProject({ optimize: true });
            }}
          />
        )}
      </div>

      <DesignEnginePanels
        project={activeProject?.generatedProject}
        disabled={isGenerating || !activeProject?.id}
        onImproveLayer={(prefix, hint) => {
          if (!activeProject?.id) {
            toast.error(wb("toasts.createOrSelectFirst"));
            return;
          }
          setEditMode(true);
          setProjectBrief(`${prefix} ${hint}`.trim());
          toast.message(wb("toasts.editInstructionHint"));
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
        onOutputTabChange={setOutputTab}
        previewEnabled={LIVE_PREVIEW_ENABLED}
        previewRevision={previewRevision}
        files={activeFiles}
        selectedFile={activeFile}
        selectedFilePath={activeFile?.path ?? selectedFilePath}
        onSelectFile={setSelectedFilePath}
        fileSearch={fileSearch}
        onFileSearch={setFileSearch}
        projects={projects}
        onSelectProject={(project) => {
          setEditMode(false);
          selectProject(project);
          setOutputTab("preview");
        }}
        onDownload={downloadProject}
        onCopy={copyActiveFile}
        onRename={() => {
          setRenameValue(activeProject?.title ?? "");
          setRenameOpen(true);
        }}
        onDelete={() => {
          if (activeProject) void deleteProject(activeProject.id);
        }}
        visualEditorDisabled={isGenerating}
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
        onFavorite={() => {
          if (activeProject) void toggleFavorite(activeProject.id);
        }}
        onRefreshPreview={refreshPreview}
        onOpenPreview={openPreviewInNewTab}
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

      <BottomWorkspace
        projects={projects}
        catalogTemplates={catalogTemplates}
        selectedMarketplaceId={marketplaceTemplateId}
        isGenerating={isGenerating}
        onOpenTemplateDetails={setRailDetailsTpl}
        activeProject={activeProject}
        onSelect={selectProject}
        onFavorite={toggleFavorite}
        onDuplicate={duplicateProject}
        onDelete={deleteProject}
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

function ThemeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const swatch: Record<string, string> = {
    Gold: "from-[#D4AF37] to-[#F4D56A]",
    Blue: "from-blue-500 to-cyan-300",
    Purple: "from-purple-500 to-fuchsia-300",
    Green: "from-emerald-500 to-lime-300",
    Custom: "from-white/60 to-premium-gold",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        active
          ? "border-premium-gold/45 bg-premium-gold/12 text-premium-gold-light"
          : "border-white/[0.08] bg-white/[0.025] text-white/55 hover:border-premium-gold/25 hover:text-white/80",
      )}
    >
      <span className={cn("size-8 rounded-xl bg-gradient-to-br shadow-lg", swatch[label])} />
      <span className="font-semibold">{label}</span>
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
  onImprove,
}: {
  activeProject: WorkspaceProject | null;
  previewRevision?: number;
  onDownload: (project?: WorkspaceProject | null) => void;
  onImprove: () => void;
}) {
  const wb = useProductT("websiteBuilder");
  const generated = activeProject?.generatedProject;
  const fileCount = generated?.files.length ?? 0;
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [liveOpen, setLiveOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<
    "none" | "prepared" | "published" | "unpublished"
  >("none");
  const [publishQuality, setPublishQuality] = useState<{
    seoScore?: number | null;
    performanceScore?: number | null;
    mobileScore?: number | null;
    conversionReady?: boolean | null;
    blockers: string[];
    warnings: string[];
    opportunities: string[];
  } | null>(null);

  useEffect(() => {
    if (!activeProject?.id) {
      setPublicUrl(null);
      setPublishStatus("none");
      setPublishQuality(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/website-builder/${activeProject.id}/publish`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        const status = data.publication?.status as
          | "prepared"
          | "published"
          | "unpublished"
          | undefined;
        setPublishStatus(status ?? "none");
        setPublicUrl(
          status === "published"
            ? data.publicUrl ??
                data.publication?.planned_public_url ??
                data.publication?.public_path ??
                null
            : data.publication?.planned_public_url ??
                data.publication?.public_path ??
                null,
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProject?.id]);

  async function runPublishAction(
    action: "prepare" | "publish" | "unpublish",
    force = false,
  ) {
    if (!activeProject?.id) return;
    setPublishBusy(true);
    try {
      const res = await fetch(`/api/website-builder/${activeProject.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, force }),
      });
      const data = await res.json();
      const qr = data.qualityRecommendations as
        | {
            seoScore?: number | null;
            performanceScore?: number | null;
            mobileScore?: number | null;
            conversionReady?: boolean | null;
            publishReady?: boolean | null;
            blockers?: string[];
            warnings?: string[];
            opportunities?: string[];
          }
        | undefined;
      if (qr) {
        setPublishQuality({
          seoScore: qr.seoScore ?? null,
          performanceScore: qr.performanceScore ?? null,
          mobileScore: qr.mobileScore ?? null,
          conversionReady: qr.conversionReady ?? null,
          blockers: qr.blockers ?? data.blockers ?? [],
          warnings: qr.warnings ?? [],
          opportunities: qr.opportunities ?? [],
        });
      }
      if (!res.ok) {
        if (res.status === 422) {
          toast.error(
            data.blockers?.[0] ??
              wb("errors.publishBlocked"),
          );
        } else {
          toast.error(data.error ?? wb("errors.couldNotAction", { action }));
        }
        return;
      }
      const status = (data.publication?.status ?? action) as
        | "prepared"
        | "published"
        | "unpublished";
      setPublishStatus(status);
      const url =
        data.publicUrl ??
        data.publication?.planned_public_url ??
        data.publication?.public_path ??
        null;
      setPublicUrl(url);
      toast.success(data.message ?? wb("publish.publishedSuccess"));
      if (action === "publish" && url) {
        window.open(url.startsWith("http") ? url : url, "_blank", "noopener,noreferrer");
      }
    } catch {
      toast.error(wb("errors.couldNotAction", { action }));
    } finally {
      setPublishBusy(false);
    }
  }

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
          <InfoTile label={wb("labels.status")} value={publishStatus === "none" ? wb("publish.notPublished") : publishStatus} />
          <InfoTile
            label={wb("labels.publicUrl")}
            value={publicUrl ?? wb("publish.notPublished")}
          />
          {publishQuality ? (
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                {wb("qualityScores.prePublish")}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-white/40">{wb("qualityScores.seo")}</p>
                  <p className="text-sm font-semibold text-premium-gold-light">
                    {publishQuality.seoScore ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40">{wb("qualityScores.perf")}</p>
                  <p className="text-sm font-semibold text-premium-gold-light">
                    {publishQuality.performanceScore ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40">{wb("qualityScores.mobile")}</p>
                  <p className="text-sm font-semibold text-premium-gold-light">
                    {publishQuality.mobileScore ?? "—"}
                  </p>
                </div>
              </div>
              {publishQuality.blockers[0] ? (
                <p className="mt-2 text-[11px] text-amber-200/80">
                  {publishQuality.blockers[0]}
                </p>
              ) : publishQuality.warnings[0] ? (
                <p className="mt-2 text-[11px] text-white/50">
                  {publishQuality.warnings[0]}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-emerald-200/70">
                  {wb("qualityScores.readyForPublishing")}
                </p>
              )}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold h-10 w-full rounded-xl"
              onClick={() => void runPublishAction("prepare")}
              disabled={!activeProject?.id || publishBusy}
            >
              {wb("qualityScores.reviewPrepare")}
            </Button>
            <Button
              type="button"
              className="btn-gold h-10 w-full rounded-xl font-bold text-luxury-black"
              onClick={() => void runPublishAction("publish")}
              disabled={!activeProject?.id || publishBusy}
            >
              {publishBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {wb("qualityScores.publishing")}
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  {publishStatus === "published" ? wb("publish.updateRepublish") : wb("publish.publishPublicUrl")}
                </>
              )}
            </Button>
            {publishStatus === "published" && publicUrl ? (
              <Button
                type="button"
                variant="outline"
                className="btn-ghost-gold h-10 w-full rounded-xl"
                onClick={() =>
                  window.open(
                    publicUrl.startsWith("http") ? publicUrl : publicUrl,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <Maximize2 className="size-4" />
                {wb("previewExport.openPublicUrl")}
              </Button>
            ) : null}
            {publishStatus === "published" ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl border-white/10 text-white/60"
                onClick={() => void runPublishAction("unpublish")}
                disabled={publishBusy}
              >
                {wb("publish.unpublishAction")}
              </Button>
            ) : null}
          </div>
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

function RightPreview({
  activeProject,
  currentPages,
  projectType,
  designStyle,
  colorTheme,
  language,
  isGenerating,
  streamStatus,
  elapsedSeconds,
  onRefreshPreview,
  onOpenPreview,
}: {
  activeProject: WorkspaceProject | null;
  currentPages: string[];
  projectType: string;
  designStyle: string;
  colorTheme: string;
  language: string;
  isGenerating: boolean;
  streamStatus: string | null;
  elapsedSeconds: number;
  onRefreshPreview: () => void;
  onOpenPreview: () => void;
}) {
  const wb = useProductT("websiteBuilder");
  const generatedProject = activeProject?.generatedProject;
  const build = activeProject?.build ?? { status: "idle" as const };
  const previewPages = generatedProject?.pages?.length ? generatedProject.pages : currentPages;
  const previewUrl = build.status === "success" ? build.previewUrl : undefined;
  const isBuilding = build.status === "building";

  return (
    <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
      <DashboardPanel gold className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            icon={MonitorSmartphone}
            title={wb("preview.title")}
            description={wb("preview.description")}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={onRefreshPreview}
              disabled={!generatedProject || isBuilding}
            >
              {isBuilding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={onOpenPreview}
              disabled={!previewUrl}
            >
              <ExternalLink className="size-4" />
              {wb("previewExport.open")}
            </Button>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#070707] shadow-[0_24px_80px_rgb(0_0_0/0.32)]">
          <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.035] px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-yellow-300/70" />
            <span className="size-2.5 rounded-full bg-green-400/70" />
            <span className="ml-auto text-[11px] text-white/30">preview.trendai.app</span>
          </div>
          <div className="p-4">
            {previewUrl ? (
              <iframe
                title={`${activeProject?.title ?? wb("previewExport.generatedProject")} ${wb("previewExport.livePreviewSuffix")}`}
                src={previewUrl}
                className="h-[520px] w-full rounded-2xl border border-premium-gold/15 bg-white"
                sandbox="allow-scripts allow-forms allow-popups"
              />
            ) : isBuilding ? (
              <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl border border-premium-gold/15 bg-black/30 text-center">
                <Loader2 className="size-8 animate-spin text-premium-gold" />
                <p className="mt-4 font-bold text-white">{wb("panels.buildingProject")}</p>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  {wb("previewExport.buildingDescription")}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-premium-gold/15 bg-[radial-gradient(circle_at_80%_0%,rgb(212_175_55/0.18),transparent_38%),linear-gradient(145deg,rgb(255_255_255/0.06),rgb(255_255_255/0.02))] p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
                  {activeProject?.type ?? projectType}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">
                  {activeProject?.title ?? wb("previewExport.premiumConcept")}
                </h3>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/45">
                  {activeProject?.description ??
                    wb("previewExport.conceptDescription")}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="text-[11px] text-white/35">{wb("labels.style")}</p>
                    <p className="mt-1 font-semibold text-white">{activeProject?.style ?? designStyle}</p>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="text-[11px] text-white/35">{wb("labels.theme")}</p>
                    <p className="mt-1 font-semibold text-white">{activeProject?.theme ?? colorTheme}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {build.status === "error" && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="size-4" />
              <p className="font-semibold">{wb("panels.compileFailed")}</p>
            </div>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-red-100/85">
              {build.error}
            </pre>
          </div>
        )}
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader icon={FileStack} title={wb("sections.websiteStructure")} description={wb("sectionDescriptions.websiteStructure")} />
        <div className="mt-5 space-y-3">
          {previewPages.map((page, index) => (
            <div
              key={page}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-premium-gold/10 text-[12px] font-bold text-premium-gold-light">
                {index + 1}
              </span>
              <span className="font-medium text-white/70">{page}</span>
            </div>
          ))}
        </div>
      </DashboardPanel>

      {generatedProject && (
        <DashboardPanel>
          <SectionHeader
            icon={Sparkles}
            title={wb("sections.generatedResult")}
            description={wb("sectionDescriptions.generatedResult")}
          />
          <div className="mt-5 space-y-4">
            <ResultList title={wb("resultLists.sections")} items={generatedProject.sections} />
            <ResultList title={wb("resultLists.colorPalette")} items={generatedProject.colorPalette} />
            <ResultList title={wb("resultLists.typography")} items={generatedProject.typography} />
            <ResultList title={wb("resultLists.components")} items={generatedProject.components} />
            <ResultList title={wb("resultLists.content")} items={generatedProject.content} />
            <ResultList title={wb("resultLists.seo")} items={generatedProject.seo} />
            <ResultList title={wb("resultLists.roadmap")} items={generatedProject.roadmap} />
          </div>
        </DashboardPanel>
      )}

      <DashboardPanel>
        <SectionHeader
          icon={Clock3}
          title={wb("sections.generationStatus")}
          description={wb("sectionDescriptions.generationStatus")}
        />
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">
              {isGenerating
                ? streamStatus ?? wb("stream.generating")
                : activeProject
                  ? "Ready"
                  : "Idle"}
            </span>
            <span className="font-bold text-premium-gold-light">
              {isGenerating ? formatElapsed(elapsedSeconds) : activeProject ? "Done" : "—"}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.07]">
            {isGenerating ? (
              <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light" />
            ) : (
              <div
                className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all duration-700"
                style={{ width: activeProject ? "100%" : "20%" }}
              />
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile label={wb("labels.typicalTime")} value={wb("labels.typicalTimeValue")} />
            <InfoTile label={wb("labels.language")} value={language} />
          </div>
        </div>
      </DashboardPanel>
    </aside>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <p className="text-[12px] font-semibold tracking-wide text-premium-gold-light uppercase">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-2 text-[13px] leading-relaxed text-white/55"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-premium-gold/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
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
  previewEnabled,
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
  onRefreshPreview,
  onOpenPreview,
  visualEditorDisabled,
  onVisualEditorSaved,
  onSeoApplied,
  onIntelligenceApply,
}: {
  activeProject: WorkspaceProject | null;
  outputTab: OutputTab;
  onOutputTabChange: (tab: OutputTab) => void;
  previewEnabled: boolean;
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
  onRefreshPreview: () => void;
  onOpenPreview: () => void;
  visualEditorDisabled?: boolean;
  onVisualEditorSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
  onSeoApplied: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
  onIntelligenceApply?: (command: string) => void;
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
            <VisualWebsiteEditor
              generationId={activeProject.id}
              files={files}
              project={activeProject.generatedProject}
              disabled={visualEditorDisabled}
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
            previewEnabled ? (
              <GeneratedPreviewWorkspace
                activeProject={activeProject}
                onRefreshPreview={onRefreshPreview}
                onOpenPreview={onOpenPreview}
              />
            ) : (
              <WebsiteLiveFrame
                projectId={activeProject?.id}
                title={wb("preview.title")}
                viewport="desktop"
                revision={previewRevision}
                className="h-full min-h-[720px]"
              />
            )
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

function GeneratedPreviewWorkspace({
  activeProject,
  onRefreshPreview,
  onOpenPreview,
}: {
  activeProject: WorkspaceProject | null;
  onRefreshPreview: () => void;
  onOpenPreview: () => void;
}) {
  const wb = useProductT("websiteBuilder");
  const build = activeProject?.build ?? { status: "idle" as const };
  const previewUrl = build.status === "success" ? build.previewUrl : undefined;
  const isBuilding = build.status === "building";

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070707]">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] bg-white/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">
            {activeProject?.title ?? wb("previewExport.noProjectYet")}
          </p>
          <p className="text-[12px] text-white/35">
            {previewUrl
              ? wb("previewExport.compiledLoaded")
              : wb("previewExport.generateToPreview")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="btn-ghost-gold rounded-xl"
            onClick={onRefreshPreview}
            disabled={!activeProject?.generatedProject || isBuilding}
          >
            {isBuilding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {wb("previewExport.refreshPreview")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="btn-ghost-gold rounded-xl"
            onClick={onOpenPreview}
            disabled={!previewUrl}
          >
            <ExternalLink className="size-4" />
            {wb("previewExport.openInNewTab")}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {previewUrl ? (
          <iframe
            title={`${activeProject?.title ?? wb("previewExport.generatedProject")} ${wb("previewExport.fullPreviewSuffix")}`}
            src={previewUrl}
            className="h-[760px] w-full rounded-2xl border border-premium-gold/15 bg-white"
            sandbox="allow-scripts allow-forms allow-popups"
          />
        ) : isBuilding ? (
          <div className="flex h-[520px] flex-col items-center justify-center rounded-2xl border border-premium-gold/15 bg-black/30 text-center">
            <Loader2 className="size-9 animate-spin text-premium-gold" />
            <p className="mt-4 font-bold text-white">{wb("panels.buildingNextApp")}</p>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              {wb("previewExport.buildingFilesDescription")}
            </p>
          </div>
        ) : (
          <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] text-center">
            <MonitorSmartphone className="size-10 text-premium-gold" />
            <p className="mt-4 font-bold text-white">{wb("preview.emptyTitle")}</p>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              {wb("previewExport.generateToRender")}
            </p>
          </div>
        )}

        {build.status === "error" && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="size-4" />
              <p className="font-semibold">{wb("panels.buildFailed")}</p>
            </div>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-red-100/85">
              {build.error}
            </pre>
          </div>
        )}
      </div>
    </div>
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
