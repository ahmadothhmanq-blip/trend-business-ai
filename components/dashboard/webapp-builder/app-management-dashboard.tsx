"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  LayoutDashboard,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Plus,
  Trash2,
  Save,
  RefreshCw,
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
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { AppVersionHistory } from "@/lib/ai-core/app-design-platform/versions";
import type { AppIntelligenceReport, AppQualityReport } from "@/lib/ai-core/app-design-platform/types";
import type { AppPreviewPayload, VisualEditorState } from "@/lib/ai-core/app-design-platform/types";
import { PREVIEW_DEVICE_FRAMES } from "@/lib/ai-core/app-design-platform/preview";
import { brandTokensToCssVars } from "@/lib/ai-core/app-design-platform/brand";

type ManagePayload = {
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
  | "deploy";

export function AppManagementDashboard({ generationId }: { generationId: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ManagePayload | null>(null);
  const [assistantMsg, setAssistantMsg] = useState("");
  const [appName, setAppName] = useState("");
  const [primary, setPrimary] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [busy, setBusy] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [propTitle, setPropTitle] = useState("");
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/webapp-builder/${generationId}/manage`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to load app");
        return;
      }
      setData(json);
      setAppName(json.model.settings.appName);
      setPrimary(json.model.brand.tokens.primary);
    } catch {
      toast.error("Failed to load management data");
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const postAction = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/webapp-builder/${generationId}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action failed");
        return;
      }
      toast.success(json.message ?? "Updated");
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
    } catch {
      toast.error("Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
        Loading app management…
      </div>
    );
  }

  const { model, intelligence, quality, preview, editor, permissions, workflows, prismaSketch, template, history } =
    data;
  const frame = PREVIEW_DEVICE_FRAMES[device];
  const activeScreen =
    model.screens.find((s) => s.id === preview.activeScreenId) || model.screens[0];

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "screens", label: "Screens" },
    { id: "catalog", label: "Content" },
    { id: "brand", label: "Brand" },
    { id: "preview", label: "Live Preview" },
    { id: "editor", label: "Visual Editor" },
    { id: "deploy", label: "Deploy" },
    { id: "assistant", label: "AI Assistant" },
    { id: "intelligence", label: "Intelligence" },
    { id: "versions", label: "Versions" },
    { id: "data", label: "Data" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-white/10 text-white/70">
            <Link href="/dashboard/app-builder">
              <ArrowLeft className="mr-2 size-4" /> Back
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
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void postAction({ action: "sync_files" })}
          >
            Sync code
          </Button>
          <Button
            className="btn-gold rounded-xl font-bold text-luxury-black"
            disabled={busy}
            onClick={() => void postAction({ action: "save_version", note: "Manual checkpoint" })}
          >
            <Save className="mr-2 size-4" /> Save version
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
              tab === t.id
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "text-white/45 hover:bg-white/5 hover:text-white/70",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-2">
            <DashboardCardHeader>
              <DashboardCardTitle>Application blueprint</DashboardCardTitle>
              <DashboardCardDescription>
                Structured model — editable without regenerating source files
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3 text-sm text-white/70">
              <p>{model.settings.tagline}</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  ["Screens", model.screens.length],
                  ["Data models", model.dataModels.length],
                  ["Roles", model.roles.length],
                  ["Catalog", model.catalog.length],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-white/5 p-3">
                    <div className="text-lg font-semibold text-white">{value}</div>
                    <div className="text-xs text-white/40">{label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 text-xs text-white/40">Features</div>
                <div className="flex flex-wrap gap-1.5">
                  {model.featureFlags.map((f) => (
                    <span key={f} className="rounded-lg bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              {template?.userFlows?.[0] && (
                <p className="text-xs text-white/45">Flow: {template.userFlows[0]}</p>
              )}
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Quality</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2 text-sm">
              <div className="text-3xl font-semibold text-premium-gold-light">{quality.score}</div>
              <p className="text-white/60">{quality.summary}</p>
              <div className="text-xs text-white/40">
                Intelligence {intelligence.grade} · {intelligence.score}/100
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "screens" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Screens & navigation</DashboardCardTitle>
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
                  name: "New Screen",
                  path: `/screen-${model.screens.length + 1}`,
                  purpose: "Custom screen",
                })
              }
            >
              <Plus className="mr-2 size-4" /> Add screen
            </Button>
            <div>
              <div className="mb-2 text-xs text-white/40">Navigation</div>
              <div className="flex flex-wrap gap-2">
                {model.navigation.map((n) => (
                  <span key={n.id} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60">
                    {n.label} → {n.href}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-white/40">Roles</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {permissions.map((p) => (
                  <div key={p.role} className="rounded-xl bg-white/5 p-3 text-xs text-white/60">
                    <div className="font-medium text-white">{p.role}</div>
                    <div>
                      {p.screens} screens · {p.dataAccess} data · {p.actions.join(", ")}
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
            <DashboardCardTitle>Business content</DashboardCardTitle>
            <DashboardCardDescription>
              Products, menu items, and catalog — update without rebuilding the app
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Item title"
                className={cn(dashboardInputClass, "max-w-xs")}
              />
              <Input
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Price"
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
                <Plus className="mr-2 size-4" /> Add item
              </Button>
            </div>
            {model.catalog.length === 0 ? (
              <p className="text-sm text-white/40">No catalog items yet.</p>
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
            <DashboardCardTitle>Brand & settings</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/50">App name</label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={dashboardInputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Primary color</label>
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
                Save name
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
                Apply brand colors
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
                <DashboardCardTitle>Live app preview</DashboardCardTitle>
                <DashboardCardDescription>
                  Sandbox runtime from generated files + structured app model
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
                title="App live preview"
                src={`/api/webapp-builder/${generationId}/live-preview${activeScreen ? `?path=${encodeURIComponent(activeScreen.path)}` : ""}`}
                className="rounded-2xl border border-white/15 bg-black shadow-2xl"
                style={{
                  width: Math.min(frame.width, device === "desktop" ? 960 : frame.width),
                  height: Math.min(frame.height, 620),
                }}
                sandbox="allow-same-origin"
              />
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "editor" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-1">
            <DashboardCardHeader>
              <DashboardCardTitle>Component library</DashboardCardTitle>
              <DashboardCardDescription>Add to selected screen</DashboardCardDescription>
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
              <DashboardCardTitle>Visual editor</DashboardCardTitle>
              <DashboardCardDescription>Drag to reorder · edit props · syncs to code</DashboardCardDescription>
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
                    placeholder="Component title"
                    className={dashboardInputClass}
                  />
                  <Input
                    placeholder="Primary color override"
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
                    Apply properties
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
            <DashboardCardTitle>Deployment</DashboardCardTitle>
            <DashboardCardDescription>One-click preview or production deploy</DashboardCardDescription>
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
                      toast.error(json.error ?? "Deploy failed");
                      return;
                    }
                    setDeployStatus(`${json.deployment?.url} · ${json.deployment?.status}`);
                    toast.success(json.message ?? "Deployed");
                  } catch {
                    toast.error("Deploy failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Deploy preview
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
                      toast.error(json.error ?? "Deploy failed");
                      return;
                    }
                    setDeployStatus(`${json.deployment?.url} · ${json.deployment?.status}`);
                    toast.success(json.message ?? "Production deploy started");
                  } catch {
                    toast.error("Deploy failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Deploy production
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void postAction({ action: "provision_backend" })}
              >
                Provision backend
              </Button>
            </div>
            <p className="text-xs text-white/40">
              Live preview: <code className="text-white/60">/api/webapp-builder/{generationId}/live-preview</code>
            </p>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "assistant" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>AI App Assistant</DashboardCardTitle>
            <DashboardCardDescription>
              Natural language edits to the structured app model
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <Textarea
              value={assistantMsg}
              onChange={(e) => setAssistantMsg(e.target.value)}
              placeholder='Try: "Add payment system" · "Create orders dashboard" · "Connect database" · "Create admin panel"'
              className={cn(dashboardInputClass, "min-h-[100px]")}
            />
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy || !assistantMsg.trim()}
              onClick={() => {
                void postAction({ action: "assistant", message: assistantMsg }).then(() =>
                  setAssistantMsg(""),
                );
              }}
            >
              <Sparkles className="mr-2 size-4" /> Apply with AI
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "intelligence" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>App intelligence</DashboardCardTitle>
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
              <DashboardCardTitle>Quality checks</DashboardCardTitle>
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
            <DashboardCardTitle>Version history</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {history.versions.length === 0 ? (
              <p className="text-sm text-white/40">No versions saved yet.</p>
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
                    Restore
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
              <DashboardCardTitle>Data models</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-2">
              {model.dataModels.map((m) => (
                <div key={m.id} className="rounded-xl bg-white/5 p-3 text-xs text-white/60">
                  <div className="font-medium text-white">{m.label}</div>
                  <div>{m.fields.map((f) => f.name).join(", ")}</div>
                  <div className="mt-1 text-white/35">CRUD: {m.crud.join(", ")}</div>
                </div>
              ))}
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Workflows & schema</DashboardCardTitle>
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
