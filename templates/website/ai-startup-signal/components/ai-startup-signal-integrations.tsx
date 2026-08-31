"use client";

const DEFAULT_LOGOS = [
  { abbr: "AWS", name: "Amazon Web Services", category: "Cloud" },
  { abbr: "GCP", name: "Google Cloud", category: "Cloud" },
  { abbr: "AZ", name: "Azure", category: "Cloud" },
  { abbr: "K8s", name: "Kubernetes", category: "Orchestration" },
  { abbr: "OTel", name: "OpenTelemetry", category: "Observability" },
  { abbr: "HF", name: "Hugging Face", category: "Models" },
];

const PIPELINE = ["Ingest", "Route", "Observe", "Deploy"];

type AiStartupSignalIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function AiStartupSignalIntegrations({
  eyebrow = "Architecture",
  title = "One control plane for your AI stack",
  subtitle = "Route inference, capture telemetry, and enforce policy — without rebuilding your infrastructure.",
  logos = DEFAULT_LOGOS,
}: AiStartupSignalIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="ai-startup-signal-integrations" aria-labelledby="as-integrations-title" className="df-reveal as-section as-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-integrations-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>

        <div className="as-glass-card mb-12 rounded-2xl border border-[var(--border-signal)] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--color-background)] px-4 py-3 text-center">
                  <p className="as-font-mono text-[0.625rem] text-[var(--color-signal)]">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-sm font-semibold">{step}</p>
                </div>
                {i < PIPELINE.length - 1 ? <span className="hidden text-[var(--color-muted)] sm:inline" aria-hidden>→</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="df-reveal-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo) => (
            <div key={logo.abbr} className="as-glass-card flex items-center gap-4 rounded-xl p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-signal)] as-font-mono text-xs font-bold text-[var(--color-signal)]">
                {logo.abbr}
              </span>
              <div>
                <p className="text-sm font-semibold">{logo.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{logo.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
