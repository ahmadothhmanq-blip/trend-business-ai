"use client";

import { useState } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import {
  WEBSITE_THEME_CATALOG,
  type WebsiteThemeCatalogEntry,
  type WebsiteThemePresetId,
} from "@/lib/website/builder/theme-catalog";

export type WebsiteThemeChoice = WebsiteThemeCatalogEntry & {
  name: string;
  templateIntelligenceId: string;
  designPreset: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    surface: string;
  };
  typography: {
    display: string;
    heading: string;
    body: string;
  };
};

function toChoice(entry: WebsiteThemeCatalogEntry): WebsiteThemeChoice {
  const ti = getTemplateIntelligence(entry.templateIntelligenceId);
  return {
    ...entry,
    name: entry.label,
    templateIntelligenceId: entry.templateIntelligenceId,
    designPreset: entry.designPreset,
    colors: ti?.colors ?? {
      primary: "#111",
      secondary: "#333",
      accent: "#2563eb",
      background: "#fff",
      foreground: "#111",
      surface: "#f5f5f5",
    },
    typography: {
      display: ti?.typography.display ?? "Inter",
      heading: ti?.typography.heading ?? "Inter",
      body: ti?.typography.body ?? "Inter",
    },
  };
}

export function ThemeSelectionPanel(props: {
  selectedId?: WebsiteThemePresetId | string | null;
  disabled?: boolean;
  activeGenerationId?: string | null;
  onSelect: (choice: WebsiteThemeChoice) => void;
  onApplied?: (payload: {
    generation: unknown;
    project: unknown;
    theme: WebsiteThemeChoice;
  }) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const applyTheme = async (entry: WebsiteThemeCatalogEntry) => {
    const choice = toChoice(entry);
    if (!props.activeGenerationId) {
      props.onSelect(choice);
      setHint(wb("panels.selectedReady", { name: entry.label }));
      return;
    }

    setApplyingId(entry.id);
    try {
      const res = await fetch(
        `/api/website-builder/${props.activeGenerationId}/theme`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateIntelligenceId: entry.templateIntelligenceId,
            themeId: entry.id,
          }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        generation?: unknown;
        project?: unknown;
      };
      if (!res.ok) throw new Error(data.error || wb("panels.failedApplyTheme"));
      props.onSelect(choice);
      props.onApplied?.({
        generation: data.generation,
        project: data.project,
        theme: choice,
      });
      setHint(wb("panels.appliedThemeRedesigned", { name: entry.label }));
    } catch (error) {
      setHint(
        error instanceof Error ? error.message : wb("panels.failedApplyTheme"),
      );
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
          {wb("panels.themesTitle")}
        </p>
        <p className="text-[11px] text-white/35">
          {wb("panels.themesSubtitle")}
        </p>
      </div>

      {hint ? (
        <p className="text-[12px] text-premium-gold/80">{hint}</p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {WEBSITE_THEME_CATALOG.map((entry) => {
          const choice = toChoice(entry);
          const selected =
            props.selectedId === entry.id ||
            props.selectedId === entry.templateIntelligenceId;
          const busy = applyingId === entry.id;

          return (
            <button
              key={entry.id}
              type="button"
              disabled={props.disabled || Boolean(busy)}
              onClick={() => void applyTheme(entry)}
              className={cn(
                "overflow-hidden rounded-2xl border text-left transition-all",
                selected
                  ? "border-premium-gold/40 bg-premium-gold/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-premium-gold/25",
                busy && "opacity-70",
              )}
            >
              <div
                className="flex h-12 items-end justify-between px-3 pb-2"
                style={{
                  background: `linear-gradient(135deg, ${choice.colors.primary}, ${choice.colors.secondary} 50%, ${choice.colors.accent})`,
                }}
              >
                <Palette className="size-3.5 text-white/80" />
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin text-white" />
                ) : selected ? (
                  <Check className="size-3.5 text-white" />
                ) : null}
              </div>
              <div className="space-y-2 p-3">
                <p className="text-[13px] font-semibold text-white">
                  {entry.label}
                </p>
                <p className="text-[11px] text-white/45">{entry.description}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-full bg-premium-gold/15 px-2 py-0.5 text-[9px] uppercase text-premium-gold/80">
                    {entry.pageTopology}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase text-white/55">
                    {entry.layoutType}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/55">
                    {entry.heroType}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/55">
                    {entry.navigationType}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-white/35">
                  {entry.sectionPreview.join(" · ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
