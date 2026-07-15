"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type TypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export function TypeSelectorCard({
  def,
  selected,
  onSelect,
}: {
  def: TypeDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = def.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-premium-gold/40 bg-premium-gold/10 ring-1 ring-premium-gold/20"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          selected
            ? "bg-premium-gold/20 text-premium-gold-light"
            : "bg-white/5 text-white/40 group-hover:text-white/60",
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className={cn("text-sm font-semibold", selected ? "text-premium-gold-light" : "text-white/80")}>
          {def.label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/40">{def.description}</p>
      </div>
      {selected && (
        <div className="mt-auto self-end">
          <Check className="size-4 text-premium-gold-light" />
        </div>
      )}
    </button>
  );
}
