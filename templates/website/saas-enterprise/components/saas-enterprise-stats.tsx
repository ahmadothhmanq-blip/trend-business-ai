"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { SAAS_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function SaasEnterpriseStats({
  eyebrow = "Platform impact",
  title = "Numbers that move the needle",
  subtitle = "Measured across our enterprise customer base in the last twelve months.",
  stats = [
    { value: "500+", label: "Enterprise customers", detail: "Across 28 countries" },
    { value: "4.9/5", label: "G2 satisfaction", detail: "Verified reviews" },
    { value: "2.1×", label: "Forecast accuracy", detail: "vs. prior stack" },
    { value: "18mo", label: "Avg. retention", detail: "Enterprise cohort" },
  ],
}: Props) {
  return (
    <FlagshipStatsSection
      ui={SAAS_FLAGSHIP_UI}
      componentId="saas-enterprise-stats"
      id="stats"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      stats={stats}
    />
  );
}
