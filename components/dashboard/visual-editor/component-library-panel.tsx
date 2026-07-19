"use client";

import { useMemo, useState } from "react";
import { GripVertical, LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COMPONENT_INDUSTRY_PACKS,
  COMPONENT_MARKETPLACE_CATEGORIES,
  COMPONENT_STYLE_VARIANTS,
  listMarketplaceComponents,
  type ComponentIndustryPack,
  type ComponentMarketplaceCategory,
  type ComponentStyleVariant,
  type MarketplaceComponent,
} from "@/lib/ai-core/component-marketplace";

const DRAG_MIME = "application/x-tba-component";

export function encodeComponentDrag(component: MarketplaceComponent): string {
  return JSON.stringify({
    id: component.id,
    exportName: component.exportName,
    path: component.path,
    category: component.category,
    sectionKind: component.sectionKind,
    name: component.name,
  });
}

export function decodeComponentDrag(raw: string): {
  id: string;
  exportName: string;
  path: string;
  category: string;
  sectionKind: string;
  name: string;
} | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data.exportName !== "string" || typeof data.path !== "string") {
      return null;
    }
    return {
      id: String(data.id || data.exportName),
      exportName: data.exportName,
      path: data.path,
      category: String(data.category || "other"),
      sectionKind: String(data.sectionKind || "section"),
      name: String(data.name || data.exportName),
    };
  } catch {
    return null;
  }
}

export { DRAG_MIME };

type ComponentLibraryPanelProps = {
  onInsert: (component: MarketplaceComponent) => void;
  compact?: boolean;
};

export function ComponentLibraryPanel({
  onInsert,
  compact,
}: ComponentLibraryPanelProps) {
  const [category, setCategory] = useState<ComponentMarketplaceCategory | "all">(
    "all",
  );
  const [industry, setIndustry] = useState<ComponentIndustryPack | "all">("all");
  const [style, setStyle] = useState<ComponentStyleVariant | "all">("all");
  const [query, setQuery] = useState("");

  const items = useMemo(
    () =>
      listMarketplaceComponents({
        category,
        industry,
        style,
        query,
      }),
    [category, industry, style, query],
  );

  return (
    <div className={cn("flex h-full flex-col", compact && "text-[12px]")}>
      <div className="mb-2 flex items-center gap-2">
        <LayoutGrid className="size-3.5 text-premium-gold" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          Component library
        </p>
      </div>
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
          className="h-8 border-white/10 bg-white/5 pl-7 text-[12px] text-white placeholder:text-white/30"
        />
      </div>
      <div className="mb-2 grid gap-1.5">
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as ComponentMarketplaceCategory | "all")
          }
          className="h-8 rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
        >
          <option value="all">All categories</option>
          {COMPONENT_MARKETPLACE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={industry}
          onChange={(e) =>
            setIndustry(e.target.value as ComponentIndustryPack | "all")
          }
          className="h-8 rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
        >
          <option value="all">All industries</option>
          {COMPONENT_INDUSTRY_PACKS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={style}
          onChange={(e) =>
            setStyle(e.target.value as ComponentStyleVariant | "all")
          }
          className="h-8 rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
        >
          <option value="all">All styles</option>
          {COMPONENT_STYLE_VARIANTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-2 text-[10px] text-white/30">
        {items.length} components · drag onto canvas or click to insert
      </p>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-auto pr-1">
        {items.map((component) => (
          <li key={component.id}>
            <button
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  DRAG_MIME,
                  encodeComponentDrag(component),
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => onInsert(component)}
              className="flex w-full items-stretch gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 text-left transition hover:border-premium-gold/30 hover:bg-premium-gold/5"
            >
              <div
                className="h-12 w-12 shrink-0 rounded-md"
                style={{ background: component.previewGradient }}
                aria-hidden
              />
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-1">
                  <GripVertical className="size-3 shrink-0 text-white/25" />
                  <p className="truncate text-[11px] font-semibold text-white">
                    {component.name}
                  </p>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">
                  {component.styleVariant} · {component.category}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
