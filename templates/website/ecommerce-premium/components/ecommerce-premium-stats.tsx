"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { ECOMMERCE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function EcommercePremiumStats({
  eyebrow = "By the numbers",
  title = "Trusted by collectors worldwide",
  subtitle = "A community built on craft, transparency, and objects that endure beyond seasons.",
  stats = [
    { value: "48+", label: "Artisan partners", detail: "Independent studios" },
    { value: "4.9", label: "Customer rating", detail: "12k+ reviews" },
    { value: "72h", label: "Avg. delivery", detail: "Express available" },
    { value: "98%", label: "Would recommend", detail: "Repeat collectors" },
  ],
}: Props) {
  return (
    <FlagshipStatsSection
      ui={ECOMMERCE_FLAGSHIP_UI}
      componentId="ecommerce-premium-stats"
      id="stats"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      stats={stats}
    />
  );
}
