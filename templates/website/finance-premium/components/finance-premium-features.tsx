"use client";

const DEFAULT_FEATURES = [
  {
    title: "Private wealth management",
    description: "Bespoke portfolio construction, tax-aware strategies, and multi-generational planning for ultra-high-net-worth families.",
    icon: "01",
    span: "lg:col-span-2",
  },
  {
    title: "Institutional advisory",
    description: "Board-level counsel on capital allocation, risk governance, and fiduciary oversight for endowments and enterprises.",
    icon: "02",
    span: "",
  },
  {
    title: "Trust & estate services",
    description: "Succession architecture, trust administration, and philanthropic structures aligned with your family's legacy.",
    icon: "03",
    span: "",
  },
  {
    title: "Global markets access",
    description: "Direct access to private markets, alternative investments, and cross-border structuring through our global network.",
    icon: "04",
    span: "lg:col-span-2",
  },
];

type FinancePremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function FinancePremiumFeatures({
  eyebrow = "Capabilities",
  title = "Integrated wealth stewardship",
  subtitle = "A unified private banking platform — investment management, fiduciary advisory, and capital strategy delivered by senior partners.",
  items = DEFAULT_FEATURES,
}: FinancePremiumFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="finance-premium-features"
      aria-labelledby="fn-features-title"
      className="fn-section fn-section-alt"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 max-w-2xl">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="fn-features-title" className="fn-headline-sm">
            {title}
          </h2>
          <div className="fn-accent-line mt-4" aria-hidden />
          <p className="fn-body text-muted-foreground mt-5">{subtitle}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`fn-card group relative overflow-hidden p-7 sm:p-8 ${item.span ?? ""}`}
            >
              <div
                className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-signal)_8%,transparent)] blur-2xl transition group-hover:bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]"
                aria-hidden
              />
              <div className="relative mb-5 flex items-center gap-4">
                <span className="fn-font-mono flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] text-xs font-semibold text-[var(--color-signal)]">
                  {item.icon ?? String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-gradient-to-r from-[var(--border-default)] to-transparent transition group-hover:from-[var(--color-signal)]"
                  aria-hidden
                />
              </div>
              <h3 className="fn-font-display relative text-lg font-semibold text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="fn-font-body relative mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
