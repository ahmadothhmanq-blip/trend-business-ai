"use client";

const DEFAULT_FEATURES = [
  {
    title: "Model routing",
    description: "Route inference across providers with latency-aware policies and automatic failover at the edge.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Observability mesh",
    description: "Trace every request, token, and deployment across your AI stack in one unified timeline.",
    icon: "02",
    span: "tall",
  },
  {
    title: "Secure deployment",
    description: "Enterprise-grade controls with audit-ready governance for regulated industries.",
    icon: "03",
    span: "compact",
  },
  {
    title: "Global scale",
    description: "Multi-region infrastructure designed for production workloads at signal-grade reliability.",
    icon: "04",
    span: "wide",
  },
];

const SPAN_CLASS: Record<string, string> = {
  hero: "as-bento-tile--hero",
  tall: "as-bento-tile--tall",
  compact: "as-bento-tile--compact",
  wide: "as-bento-tile--wide",
  standard: "as-bento-tile--standard",
};

type AiStartupSignalFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function AiStartupSignalFeatures({
  eyebrow = "Platform capabilities",
  title = "Built for modern AI teams",
  subtitle = "A control plane for routing, observability, and secure deployment — designed for clarity at global scale.",
  items = DEFAULT_FEATURES,
}: AiStartupSignalFeaturesProps) {
  return (
    <section id="features" data-v2-component="ai-startup-signal-features" aria-labelledby="as-features-title" className="df-reveal as-section as-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-features-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="as-bento-grid">
          {items.map((item, i) => (
            <article
              key={item.title}
              className={`as-bento-tile as-card p-7 ${SPAN_CLASS[item.span ?? "standard"] ?? (i === 0 ? "as-bento-tile--hero" : "as-bento-tile--standard")}`}
            >
              <span className="as-font-mono text-xs text-[var(--color-signal)]">{item.icon ?? String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
