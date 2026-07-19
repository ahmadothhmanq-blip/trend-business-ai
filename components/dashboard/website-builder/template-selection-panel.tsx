"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutTemplate,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { MarketplaceTemplate } from "@/lib/ai-core/template-marketplace";

export type TemplateUsePayload = {
  templateId: string;
  marketplaceTemplateId: string;
  industry: string;
  style: string;
  designPreset: string;
  components: string[];
  designSystem: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    displayFont: string;
    bodyFont: string;
  };
  name: string;
  description: string;
  tagline: string;
  features: string[];
  layoutType: string;
};

type CatalogResponse = {
  templates: MarketplaceTemplate[];
  count: number;
};

export function buildTemplateUsePayload(
  tpl: MarketplaceTemplate,
): TemplateUsePayload {
  return {
    templateId: tpl.premiumTemplateId,
    marketplaceTemplateId: tpl.id,
    industry: tpl.industry,
    style: tpl.style,
    designPreset: tpl.designPreset,
    components: tpl.previewSections.map((s) => s.key),
    designSystem: {
      primary: tpl.colorSystem.primary,
      secondary: tpl.colorSystem.secondary,
      accent: tpl.colorSystem.accent,
      background: tpl.colorSystem.background,
      foreground: tpl.colorSystem.foreground,
      displayFont: tpl.typography.display,
      bodyFont: tpl.typography.body,
    },
    name: tpl.name,
    description: tpl.description,
    tagline: tpl.tagline,
    features: tpl.features,
    layoutType: tpl.layoutType,
  };
}

export function TemplateDetailsDialog(props: {
  template: MarketplaceTemplate | null;
  disabled?: boolean;
  onClose: () => void;
  onUseTemplate: (payload: TemplateUsePayload) => void;
}) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [using, setUsing] = useState(false);
  const details = props.template;

  useEffect(() => {
    if (!details) {
      setPreviewHtml(null);
      return;
    }
    let cancelled = false;
    setPreviewHtml(null);
    setPreviewLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/website-builder/marketplace?id=${encodeURIComponent(details.id)}`,
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { previewHtml?: string };
        if (!cancelled) setPreviewHtml(data.previewHtml || null);
      } catch {
        if (!cancelled) setPreviewHtml(null);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [details]);

  const useTemplate = () => {
    if (!details) return;
    setUsing(true);
    props.onUseTemplate(buildTemplateUsePayload(details));
    props.onClose();
    window.setTimeout(() => setUsing(false), 800);
  };

  return (
    <Dialog
      open={Boolean(details)}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0c0c0c] text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{details?.name || "Template details"}</DialogTitle>
          <DialogDescription className="text-white/45">
            {details?.description ||
              "Review this template, then generate a new website project."}
          </DialogDescription>
        </DialogHeader>

        {details ? (
          <div className="space-y-4">
            <div
              className="h-28 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${details.colorSystem.primary}, ${details.colorSystem.secondary} 55%, ${details.colorSystem.accent})`,
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/70">
                {details.category}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                {details.style}
              </span>
              <span className="rounded-full bg-premium-gold/20 px-2 py-0.5 text-[10px] text-premium-gold">
                {details.designPreset}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                {details.industry}
              </span>
            </div>
            <p className="text-[13px] text-white/55">{details.tagline}</p>

            <div className="grid gap-3 text-[12px] text-white/50 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-white/80">Design system</p>
                <p>
                  {details.typography.display} / {details.typography.body}
                </p>
                <p className="mt-1 font-mono text-[11px]">
                  {details.colorSystem.primary} · {details.colorSystem.secondary}{" "}
                  · {details.colorSystem.accent}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/80">Components</p>
                <p>
                  {details.previewSections.map((s) => s.label).join(" · ")}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold text-white/80">Features</p>
                <p>{details.features.join(" · ")}</p>
              </div>
            </div>

            <DashboardPanel className="overflow-hidden p-0">
              <div className="border-b border-white/10 px-3 py-2 text-[11px] text-white/40">
                Live structural preview
              </div>
              <div className="bg-[#080808] p-3">
                {previewLoading ? (
                  <div className="flex h-[280px] items-center justify-center text-white/40">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                ) : previewHtml ? (
                  <iframe
                    title="Template preview"
                    srcDoc={previewHtml}
                    className="h-[320px] w-full rounded-lg border border-white/10 bg-white"
                  />
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-sm text-white/35">
                    Preview unavailable
                  </div>
                )}
              </div>
            </DashboardPanel>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <LayoutTemplate className="size-3.5" />
            Seeds industry, style, components, and design system
          </div>
          {details ? (
            <Button
              className="bg-premium-gold text-black hover:bg-premium-gold/90"
              disabled={props.disabled || using}
              onClick={useTemplate}
            >
              {using ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Use Template
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateSelectionPanel(props: {
  selectedMarketplaceId?: string | null;
  disabled?: boolean;
  onUseTemplate: (payload: TemplateUsePayload) => void;
  onCatalogLoaded?: (templates: MarketplaceTemplate[]) => void;
}) {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<MarketplaceTemplate | null>(null);

  const onCatalogLoaded = props.onCatalogLoaded;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/website-builder/marketplace");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = (await res.json()) as CatalogResponse;
      const list = data.templates || [];
      setTemplates(list);
      onCatalogLoaded?.(list);
    } catch {
      setTemplates([]);
      onCatalogLoaded?.([]);
    } finally {
      setLoading(false);
    }
  }, [onCatalogLoaded]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            Templates
          </p>
          <span className="text-[11px] text-white/30">
            Click a card for details
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-[12px] text-white/40">
            <Loader2 className="size-3.5 animate-spin" />
            Loading templates…
          </div>
        ) : templates.length === 0 ? (
          <p className="text-[12px] text-white/40">No templates available.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.slice(0, 12).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={props.disabled}
                onClick={() => setDetails(tpl)}
                className={cn(
                  "overflow-hidden rounded-2xl border text-left transition-all",
                  props.selectedMarketplaceId === tpl.id
                    ? "border-premium-gold/40 bg-premium-gold/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-premium-gold/25",
                )}
              >
                <div
                  className="h-14"
                  style={{
                    background: `linear-gradient(135deg, ${tpl.colorSystem.primary}, ${tpl.colorSystem.secondary} 55%, ${tpl.colorSystem.accent})`,
                  }}
                />
                <div className="p-3">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {tpl.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {tpl.category} · {tpl.style}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <TemplateDetailsDialog
        template={details}
        disabled={props.disabled}
        onClose={() => setDetails(null)}
        onUseTemplate={props.onUseTemplate}
      />
    </>
  );
}

/** Compact template cards for the bottom workspace rail. */
export function TemplateSelectionRail(props: {
  templates: MarketplaceTemplate[];
  selectedMarketplaceId?: string | null;
  disabled?: boolean;
  onOpenDetails: (tpl: MarketplaceTemplate) => void;
}) {
  if (!props.templates.length) {
    return (
      <p className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white/40">
        Templates load from the marketplace catalog.
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {props.templates.slice(0, 8).map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          disabled={props.disabled}
          onClick={() => props.onOpenDetails(tpl)}
          className={cn(
            "w-full overflow-hidden rounded-2xl border text-left transition-all",
            props.selectedMarketplaceId === tpl.id
              ? "border-premium-gold/40 bg-premium-gold/10"
              : "border-white/[0.08] bg-white/[0.025] hover:border-premium-gold/25",
          )}
        >
          <div
            className="h-10"
            style={{
              background: `linear-gradient(135deg, ${tpl.colorSystem.primary}, ${tpl.colorSystem.accent})`,
            }}
          />
          <div className="p-3">
            <p className="text-sm font-medium text-white/85">{tpl.name}</p>
            <p className="mt-0.5 text-[11px] text-white/40">
              {tpl.category} · {tpl.style}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
