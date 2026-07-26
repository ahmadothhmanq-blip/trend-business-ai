"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderSectionView } from "@/lib/website/builder/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type BuilderSectionsPanelProps = {
  sections: BuilderSectionView[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onReorderSection?: (fromIndex: number, toIndex: number) => void;
};

export function BuilderSectionsPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSection,
}: BuilderSectionsPanelProps) {
  const { wb } = useBuilderLocale();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <aside className="flex h-full flex-col border-e border-white/[0.08] bg-black/25 p-3">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.sections.title")}
      </p>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {sections.map((section, index) => {
          const selected = section.id === selectedSectionId;
          return (
            <li
              key={section.id}
              draggable={Boolean(onReorderSection) && !section.locked}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) return;
                onReorderSection?.(dragIndex, index);
                setDragIndex(null);
              }}
            >
              <button
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-start text-xs transition",
                  selected
                    ? "border-premium-gold/35 bg-premium-gold/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.03]",
                  section.locked && "opacity-80",
                )}
              >
                <GripVertical className="size-3 shrink-0 text-white/25" aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {section.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
