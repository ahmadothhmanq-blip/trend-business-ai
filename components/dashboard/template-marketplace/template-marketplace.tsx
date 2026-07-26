"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Loader2,
  Monitor,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type {
  MarketplaceCategory,
  MarketplaceRecommendResult,
  MarketplaceStyleVariation,
  MarketplaceTemplate,
} from "@/lib/ai-core/template-marketplace";

type CatalogResponse = {
  templates: MarketplaceTemplate[];
  categories: Array<{ id: MarketplaceCategory; label: string; description: string }>;
  styles: MarketplaceStyleVariation[];
  count: number;
};

type PreviewResponse = {
  template: MarketplaceTemplate;
  previewHtml: string;
};

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function TemplateMarketplace() {
  const pt = useProductT("templateMarketplace");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MarketplaceCategory | "all">("all");
  const [style, setStyle] = useState<MarketplaceStyleVariation | "all">("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [recIndustry, setRecIndustry] = useState("");
  const [recGoal, setRecGoal] = useState("");
  const [recAudience, setRecAudience] = useState("");
  const [recPrompt, setRecPrompt] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] =
    useState<MarketplaceRecommendResult | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (style !== "all") params.set("style", style);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/website-builder/marketplace?${params}`);
      if (!res.ok) throw new Error(pt("errors.loadFailed"));
      const data = (await res.json()) as CatalogResponse;
      setCatalog(data);
    } catch {
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, [category, style, query]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadCatalog();
    }, 120);
    return () => clearTimeout(t);
  }, [loadCatalog]);

  const openPreview = async (id: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    setViewport("desktop");
    try {
      const res = await fetch(
        `/api/website-builder/marketplace?id=${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw new Error(pt("errors.previewFailed"));
      const data = (await res.json()) as PreviewResponse;
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const runRecommend = async () => {
    setRecommending(true);
    try {
      const res = await fetch("/api/website-builder/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: recIndustry || undefined,
          businessGoal: recGoal || undefined,
          audience: recAudience || undefined,
          prompt: recPrompt || undefined,
          limit: 6,
        }),
      });
      if (!res.ok) throw new Error(pt("errors.recommendFailed"));
      const data = (await res.json()) as MarketplaceRecommendResult;
      setRecommendations(data);
    } catch {
      setRecommendations(null);
    } finally {
      setRecommending(false);
    }
  };

  const buildTemplateUseHref = (tpl: MarketplaceTemplate) =>
    `/dashboard/website-builder?templateId=${encodeURIComponent(tpl.premiumTemplateId)}&marketplaceTemplateId=${encodeURIComponent(tpl.id)}&templateStyle=${encodeURIComponent(tpl.style)}&designPreset=${encodeURIComponent(tpl.designPreset)}`;

  const templates = catalog?.templates ?? [];
  const categories = catalog?.categories ?? [];
  const styles = catalog?.styles ?? [];

  const featured = useMemo(
    () => templates.filter((t) => t.popular).slice(0, 4),
    [templates],
  );

  return (
    <div className="space-y-8">
      <DashboardPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
              <Sparkles className="size-3" />
              {pt("badge")}
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {pt("title")}
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-white/45">
              {pt("description")}
            </p>
          </div>
          <Link href="/dashboard/website-builder">
            <Button variant="outline" className="border-white/15 text-white">
              {pt("openWebsiteBuilder")}
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pt("searchPlaceholder")}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as MarketplaceCategory | "all")
            }
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="all">{pt("allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={style}
            onChange={(e) =>
              setStyle(e.target.value as MarketplaceStyleVariation | "all")
            }
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="all">{pt("allStyles")}</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </DashboardPanel>

      <DashboardPanel className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white">
          {pt("aiRecommendations")}
        </h3>
        <p className="mt-1 text-[12px] text-white/40">
          {pt("aiRecommendationsDescription")}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            value={recIndustry}
            onChange={(e) => setRecIndustry(e.target.value)}
            placeholder={pt("industryPlaceholder")}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          <Input
            value={recGoal}
            onChange={(e) => setRecGoal(e.target.value)}
            placeholder={pt("goalPlaceholder")}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          <Input
            value={recAudience}
            onChange={(e) => setRecAudience(e.target.value)}
            placeholder={pt("audiencePlaceholder")}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          <Button
            onClick={() => void runRecommend()}
            disabled={recommending}
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
          >
            {recommending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {pt("recommend")}
          </Button>
        </div>
        <Textarea
          value={recPrompt}
          onChange={(e) => setRecPrompt(e.target.value)}
          placeholder={pt("briefPlaceholder")}
          className="mt-3 min-h-[72px] border-white/10 bg-white/5 text-white placeholder:text-white/30"
        />
        {recommendations ? (
          <div className="mt-4 space-y-3">
            <p className="text-[12px] text-premium-gold/90">
              {recommendations.summary}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.recommendations.map((r) => (
                <TemplateCard
                  key={r.template.id}
                  template={r.template}
                  badge={pt("badgeScore", { score: r.score, reason: r.reason })}
                  onPreview={() => void openPreview(r.template.id)}
                  buildTemplateUseHref={buildTemplateUseHref(r.template)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </DashboardPanel>

      {featured.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-white/80">{pt("popular")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onPreview={() => void openPreview(t.id)}
                buildTemplateUseHref={buildTemplateUseHref(t)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">
            {pt("library")} {catalog ? `(${catalog.count})` : ""}
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-16 text-white/40">
            <Loader2 className="size-4 animate-spin" />
            {pt("loading")}
          </div>
        ) : templates.length === 0 ? (
          <DashboardPanel className="p-8 text-center text-sm text-white/40">
            {pt("noResults")}
          </DashboardPanel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onPreview={() => void openPreview(t.id)}
                buildTemplateUseHref={buildTemplateUseHref(t)}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-white/10 bg-[#0c0c0c] text-white sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.template.name || pt("previewTitle")}
            </DialogTitle>
            <DialogDescription className="text-white/45">
              {preview?.template.description || pt("previewDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ] as const
            ).map(([key, Icon]) => (
              <Button
                key={key}
                size="sm"
                variant={viewport === key ? "default" : "outline"}
                className={cn(
                  viewport === key
                    ? "bg-premium-gold text-black"
                    : "border-white/15 text-white",
                )}
                onClick={() => setViewport(key)}
              >
                <Icon className="size-3.5" />
                {pt(`viewports.${key}`)}
              </Button>
            ))}
          </div>

          <div className="mt-3 flex justify-center overflow-auto rounded-xl border border-white/10 bg-[#080808] p-3">
            {previewLoading ? (
              <div className="flex h-[420px] items-center justify-center text-white/40">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : preview?.previewHtml ? (
              <iframe
                title={pt("previewIframe")}
                srcDoc={preview.previewHtml}
                className="h-[520px] rounded-lg border border-white/10 bg-white transition-all"
                style={{ width: VIEWPORT_WIDTH[viewport], maxWidth: "100%" }}
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center text-sm text-white/40">
                {pt("previewUnavailable")}
              </div>
            )}
          </div>

          {preview?.template ? (
            <div className="grid gap-3 text-[12px] text-white/55 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white/80">{pt("intelligence")}</p>
                <p>{pt("industry")}: {preview.template.industry}</p>
                <p>{pt("style")}: {preview.template.style}</p>
                <p>{pt("layout")}: {preview.template.layoutType}</p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("audience")}</p>
                <p>{preview.template.recommendedAudience}</p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("features")}</p>
                <p>{preview.template.features.join(" · ")}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <LayoutTemplate className="size-3.5" />
              {pt("pipelineHint")}
            </div>
            {preview?.template ? (
              <Link href={buildTemplateUseHref(preview.template)}>
                <Button className="bg-premium-gold text-black hover:bg-premium-gold/90">
                  {pt("useThisTemplate")}
                </Button>
              </Link>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateCard(props: {
  template: MarketplaceTemplate;
  onPreview: () => void;
  buildTemplateUseHref: string;
  badge?: string;
}) {
  const pt = useProductT("templateMarketplace");
  const { template: t, onPreview, buildTemplateUseHref, badge } = props;
  return (
    <DashboardPanel className="flex h-full flex-col overflow-hidden p-0">
      <div
        className="relative h-28"
        style={{
          background: `linear-gradient(135deg, ${t.colorSystem.primary}, ${t.colorSystem.secondary} 55%, ${t.colorSystem.accent})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {t.category}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90">
            {t.style}
          </span>
          {t.popular ? (
            <span className="rounded-full bg-premium-gold/90 px-2 py-0.5 text-[10px] font-semibold text-black">
              {pt("popular")}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[15px] font-bold text-white">{t.name}</h4>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/45">
          {t.tagline}
        </p>
        {badge ? (
          <p className="mt-2 text-[11px] text-premium-gold/85">{badge}</p>
        ) : null}
        <ul className="mt-3 space-y-1 text-[11px] text-white/40">
          <li>{pt("layoutLabel", { type: t.layoutType })}</li>
          <li>{pt("audienceLabel", { audience: t.recommendedAudience })}</li>
          <li className="line-clamp-1">{pt("featuresLabel", { features: t.features.slice(0, 3).join(", ") })}</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/15 text-white"
            onClick={onPreview}
          >
            {pt("preview")}
          </Button>
          <Link href={buildTemplateUseHref} className="flex-1">
            <Button
              size="sm"
              className="w-full bg-premium-gold text-black hover:bg-premium-gold/90"
            >
              {pt("use")}
            </Button>
          </Link>
        </div>
      </div>
    </DashboardPanel>
  );
}
