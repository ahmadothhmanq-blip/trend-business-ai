"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  TemplateIntelligenceCategory,
  TemplateIntelligenceDefinition,
} from "@/lib/ai-core/template-intelligence";

export type TemplateIntelligenceChoice = {
  templateIntelligenceId: string;
  category: TemplateIntelligenceCategory;
  designPreset: string;
  designStyle: string;
  premiumTemplateId?: string;
  components: string[];
  colors: TemplateIntelligenceDefinition["colors"];
  typography: TemplateIntelligenceDefinition["typography"];
  name: string;
};

type CatalogResponse = {
  templates: TemplateIntelligenceDefinition[];
  categories: TemplateIntelligenceCategory[];
};

export function TemplateIntelligencePanel(props: {
  selectedId?: string | null;
  disabled?: boolean;
  /** When set, shows "Apply to project" for post-generation switch. */
  activeGenerationId?: string | null;
  /** Context for AI auto-select before generation. */
  selectionContext?: {
    businessType?: string;
    industry?: string;
    brandStyle?: string;
    designStyle?: string;
    prompt?: string;
  };
  onSelect: (choice: TemplateIntelligenceChoice) => void;
  onApplied?: (payload: {
    generation: unknown;
    project: unknown;
    template: TemplateIntelligenceDefinition;
  }) => void;
}) {
  const [templates, setTemplates] = useState<TemplateIntelligenceDefinition[]>(
    [],
  );
  const [categories, setCategories] = useState<TemplateIntelligenceCategory[]>(
    [],
  );
  const [category, setCategory] = useState<TemplateIntelligenceCategory | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<TemplateIntelligenceDefinition | null>(
    null,
  );
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [autoHint, setAutoHint] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/website-builder/template-intelligence");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = (await res.json()) as CatalogResponse;
      setTemplates(data.templates || []);
      setCategories(data.categories || []);
    } catch {
      setTemplates([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetails = async (tpl: TemplateIntelligenceDefinition) => {
    setDetails(tpl);
    setPreviewHtml(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `/api/website-builder/template-intelligence?id=${encodeURIComponent(tpl.id)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { previewHtml?: string };
        setPreviewHtml(data.previewHtml || null);
      }
    } catch {
      setPreviewHtml(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const toChoice = (
    tpl: TemplateIntelligenceDefinition,
  ): TemplateIntelligenceChoice => ({
    templateIntelligenceId: tpl.id,
    category: tpl.category,
    designPreset: tpl.designPreset,
    designStyle: tpl.designStyle,
    premiumTemplateId: tpl.premiumTemplateId,
    components: tpl.components.map(String),
    colors: tpl.colors,
    typography: tpl.typography,
    name: tpl.name,
  });

  const selectForGenerate = (tpl: TemplateIntelligenceDefinition) => {
    props.onSelect(toChoice(tpl));
    setDetails(null);
    setAutoHint(`Selected ${tpl.name} — ready to generate`);
  };

  const applyToProject = async (tpl: TemplateIntelligenceDefinition) => {
    if (!props.activeGenerationId) {
      selectForGenerate(tpl);
      return;
    }
    setApplying(true);
    try {
      const res = await fetch(
        `/api/website-builder/${props.activeGenerationId}/template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateIntelligenceId: tpl.id }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        generation?: unknown;
        project?: unknown;
        template?: TemplateIntelligenceDefinition;
      };
      if (!res.ok) throw new Error(data.error || "Failed to apply template");
      props.onSelect(toChoice(tpl));
      if (data.generation && data.project && data.template) {
        props.onApplied?.({
          generation: data.generation,
          project: data.project,
          template: data.template,
        });
      }
      setDetails(null);
      setAutoHint(`Applied ${tpl.name} — content & images preserved`);
    } catch (error) {
      setAutoHint(
        error instanceof Error ? error.message : "Could not apply template",
      );
    } finally {
      setApplying(false);
    }
  };

  const runAutoSelect = async () => {
    setApplying(true);
    try {
      const ctx = props.selectionContext || {};
      const res = await fetch("/api/website-builder/template-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: ctx.businessType,
          industry: ctx.industry,
          brandStyle: ctx.brandStyle,
          designStyle: ctx.designStyle,
          prompt: ctx.prompt,
          category: category === "all" ? undefined : category,
        }),
      });
      if (!res.ok) throw new Error("Auto-select failed");
      const data = (await res.json()) as {
        template: TemplateIntelligenceDefinition;
        reason?: string;
      };
      if (data.template) {
        props.onSelect(toChoice(data.template));
        setAutoHint(data.reason || `Auto-selected ${data.template.name}`);
      }
    } catch {
      setAutoHint("Auto-select unavailable");
    } finally {
      setApplying(false);
    }
  };

  const visible =
    category === "all"
      ? templates
      : templates.filter((t) => t.category === category);

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
              Template Intelligence
            </p>
            <p className="text-[11px] text-white/35">
              AI picks the best look — or choose one anytime
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={props.disabled || applying}
            className="border-white/15 text-white"
            onClick={() => void runAutoSelect()}
          >
            <Wand2 className="size-3.5" />
            Auto-select
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] transition",
              category === "all"
                ? "bg-premium-gold/20 text-premium-gold"
                : "bg-white/[0.04] text-white/45 hover:text-white/70",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] transition",
                category === cat
                  ? "bg-premium-gold/20 text-premium-gold"
                  : "bg-white/[0.04] text-white/45 hover:text-white/70",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {autoHint ? (
          <p className="text-[12px] text-premium-gold/80">{autoHint}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-[12px] text-white/40">
            <Loader2 className="size-3.5 animate-spin" />
            Loading visual templates…
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {visible.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={props.disabled}
                onClick={() => void openDetails(tpl)}
                className={cn(
                  "overflow-hidden rounded-2xl border text-left transition-all",
                  props.selectedId === tpl.id
                    ? "border-premium-gold/40 bg-premium-gold/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-premium-gold/25",
                )}
              >
                <div
                  className="h-12"
                  style={{
                    background: `linear-gradient(135deg, ${tpl.colors.primary}, ${tpl.colors.secondary} 55%, ${tpl.colors.accent})`,
                  }}
                />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {tpl.name}
                    </p>
                    {props.selectedId === tpl.id ? (
                      <Check className="size-3.5 shrink-0 text-premium-gold" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {tpl.category} · {tpl.designPreset}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(details)}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0c0c0c] text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{details?.name || "Template"}</DialogTitle>
            <DialogDescription className="text-white/45">
              {details?.description}
            </DialogDescription>
          </DialogHeader>

          {details ? (
            <div className="space-y-4">
              <div
                className="h-24 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${details.colors.primary}, ${details.colors.secondary} 55%, ${details.colors.accent})`,
                }}
              />
              <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wide text-white/60">
                <span className="rounded-full bg-white/10 px-2 py-0.5">
                  {details.category}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5">
                  {details.layoutStructure}
                </span>
                <span className="rounded-full bg-premium-gold/20 px-2 py-0.5 text-premium-gold">
                  {details.animations.label}
                </span>
              </div>
              <p className="text-[13px] text-white/55">{details.tagline}</p>
              <p className="font-mono text-[11px] text-white/40">
                {details.typography.display} / {details.typography.body}
              </p>
              <p className="text-[12px] text-white/45">
                Components:{" "}
                {details.components.slice(0, 8).join(" · ")}
                {details.components.length > 8 ? "…" : ""}
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080808]">
                <div className="border-b border-white/10 px-3 py-2 text-[11px] text-white/40">
                  Visual preview
                </div>
                <div className="p-3">
                  {previewLoading ? (
                    <div className="flex h-[240px] items-center justify-center text-white/40">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  ) : previewHtml ? (
                    <iframe
                      title="Template preview"
                      srcDoc={previewHtml}
                      className="h-[280px] w-full rounded-lg border border-white/10 bg-white"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-end">
            {details ? (
              <>
                <Button
                  variant="outline"
                  className="border-white/15 text-white"
                  disabled={props.disabled || applying}
                  onClick={() => selectForGenerate(details)}
                >
                  <Sparkles className="size-4" />
                  Use for generation
                </Button>
                {props.activeGenerationId ? (
                  <Button
                    className="bg-premium-gold text-black hover:bg-premium-gold/90"
                    disabled={props.disabled || applying}
                    onClick={() => void applyToProject(details)}
                  >
                    {applying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Apply to project
                  </Button>
                ) : null}
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
