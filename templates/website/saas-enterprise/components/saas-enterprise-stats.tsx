"use client";

const DEFAULT_STATS = [
  { value: "99.99%", label: "Uptime SLO", detail: "last 12 months" },
  { value: "2.1s", label: "Time-to-insight", detail: "median board view" },
  { value: "140+", label: "Enterprise orgs", detail: "global" },
  { value: "38%", label: "Forecast lift", detail: "vs prior stack" },
];

type SaasEnterpriseStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function SaasEnterpriseStats({
  eyebrow = "Telemetry",
  title = "Operational metrics",
  subtitle = "Dense readouts — product docs style, not a marketing strip.",
  stats = DEFAULT_STATS,
}: SaasEnterpriseStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="saas-enterprise-stats"
      aria-labelledby="se-stats-title"
      className="se-telemetry se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-stats-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <div className="se-telemetry-grid se-reveal-stagger">
          {stats.map((s) => (
            <div key={s.label} className="se-telemetry-cell">
              <p className="se-metric">{s.value}</p>
              <p className="se-telemetry-label">{s.label}</p>
              {s.detail ? <p className="se-telemetry-detail">{s.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
