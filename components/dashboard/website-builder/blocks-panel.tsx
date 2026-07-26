"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listBuilderBlocks,
  type BuilderBlockCategory,
  type BuilderBlockView,
} from "@/lib/website/builder";
import { cn } from "@/lib/utils";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

const CATEGORIES: BuilderBlockCategory[] = [
  "all",
  "hero",
  "section",
  "cta",
  "proof",
  "media",
  "layout",
];

type BlocksPanelProps = {
  disabled?: boolean;
  onInsert: (block: BuilderBlockView) => void;
};

export function BlocksPanel({ disabled, onInsert }: BlocksPanelProps) {
  const { wb } = useBuilderLocale();
  const [category, setCategory] = useState<BuilderBlockCategory>("all");
  const [query, setQuery] = useState("");

  const blocks = useMemo(
    () => listBuilderBlocks({ category, query }),
    [category, query],
  );

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={wb("builder.blocks.searchPlaceholder")}
        disabled={disabled}
        className="border-white/10 bg-white/5 text-white"
        aria-label={wb("builder.blocks.searchPlaceholder")}
      />
      <div className="flex flex-wrap gap-1" role="tablist">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-medium",
              category === item
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "text-white/45 hover:text-white/70",
            )}
          >
            {wb(`builder.blocks.categories.${item}`)}
          </button>
        ))}
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {blocks.map((block) => (
          <li
            key={block.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2"
          >
            <p className="text-xs font-medium text-white">{block.name}</p>
            {block.description ? (
              <p className="mt-0.5 text-[10px] text-white/45">{block.description}</p>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => onInsert(block)}
              className="mt-2 h-7 w-full bg-premium-gold/15 text-[10px] text-premium-gold-light hover:bg-premium-gold/25"
            >
              <Plus className="size-3" aria-hidden />
              {wb("builder.blocks.insert")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
