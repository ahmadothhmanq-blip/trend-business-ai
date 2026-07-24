"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  MessageSquare,
  Palette,
  RefreshCw,
  Share2,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { sanitizeSvgContent } from "@/lib/ai/sanitize";
import type { BrandIdentityGeneration } from "@/types/brand-identity";

type Props = {
  generation: BrandIdentityGeneration;
};

type Tab = "overview" | "colors" | "typography" | "voice" | "logos" | "assets" | "assistant" | "apply";

export function BrandManagementDashboard({ generation: initial }: Props) {
  const { t } = useTranslation();
  const p = useProductT("brandIdentity");
  const router = useRouter();
  const [generation, setGeneration] = useState(initial);
  const [tab, setTab] = useState<Tab>("overview");
  const [assistantMsg, setAssistantMsg] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [kitBusy, setKitBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const bp = generation.blueprint;
  const logos = bp?.logoVariants ?? bp?.logos ?? [];

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/brand-identity/${generation.id}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.generation) setGeneration(data.generation);
  }, [generation.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleColorChange = async (index: number, hex: string) => {
    if (!bp) return;
    const colors = bp.colorPalette.map((c, i) => (i === index ? { ...c, hex } : c));
    const res = await fetch(`/api/brand-identity/${generation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors }),
    });
    if (res.ok) {
      toast.success(p("toasts.colorsUpdated"));
      await refresh();
    }
  };

  const handleTypographySave = async () => {
    if (!bp?.typography) return;
    const res = await fetch(`/api/brand-identity/${generation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typography: bp.typography }),
    });
    if (res.ok) {
      toast.success(p("toasts.typographySaved"));
      await refresh();
    }
  };

  const handleGenerateLogos = async () => {
    setLogoBusy(true);
    try {
      const res = await fetch(`/api/brand-identity/${generation.id}/logos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptCount: 3 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? p("errors.logoGenerationFailed"));
        return;
      }
      toast.success(data.message ?? p("toasts.logosGenerated"));
      if (data.generation) setGeneration(data.generation);
    } finally {
      setLogoBusy(false);
    }
  };

  const handleCreateKit = async () => {
    setKitBusy(true);
    try {
      const res = await fetch(`/api/brand-identity/${generation.id}/kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: generation.brand_name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? p("errors.kitCreationFailed"));
        return;
      }
      setShareUrl(data.shareUrl ?? null);
      toast.success(data.message ?? p("toasts.kitCreated"));
    } finally {
      setKitBusy(false);
    }
  };

  const handleAssistant = async () => {
    if (!assistantMsg.trim()) return;
    setAssistantBusy(true);
    try {
      const res = await fetch(`/api/brand-identity/${generation.id}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: assistantMsg }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? p("errors.assistantFailed"));
        return;
      }
      toast.success(data.message);
      setAssistantMsg("");
      if (data.generation) setGeneration(data.generation);
    } finally {
      setAssistantBusy(false);
    }
  };

  const handleExport = async (format: "json" | "html" | "markdown") => {
    window.open(`/api/brand-identity/${generation.id}/export?format=${format}`, "_blank");
  };

  const handleApply = async (target: string) => {
    const res = await fetch(`/api/brand-identity/${generation.id}/export?applyTo=${target}`);
    const data = await res.json();
    if (res.ok) {
      await navigator.clipboard.writeText(JSON.stringify(data.apply, null, 2));
      toast.success(p("management.tokensCopied", { target }));
    }
  };

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <p className="text-white/50">{p("management.noBlueprint")}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/brand-studio")}>
          {p("management.backToStudio")}
        </Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: p("management.tabs.overview") },
    { key: "colors", label: p("management.tabs.colors") },
    { key: "typography", label: p("management.tabs.fonts") },
    { key: "voice", label: p("management.tabs.voice") },
    { key: "logos", label: p("management.tabs.logos") },
    { key: "assets", label: p("management.tabs.assets") },
    { key: "assistant", label: p("management.tabs.assistant") },
    { key: "apply", label: p("management.tabs.apply") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/brand-studio">
          <Button variant="ghost" size="icon-xs" className="text-white/40 hover:text-white">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-white">{bp.title}</h2>
          <p className="text-xs text-white/40">
            {generation.brand_type} · {p("management.qualityScore", { score: bp.qualityScore ?? "—" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => void handleGenerateLogos()} disabled={logoBusy}>
            <RefreshCw className={cn("size-3", logoBusy && "animate-spin")} /> {p("management.logosBtn")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => void handleCreateKit()} disabled={kitBusy}>
            <Sparkles className="size-3" /> {p("management.createKit")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => void handleExport("html")}>
            <Download className="size-3" /> {p("management.pdfHtml")}
          </Button>
          {shareUrl ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success(p("management.shareLinkCopied")); }}>
              <Share2 className="size-3" /> {p("management.share")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardPanel className="space-y-2 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-premium-gold-light">{p("management.mission")}</span>
            <p className="text-sm text-white/70">{bp.mission}</p>
          </DashboardPanel>
          <DashboardPanel className="space-y-2 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-premium-gold-light">{p("management.vision")}</span>
            <p className="text-sm text-white/70">{bp.vision}</p>
          </DashboardPanel>
          <DashboardPanel className="space-y-2 p-5 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-premium-gold-light">{p("management.tagline")}</span>
            <p className="text-lg font-semibold text-white/80">{bp.voiceTone.tagline || "—"}</p>
          </DashboardPanel>
        </div>
      )}

      {tab === "colors" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bp.colorPalette.map((c, i) => (
            <DashboardPanel key={i} className="flex items-center gap-3 p-4">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => void handleColorChange(i, e.target.value)}
                className="size-10 cursor-pointer rounded-lg border-0 bg-transparent"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/80">{c.name}</p>
                <p className="text-xs text-white/40">{c.role}</p>
              </div>
              <code className="text-xs text-white/50">{c.hex}</code>
            </DashboardPanel>
          ))}
        </div>
      )}

      {tab === "typography" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2"><Type className="size-4" /> {p("management.typography")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/50">{p("management.primaryHeadings")}</label>
              <Input
                value={bp.typography.primary}
                onChange={(e) =>
                  setGeneration((g) => ({
                    ...g,
                    blueprint: g.blueprint ? { ...g.blueprint, typography: { ...g.blueprint.typography, primary: e.target.value } } : g.blueprint,
                  }))
                }
                className={dashboardInputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">{p("management.secondaryBody")}</label>
              <Input
                value={bp.typography.secondary}
                onChange={(e) =>
                  setGeneration((g) => ({
                    ...g,
                    blueprint: g.blueprint ? { ...g.blueprint, typography: { ...g.blueprint.typography, secondary: e.target.value } } : g.blueprint,
                  }))
                }
                className={dashboardInputClass}
              />
            </div>
            <Button onClick={() => void handleTypographySave()} className="btn-gold sm:col-span-2 w-fit">
              Save Fonts
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "voice" && (
        <DashboardPanel className="space-y-4 p-5">
          <p className="text-sm text-white/70"><strong>{p("management.toneLabel")}</strong> {bp.voiceTone.tone}</p>
          <p className="text-sm text-white/70">{bp.voiceTone.elevatorPitch}</p>
        </DashboardPanel>
      )}

      {tab === "logos" && (
        <div className="space-y-4">
          {!logos.length ? (
            <DashboardPanel className="py-12 text-center">
              <Palette className="mx-auto size-8 text-white/20" />
              <p className="mt-3 text-sm text-white/50">{p("management.noLogosYet")}</p>
              <Button className="btn-gold mt-4" onClick={() => void handleGenerateLogos()} disabled={logoBusy}>
                Generate Logo Concepts
              </Button>
            </DashboardPanel>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(bp.logoVariants ?? []).map((v) => (
                <DashboardPanel key={v.id} className="space-y-3 p-4">
                  <p className="text-sm font-semibold text-white/80">{v.name}</p>
                  {v.svg ? (
                    <div className="flex justify-center rounded-lg bg-white p-4" dangerouslySetInnerHTML={{ __html: sanitizeSvgContent(v.svg) }} />
                  ) : null}
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => v.svg && navigator.clipboard.writeText(v.svg)}>
                    Copy SVG
                  </Button>
                </DashboardPanel>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "assets" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bp.assets.map((a, i) => (
            <DashboardPanel key={i} className="p-4">
              <p className="text-sm font-semibold text-white/80">{a.name}</p>
              <p className="text-xs text-white/40">{a.category} · {a.format}</p>
            </DashboardPanel>
          ))}
        </div>
      )}

      {tab === "assistant" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2"><MessageSquare className="size-4" /> {p("management.brandAssistant")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <p className="text-xs text-white/40">
              {p("management.assistantHint")}
            </p>
            <Textarea
              value={assistantMsg}
              onChange={(e) => setAssistantMsg(e.target.value)}
              placeholder={p("placeholders.assistantMessage")}
              className={cn(dashboardInputClass, "min-h-[100px]")}
            />
            <Button onClick={() => void handleAssistant()} disabled={assistantBusy || !assistantMsg.trim()} className="btn-gold gap-2">
              <Wand2 className="size-4" /> {assistantBusy ? p("management.applying") : p("management.apply")}
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "apply" && (
        <div className="grid gap-3 sm:grid-cols-3">
          {(["website-builder", "app-builder", "video-studio"] as const).map((target) => (
            <DashboardPanel key={target} className="space-y-3 p-5">
              <p className="text-sm font-semibold capitalize text-white/80">{target.replace("-", " ")}</p>
              <p className="text-xs text-white/40">{p("management.copyTokensFor", { target })}</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => void handleApply(target)}>
                <ExternalLink className="size-3" /> {p("management.copyTokens")}
              </Button>
            </DashboardPanel>
          ))}
        </div>
      )}
    </div>
  );
}
