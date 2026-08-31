"use client";

import { dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import type { SiteImageStrategyMode } from "@/lib/website/site-plan/image-strategy";
import { cn } from "@/lib/utils";

const OPTIONS: { value: SiteImageStrategyMode; label: string }[] = [
  { value: "with-images", label: "With AI images" },
  { value: "without-images", label: "No images (typography-first)" },
  { value: "user-adds-later", label: "I'll add images later" },
];

type SiteImageStrategySelectProps = {
  value: SiteImageStrategyMode;
  onChange: (value: SiteImageStrategyMode) => void;
  className?: string;
};

export function SiteImageStrategySelect({
  value,
  onChange,
  className,
}: SiteImageStrategySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SiteImageStrategyMode)}
      className={cn(dashboardSelectClass, className)}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-luxury-black">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
