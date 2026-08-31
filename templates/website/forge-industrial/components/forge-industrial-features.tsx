"use client";

const DEFAULT_FEATURES = [
  {
    title: "Supply chain control",
    description: "End-to-end visibility across suppliers, warehouses, and last-mile delivery.",
    icon: "M-01",
    span: "hero",
    note: "Critical path",
  },
  {
    title: "Asset intelligence",
    description: "Predictive maintenance and fleet optimization powered by live telemetry.",
    icon: "M-02",
    span: "tall",
    note: "Sensor mesh",
  },
  {
    title: "Field service network",
    description: "Dispatch, routing, and technician management across distributed teams.",
    icon: "M-03",
    span: "compact",
    note: "Ops layer",
  },
  {
    title: "Compliance automation",
    description: "Regulatory documentation and audit trails built into every workflow.",
    icon: "M-04",
    span: "wide",
    note: "Governance",
  },
];

type ForgeIndustrialFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string; note?: string }>;
  figureLabel?: string;
};

export function ForgeIndustrialFeatures({
  eyebrow = "Annotated modules",
  title = "Technical specification — modules",
  subtitle = "Each capability is a referenced assembly with installation notes and interface constraints.",
  items = DEFAULT_FEATURES,
  figureLabel = "FIG. 02 — MODULE MAP",
}: ForgeIndustrialFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="forge-industrial-features"
      aria-labelledby="fg-features-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-features-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>

          <div className="fg-reveal-stagger mt-8" role="list">
            {items.map((item, index) => (
              <article key={item.title} className="fg-module" role="listitem">
                <p className="fg-module-ref">{item.icon ?? `M-${String(index + 1).padStart(2, "0")}`}</p>
                <div>
                  <h3 className="fg-font-display text-xl font-semibold uppercase tracking-wide text-[var(--color-foreground)]">
                    {item.title}
                  </h3>
                  <p className="fg-body mt-2 text-base">{item.description}</p>
                </div>
                <p className="fg-module-note">{item.note ?? "Interface note"}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
