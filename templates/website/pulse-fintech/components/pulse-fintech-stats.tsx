"use client";

const DEFAULT_STATS = [
  { value: "$48B", label: "Assets advised", detail: "Global AUM" },
  { value: "97%", label: "Client retention", detail: "10-year average" },
  { value: "28", label: "Financial centers", detail: "Active desks" },
  { value: "150+", label: "Advisory specialists", detail: "CFA, CPA credentialed" },
];

type PulseFintechStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function PulseFintechStats({
  eyebrow = "Desk metrics",
  title = "Operational telemetry",
  subtitle = "Live figures from production rails.",
  stats = DEFAULT_STATS,
}: PulseFintechStatsProps) {
  return (
    <section id="stats" data-v2-component="pulse-fintech-stats" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="pu-eyebrow">{eyebrow}</p>
            <h2 className="pu-headline-sm mt-1">{title}</h2>
          </div>
          <p className="pu-body max-w-sm text-sm">{subtitle}</p>
        </div>
        <div className="pu-stat-row pu-reveal-stagger">
          {stats.map((s) => (
            <div key={s.label} className="pu-stat-cell">
              <p className="pu-metric">{s.value}</p>
              <p className="mt-2 text-xs text-[var(--color-foreground)]">{s.label}</p>
              {s.detail ? <p className="mt-1 text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-muted)]">{s.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
