"use client";

const DEFAULT_STATS = [
  { value: "99.7%", label: "System uptime", detail: "mission-critical" },
  { value: "2.4M", label: "Assets tracked", detail: "global fleet" },
  { value: "180+", label: "Enterprise clients", detail: "manufacturing" },
  { value: "42", label: "Countries deployed", detail: "active markets" },
];

type ForgeIndustrialStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
  figureLabel?: string;
};

export function ForgeIndustrialStats({
  eyebrow = "Calibration data",
  title = "Measured operating envelope",
  subtitle = "Field-verified figures from production deployments.",
  stats = DEFAULT_STATS,
  figureLabel = "FIG. 04 — PERFORMANCE DATA",
}: ForgeIndustrialStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="forge-industrial-stats"
      aria-labelledby="fg-stats-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-stats-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>

          <dl className="fg-reveal-stagger mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="border border-[var(--border-default)] bg-[var(--color-surface)] p-4">
                <dt className="fg-font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                  D-{String(index + 1).padStart(2, "0")} · {stat.label}
                </dt>
                <dd className="fg-metric mt-3">{stat.value}</dd>
                {stat.detail ? (
                  <p className="fg-font-mono mt-2 text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                    {stat.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
