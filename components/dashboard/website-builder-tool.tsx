"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
  MonitorSmartphone,
  Palette,
  RefreshCw,
  Search,
  Settings,
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
import type { ProductDefinition } from "@/lib/products/types";
import type { WebsiteGeneration } from "@/types/database";
import { cn } from "@/lib/utils";

type WebsiteBuilderToolProps = {
  product?: ProductDefinition;
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

const DESIGN_STYLES = ["Luxury", "Minimal", "Corporate", "Startup", "Modern", "Glass", "Dark", "Light"] as const;
const COLOR_THEMES = ["Gold", "Blue", "Purple", "Green", "Custom"] as const;
const LANGUAGES = ["English", "Arabic", "Bilingual"] as const;
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

export function WebsiteBuilderTool({
  product,
  initialGenerations = [],
}: WebsiteBuilderToolProps) {
  const productTemplates = product?.templates?.length
    ? product.templates
    : [...TEMPLATES];
  const [projectBrief, setProjectBrief] = useState("");
  const [projectType, setProjectType] = useState<(typeof PROJECT_TYPES)[number]>(
    () => resolveInitialProjectType(product),
  );
  const [designStyle, setDesignStyle] = useState<(typeof DESIGN_STYLES)[number]>("Luxury");
  const [colorTheme, setColorTheme] = useState<(typeof COLOR_THEMES)[number]>("Gold");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [features, setFeatures] = useState<string[]>(["Dashboard", "Booking", "Admin Panel"]);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [progress, setProgress] = useState(34);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [outputTab, setOutputTab] = useState<"preview" | "code">("preview");
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
        throw new Error("error" in data ? data.error : "Generated project failed to build.");
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
              : "Generated project failed to build.",
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

  async function createInterfaceProject(options?: { regenerate?: boolean }) {
    const brief =
      projectBrief.trim() ||
      (options?.regenerate ? activeProject?.description.trim() : "") ||
      productTemplates[0] ||
      "I need a luxury real estate web application with booking system, authentication and admin dashboard.";

    if (options?.regenerate && !projectBrief.trim() && activeProject?.description) {
      setProjectBrief(activeProject.description);
    }

    setIsGenerating(true);
    setApiError(null);
    setProgress(28);
    setStreamStatus("Connecting to AI website engine...");

    const stages = [
      "Analyzing product brief...",
      "Planning pages and architecture...",
      "Generating file blueprint...",
      "Saving project to workspace...",
    ];

    let stageIndex = 0;
    const stageTimer = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stages.length - 1);
      setStreamStatus(stages[stageIndex] ?? null);
      setProgress((value) => Math.min(92, value + 14));
    }, 900);

    try {
      const response = await fetch("/api/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: brief,
          projectType,
          language,
          theme: `${colorTheme} ${designStyle}`,
          features: [
            ...features,
            ...(product?.id ? [`product:${product.id}`] : []),
          ],
          productId: product?.id,
          mode: options?.regenerate ? "regenerate" : "generate",
          parentGenerationId: options?.regenerate ? activeProject?.id : undefined,
        }),
      });
      const data = (await response.json()) as GenerateProjectResponse;

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to generate website.");
      }

      if (!("project" in data) || !data.project || !data.generation?.id) {
        throw new Error("AI engine did not return a saved generation.");
      }

      const generatedProject = data.project;
      const generation = data.generation;
      const nextProject: WorkspaceProject = {
        id: generation.id,
        title: generatedProject.title || `${projectType} Concept`,
        type: generation.website_type,
        style: designStyle,
        theme: colorTheme,
        language,
        features,
        createdAt: formatGenerationDate(generation.created_at),
        favorite: false,
        description: generatedProject.description || brief,
        generatedProject,
        build: { status: "idle" },
      };

      setStreamStatus("Streaming blueprint into workspace...");
      setActiveProject(nextProject);
      setSelectedFilePath(generatedProject.files[0]?.path ?? "");
      setOutputTab("code");
      setProjects((items) => [nextProject, ...items].slice(0, 8));
      setProgress(100);
      setStreamStatus("Project saved.");
      toast.success("Project generated and saved to your workspace.");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to generate website application.",
      );
      setProgress(34);
      setStreamStatus(null);
    } finally {
      window.clearInterval(stageTimer);
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
        throw new Error(data.error ?? "Unable to update favorite.");
      }

      patchProject(id, data.generation);
      toast.success(project.favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update favorite.";
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
        throw new Error(data.error ?? "Unable to duplicate project.");
      }

      const copyProject = toProject(data.generation);
      setProjects((items) => [copyProject, ...items].slice(0, 8));
      selectProject(copyProject);
      toast.success("Project duplicated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to duplicate project.";
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
        throw new Error(data.error ?? "Unable to delete project.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete project.";
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
    toast.success("Project deleted");
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
        throw new Error(data.error ?? "Unable to rename project.");
      }

      patchProject(activeProject.id, data.generation);
      setRenameOpen(false);
      setRenameValue("");
      toast.success("Project renamed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to rename project.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function copyActiveFile() {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    toast.success("File copied to clipboard");
  }

  async function downloadProject(project = activeProject) {
    if (!project) return;

    const JSZip = (await import("jszip")).default; const zip = new JSZip();
    const files =
      project.generatedProject?.files.length
        ? project.generatedProject.files
        : [
            {
              path: "README.md",
              language: "markdown",
              content: [
                `# ${project.title}`,
                "",
                project.description,
                "",
                `Type: ${project.type}`,
                `Design Style: ${project.style}`,
                `Color Theme: ${project.theme}`,
                `Language: ${project.language}`,
                `Features: ${project.features.join(", ")}`,
                `Pages: ${currentPages.join(", ")}`,
              ].join("\n"),
            },
          ];

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
        : "ZIP download started",
    );
  }

  function refreshPreview() {
    if (activeProject) {
      void buildGeneratedProject(activeProject);
    }
  }

  function openPreviewInNewTab() {
    const previewUrl = activeProject?.build?.previewUrl;

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
              {product?.eyebrow ?? "Website and app generation workspace"}
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              {product?.title ?? "AI Website & App Builder"}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
              {product?.description ??
                "Generate complete production-ready websites and web applications with AI."}
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/[0.08] bg-black/25 p-4 shadow-[0_24px_90px_rgb(0_0_0/0.35)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-premium-gold/15 bg-[linear-gradient(145deg,rgb(212_175_55/0.13),rgb(255_255_255/0.035))] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
                    Live builder status
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {isGenerating ? "Designing" : "Ready"}
                  </p>
                </div>
                <DashboardIconBox icon={MonitorSmartphone} className="size-12 rounded-2xl" />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all duration-700"
                  style={{ width: `${isGenerating ? progress : activeProject ? 100 : 34}%` }}
                />
              </div>
              <p className="mt-3 text-[12px] text-white/40">
                Connected to DeepSeek AI for generated React and Next.js applications.
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
              title="Project Input"
              description="Describe the product, audience, features and visual direction."
            />
            <Textarea
              value={projectBrief}
              onChange={(event) => setProjectBrief(event.target.value)}
              placeholder={
                product?.promptPlaceholder ??
                'Describe your project...\n\nExample: "I need a luxury real estate web application with booking system, authentication and admin dashboard."'
              }
              className="mt-5 min-h-[190px] rounded-3xl border-white/[0.08] bg-black/25 p-5 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus-visible:border-premium-gold/35 focus-visible:ring-premium-gold/15"
            />
            <div className="mt-5">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {productTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setProjectBrief(template)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] transition-all",
                      projectBrief === template
                        ? "border-premium-gold/35 bg-premium-gold/12 text-premium-gold-light"
                        : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-premium-gold/25 hover:text-white/75",
                    )}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
            {apiError && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                {apiError}
              </p>
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
            {advancedOpen ? "Hide advanced settings" : "Show advanced settings"}
          </Button>

          {advancedOpen ? (
            <>
          <DashboardPanel>
            <SectionHeader
              icon={Globe2}
              title="Project Type"
              description="Choose a website or application architecture. DeepSeek will also auto-detect from your prompt."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_TYPES.map((type) => (
                <ChoiceCard
                  key={type}
                  label={type}
                  active={projectType === type}
                  onClick={() => setProjectType(type)}
                />
              ))}
            </div>
          </DashboardPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardPanel>
              <SectionHeader icon={Palette} title="Design Style" description="Set the visual personality." />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {DESIGN_STYLES.map((style) => (
                  <ChoiceCard
                    key={style}
                    label={style}
                    active={designStyle === style}
                    onClick={() => setDesignStyle(style)}
                    compact
                  />
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeader icon={Sparkles} title="Color Theme" description="Pick the primary brand mood." />
              <div className="mt-5 grid gap-3">
                {COLOR_THEMES.map((theme) => (
                  <ThemeButton
                    key={theme}
                    label={theme}
                    active={colorTheme === theme}
                    onClick={() => setColorTheme(theme)}
                  />
                ))}
              </div>
            </DashboardPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <DashboardPanel>
              <SectionHeader icon={FileStack} title="Language" description="Select output language." />
              <div className="mt-5 space-y-3">
                {LANGUAGES.map((item) => (
                  <ChoiceCard
                    key={item}
                    label={item}
                    active={language === item}
                    onClick={() => setLanguage(item)}
                    compact
                  />
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeader icon={LayoutDashboard} title="Features" description="Select the capabilities this project needs." />
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
                      {feature}
                    </label>
                  );
                })}
              </div>
            </DashboardPanel>
          </div>
            </>
          ) : null}

          {(isGenerating || streamStatus) && (
            <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/5 p-4">
              <div className="mb-2 flex items-center justify-between text-[12px] text-premium-gold-light">
                <span>{streamStatus ?? "Generation in progress"}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => void createInterfaceProject()}
            disabled={isGenerating}
            className="btn-gold h-14 w-full rounded-2xl text-base font-bold text-luxury-black shadow-[0_18px_60px_rgb(212_175_55/0.18)]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                {product?.generateLabel ?? "Generate Website"}
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
              void createInterfaceProject({ regenerate: true });
            }}
            disabled={isGenerating}
            className="btn-ghost-gold h-14 w-full rounded-2xl text-base font-semibold"
          >
            <RefreshCw className="size-5" />
            Regenerate
          </Button>
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
            progress={isGenerating ? progress : activeProject ? 100 : 34}
            onRefreshPreview={refreshPreview}
            onOpenPreview={openPreviewInNewTab}
          />
        ) : (
          <ProjectExportPanel activeProject={activeProject} onDownload={downloadProject} />
        )}
      </div>

      <OutputWorkspace
        activeProject={activeProject}
        outputTab={outputTab}
        previewEnabled={LIVE_PREVIEW_ENABLED}
        files={activeFiles}
        selectedFile={activeFile}
        selectedFilePath={activeFile?.path ?? selectedFilePath}
        onSelectFile={setSelectedFilePath}
        fileSearch={fileSearch}
        onFileSearch={setFileSearch}
        projects={projects}
        onSelectProject={selectProject}
        onDownload={downloadProject}
        onCopy={copyActiveFile}
        onRename={() => {
          setRenameValue(activeProject?.title ?? "");
          setRenameOpen(true);
        }}
        onDelete={() => {
          if (activeProject) void deleteProject(activeProject.id);
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
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription className="text-white/45">
              Update the saved project name in your workspace history.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="h-11 rounded-xl border-white/[0.1] bg-black/25 text-white"
            placeholder="Project name"
          />
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-gold text-luxury-black"
              onClick={renameProject}
              disabled={!renameValue.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomWorkspace
        projects={projects}
        templates={productTemplates}
        activeProject={activeProject}
        onSelect={selectProject}
        onFavorite={toggleFavorite}
        onDuplicate={duplicateProject}
        onDelete={deleteProject}
        onDownload={downloadProject}
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
          Optimized sections, pages and components for this product type.
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

/** Honest export panel while Live Preview stays off (D-003 / D-004 / H07). */
function ProjectExportPanel({
  activeProject,
  onDownload,
}: {
  activeProject: WorkspaceProject | null;
  onDownload: (project?: WorkspaceProject | null) => void;
}) {
  const fileCount = activeProject?.generatedProject?.files.length ?? 0;

  return (
    <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
      <DashboardPanel gold>
        <div className="flex items-center gap-3">
          <DashboardIconBox icon={Download} />
          <div>
            <h3 className="font-bold text-white">Download project</h3>
            <p className="text-[13px] text-white/40">
              AI generates source files you can download as a ZIP and run locally.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-dashed border-premium-gold/20 bg-black/20 p-6 text-center">
          <Download className="mx-auto size-12 text-premium-gold" />
          <p className="mt-4 text-lg font-bold text-white">
            {activeProject ? "Your project is ready to download" : "Generate a project to export"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/45">
            This tool delivers a downloadable Next.js code project — not a hosted live website.
            After download, run <span className="text-white/70">npm install</span> and{" "}
            <span className="text-white/70">npm run dev</span> on your machine, or deploy the
            files to your own hosting.
          </p>
          <Button
            type="button"
            className="btn-gold mt-6 h-11 rounded-xl px-5 font-bold text-luxury-black"
            onClick={() => onDownload(activeProject)}
            disabled={!activeProject}
          >
            <Download className="size-4" />
            Download ZIP
          </Button>
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader
          icon={FileStack}
          title="Project Summary"
          description="Saved generated project details."
        />
        <div className="mt-5 space-y-3">
          <InfoTile label="Project" value={activeProject?.title ?? "Not generated yet"} />
          <InfoTile label="Type" value={activeProject?.type ?? "Auto-detected"} />
          <InfoTile label="Files" value={String(fileCount)} />
          <InfoTile
            label="Delivery"
            value={activeProject ? "Source code (ZIP)" : "Generate project first"}
          />
          <InfoTile
            label="Primary action"
            value={activeProject ? "Download ZIP" : "Generate project"}
          />
        </div>
      </DashboardPanel>
    </aside>
  );
}

function RightPreview({
  activeProject,
  currentPages,
  projectType,
  designStyle,
  colorTheme,
  language,
  progress,
  onRefreshPreview,
  onOpenPreview,
}: {
  activeProject: WorkspaceProject | null;
  currentPages: string[];
  projectType: string;
  designStyle: string;
  colorTheme: string;
  language: string;
  progress: number;
  onRefreshPreview: () => void;
  onOpenPreview: () => void;
}) {
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
            title="Live Preview"
            description="Compiled generated project rendered in a sandbox."
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
              Open
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
                title={`${activeProject?.title ?? "Generated project"} live preview`}
                src={previewUrl}
                className="h-[520px] w-full rounded-2xl border border-premium-gold/15 bg-white"
                sandbox="allow-scripts allow-forms allow-popups"
              />
            ) : isBuilding ? (
              <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl border border-premium-gold/15 bg-black/30 text-center">
                <Loader2 className="size-8 animate-spin text-premium-gold" />
                <p className="mt-4 font-bold text-white">Building generated project</p>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  The generated React, Next.js and Tailwind files are compiling inside a temporary project.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-premium-gold/15 bg-[radial-gradient(circle_at_80%_0%,rgb(212_175_55/0.18),transparent_38%),linear-gradient(145deg,rgb(255_255_255/0.06),rgb(255_255_255/0.02))] p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
                  {activeProject?.type ?? projectType}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">
                  {activeProject?.title ?? "Premium Project Concept"}
                </h3>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/45">
                  {activeProject?.description ??
                    "A polished website and app structure will appear here after you generate the interface concept."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="text-[11px] text-white/35">Style</p>
                    <p className="mt-1 font-semibold text-white">{activeProject?.style ?? designStyle}</p>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="text-[11px] text-white/35">Theme</p>
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
              <p className="font-semibold">Generated project failed to compile</p>
            </div>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-red-100/85">
              {build.error}
            </pre>
          </div>
        )}
      </DashboardPanel>

      <DashboardPanel>
        <SectionHeader icon={FileStack} title="Website Structure" description="Pages and flow generated from your brief." />
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
            title="Generated Result"
            description="DeepSeek output for this project."
          />
          <div className="mt-5 space-y-4">
            <ResultList title="Sections" items={generatedProject.sections} />
            <ResultList title="Color Palette" items={generatedProject.colorPalette} />
            <ResultList title="Typography" items={generatedProject.typography} />
            <ResultList title="Components" items={generatedProject.components} />
            <ResultList title="Content" items={generatedProject.content} />
            <ResultList title="SEO" items={generatedProject.seo} />
            <ResultList title="Roadmap" items={generatedProject.roadmap} />
          </div>
        </DashboardPanel>
      )}

      <DashboardPanel>
        <SectionHeader icon={Clock3} title="Progress" description="Estimated build readiness." />
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Workspace progress</span>
            <span className="font-bold text-premium-gold-light">{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile label="Estimated Time" value="2-4 min" />
            <InfoTile label="Language" value={language} />
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
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-white/55">
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
  previewEnabled,
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
}: {
  activeProject: WorkspaceProject | null;
  outputTab: "preview" | "code";
  previewEnabled: boolean;
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
}) {
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
          {previewEnabled && outputTab === "preview" ? (
            <GeneratedPreviewWorkspace
              activeProject={activeProject}
              onRefreshPreview={onRefreshPreview}
              onOpenPreview={onOpenPreview}
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
  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.08] bg-black/25 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
          AI Project Workspace
        </p>
        <h3 className="mt-1 truncate text-lg font-bold text-white">
          {activeProject?.title ?? "No project selected"}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="btn-gold rounded-xl font-bold text-luxury-black"
          onClick={() => onDownload(activeProject)}
          disabled={!activeProject}
        >
          <Download className="size-4" />
          Download ZIP
        </Button>
        <Button
          type="button"
          variant="outline"
          className="btn-ghost-gold rounded-xl"
          onClick={onCopy}
          disabled={!selectedFile}
        >
          <Copy className="size-4" />
          Copy
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={onRename} disabled={!activeProject}>
          Rename
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={onFavorite} disabled={!activeProject}>
          <Star className={cn("size-4", activeProject?.favorite && "fill-premium-gold text-premium-gold")} />
          Favorite
        </Button>
        <Button type="button" variant="outline" className="btn-ghost-gold rounded-xl" onClick={() => onDownload(activeProject)} disabled={!activeProject}>
          <ArrowDownToLine className="size-4" />
          Export
        </Button>
        <Button type="button" variant="outline" className="rounded-xl border-red-400/20 text-red-300 hover:bg-red-400/10" onClick={onDelete} disabled={!activeProject}>
          <Trash2 className="size-4" />
          Delete
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
  return (
    <aside className="space-y-5 bg-black/20 p-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <FolderTree className="size-4 text-premium-gold" />
          Project Files
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={fileSearch}
            onChange={(event) => onFileSearch(event.target.value)}
            placeholder="Search files..."
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
          Project Info
        </p>
        <p className="mt-2 truncate font-semibold text-white">{activeProject?.title ?? "No project"}</p>
        <p className="mt-1 text-[12px] text-white/40">{activeProject?.type ?? "Generate a project"}</p>
        <p className="mt-3 text-[12px] text-premium-gold-light">{allFileCount} files</p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <History className="size-4 text-premium-gold" />
          History
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
              <p className="truncate text-sm font-semibold text-white">{project.title}</p>
              <p className="mt-1 text-[11px] text-white/35">{project.createdAt}</p>
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
              : "Select a generated file to review source code.",
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
  const project = activeProject?.generatedProject;

  return (
    <aside className="space-y-5 bg-black/20 p-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          Project Details
        </p>
        <h4 className="mt-2 font-bold text-white">{activeProject?.title ?? "No project"}</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-white/45">
          {activeProject?.description ?? "Generate or reopen a project to see details."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          Prompt Used
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          {project?.prompt ?? "Prompt metadata will appear here after generation."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          Generation Metadata
        </p>
        <div className="mt-3 space-y-2 text-[13px] text-white/55">
          <p>Kind: {project?.projectKind ?? "Unknown"}</p>
          <p>Generated: {project?.generatedAt ? formatGenerationDate(project.generatedAt) : "Unknown"}</p>
          <p>Selected file: {selectedFile?.path ?? "None"}</p>
          <p>Files: {project?.files.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Settings className="size-4 text-premium-gold" />
          <p className="font-semibold text-white">Project Settings</p>
        </div>
        <div className="space-y-2 text-[13px] text-white/55">
          <p>Framework: {project?.settings?.framework ?? "Next.js App Router"}</p>
          <p>Styling: {project?.settings?.styling ?? "Tailwind CSS"}</p>
          <p>Package manager: {project?.settings?.packageManager ?? "npm"}</p>
          <p>Deploy: {project?.settings?.deploymentTarget ?? "Vercel or Node hosting"}</p>
        </div>
        <Button asChild variant="outline" className="btn-ghost-gold mt-4 w-full rounded-xl">
          <Link href="/dashboard/website-builder/settings">
            Open Settings Page
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-premium-gold/15 bg-premium-gold/[0.06] p-4">
        <p className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
          AI Actions
        </p>
        <div className="mt-4 grid gap-2">
          <Button className="btn-gold rounded-xl font-bold text-luxury-black" onClick={() => onDownload(activeProject)} disabled={!activeProject}>
            <Download className="size-4" />
            Download ZIP
          </Button>
          <Button variant="outline" className="btn-ghost-gold rounded-xl" onClick={onRename} disabled={!activeProject}>
            Rename Project
          </Button>
          <Button variant="outline" className="btn-ghost-gold rounded-xl" onClick={onFavorite} disabled={!activeProject}>
            Toggle Favorite
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
  const build = activeProject?.build ?? { status: "idle" as const };
  const previewUrl = build.status === "success" ? build.previewUrl : undefined;
  const isBuilding = build.status === "building";

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070707]">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] bg-white/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">
            {activeProject?.title ?? "No generated project yet"}
          </p>
          <p className="text-[12px] text-white/35">
            {previewUrl
              ? "Compiled Next.js export is loaded below."
              : "Generate a project to build and render the live preview."}
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
            Refresh Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            className="btn-ghost-gold rounded-xl"
            onClick={onOpenPreview}
            disabled={!previewUrl}
          >
            <ExternalLink className="size-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      <div className="p-4">
        {previewUrl ? (
          <iframe
            title={`${activeProject?.title ?? "Generated project"} full preview`}
            src={previewUrl}
            className="h-[760px] w-full rounded-2xl border border-premium-gold/15 bg-white"
            sandbox="allow-scripts allow-forms allow-popups"
          />
        ) : isBuilding ? (
          <div className="flex h-[520px] flex-col items-center justify-center rounded-2xl border border-premium-gold/15 bg-black/30 text-center">
            <Loader2 className="size-9 animate-spin text-premium-gold" />
            <p className="mt-4 font-bold text-white">Building generated Next.js app</p>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              The generated files are being written to a temporary project and compiled.
            </p>
          </div>
        ) : (
          <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] text-center">
            <MonitorSmartphone className="size-10 text-premium-gold" />
            <p className="mt-4 font-bold text-white">Preview will appear here</p>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              Generate a website or web app to build and render the real project.
            </p>
          </div>
        )}

        {build.status === "error" && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="size-4" />
              <p className="font-semibold">Build failed</p>
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
  templates,
  activeProject,
  onSelect,
  onFavorite,
  onDuplicate,
  onDelete,
  onDownload,
}: {
  projects: WorkspaceProject[];
  templates: readonly string[];
  activeProject: WorkspaceProject | null;
  onSelect: (project: WorkspaceProject) => void;
  onFavorite: (id: string) => void;
  onDuplicate: (project: WorkspaceProject) => void;
  onDelete: (id: string) => void;
  onDownload: (project?: WorkspaceProject | null) => void;
}) {
  const favorites = projects.filter((project) => project.favorite);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <DashboardPanel>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader icon={History} title="Recent Projects" description="Review generated interface concepts." />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onDownload(activeProject)}
              disabled={!activeProject}
            >
              <ArrowDownToLine className="size-4" />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-ghost-gold rounded-xl"
              onClick={() => onDownload(activeProject)}
              disabled={!activeProject}
            >
              <Download className="size-4" />
              Download
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
                    {project.type} ┬╖ {project.createdAt}
                  </p>
                </button>
                <div className="mt-4 flex flex-wrap gap-2">
                  <IconAction icon={Star} label="Favorite" active={project.favorite} onClick={() => onFavorite(project.id)} />
                  <IconAction icon={Copy} label="Duplicate" onClick={() => onDuplicate(project)} />
                  <IconAction icon={Download} label="Download" onClick={() => onDownload(project)} />
                  <IconAction icon={Trash2} label="Delete" danger onClick={() => onDelete(project.id)} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/[0.1] p-8 text-center">
            <Globe2 className="mx-auto size-10 text-premium-gold" />
            <p className="mt-4 font-bold text-white">No recent projects yet</p>
            <p className="mt-2 text-sm text-white/40">
              Generate an interface concept to populate your recent projects, favorites and history.
            </p>
          </div>
        )}
      </DashboardPanel>

      <div className="space-y-6">
        <DashboardPanel>
          <SectionHeader icon={LayoutDashboard} title="Templates" description="Production-ready starting points." />
          <div className="mt-5 space-y-3">
            {templates.map((template) => (
              <div
                key={template}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-sm font-medium text-white/65"
              >
                {template}
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeader icon={Star} title="Favorites" description="Pinned workspace concepts." />
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
                Favorite projects will appear here.
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
