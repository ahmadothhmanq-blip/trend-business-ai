"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BUILDER_SPACING_MAP,
  BUILDER_THEME_PRESETS,
  spacingPresetFromSectionY,
  type BuilderSpacingPreset,
} from "@/lib/website/builder";
import type { VisualDesignTokens } from "@/lib/ai-core/visual-editor/types";
import { BUILDER_BREAKPOINTS } from "@/lib/website/builder/responsive";
import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";
import { cn } from "@/lib/utils";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type DesignSystemPanelProps = {
  tokens: VisualDesignTokens;
  viewport: VisualViewport;
  disabled?: boolean;
  onTokensChange: (patch: Partial<VisualDesignTokens>) => void;
  onViewportChange: (viewport: VisualViewport) => void;
  onApplyTheme: (presetId: string) => void;
};

function normalizeHex(value: string): string {
  const m = value.match(/#([0-9a-fA-F]{3,8})\b/);
  if (!m) return "#d4af37";
  let hex = m[1]!;
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  return `#${hex.slice(0, 6)}`;
}

function themeI18nKey(presetId: string): string {
  return presetId.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function DesignSystemPanel({
  tokens,
  viewport,
  disabled,
  onTokensChange,
  onViewportChange,
  onApplyTheme,
}: DesignSystemPanelProps) {
  const { wb } = useBuilderLocale();
  const spacing = spacingPresetFromSectionY(tokens.sectionY);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.design.themePresets")}
        </p>
        <div className="space-y-2">
          {BUILDER_THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onApplyTheme(preset.id)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-start transition hover:border-premium-gold/30"
            >
              <p className="text-xs font-medium text-white">
                {wb(`builder.themes.${themeI18nKey(preset.id)}.label`)}
              </p>
              <p className="text-[10px] text-white/45">
                {wb(`builder.themes.${themeI18nKey(preset.id)}.description`)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.design.responsive")}
        </p>
        <div className="flex flex-wrap gap-1">
          {BUILDER_BREAKPOINTS.map((bp) => (
            <Button
              key={bp.id}
              type="button"
              size="sm"
              variant={viewport === bp.id ? "default" : "outline"}
              disabled={disabled}
              onClick={() => onViewportChange(bp.id)}
              className={cn(
                "h-8 text-[10px]",
                viewport === bp.id
                  ? "bg-premium-gold text-black"
                  : "border-white/15 text-white",
              )}
            >
              {bp.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.design.colors")}
        </p>
        <div className="space-y-2">
          {(
            [
              "primary",
              "secondary",
              "accent",
              "background",
              "foreground",
            ] as const
          ).map((key) => (
            <label
              key={key}
              className="flex items-center justify-between gap-2 text-[11px] text-white/50"
            >
              {wb(`builder.design.${key}`)}
              <input
                type="color"
                value={normalizeHex(tokens[key])}
                disabled={disabled}
                onChange={(e) => onTokensChange({ [key]: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.design.typography")}
        </p>
        <label className="mb-2 block text-[11px] text-white/50">
          {wb("builder.design.headingFont")}
          <Input
            value={tokens.headingFont}
            disabled={disabled}
            onChange={(e) => onTokensChange({ headingFont: e.target.value })}
            className="mt-1 border-white/10 bg-white/5 text-white"
          />
        </label>
        <label className="block text-[11px] text-white/50">
          {wb("builder.design.bodyFont")}
          <Input
            value={tokens.bodyFont}
            disabled={disabled}
            onChange={(e) => onTokensChange({ bodyFont: e.target.value })}
            className="mt-1 border-white/10 bg-white/5 text-white"
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.design.spacing")}
        </p>
        <select
          value={spacing}
          disabled={disabled}
          onChange={(e) =>
            onTokensChange({
              sectionY:
                BUILDER_SPACING_MAP[e.target.value as BuilderSpacingPreset],
            })
          }
          className="h-10 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-sm text-white"
          aria-label={wb("builder.design.spacing")}
        >
          <option value="compact">{wb("builder.design.compact")}</option>
          <option value="balanced">{wb("builder.design.balanced")}</option>
          <option value="airy">{wb("builder.design.airy")}</option>
        </select>
      </div>
    </div>
  );
}
