"use client";

const DEFAULT_FEATURES = [
  {
    "title": "Portfolio strategy",
    "description": "Multi-asset allocation with scenario modeling and disciplined rebalancing.",
    "icon": "01",
    "span": "hero"
  },
  {
    "title": "Risk governance",
    "description": "Institutional-grade controls with fiduciary oversight on every mandate.",
    "icon": "02",
    "span": "tall"
  },
  {
    "title": "Global coverage",
    "description": "Advisory desks across major financial centers with cross-border expertise.",
    "icon": "03",
    "span": "compact"
  },
  {
    "title": "Wealth architecture",
    "description": "Generational planning, trust structures, and philanthropic advisory.",
    "icon": "04",
    "span": "wide"
  }
];

type FinancePremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function FinancePremiumFeatures({
  eyebrow = "Advisory capabilities",
  title = "Institutional strength across markets",
  subtitle = "Portfolio strategy, risk governance, and wealth architecture for families and institutions.",
  items = DEFAULT_FEATURES,
}: FinancePremiumFeaturesProps) {
  return (
    <section id="features" data-v2-component="finance-premium-features" aria-labelledby="fn-features-title" className="df-reveal fn-section bg-[var(--color-background)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 border-b border-[var(--border-default)] pb-8">
          <p className="fn-eyebrow">{eyebrow}</p>
          <h2 className="fn-headline-sm mt-2">{title}</h2>
        </header>
        <ol className="space-y-0">
          {items.map((item, i) => (
            <li key={item.title} className="df-reveal-stagger grid gap-6 border-b border-[var(--border-subtle)] py-10 lg:grid-cols-12 lg:items-start">
              <span className="fn-font-mono text-4xl font-light text-[var(--color-accent)] lg:col-span-2">{String(i + 1).padStart(2, "0")}</span>
              <div className="lg:col-span-10">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-[var(--color-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
