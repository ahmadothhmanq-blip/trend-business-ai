import { DEFAULT_STATS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const STATS_GENERATORS = {
  "four-column-grid": fourColumnGrid,
  "horizontal-strip": horizontalStrip,
  "dashboard-metrics": dashboardMetrics,
  "corporate-counters": corporateCounters,
  "fullscreen-numbers": fullscreenNumbers,
  "clinical-stats": clinicalStats,
  "resort-highlights": resortHighlights,
  "culinary-awards": culinaryAwards,
  "alumni-stats": alumniStats,
  "commerce-kpis": commerceKpis,
  "saas-pipeline": saasPipeline,
  "portfolio-metrics": portfolioMetrics,
  "property-stats": propertyStats,
  "nature-metrics": natureMetrics,
  "gradient-stats": gradientStats,
  "minimal-counters": minimalCounters,
  "terminal-stats": terminalStats,
  "industrial-output": industrialOutput,
  "firm-metrics": firmMetrics,
  "wellness-stats": wellnessStats,
};

export function generateStats(entry, layoutKey) {
  const fn = STATS_GENERATORS[layoutKey] ?? fourColumnGrid;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function statsHeader({ p, pkg, Pascal }) {
  return `"use client";

const DEFAULT_STATS = ${JSON.stringify(DEFAULT_STATS, null, 2)};

type ${Pascal}StatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function ${Pascal}Stats({
  eyebrow = "Impact",
  title = "Numbers that matter",
  subtitle = "Measured across our global client base.",
  stats = DEFAULT_STATS,
}: ${Pascal}StatsProps) {`;
}

function fourColumnGrid({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" aria-labelledby="${p}-stats-title" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-stats-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mx-auto mt-4 max-w-xl text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="${p}-card p-6 text-center">
              <dd className="${p}-metric">{s.value}</dd>
              <dt className="mt-2 font-medium">{s.label}</dt>
              {s.detail ? <p className="mt-1 text-xs text-[var(--color-muted)]">{s.detail}</p> : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
`;
}

function horizontalStrip({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="border-y border-[var(--border-default)] py-12">
      <dl className="mx-auto flex max-w-[88rem] flex-wrap justify-between gap-8 px-5 sm:px-8">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="${p}-font-display text-4xl font-bold">{s.value}</dd>
            <dt className="mt-1 text-sm text-[var(--color-muted)]">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
`;
}

function dashboardMetrics({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="${p}-section-glow py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="${p}-glass-card rounded-xl border border-[var(--border-accent)] p-5">
              <p className="${p}-font-mono text-xs text-[var(--color-muted)]">{s.label}</p>
              <p className="${p}-metric mt-2 text-[var(--color-accent)]">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function corporateCounters({ p, pkg, Pascal }) {
  return fourColumnGrid({ p, pkg, Pascal });
}

function fullscreenNumbers({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="flex min-h-[50vh] items-center bg-[var(--color-primary)]">
      <dl className="mx-auto grid w-full max-w-[88rem] gap-12 px-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <dd className="${p}-display text-5xl">{s.value}</dd>
            <dt className="mt-3 text-sm uppercase tracking-widest opacity-70">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
`;
}

function clinicalStats({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="py-16 text-center">
      <h2 className="${p}-headline-sm">{title}</h2>
      <dl className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[var(--color-surface)] p-8">
            <dd className="${p}-metric text-3xl">{s.value}</dd>
            <dt className="mt-2 text-sm">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
`;
}

function resortHighlights({ p, pkg, Pascal }) {
  return horizontalStrip({ p, pkg, Pascal });
}

function culinaryAwards({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="py-12">
      <div className="mx-auto flex max-w-[82rem] flex-wrap justify-center gap-12 px-5 sm:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl">★</p>
            <p className="${p}-metric mt-2">{s.value}</p>
            <p className="text-sm text-[var(--color-muted)]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function alumniStats({ p, pkg, Pascal }) {
  return fourColumnGrid({ p, pkg, Pascal });
}

function commerceKpis({ p, pkg, Pascal }) {
  return horizontalStrip({ p, pkg, Pascal });
}

function saasPipeline({ p, pkg, Pascal }) {
  return dashboardMetrics({ p, pkg, Pascal });
}

function portfolioMetrics({ p, pkg, Pascal }) {
  return horizontalStrip({ p, pkg, Pascal });
}

function propertyStats({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ul className="mt-10 divide-y divide-[var(--border-default)]">
          {stats.map((s) => (
            <li key={s.label} className="flex items-center justify-between py-5">
              <span className="font-medium">{s.label}</span>
              <span className="${p}-metric">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function natureMetrics({ p, pkg, Pascal }) {
  return clinicalStats({ p, pkg, Pascal });
}

function gradientStats({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="py-16">
      <div className="mx-auto grid max-w-[82rem] gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-2xl p-6 text-white" style={{ background: \`linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-primary) \${60 + i * 10}%, transparent))\` }}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="mt-2 text-sm opacity-90">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function minimalCounters({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="py-12 font-mono">
      <dl className="mx-auto max-w-xl space-y-4 px-5 sm:px-8">
        {stats.map((s) => (
          <div key={s.label} className="flex justify-between border-b border-[var(--border-subtle)] pb-3">
            <dt className="text-[var(--color-muted)]">{s.label}</dt>
            <dd className="font-bold text-[var(--color-accent)]">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
`;
}

function terminalStats({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="bg-[#0a0f0a] py-10 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p>$ metrics --live</p>
        <pre className="mt-4">
{stats.map((s) => \`\${s.label.padEnd(28)} \${s.value}\`).join("\\n")}
        </pre>
      </div>
    </section>
  );
}
`;
}

function industrialOutput({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="border-t-4 border-[var(--color-accent)] py-12" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <dl className="mx-auto grid max-w-[82rem] gap-4 px-5 sm:grid-cols-4 sm:px-8">
        {stats.map((s) => (
          <div key={s.label} className="border border-[var(--border-default)] p-4">
            <dt className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{s.label}</dt>
            <dd className="${p}-metric mt-2">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
`;
}

function firmMetrics({ p, pkg, Pascal }) {
  return fourColumnGrid({ p, pkg, Pascal });
}

function wellnessStats({ p, pkg, Pascal }) {
  return `${statsHeader({ p, pkg, Pascal })}
  return (
    <section id="stats" data-v2-component="${pkg}-stats" className="py-16">
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-6 px-5 sm:px-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-full bg-[var(--color-surface)] px-8 py-6 text-center shadow-sm">
            <p className="${p}-metric text-2xl">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}
