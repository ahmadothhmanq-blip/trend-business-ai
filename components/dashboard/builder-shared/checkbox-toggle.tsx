"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckboxToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
        checked
          ? "border-premium-gold/30 bg-premium-gold/10 text-premium-gold-light"
          : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/[0.15] hover:text-white/70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded border",
          checked
            ? "border-premium-gold/40 bg-premium-gold/20"
            : "border-white/15 bg-white/5",
        )}
      >
        {checked && <Check className="size-2.5 text-premium-gold-light" />}
      </span>
      {label}
    </label>
  );
}
