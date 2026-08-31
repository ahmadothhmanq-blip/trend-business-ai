"use client";

import { dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { hasPublishedVisualSkins, listVisualSkins } from "@/lib/website/visual-skin/registry";
import { cn } from "@/lib/utils";

type VisualSkinSelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function VisualSkinSelect({ value, onChange, className }: VisualSkinSelectProps) {
  const skins = listVisualSkins();
  if (!hasPublishedVisualSkins()) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(dashboardSelectClass, className)}
    >
      {skins.map((skin) => (
        <option key={skin.id} value={skin.id} className="bg-luxury-black">
          {skin.label} — {skin.description}
        </option>
      ))}
    </select>
  );
}
