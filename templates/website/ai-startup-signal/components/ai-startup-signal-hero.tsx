"use client";

const DEFAULT_METRICS = [
  { value: "12ms", label: "Inference latency", trend: "p99 edge" },
  { value: "99.99%", label: "Platform uptime", trend: "global SLA" },
  { value: "140+", label: "Model endpoints", trend: "production" },
  { value: "48", label: "Regions live", trend: "multi-cloud" },
];

const DEFAULT_TRUST = [
  "AI platforms",
  "Fintech",
  "Healthcare AI",
  "Cybersecurity",
  "Developer tools",
  "Enterprise data",
];

const THROUGHPUT_BARS = [38, 52, 44, 68, 58, 82, 64, 92, 70, 86, 74, 96];

type AiStartupSignalHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
  trustSectors?: string[];
};

export function AiStartupSignalHero({
  title = "Ship intelligence that scales with your product",
  subtitle = "A global AI operations layer — model routing, observability, and secure deployment in one signal-grade control plane.",
  eyebrow = "AI infrastructure platform",
  primaryCta = "Request access",
  secondaryCta = "View architecture",
  imageUrl = null,
  metrics = DEFAULT_METRICS,
  trustSectors = DEFAULT_TRUST,
}: AiStartupSignalHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="ai-startup-signal-hero"
      aria-labelledby="as-hero-title"
      className="as-section relative min-h-[min(88vh,52rem)] overflow-hidden bg-[var(--color-background)] pb-12 pt-14 sm:pt-16"
    >
      <div className="as-grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-signal)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)]" aria-hidden />
              <span className="as-eyebrow !text-[0.6875rem]">{eyebrow}</span>
            </div>
            <h1 id="as-hero-title" className="as-headline mt-6 max-w-[13ch]">
              {title}
            </h1>
            <p className="as-body mt-6 max-w-lg">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="as-btn-primary as-focus-ring">{primaryCta}</a>
              <a href="#platform" className="as-btn-secondary as-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {trustSectors.map((sector) => (
                <span key={sector} className="as-trust-badge">
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="as-browser-frame overflow-hidden rounded-[var(--radius-xl,32px)] border border-[var(--border-signal)]">
              <div className="as-hero-shell-header">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-muted)_55%,transparent)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)]" />
                </div>
                <span className="as-font-mono text-[0.6875rem] text-[var(--color-muted)]">signal.control / production</span>
              </div>
              <div className="as-hero-dashboard min-h-[22rem]">
                <div className="as-hero-dashboard-panel as-hero-dashboard-panel--wide as-glass-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="as-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                      Inference throughput
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-signal)]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-signal)]" aria-hidden />
                      Live
                    </span>
                  </div>
                  <div className="mt-5 flex h-24 items-end gap-1.5" aria-hidden>
                    {THROUGHPUT_BARS.map((height, index) => (
                      <div
                        key={index}
                        className="as-hero-dashboard-bar flex-1 origin-bottom"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="as-hero-dashboard-sparkline mt-4" aria-hidden />
                </div>

                <div className="as-hero-dashboard-panel as-hero-dashboard-panel--narrow as-glass-card flex flex-col items-center justify-center gap-3 text-center">
                  <div className="as-hero-dashboard-ring" aria-hidden />
                  <p className="as-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Global status</p>
                  <p className="text-sm font-semibold text-[var(--color-signal)]">Operational</p>
                  <p className="text-xs text-[var(--color-muted)]">All regions nominal</p>
                </div>

                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="as-hero-dashboard-panel as-hero-dashboard-panel--metric as-glass-card col-span-6 sm:col-span-3"
                  >
                    <p className="as-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">{metric.label}</p>
                    <p className="as-metric mt-2 text-[var(--color-signal)]">{metric.value}</p>
                    {metric.trend ? <p className="as-font-body mt-1 text-xs text-[var(--color-muted)]">{metric.trend}</p> : null}
                  </div>
                ))}
              </div>
            </div>
            {imageUrl ? <img src={imageUrl} alt="" className="sr-only" aria-hidden /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
