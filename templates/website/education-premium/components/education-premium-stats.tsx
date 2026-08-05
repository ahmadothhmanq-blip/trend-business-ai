"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { EDUCATION_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function EducationPremiumStats({
  eyebrow = "By the numbers",
  title = "A university of measurable impact",
  subtitle = "Key metrics that reflect our commitment to academic excellence and student success.",
  stats = [
    { value: "12:1", label: "Student-faculty ratio", detail: "Small seminars" },
    { value: "94%", label: "Graduate placement", detail: "Within 6 months" },
    { value: "140+", label: "Degree programs", detail: "Undergraduate & graduate" },
    { value: "$48M", label: "Research funding", detail: "Annual awards" },
  ],
}: Props) {
  return (
    <FlagshipStatsSection
      ui={EDUCATION_FLAGSHIP_UI}
      componentId="education-premium-stats"
      id="stats"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      stats={stats}
    />
  );
}
