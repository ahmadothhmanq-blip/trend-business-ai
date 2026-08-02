"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ICON_CATEGORIES,
  searchIcons,
  type IconCategory,
} from "@/lib/ai-core/visual-editor/icon-library";
import { resolveLucideIcon } from "@/components/dashboard/visual-editor/icon-render";

const FAVORITES_KEY = "wb-icon-favorites";
const RECENT_KEY = "wb-icon-recent";

function readStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value.slice(0, 24)));
}

type IconPickerProps = {
  value: string;
  disabled?: boolean;
  onChange: (iconId: string) => void;
};

export function IconPicker({ value, disabled, onChange }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readStorage(FAVORITES_KEY));
    setRecent(readStorage(RECENT_KEY));
  }, []);

  const results = useMemo(
    () => searchIcons(query, category, favorites, recent),
    [query, category, favorites, recent],
  );

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [id, ...favorites];
    setFavorites(next);
    writeStorage(FAVORITES_KEY, next);
  };

  const pick = (id: string) => {
    const nextRecent = [id, ...recent.filter((r) => r !== id)];
    setRecent(nextRecent);
    writeStorage(RECENT_KEY, nextRecent);
    onChange(id);
  };

  return (
    <div className="space-y-2">
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search icons…"
        className="h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
      />
      <div className="flex flex-wrap gap-1">
        {ICON_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            disabled={disabled}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px]",
              category === cat.id
                ? "border-premium-gold/50 bg-premium-gold/15 text-white"
                : "border-white/10 text-white/55",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-44 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-white/10 bg-black/20 p-1">
        {results.map((entry) => {
          const Icon = resolveLucideIcon(entry.id);
          const isFavorite = favorites.includes(entry.id);
          const isSelected = value === entry.id;
          return (
            <div key={entry.id} className="relative">
              <button
                type="button"
                disabled={disabled}
                title={entry.label}
                onClick={() => pick(entry.id)}
                className={cn(
                  "flex h-9 w-full items-center justify-center rounded-md border transition-colors",
                  isSelected
                    ? "border-premium-gold bg-premium-gold/20 text-white"
                    : "border-transparent text-white/70 hover:bg-white/10",
                )}
              >
                <Icon className="size-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleFavorite(entry.id)}
                className="absolute -right-0.5 -top-0.5 rounded-full bg-[#1a1a1a] p-0.5"
                aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
              >
                <Star
                  className={cn(
                    "size-2.5",
                    isFavorite ? "fill-premium-gold text-premium-gold" : "text-white/30",
                  )}
                />
              </button>
            </div>
          );
        })}
        {!results.length ? (
          <p className="col-span-6 py-4 text-center text-[10px] text-white/35">
            No icons found
          </p>
        ) : null}
      </div>
    </div>
  );
}
