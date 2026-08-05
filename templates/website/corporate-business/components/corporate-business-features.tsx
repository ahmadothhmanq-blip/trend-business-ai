"use client";

const DEFAULT_FEATURES = [
  {
    title: "Strategic advisory",
    description: "Board-level counsel on market entry, portfolio optimization, and long-range capital allocation.",
    index: "01",
    span: "lg:col-span-7 lg:row-span-2",
    featured: true,
  },
  {
    title: "Operational excellence",
    description: "Lean operating models, supply-chain resilience, and performance management at scale.",
    index: "02",
    span: "lg:col-span-5",
  },
  {
    title: "Governance & risk",
    description: "Enterprise risk frameworks, compliance programs, and stakeholder reporting you can defend.",
    index: "03",
    span: "lg:col-span-5",
  },
  {
    title: "Transformation delivery",
    description: "End-to-end program leadership from discovery through change management and measurable outcomes.",
    index: "04",
    span: "lg:col-span-12",
  },
];

type CorporateBusinessFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; index?: string; span?: string; featured?: boolean }>;
};

export function CorporateBusinessFeatures({
  eyebrow = "Capabilities",
  title = "Advisory built for enterprise complexity",
  subtitle = "Integrated practices across strategy, operations, and governance — delivered by senior partners with sector depth.",
  items = DEFAULT_FEATURES,
}: CorporateBusinessFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="corporate-business-features"
      aria-labelledby="cb-features-title"
      className="cb-section cb-section-alt"
    >
      <div className="cb-container">
        <div className="mb-20 grid gap-10 lg:grid-cols-2 lg:items-end">
          <header>
            <p className="cb-eyebrow mb-6">{eyebrow}</p>
            <h2 id="cb-features-title" className="cb-headline-sm max-w-[14ch]">
              {title}
            </h2>
            <div className="cb-accent-line mt-8" aria-hidden />
          </header>
          <p className="cb-prose lg:justify-self-end lg:text-end">{subtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={[
                "group relative flex flex-col justify-between overflow-hidden p-9 sm:p-10",
                item.featured ? "cb-card-featured min-h-[22rem] lg:min-h-[24rem]" : "cb-card",
                item.span ?? "",
              ].join(" ")}
            >
              <div>
                <span className="cb-font-mono text-[0.625rem] tracking-[0.18em] text-[var(--color-signal)]">
                  {item.index ?? String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  className={[
                    "cb-font-display mt-8 text-[clamp(1.375rem,2vw,1.75rem)] font-medium leading-tight",
                    item.featured ? "text-white" : "text-[var(--color-foreground)]",
                  ].join(" ")}
                >
                  {item.title}
                </h3>
                <p
                  className={[
                    "cb-font-body mt-5 max-w-md text-[0.9375rem] leading-[1.75]",
                    item.featured ? "text-white/68" : "text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {item.description}
                </p>
              </div>
              <a
                href="#contact"
                className={[
                  "cb-btn-ghost mt-10",
                  item.featured ? "text-[var(--color-signal)]" : "",
                ].join(" ")}
              >
                Learn more <span aria-hidden>→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
