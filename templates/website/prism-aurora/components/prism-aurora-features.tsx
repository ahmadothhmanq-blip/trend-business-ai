"use client";

const DEFAULT_FEATURES = [
  {
    title: "Model routing",
    description: "Route workloads across providers with latency-aware policies and automatic failover.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Observability mesh",
    description: "Trace every request and deployment across your stack in one unified timeline.",
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

type PrismAuroraFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function PrismAuroraFeatures({
  eyebrow = "Platform capabilities",
  title = "Built for modern product teams",
  subtitle = "A control plane designed for clarity, scale, and measurable impact at global velocity.",
  items = DEFAULT_FEATURES,
}: PrismAuroraFeaturesProps) {
  return (
    <section id="features" data-v2-component="prism-aurora-features" aria-labelledby="pr-features-title" className="pr-reveal pr-section overflow-hidden bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <p className="pr-eyebrow">{eyebrow}</p>
        <h2 id="pr-features-title" className="pr-headline-sm mt-2 max-w-[16ch]">
          {title}
        </h2>
        <p className="pr-body mt-3 max-w-lg">{subtitle}</p>
        <div className="pr-mosaic pr-reveal-stagger mt-8">
          {items.map((item, i) => (
            <article
              key={item.title}
              className={`pr-tile ${
                item.span === "hero" || i === 0
                  ? "pr-span-7 pr-row-2 pr-tile-field-a"
                  : item.span === "tall" || i === 1
                    ? "pr-span-5 pr-row-2 pr-tile-field-b"
                    : item.span === "wide" || i === 3
                      ? "pr-span-8 pr-tile-field-c"
                      : "pr-span-4 pr-tile-field-a"
              }`}
            >
              <p className="pr-font-display text-xs font-semibold text-[var(--color-accent)]">{item.icon ?? String(i + 1).padStart(2, "0")}</p>
              <h3 className="pr-font-display mt-3 text-xl font-bold sm:text-2xl">{item.title}</h3>
              <p className="pr-body mt-2 text-sm">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
