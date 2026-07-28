"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Navigation,
  Package,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import type { CatalogItem, CmsEntry, NavLink } from "@/lib/ai-core/website-management";
import { MediaLibraryPanel } from "@/components/dashboard/website-builder/media-library-panel";
import { useCopilotCommand } from "@/components/dashboard/website-builder/hooks/use-copilot-command";

type Tab =
  | "overview"
  | "pages"
  | "navigation"
  | "catalog"
  | "cms"
  | "media"
  | "brand"
  | "leads"
  | "assistant"
  | "quality";

export function WebsiteManagementDashboard({
  generationId,
}: {
  generationId: string;
}) {
  const wb = useProductT("websiteBuilder");
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<{
    project?: { title?: string; description?: string };
    structure?: {
      businessType?: string;
      pages?: Array<{ route: string; label: string; path?: string }>;
      navLinks?: NavLink[];
      footerLinks?: NavLink[];
    };
    catalog?: CatalogItem[];
    cms?: CmsEntry[];
    leads?: Array<{ id: string; formType: string; fields: Record<string, string>; createdAt: string }>;
    quality?: {
      ready: boolean;
      score: number;
      summary: string;
      checks: Array<{ id: string; label: string; passed: boolean; detail: string; severity: string }>;
    };
    brand?: {
      businessName?: string;
      primary?: string;
      secondary?: string;
      accent?: string;
      displayFont?: string;
      bodyFont?: string;
      logoUrl?: string | null;
    };
  } | null>(null);
  const [brandForm, setBrandForm] = useState({
    businessName: "",
    primary: "",
    secondary: "",
    accent: "",
    displayFont: "",
    bodyFont: "",
    logoUrl: "",
  });
  const [assistantMsg, setAssistantMsg] = useState("");
  const [assistantLog, setAssistantLog] = useState<string[]>([]);
  const [cmsTitle, setCmsTitle] = useState("");
  const [cmsBody, setCmsBody] = useState("");
  const [cmsSlug, setCmsSlug] = useState("");
  const [cmsCategories, setCmsCategories] = useState("");
  const [cmsTags, setCmsTags] = useState("");
  const [newPageLabel, setNewPageLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "catalog"; id: string; title: string } | { kind: "cms"; id: string; title: string } | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/manage`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || wb("management.errors.loadFailed"));
      setData(json);
      setBrandForm({
        businessName: json.brand?.businessName || "",
        primary: json.brand?.primary || "",
        secondary: json.brand?.secondary || "",
        accent: json.brand?.accent || "",
        displayFont: json.brand?.displayFont || "",
        bodyFont: json.brand?.bodyFont || "",
        logoUrl: json.brand?.logoUrl || "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : wb("management.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [generationId, wb]);

  const copilot = useCopilotCommand({
    generationId,
    applyAi: true,
    onApplied: () => {
      void load();
    },
  });

  useEffect(() => {
    void load();
  }, [load]);

  async function runCopilotAssistant(message: string) {
    setSaving(true);
    try {
      const result = await copilot.submit(message, { forceStream: true });
      if (!result) {
        throw new Error(wb("management.errors.actionFailed"));
      }
      setAssistantLog((log) =>
        [result.summary || wb("builder.copilot.assistant"), ...log].slice(0, 20),
      );
      toast.success(result.summary || wb("management.saved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : wb("management.errors.actionFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function postAction(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || wb("management.errors.actionFailed"));
      if (json.catalog) setData((d) => (d ? { ...d, catalog: json.catalog } : d));
      if (json.cms) setData((d) => (d ? { ...d, cms: json.cms } : d));
      if (json.structure) setData((d) => (d ? { ...d, structure: json.structure } : d));
      if (json.quality) setData((d) => (d ? { ...d, quality: json.quality } : d));
      if (json.assistant) {
        setAssistantLog((log) => [
          ...json.assistant.actions,
          ...json.assistant.notes,
          ...log,
        ].slice(0, 20));
        if (json.editCommand) {
          const result = await copilot.submit(json.editCommand, { forceStream: true });
          if (!result) {
            throw new Error(wb("management.errors.actionFailed"));
          }
        }
      }
      toast.success(json.notes?.[0] || wb("management.saved"));
      if (
        payload.action === "brand.apply" ||
        payload.action === "catalog.upsert" ||
        String(payload.action).startsWith("pages.") ||
        payload.action === "nav.update" ||
        payload.action === "footer.update"
      ) {
        await load();
      }
      return json;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : wb("management.failed"));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const payload =
      deleteTarget.kind === "catalog"
        ? { action: "catalog.delete", id: deleteTarget.id }
        : { action: "cms.delete", id: deleteTarget.id };
    const result = await postAction(payload);
    if (result) setDeleteTarget(null);
  }

  const tabs: Array<{
    id: Tab;
    labelKey: string;
    icon: typeof ShieldCheck;
  }> = [
    { id: "overview", labelKey: "management.tabs.overview", icon: ShieldCheck },
    { id: "pages", labelKey: "management.pages", icon: FileText },
    { id: "navigation", labelKey: "management.navigation", icon: Navigation },
    { id: "catalog", labelKey: "management.tabs.catalog", icon: Package },
    { id: "cms", labelKey: "management.tabs.cms", icon: LayoutGrid },
    { id: "media", labelKey: "builder.media.title", icon: ImageIcon },
    { id: "brand", labelKey: "management.tabs.brand", icon: Palette },
    { id: "leads", labelKey: "management.tabs.leads", icon: MessageSquare },
    { id: "assistant", labelKey: "management.tabs.assistant", icon: Sparkles },
    { id: "quality", labelKey: "management.tabs.quality", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-white/50">
        <Loader2 className="size-5 animate-spin" />
        {wb("management.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/website-builder"
            className="mb-2 inline-flex items-center gap-1 text-[12px] text-premium-gold hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            {wb("management.backToBuilder")}
          </Link>
          <h1 className="text-2xl font-semibold text-white">
            {data?.project?.title || wb("management.title")}
          </h1>
          <p className="text-sm text-white/45">
            {data?.structure?.businessType || wb("management.business")} · {wb("management.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/website-builder?generation=${generationId}`}>
            <Button variant="outline" className="border-white/15 text-white">
              {wb("management.openEditor")}
            </Button>
          </Link>
          <Button
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={saving}
            onClick={() => void postAction({ action: "quality" })}
          >
            {wb("management.recheckQuality")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition",
              tab === tabItem.id
                ? "bg-premium-gold/20 text-premium-gold"
                : "bg-white/[0.04] text-white/45 hover:text-white/70",
            )}
          >
            <tabItem.icon className="size-3.5" />
            {"labelKey" in tabItem ? wb(tabItem.labelKey) : ""}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardPanel>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              {wb("management.pages")}
            </p>
            <ul className="mt-3 space-y-2">
              {(data?.structure?.pages || []).map((p) => (
                <li
                  key={p.route}
                  className="flex justify-between rounded-xl border border-white/[0.06] px-3 py-2 text-sm"
                >
                  <span className="text-white">{p.label}</span>
                  <span className="font-mono text-[11px] text-white/40">
                    {p.route}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardPanel>
          <DashboardPanel>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              {wb("management.navigation")}
            </p>
            <ul className="mt-3 space-y-2">
              {(data?.structure?.navLinks || []).map((l) => (
                <li key={l.href} className="text-sm text-white/70">
                  {l.label} → <span className="font-mono text-white/40">{l.href}</span>
                </li>
              ))}
            </ul>
            {data?.quality ? (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-sm text-white">
                  {wb("management.qualityScore")}{" "}
                  <span className="text-premium-gold">{data.quality.score}</span>
                  {data.quality.ready ? ` · ${wb("management.ready")}` : ` · ${wb("management.needsFixes")}`}
                </p>
                <p className="mt-1 text-[12px] text-white/45">{data.quality.summary}</p>
              </div>
            ) : null}
          </DashboardPanel>
        </div>
      ) : null}

      {tab === "pages" ? (
        <DashboardPanel className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <label className="text-[11px] text-white/40">{wb("builder.pages.title")}</label>
              <Input
                value={newPageLabel}
                onChange={(e) => setNewPageLabel(e.target.value)}
                placeholder={wb("pages.about")}
                className="mt-1 border-white/10 bg-black/30 text-white"
              />
            </div>
            <Button
              disabled={saving || !newPageLabel.trim()}
              className="bg-premium-gold text-black"
              onClick={() => {
                void postAction({
                  action: "pages.create",
                  label: newPageLabel,
                }).then(() => setNewPageLabel(""));
              }}
            >
              {wb("management.addItem")}
            </Button>
          </div>
          <div className="space-y-2">
            {(data?.structure?.pages || []).map((page, index) => (
              <div
                key={page.route}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{page.label}</p>
                  <p className="font-mono text-[11px] text-white/40">{page.route}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white"
                    disabled={saving || index === 0}
                    onClick={() => {
                      const routes = (data?.structure?.pages || []).map((p) => p.route);
                      const next = [...routes];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      void postAction({ action: "pages.reorder", routes: next });
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white"
                    disabled={saving || index === (data?.structure?.pages?.length || 0) - 1}
                    onClick={() => {
                      const routes = (data?.structure?.pages || []).map((p) => p.route);
                      const next = [...routes];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      void postAction({ action: "pages.reorder", routes: next });
                    }}
                  >
                    ↓
                  </Button>
                  {page.route !== "/" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 text-white"
                        disabled={saving}
                        onClick={() =>
                          void postAction({
                            action: "pages.setHome",
                            route: page.route,
                          })
                        }
                      >
                        {wb("pages.home")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 text-white"
                        disabled={saving}
                        onClick={() =>
                          void postAction({
                            action: "pages.duplicate",
                            route: page.route,
                          })
                        }
                      >
                        {t("common.duplicate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-400/30 text-red-200"
                        disabled={saving}
                        onClick={() =>
                          void postAction({
                            action: "pages.delete",
                            route: page.route,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {tab === "navigation" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardPanel className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              {wb("management.navigation")}
            </p>
            {(data?.structure?.navLinks || []).map((link, index) => (
              <div key={`nav-${index}`} className="flex gap-2">
                <Input
                  defaultValue={link.label}
                  className="border-white/10 bg-black/30 text-white"
                  onBlur={(e) => {
                    const links = [...(data?.structure?.navLinks || [])];
                    links[index] = { ...links[index], label: e.target.value };
                    void postAction({ action: "nav.update", links });
                  }}
                />
                <Input
                  defaultValue={link.href}
                  className="border-white/10 bg-black/30 text-white"
                  onBlur={(e) => {
                    const links = [...(data?.structure?.navLinks || [])];
                    links[index] = { ...links[index], href: e.target.value };
                    void postAction({ action: "nav.update", links });
                  }}
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              onClick={() => {
                const links = [
                  ...(data?.structure?.navLinks || []),
                  { href: "/", label: wb("management.navigation") },
                ];
                void postAction({ action: "nav.update", links });
              }}
            >
              {wb("management.addItem")}
            </Button>
          </DashboardPanel>
          <DashboardPanel className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              {wb("builder.blocks.categories.layout")}
            </p>
            {(data?.structure?.footerLinks || []).map((link, index) => (
              <div key={`footer-${index}`} className="flex gap-2">
                <Input
                  defaultValue={link.label}
                  className="border-white/10 bg-black/30 text-white"
                  onBlur={(e) => {
                    const links = [...(data?.structure?.footerLinks || [])];
                    links[index] = { ...links[index], label: e.target.value };
                    void postAction({ action: "footer.update", links });
                  }}
                />
                <Input
                  defaultValue={link.href}
                  className="border-white/10 bg-black/30 text-white"
                  onBlur={(e) => {
                    const links = [...(data?.structure?.footerLinks || [])];
                    links[index] = { ...links[index], href: e.target.value };
                    void postAction({ action: "footer.update", links });
                  }}
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              onClick={() => {
                const links = [
                  ...(data?.structure?.footerLinks || []),
                  { href: "/", label: wb("management.navigation") },
                ];
                void postAction({ action: "footer.update", links });
              }}
            >
              {wb("management.addItem")}
            </Button>
          </DashboardPanel>
        </div>
      ) : null}

      {tab === "catalog" ? (
        <DashboardPanel>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              {wb("management.businessCatalog")}
            </p>
            <Button
              size="sm"
              disabled={saving}
              className="bg-premium-gold text-black"
              onClick={() =>
                void postAction({
                  action: "catalog.upsert",
                  item: {
                    type: "service",
                    title: wb("management.catalog.newItem"),
                    price: wb("management.customPrice"),
                    description: wb("management.catalog.newItemDescription"),
                  },
                })
              }
            >
              {wb("management.addItem")}
            </Button>
          </div>
          <div className="space-y-2">
            {(data?.catalog || []).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-[11px] text-white/40">
                    {item.type} · {item.category || "—"} · {item.price || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white"
                    disabled={saving}
                    onClick={() => {
                      const price = window.prompt(wb("management.catalog.pricePrompt"), item.price || "");
                      if (!price) return;
                      void postAction({
                        action: "catalog.upsert",
                        item: { ...item, price },
                      });
                    }}
                  >
                    {wb("management.editPrice")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-400/30 text-red-200"
                    disabled={saving}
                    onClick={() =>
                      setDeleteTarget({
                        kind: "catalog",
                        id: item.id,
                        title: item.title,
                      })
                    }
                  >
                    {wb("management.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {tab === "cms" ? (
        <DashboardPanel className="space-y-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
            {wb("management.contentManagement")}
          </p>
          <Input
            value={cmsTitle}
            onChange={(e) => setCmsTitle(e.target.value)}
            placeholder={wb("management.cms.titlePlaceholder")}
            className="border-white/10 bg-black/30 text-white"
          />
          <Textarea
            value={cmsBody}
            onChange={(e) => setCmsBody(e.target.value)}
            placeholder={wb("management.bodyPlaceholder")}
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              value={cmsSlug}
              onChange={(e) => setCmsSlug(e.target.value)}
              placeholder={wb("management.cms.titlePlaceholder")}
              className="border-white/10 bg-black/30 text-white"
            />
            <Input
              value={cmsCategories}
              onChange={(e) => setCmsCategories(e.target.value)}
              placeholder={wb("management.bodyPlaceholder")}
              className="border-white/10 bg-black/30 text-white"
            />
            <Input
              value={cmsTags}
              onChange={(e) => setCmsTags(e.target.value)}
              placeholder={wb("management.scheduled")}
              className="border-white/10 bg-black/30 text-white"
            />
          </div>
          <Button
            disabled={saving || !cmsTitle.trim()}
            className="bg-premium-gold text-black"
            onClick={() => {
              void postAction({
                action: "cms.upsert",
                entry: {
                  kind: "post",
                  title: cmsTitle,
                  body: cmsBody,
                  slug: cmsSlug || undefined,
                  categories: cmsCategories
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  tags: cmsTags
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  published: true,
                },
              }).then(() => {
                setCmsTitle("");
                setCmsBody("");
                setCmsSlug("");
                setCmsCategories("");
                setCmsTags("");
                void load();
              });
            }}
          >
            {wb("management.publishContent")}
          </Button>
          <div className="space-y-2 pt-2">
            {(data?.cms || []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{entry.title}</p>
                  <p className="text-[11px] text-white/40">
                    {entry.kind}
                    {entry.scheduledAt ? ` · ${wb("management.scheduled")} ${entry.scheduledAt}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  onClick={() =>
                    setDeleteTarget({
                      kind: "cms",
                      id: entry.id,
                      title: entry.title,
                    })
                  }
                >
                  {wb("management.delete")}
                </Button>
              </div>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {tab === "media" ? (
        <DashboardPanel>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            Media library
          </p>
          <MediaLibraryPanel generationId={generationId} />
        </DashboardPanel>
      ) : null}

      {tab === "brand" ? (
        <DashboardPanel className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
            {wb("management.brandManagement")}
          </p>
          {brandForm.logoUrl ? (
            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
              <p className="mb-2 text-[11px] text-white/40">{wb("management.logoUrl")}</p>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brandForm.logoUrl}
                  alt={brandForm.businessName || wb("management.brand.businessName")}
                  className="h-16 w-16 rounded-lg border border-white/10 bg-white/5 object-contain p-1"
                />
                <p className="min-w-0 flex-1 truncate text-[12px] text-white/55">
                  {brandForm.logoUrl}
                </p>
              </div>
            </div>
          ) : null}
          {(
            [
              ["businessName", wb("management.brand.businessName")],
              ["logoUrl", wb("management.logoUrl")],
              ["primary", wb("management.brand.primary")],
              ["secondary", wb("management.brand.secondary")],
              ["accent", wb("management.brand.accent")],
              ["displayFont", wb("management.brand.displayFont")],
              ["bodyFont", wb("management.brand.bodyFont")],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-[11px] text-white/40">{label}</label>
              <Input
                value={brandForm[key]}
                onChange={(e) =>
                  setBrandForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="mt-1 border-white/10 bg-black/30 text-white"
              />
            </div>
          ))}
          <Button
            disabled={saving || !brandForm.businessName.trim()}
            className="bg-premium-gold text-black"
            onClick={() =>
              void postAction({
                action: "brand.apply",
                brand: {
                  businessName: brandForm.businessName,
                  logoUrl: brandForm.logoUrl || null,
                  primary: brandForm.primary || undefined,
                  secondary: brandForm.secondary || undefined,
                  accent: brandForm.accent || undefined,
                  displayFont: brandForm.displayFont || undefined,
                  bodyFont: brandForm.bodyFont || undefined,
                },
              })
            }
          >
            {wb("management.applyBrand")}
          </Button>
        </DashboardPanel>
      ) : null}

      {tab === "leads" ? (
        <DashboardPanel>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            {wb("management.formLeads")}
          </p>
          {(data?.leads || []).length === 0 ? (
            <p className="text-sm text-white/40">{wb("management.noLeads")}</p>
          ) : (
            <div className="space-y-2">
              {(data?.leads || []).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-white/[0.08] px-3 py-2 text-sm"
                >
                  <p className="text-white">{lead.formType}</p>
                  <p className="text-[11px] text-white/40">{lead.createdAt}</p>
                  <pre className="mt-2 overflow-auto text-[11px] text-white/55">
                    {JSON.stringify(lead.fields, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      ) : null}

      {tab === "assistant" ? (
        <DashboardPanel className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
            {wb("management.aiAssistantTitle")}
          </p>
          <p className="text-[12px] text-white/45">
            {wb("management.assistantExamples")}
          </p>
          <Textarea
            value={assistantMsg}
            onChange={(e) => setAssistantMsg(e.target.value)}
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
            placeholder={wb("management.assistant.placeholder")}
          />
          <Button
            disabled={saving || !assistantMsg.trim()}
            className="bg-premium-gold text-black"
            onClick={() => {
              const msg = assistantMsg;
              setAssistantMsg("");
              void runCopilotAssistant(msg);
            }}
          >
            <Sparkles className="size-4" />
            {wb("management.runAssistant")}
          </Button>
          <ul className="space-y-1 text-[12px] text-white/50">
            {assistantLog.map((line, i) => (
              <li key={`${line}-${i}`}>• {line}</li>
            ))}
          </ul>
        </DashboardPanel>
      ) : null}

      {tab === "quality" ? (
        <DashboardPanel>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            {wb("management.prePublishQuality")}
          </p>
          {data?.quality ? (
            <>
              <p className="text-lg text-white">
                {wb("management.scoreLabel", { score: data.quality.score })} ·{" "}
                {data.quality.ready ? wb("management.quality.readyToPublish") : wb("management.quality.blocked")}
              </p>
              <p className="mt-1 text-sm text-white/45">{data.quality.summary}</p>
              <div className="mt-4 space-y-2">
                {data.quality.checks.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm",
                      c.passed
                        ? "border-emerald-500/20 text-emerald-200"
                        : "border-amber-500/20 text-amber-100",
                    )}
                  >
                    <p className="font-medium">{c.label}</p>
                    <p className="text-[12px] opacity-80">{c.detail}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-white/40">{wb("management.runQualityCheck")}</p>
          )}
        </DashboardPanel>
      ) : null}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !saving && setDeleteTarget(null)}
      >
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
              className="border-white/15 text-white"
              disabled={saving}
              onClick={() => setDeleteTarget(null)}
            >
              {wb("dialogs.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={saving}
              onClick={() => void confirmDelete()}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {wb("dialogs.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
