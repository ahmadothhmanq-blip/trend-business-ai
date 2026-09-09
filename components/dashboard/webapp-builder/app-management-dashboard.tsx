"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Store,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { AppVersionHistory } from "@/lib/ai-core/app-design-platform/versions";
import type { AppIntelligenceReport, AppQualityReport } from "@/lib/ai-core/app-design-platform/types";
import type { AppPreviewPayload, VisualEditorState } from "@/lib/ai-core/app-design-platform/types";
import { PREVIEW_DEVICE_FRAMES } from "@/lib/ai-core/app-design-platform/preview";
import { brandTokensToCssVars } from "@/lib/ai-core/app-design-platform/brand";
import { AppStudioChat } from "@/components/dashboard/webapp-builder/app-studio-chat";
import type { AppCopilotUndoSnapshot } from "@/components/dashboard/webapp-builder/hooks/use-app-copilot-command";
import { StorePublishPanel } from "@/components/dashboard/webapp-builder/store-publish-panel";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppGeneration } from "@/types/webapp";
import { readBlueprintRevisionFromGeneration } from "@/lib/webapp/platform/revision";

type ManagePayload = {
  generation: WebAppGeneration;
  model: StructuredAppModel;
  history: AppVersionHistory;
  intelligence: AppIntelligenceReport;
  quality: AppQualityReport;
  preview: AppPreviewPayload;
  editor: VisualEditorState;
  permissions: Array<{
    role: string;
    screens: number;
    actions: string[];
    dataAccess: string;
  }>;
  workflows: string[];
  prismaSketch: string;
  template: { id: string; label: string; description: string; userFlows: string[] } | null;
  componentPalette?: Array<{ id: string; label: string; category: string; description: string }>;
  livePreviewUrl?: string;
  publication?: {
    publicPath: string | null;
    productionUrl: string | null;
    previewHostUrl?: string | null;
    status: string;
    kind: string;
  } | null;
  runtimeHost?: {
    url: string;
    status: string;
    message?: string;
  } | null;
};

type Tab =
  | "overview"
  | "screens"
  | "catalog"
  | "brand"
  | "preview"
  | "editor"
  | "assistant"
  | "intelligence"
  | "versions"
  | "data"
  | "deploy"
  | "stores";

export function AppManagementDashboard({ generationId }: { generationId: string }) {
  const p = useProductT("webappBuilder");
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ManagePayload | null>(null);
  const [appName, setAppName] = useState("");
  const [primary, setPrimary] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [busy, setBusy] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [propTitle, setPropTitle] = useState("");
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [productionUrl, setProductionUrl] = useState<string | null>(null);
  const [previewHostUrl, setPreviewHostUrl] = useState<string | null>(null);
  const [runtimeHostStatus, setRuntimeHostStatus] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [files, setFiles] = useState<GeneratedProjectFile[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/webapp-builder/${generationId}/manage`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? p("errors.loadFailed"));
        return;
      }
      setData(json);
      setAppName(json.model.settings.appName);
      setPrimary(json.model.brand.tokens.primary);
      setRevision(readBlueprintRevisionFromGeneration(json.generation));
      setFiles(json.generation?.blueprint?.files ?? []);
      if (json.runtimeHost?.url) {
        setProductionUrl(String(json.runtimeHost.url));
        setRuntimeHostStatus(String(json.runtimeHost.status ?? ""));
      } else if (
        json.publication?.kind === "self-hosted" &&
        json.publication?.productionUrl
      ) {
        setProductionUrl(String(json.publication.productionUrl));
        setRuntimeHostStatus(String(json.publication.status ?? ""));
      } else {
        setProductionUrl(null);
        setRuntimeHostStatus(null);
      }
      const preview =
        json.publication?.previewHostUrl ||
        (json.publication?.kind === "interactive-preview-host"
          ? json.publication?.productionUrl
          : null);
      setPreviewHostUrl(preview ? String(preview) : null);
    } catch {
      toast.error(p("errors.loadManagementFailed"));
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const postAction = async (
    body: Record<string, unknown>,
    options?: { silent?: boolean },
  ): Promise<string | undefined> => {
    setBusy(true);
    try {
      const res = await fetch(`/api/webapp-builder/${generationId}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? p("errors.actionFailed"));
        return undefined;
      }
      if (!options?.silent) {
        toast.success(json.message ?? p("management.updated"));
      }
      if (json.model) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                model: json.model,
                history: json.history ?? prev.history,
                intelligence: json.intelligence ?? prev.intelligence,
                quality: json.quality ?? prev.quality,
                preview: json.preview ?? prev.preview,
                editor: json.editor ?? prev.editor,
              }
            : prev,
        );
        setAppName(json.model.settings.appName);
        setPrimary(json.model.brand.tokens.primary);
      }
      if (json.preview && body.action === "preview") {
        setData((prev) => (prev ? { ...prev, preview: json.preview } : prev));
      }
      return typeof json.message === "string" ? json.message : undefined;
    } catch {
      toast.error(p("errors.requestFailed"));
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  const downloadProjectZip = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/webapp-builder/${generationId}/export`);
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(json.error ?? p("management.downloadZipFailed"));
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ??
        `${(data?.model.settings.appName ?? appName).replace(/\s+/g, "-").toLowerCase()}.zip`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(p("management.downloadZipStarted"));
    } catch {
      toast.error(p("management.downloadZipFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
        {p("management.loading")}
      </div>
    );
  }

  const { model, intelligence, quality, preview, editor, permissions, workflows, prismaSketch, template, history } =
    data;
  const frame = PREVIEW_DEVICE_FRAMES[device];
  const activeScreen =
    model.screens.find((s) => s.id === preview.activeScreenId) || model.screens[0];

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: p("management.tabs.overview") },
    { id: "screens", label: p("management.tabs.screens") },
    { id: "catalog", label: p("management.tabs.content") },
    { id: "brand", label: p("management.tabs.brand") },
    { id: "preview", label: p("management.tabs.livePreview") },
    { id: "editor", label: p("management.tabs.visualEditor") },
    { id: "deploy", label: p("management.tabs.deploy") },
    { id: "stores", label: p("management.tabs.stores") },
    { id: "assistant", label: p("management.tabs.assistant") },
    { id: "intelligence", label: p("management.tabs.intelligence") },
    { id: "versions", label: p("management.tabs.versions") },
    { id: "data", label: p("management.tabs.data") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-white/10 text-white/70">
            <Link href="/dashboard/app-builder">
              <ArrowLeft className="mr-2 size-4" /> {p("management.backToBuilder")}
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">{model.settings.appName}</h1>
            <p className="text-xs text-white/45">
              {template?.label ?? model.templateId} · {model.architecture} · v{model.version}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            onClick={() => void load()}
            disabled={busy}
          >
            <RefreshCw className="mr-2 size-4" /> {p("management.refresh")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void postAction({ action: "sync_files" })}
          >
            {p("management.syncCode")}
          </Button>
          <Button
            className="btn-gold rounded-xl font-bold text-luxury-black"
            disabled={busy}
            onClick={() => void postAction({ action: "save_version", note: p("management.manualCheckpoint") })}
          >
            <Save className="mr-2 size-4" /> {p("management.saveVersion")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
              tab === tabItem.id
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "text-white/45 hover:bg-white/5 hover:text-white/70",
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-2">
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.blueprintTitle")}</DashboardCardTitle>
              <DashboardCardDescription>
                {p("management.blueprintDescription")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3 text-sm text-white/70">
              <p>{model.settings.tagline}</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  [p("management.stats.screens"), model.screens.length],
                  [p("management.stats.dataModels"), model.dataModels.length],
                  [p("management.stats.roles"), model.roles.length],
                  [p("management.stats.catalog"), model.catalog.length],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-white/5 p-3">
                    <div className="text-lg font-semibold text-white">{value}</div>
                    <div className="text-xs text-white/40">{label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 text-xs text-white/40">{p("management.features")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {model.featureFlags.map((f) => (
                    <span key={f} className="rounded-lg bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              {template?.userFlows?.[0] && (
                <p className="text-xs text-white/45">{p("management.flow")}: {template.userFlows[0]}</p>
              )}
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.quality")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2 text-sm">
              <div className="text-3xl font-semibold text-premium-gold-light">{quality.score}</div>
              <p className="text-white/60">{quality.summary}</p>
              <div className="text-xs text-white/40">
                {p("management.intelligenceGrade", { grade: intelligence.grade, score: intelligence.score })}
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-xl border-white/10"
                onClick={() => setTab("stores")}
              >
                {p("management.mobileStores.openWizard")}
              </Button>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "screens" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.screensNav")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="grid gap-2">
              {model.screens.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-xs text-white/40">
                      {s.path} · {s.components.join(", ")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-white/10"
                    disabled={busy || /login/i.test(s.path)}
                    onClick={() => void postAction({ action: "remove_screen", screenId: s.id })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy}
              onClick={() =>
                void postAction({
                  action: "add_screen",
                  name: p("management.newScreenName"),
                  path: `/screen-${model.screens.length + 1}`,
                  purpose: p("management.customScreenPurpose"),
                })
              }
            >
              <Plus className="mr-2 size-4" /> {p("management.addScreen")}
            </Button>
            <div>
              <div className="mb-2 text-xs text-white/40">{p("management.navigation")}</div>
              <div className="flex flex-wrap gap-2">
                {model.navigation.map((n) => (
                  <span key={n.id} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60">
                    {n.label} → {n.href}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-white/40">{p("management.roles")}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {permissions.map((perm) => (
                  <div key={perm.role} className="rounded-xl bg-white/5 p-3 text-xs text-white/60">
                    <div className="font-medium text-white">{perm.role}</div>
                    <div>
                      {p("management.permissionSummary", {
                        screenCount: perm.screens,
                        dataAccess: perm.dataAccess,
                        actions: perm.actions.join(", "),
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "catalog" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.businessContent")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.businessContentDescription")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder={p("placeholders.itemTitle")}
                className={cn(dashboardInputClass, "max-w-xs")}
              />
              <Input
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder={p("placeholders.itemPrice")}
                className={cn(dashboardInputClass, "max-w-[120px]")}
              />
              <Button
                className="btn-gold rounded-xl font-bold text-luxury-black"
                disabled={busy || !newItemTitle.trim()}
                onClick={() => {
                  void postAction({
                    action: "upsert_catalog",
                    item: {
                      type: model.templateId === "restaurant" ? "menu-item" : "product",
                      title: newItemTitle.trim(),
                      price: newItemPrice.trim() || undefined,
                      status: "published",
                    },
                  }).then(() => {
                    setNewItemTitle("");
                    setNewItemPrice("");
                  });
                }}
              >
                <Plus className="mr-2 size-4" /> {p("management.addItem")}
              </Button>
            </div>
            {model.catalog.length === 0 ? (
              <p className="text-sm text-white/40">{p("management.noCatalogItems")}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {model.catalog.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 rounded-xl bg-white/5 p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-white/45">
                        {item.type} · {item.price || "—"} · {item.status}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      disabled={busy}
                      onClick={() => void postAction({ action: "delete_catalog", itemId: item.id })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "brand" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.brandSettings")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/50">{p("management.appName")}</label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={dashboardInputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">{p("management.primaryColor")}</label>
                <Input
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className={dashboardInputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="btn-gold rounded-xl font-bold text-luxury-black"
                disabled={busy}
                onClick={() =>
                  void postAction({
                    action: "update_settings",
                    appName,
                  })
                }
              >
                {p("management.saveName")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() =>
                  void postAction({
                    action: "apply_brand",
                    name: appName,
                    primary,
                    accent: primary,
                  })
                }
              >
                {p("management.applyBrandColors")}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-[11px] text-white/50">
              {brandTokensToCssVars(model.brand.tokens)}
            </pre>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "preview" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DashboardCardTitle>{p("management.liveAppPreview")}</DashboardCardTitle>
                <DashboardCardDescription>
                  {p("management.liveAppPreviewDescription")}
                </DashboardCardDescription>
              </div>
              <div className="flex gap-1">
                {(
                  [
                    ["mobile", Smartphone],
                    ["tablet", Tablet],
                    ["desktop", Monitor],
                  ] as const
                ).map(([id, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    title={p(`management.devices.${id}`)}
                    onClick={() => setDevice(id)}
                    className={cn(
                      "rounded-lg p-2",
                      device === id ? "bg-premium-gold/20 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="mb-3 flex flex-wrap gap-2">
              {model.screens.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    void postAction({
                      action: "preview",
                      device,
                      screenId: s.id,
                    })
                  }
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    preview.activeScreenId === s.id
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-white/45",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="flex justify-center overflow-auto py-2">
              <iframe
                title={p("management.livePreviewTitle")}
                src={`/api/webapp-builder/${generationId}/live-preview${activeScreen ? `?path=${encodeURIComponent(activeScreen.path)}` : ""}`}
                className="rounded-2xl border border-white/15 bg-black shadow-2xl"
                style={{
                  width: Math.min(frame.width, device === "desktop" ? 960 : frame.width),
                  height: Math.min(frame.height, 620),
                }}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "editor" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-1">
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.componentLibrary")}</DashboardCardTitle>
              <DashboardCardDescription>{p("management.addToSelectedScreen")}</DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="max-h-[420px] space-y-2 overflow-auto">
              {(data.componentPalette ?? []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={busy || !editor.selectedScreenId}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs hover:bg-white/10"
                  onClick={() =>
                    void postAction({
                      action: "editor_add_component",
                      screenId: editor.selectedScreenId!,
                      componentType: c.id,
                    })
                  }
                >
                  <div className="font-medium text-white">{c.label}</div>
                  <div className="text-white/45">{c.category}</div>
                </button>
              ))}
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard className="lg:col-span-2">
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.visualEditor")}</DashboardCardTitle>
              <DashboardCardDescription>{p("management.visualEditorDescription")}</DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {model.screens.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    draggable
                    onDragStart={() => setSelectedNodeId(`screen-${idx}`)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const from = Number(selectedNodeId?.replace("screen-", "") ?? idx);
                      if (from !== idx) {
                        void postAction({ action: "reorder_screens", fromIndex: from, toIndex: idx });
                      }
                    }}
                    className={cn(
                      "rounded-lg px-2 py-1 text-xs",
                      editor.selectedScreenId === s.id
                        ? "bg-premium-gold/20 text-premium-gold-light"
                        : "bg-white/5 text-white/50",
                    )}
                    onClick={() => void postAction({ action: "editor_select_screen", screenId: s.id })}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="space-y-2 rounded-xl bg-black/30 p-3">
                {editor.tree[0]?.children.map((node, idx) => (
                  <div
                    key={node.id}
                    draggable
                    className={cn(
                      "cursor-grab rounded-lg border px-3 py-2 text-xs",
                      selectedNodeId === node.id
                        ? "border-premium-gold/50 bg-premium-gold/10"
                        : "border-white/10 bg-white/5",
                    )}
                    onDragStart={() => setSelectedNodeId(node.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const from = editor.tree[0]?.children.findIndex((c) => c.id === selectedNodeId) ?? idx;
                      if (from >= 0 && from !== idx && editor.selectedScreenId) {
                        void postAction({
                          action: "editor_reorder_components",
                          screenId: editor.selectedScreenId,
                          fromIndex: from,
                          toIndex: idx,
                        });
                      }
                    }}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setPropTitle(String(node.props.title || node.label || ""));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{node.label}</span>
                      <button
                        type="button"
                        className="text-red-300/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          void postAction({ action: "editor_remove_component", componentId: node.id });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {selectedNodeId && editor.selectedScreenId && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder={p("management.componentTitlePlaceholder")}
                    className={dashboardInputClass}
                  />
                  <Input
                    placeholder={p("management.primaryColorPlaceholder")}
                    className={dashboardInputClass}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) return;
                      void postAction({
                        action: "editor_update_styles",
                        screenId: editor.selectedScreenId!,
                        nodeId: selectedNodeId,
                        style: { color: e.target.value.trim() },
                      });
                    }}
                  />
                  <Button
                    className="sm:col-span-2 rounded-xl"
                    disabled={busy}
                    onClick={() =>
                      void postAction({
                        action: "editor_update_props",
                        screenId: editor.selectedScreenId!,
                        nodeId: selectedNodeId,
                        props: { title: propTitle },
                      })
                    }
                  >
                    {p("management.applyProperties")}
                  </Button>
                </div>
              )}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "deploy" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.deployment")}</DashboardCardTitle>
            <DashboardCardDescription>{p("management.deploymentDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            {deployStatus ? <p className="text-sm text-white/60">{deployStatus}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button
                className="btn-gold rounded-xl font-bold text-luxury-black"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await fetch(`/api/webapp-builder/${generationId}/deploy`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ environment: "preview", provisionBackend: true }),
                    });
                    const json = await res.json();
                    if (!res.ok) {
                      toast.error(json.error ?? p("management.deployFailed"));
                      return;
                    }
                    setDeployStatus(`${json.deployment?.url} · ${json.deployment?.status}`);
                    toast.success(json.message ?? p("management.deployed"));
                  } catch {
                    toast.error(p("management.deployFailed"));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {p("management.deployPreview")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await fetch(`/api/webapp-builder/${generationId}/deploy`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ environment: "production", provisionBackend: true }),
                    });
                    const json = await res.json();
                    if (!res.ok) {
                      toast.error(json.error ?? p("management.deployFailed"));
                      return;
                    }
                    setDeployStatus(`${json.deployment?.url} · ${json.deployment?.status}`);
                    if (json.deployment?.url) setPreviewHostUrl(String(json.deployment.url));
                    toast.success(json.message ?? p("management.productionDeployStarted"));
                  } catch {
                    toast.error(p("management.deployFailed"));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {p("management.deployProduction")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void postAction({ action: "provision_backend" })}
              >
                {p("management.provisionBackend")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-premium-gold/25 text-premium-gold-light hover:border-premium-gold/40"
                disabled={busy}
                onClick={() => void downloadProjectZip()}
              >
                <Download className="size-4" aria-hidden />
                {p("management.downloadZip")}
              </Button>
            </div>
            <p className="text-xs text-white/40">
              Preview uses the authenticated live sandbox. Production publishes a public HTML host at{" "}
              <code className="text-white/60">/w/app/…</code>
              {" "}(not a remote Node/Vercel build). Full Next.js runtime: download the project ZIP.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
              <p className="text-sm font-semibold text-white">{p("management.zipPlaybookTitle")}</p>
              <p className="text-xs text-white/55">{p("management.zipPlaybookIntro")}</p>
              <ol className="list-decimal space-y-1 ps-4 text-xs text-white/65">
                <li>{p("management.zipPlaybookStep1")}</li>
                <li>{p("management.zipPlaybookStep2")}</li>
                <li>{p("management.zipPlaybookStep3")}</li>
              </ol>
              <p className="text-xs text-premium-gold-light/80">{p("management.zipPlaybookTrust")}</p>
            </div>
            <p className="text-xs text-white/40">
              {p("management.livePreviewPath")} <code className="text-white/60">/api/webapp-builder/{generationId}/live-preview</code>
            </p>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "deploy" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light">
                <Store className="size-5" aria-hidden />
              </div>
              <div>
                <DashboardCardTitle>{p("management.mobileStores.title")}</DashboardCardTitle>
                <DashboardCardDescription>{p("management.mobileStores.description")}</DashboardCardDescription>
              </div>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent className="flex flex-wrap gap-2">
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              onClick={() => setTab("stores")}
            >
              {p("management.mobileStores.openWizard")}
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-white/10"
              disabled={busy}
              onClick={() => void downloadProjectZip()}
            >
              <Download className="size-4" aria-hidden />
              {p("management.downloadZip")}
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "stores" && (
        <StorePublishPanel
          appName={model.settings.appName || appName}
          busy={busy}
          productionUrl={productionUrl}
          previewHostUrl={previewHostUrl}
          runtimeHostStatus={runtimeHostStatus}
          onDeployProduction={async () => {
            setBusy(true);
            try {
              const res = await fetch(`/api/webapp-builder/${generationId}/deploy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ environment: "production", provisionBackend: true }),
              });
              const json = await res.json();
              if (!res.ok) {
                toast.error(json.error ?? p("management.deployFailed"));
                return;
              }
              setDeployStatus(`${json.deployment?.url} · ${json.deployment?.status}`);
              if (json.deployment?.url) setPreviewHostUrl(String(json.deployment.url));
              toast.success(json.message ?? p("management.productionDeployStarted"));
            } catch {
              toast.error(p("management.deployFailed"));
            } finally {
              setBusy(false);
            }
          }}
          onDownloadZip={() => downloadProjectZip()}
          onSyncPackaging={() => postAction({ action: "sync_files" }, { silent: true })}
          onRegisterRuntimeHost={async (url) => {
            setBusy(true);
            try {
              const res = await fetch(`/api/webapp-builder/${generationId}/manage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "register_runtime_host",
                  url,
                  verify: true,
                }),
              });
              const json = await res.json();
              if (!res.ok) {
                toast.error(json.error ?? p("management.mobileStores.registerHostFailed"));
                return;
              }
              if (json.runtimeHost?.url) {
                setProductionUrl(String(json.runtimeHost.url));
                setRuntimeHostStatus(String(json.runtimeHost.status ?? ""));
              }
              toast.success(json.message ?? p("management.mobileStores.registerHostSuccess"));
            } catch {
              toast.error(p("management.mobileStores.registerHostFailed"));
            } finally {
              setBusy(false);
            }
          }}
          onClearRuntimeHost={async () => {
            setBusy(true);
            try {
              const res = await fetch(`/api/webapp-builder/${generationId}/manage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "clear_runtime_host" }),
              });
              const json = await res.json();
              if (!res.ok) {
                toast.error(json.error ?? p("management.mobileStores.clearHostFailed"));
                return;
              }
              setProductionUrl(null);
              setRuntimeHostStatus(null);
              toast.success(json.message ?? p("management.mobileStores.clearHostSuccess"));
            } catch {
              toast.error(p("management.mobileStores.clearHostFailed"));
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {tab === "assistant" && data && (
        <AppStudioChat
          mode="edit"
          generationId={generationId}
          expectedRevision={revision}
          onBeforeMutation={() => {
            if (!data) return null;
            return {
              model: data.model,
              files,
              generation: data.generation,
              revision,
            } satisfies AppCopilotUndoSnapshot;
          }}
          onApplied={({ model, files: nextFiles, generation, revision: nextRevision }) => {
            setData((current) =>
              current
                ? {
                    ...current,
                    model,
                    generation,
                  }
                : current,
            );
            setFiles(nextFiles);
            setRevision(nextRevision);
            setAppName(model.settings.appName);
            setPrimary(model.brand.tokens.primary);
            void load();
          }}
        />
      )}

      {tab === "intelligence" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.appIntelligence")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="text-3xl font-semibold text-white">
                {intelligence.grade} · {intelligence.score}
              </div>
              <p className="text-sm text-white/60">{intelligence.summary}</p>
              <ul className="space-y-2">
                {intelligence.suggestions.map((s) => (
                  <li key={s.id} className="rounded-xl bg-white/5 p-3 text-xs text-white/65">
                    <div className="font-medium text-white">
                      [{s.priority}] {s.title}
                    </div>
                    <div>{s.description}</div>
                  </li>
                ))}
              </ul>
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.qualityChecks")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2">
              {quality.checks.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs",
                    c.passed ? "bg-emerald-500/10 text-emerald-200/80" : "bg-amber-500/10 text-amber-100/80",
                  )}
                >
                  <div className="font-medium">
                    {c.passed ? "✓" : "!"} {c.label}
                  </div>
                  <div className="opacity-80">{c.detail}</div>
                </div>
              ))}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "versions" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.versionHistory")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {history.versions.length === 0 ? (
              <p className="text-sm text-white/40">{p("management.noVersions")}</p>
            ) : (
              history.versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2"
                >
                  <div>
                    <div className="text-sm text-white">{v.label}</div>
                    <div className="text-xs text-white/40">
                      {new Date(v.createdAt).toLocaleString()} · {v.note || "—"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-white/10"
                    disabled={busy}
                    onClick={() => void postAction({ action: "restore_version", versionId: v.id })}
                  >
                    {p("management.restore")}
                  </Button>
                </div>
              ))
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "data" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.dataModels")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2">
              {model.dataModels.map((m) => (
                <div key={m.id} className="rounded-xl bg-white/5 p-3 text-xs text-white/60">
                  <div className="font-medium text-white">{m.label}</div>
                  <div>{m.fields.map((f) => f.name).join(", ")}</div>
                  <div className="mt-1 text-white/35">{p("management.crud")} {m.crud.join(", ")}</div>
                </div>
              ))}
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.workflowsSchema")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <ul className="space-y-1 text-xs text-white/55">
                {workflows.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
              <pre className="max-h-64 overflow-auto rounded-xl bg-black/40 p-3 text-[10px] text-white/45">
                {prismaSketch}
              </pre>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
