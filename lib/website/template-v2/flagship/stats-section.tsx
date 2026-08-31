"use client";

import { FlagshipSectionHeader } from "@/lib/website/template-v2/flagship/section-header";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipStat = { value: string; label: string; detail?: string };

export type FlagshipStatsProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: FlagshipStat[];
};

export function FlagshipStatsSection({
  ui,
  componentId,
  id,
  eyebrow,
  title,
  subtitle,
  stats,
}: FlagshipStatsProps) {
  if (!stats?.length) return null;
  const sectionId = id ?? "stats";

  return (
    <section
      id={sectionId}
      data-v2-component={componentId}
      aria-labelledby={`${sectionId}-title`}
      className={`${ui.section} df-section-glow relative overflow-hidden bg-[var(--color-background)]`}
    >
      <div className="df-glow-orb -start-24 top-0 h-64 w-64 bg-[var(--color-accent)]" aria-hidden />
      <div className="df-glow-orb end-0 bottom-0 h-48 w-48 bg-[var(--color-primary)]" aria-hidden />
      <div className={`${ui.container} relative`}>
        <FlagshipSectionHeader ui={ui} id={sectionId} eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`${ui.card} p-6 text-center sm:p-7`}>
              <dt className={`${ui.fontBody} text-sm font-medium text-[var(--color-muted)]`}>{stat.label}</dt>
              <dd className={`${ui.metric} mt-3 block`}>{stat.value}</dd>
              {stat.detail ? (
                <dd className={`${ui.fontBody} mt-2 text-xs text-[var(--color-muted)]`}>{stat.detail}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
