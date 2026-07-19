"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  MessageSquare,
  Package,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { CatalogItem, CmsEntry } from "@/lib/ai-core/website-management";

type Tab =
  | "overview"
  | "catalog"
  | "cms"
  | "brand"
  | "leads"
  | "assistant"
  | "quality";

export function WebsiteManagementDashboard({
  generationId,
}: {
  generationId: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<{
    project?: { title?: string; description?: string };
    structure?: {
      businessType?: string;
      pages?: Array<{ route: string; label: string }>;
      navLinks?: Array<{ href: string; label: string }>;
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/manage`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
      setBrandForm({
        businessName: json.brand?.businessName || "",
        primary: json.brand?.primary || "",
        secondary: json.brand?.secondary || "",
        accent: json.brand?.accent || "",
        displayFont: json.brand?.displayFont || "",
        bodyFont: json.brand?.bodyFont || "",
        logoUrl: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      if (json.catalog) setData((d) => (d ? { ...d, catalog: json.catalog } : d));
      if (json.cms) setData((d) => (d ? { ...d, cms: json.cms } : d));
      if (json.quality) setData((d) => (d ? { ...d, quality: json.quality } : d));
      if (json.assistant) {
        setAssistantLog((log) => [
          ...json.assistant.actions,
          ...json.assistant.notes,
          ...log,
        ].slice(0, 20));
        if (json.editCommand) {
          await fetch(`/api/website-builder/${generationId}/edit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: json.editCommand, applyAi: true }),
          });
        }
      }
      toast.success(json.notes?.[0] || "Saved");
      if (payload.action === "brand.apply" || payload.action === "catalog.upsert") {
        await load();
      }
      return json;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      return null;
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof Package }> = [
    { id: "overview", label: "Overview", icon: ShieldCheck },
    { id: "catalog", label: "Catalog", icon: Package },
    { id: "cms", label: "Content", icon: ImageIcon },
    { id: "brand", label: "Brand", icon: Palette },
    { id: "leads", label: "Leads", icon: MessageSquare },
    { id: "assistant", label: "AI Assistant", icon: Sparkles },
    { id: "quality", label: "Quality", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-white/50">
        <Loader2 className="size-5 animate-spin" />
        Loading website management…
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
            Back to Website Builder
          </Link>
          <h1 className="text-2xl font-semibold text-white">
            {data?.project?.title || "Website Management"}
          </h1>
          <p className="text-sm text-white/45">
            {data?.structure?.businessType || "Business"} · manage content, brand, catalog & quality
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/website-builder?generation=${generationId}`}>
            <Button variant="outline" className="border-white/15 text-white">
              Open editor
            </Button>
          </Link>
          <Button
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={saving}
            onClick={() => void postAction({ action: "quality" })}
          >
            Re-check quality
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition",
              tab === t.id
                ? "bg-premium-gold/20 text-premium-gold"
                : "bg-white/[0.04] text-white/45 hover:text-white/70",
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardPanel>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              Pages
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
              Navigation
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
                  Quality score{" "}
                  <span className="text-premium-gold">{data.quality.score}</span>
                  {data.quality.ready ? " · Ready" : " · Needs fixes"}
                </p>
                <p className="mt-1 text-[12px] text-white/45">{data.quality.summary}</p>
              </div>
            ) : null}
          </DashboardPanel>
        </div>
      ) : null}

      {tab === "catalog" ? (
        <DashboardPanel>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
              Business catalog
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
                    title: "New item",
                    price: "Custom",
                    description: "Added from management dashboard",
                  },
                })
              }
            >
              Add item
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
                      const price = window.prompt("New price", item.price || "");
                      if (!price) return;
                      void postAction({
                        action: "catalog.upsert",
                        item: { ...item, price },
                      });
                    }}
                  >
                    Edit price
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-400/30 text-red-200"
                    disabled={saving}
                    onClick={() =>
                      void postAction({ action: "catalog.delete", id: item.id })
                    }
                  >
                    Delete
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
            Content management
          </p>
          <Input
            value={cmsTitle}
            onChange={(e) => setCmsTitle(e.target.value)}
            placeholder="Content title"
            className="border-white/10 bg-black/30 text-white"
          />
          <Textarea
            value={cmsBody}
            onChange={(e) => setCmsBody(e.target.value)}
            placeholder="Body / announcement / media note"
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
          />
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
                  published: true,
                },
              }).then(() => {
                setCmsTitle("");
                setCmsBody("");
              });
            }}
          >
            Publish content
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
                    {entry.scheduledAt ? ` · scheduled ${entry.scheduledAt}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  onClick={() =>
                    void postAction({ action: "cms.delete", id: entry.id })
                  }
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {tab === "brand" ? (
        <DashboardPanel className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-white/40">
            Brand management
          </p>
          {(
            [
              ["businessName", "Business name"],
              ["logoUrl", "Logo URL"],
              ["primary", "Primary color"],
              ["secondary", "Secondary color"],
              ["accent", "Accent color"],
              ["displayFont", "Display font"],
              ["bodyFont", "Body font"],
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
            Apply brand to website
          </Button>
        </DashboardPanel>
      ) : null}

      {tab === "leads" ? (
        <DashboardPanel>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            Form leads
          </p>
          {(data?.leads || []).length === 0 ? (
            <p className="text-sm text-white/40">No leads yet.</p>
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
            AI Website Assistant
          </p>
          <p className="text-[12px] text-white/45">
            Try: “Change signature tasting price to $90” or “Add a new service called Concierge”
          </p>
          <Textarea
            value={assistantMsg}
            onChange={(e) => setAssistantMsg(e.target.value)}
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
            placeholder="Tell the assistant what to change…"
          />
          <Button
            disabled={saving || !assistantMsg.trim()}
            className="bg-premium-gold text-black"
            onClick={() => {
              const msg = assistantMsg;
              setAssistantMsg("");
              void postAction({ action: "assistant", message: msg });
            }}
          >
            <Sparkles className="size-4" />
            Run assistant
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
            Pre-publish quality
          </p>
          {data?.quality ? (
            <>
              <p className="text-lg text-white">
                Score {data.quality.score} ·{" "}
                {data.quality.ready ? "Ready to publish" : "Blocked"}
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
            <p className="text-sm text-white/40">Run a quality check to see results.</p>
          )}
        </DashboardPanel>
      ) : null}
    </div>
  );
}
