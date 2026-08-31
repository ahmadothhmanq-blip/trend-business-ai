"use client";

import { VisualSkinPreview } from "@/components/dashboard/website-builder/visual-skin-preview";
import { DEFAULT_VISUAL_SKIN_ID } from "@/lib/website/visual-skin/catalog";
import { getVisualSkin, hasPublishedVisualSkins, listVisualSkins } from "@/lib/website/visual-skin/registry";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type VisualSkinCatalogPanelProps = {
  selectedId?: string | null;
  disabled?: boolean;
  compact?: boolean;
  showHeader?: boolean;
  onSelect?: (skinId: string) => void;
};

export function VisualSkinCatalogPanel({
  selectedId,
  disabled,
  compact = false,
  showHeader = false,
  onSelect,
}: VisualSkinCatalogPanelProps) {
  const skins = listVisualSkins();

  if (!hasPublishedVisualSkins()) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center">
        <p className="text-sm font-medium text-white/75">لا قوالب شكل متاحة حالياً</p>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          التوليد يعتمد على موقعك فقط (SitePlan) — القوالب الجديدة قيد الإعداد.
        </p>
      </div>
    );
  }

  const selected = selectedId ?? skins[0]?.id;
  const selectedSkin = selected ? getVisualSkin(selected) : null;

  if (compact) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1">
        {skins.map((skin) => {
          const active = skin.id === selected;
          return (
            <button
              key={skin.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(skin.id)}
              className={cn(
                "min-w-[168px] shrink-0 overflow-hidden rounded-2xl border text-left transition-all",
                active
                  ? "border-premium-gold/40 bg-premium-gold/10 ring-1 ring-premium-gold/25"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-premium-gold/25",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <VisualSkinPreview
                skinId={skin.id}
                className="rounded-none border-0"
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader ? (
        <p className="text-sm text-white/50">
          {skins.length} قالب عالمي جاهز — المظهر فقط؛ المحتوى والهيكل من موجزك وSitePlan.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {skins.map((skin) => {
          const active = skin.id === selected;
          const showRecommended = skin.id === DEFAULT_VISUAL_SKIN_ID;
          return (
            <div
              key={skin.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={active}
              aria-disabled={disabled || undefined}
              onClick={() => !disabled && onSelect?.(skin.id)}
              onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect?.(skin.id);
                }
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-premium-gold/40",
                active
                  ? "border-premium-gold/45 ring-1 ring-premium-gold/25"
                  : "border-white/[0.08] hover:border-premium-gold/25",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              {showRecommended ? (
                <span className="absolute top-3 start-3 z-10 rounded-md border border-amber-500/35 bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-100 backdrop-blur-sm">
                  موصى به
                </span>
              ) : null}
              {active ? (
                <span className="absolute top-3 end-3 z-10 inline-flex size-7 items-center justify-center rounded-full bg-premium-gold text-luxury-black shadow-lg">
                  <Check className="size-4" aria-hidden />
                </span>
              ) : null}
              <VisualSkinPreview
                skinId={skin.id}
                className="rounded-none border-0"
              />
            </div>
          );
        })}
      </div>
      {selectedSkin ? (
        <p className="text-xs text-white/45">
          المحدد: {selectedSkin.label}
        </p>
      ) : null}
    </div>
  );
}
