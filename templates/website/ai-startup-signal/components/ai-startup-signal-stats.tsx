"use client";

const DEFAULT_STATS = [
  { value: "12ms", label: "Inference latency", detail: "p99 edge" },
  { value: "99.99%", label: "Platform uptime", detail: "global SLA" },
  { value: "140+", label: "Model endpoints", detail: "production" },
  { value: "48", label: "Regions live", detail: "multi-cloud" },
];

type AiStartupSignalStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function AiStartupSignalStats({
  eyebrow = "Platform metrics",
  title = "Production-grade by default",
  subtitle = "Real-time signals from our global inference mesh — the same telemetry your team monitors.",
  stats = DEFAULT_STATS,
}: AiStartupSignalStatsProps) {
  return (
    <section id="stats" data-v2-component="ai-startup-signal-stats" aria-labelledby="as-stats-title" className="df-reveal as-section-glow py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-stats-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="as-glass-card group rounded-xl border border-[var(--border-signal)] p-6 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)]"
            >
              <p className="as-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">{s.label}</p>
              <p className="as-metric mt-3 text-[var(--color-signal)]">{s.value}</p>
              {s.detail ? <p className="mt-2 text-xs text-[var(--color-muted)]">{s.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
