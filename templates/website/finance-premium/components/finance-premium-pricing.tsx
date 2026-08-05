"use client";

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const DEFAULT_TIERS: PricingTier[] = [
  {
    name: "Private advisory",
    price: "From $25k",
    period: "/quarter",
    description: "Dedicated partner access for families beginning a formal wealth stewardship relationship.",
    features: [
      "Quarterly portfolio reviews",
      "Tax-aware strategy sessions",
      "Trust & estate coordination",
      "Dedicated relationship manager",
    ],
    cta: "Request proposal",
  },
  {
    name: "Wealth management",
    price: "From $75k",
    period: "/quarter",
    description: "Full-service private banking with bespoke portfolio construction and fiduciary oversight.",
    features: [
      "Everything in Private advisory",
      "Custom investment policy",
      "Alternative investments access",
      "Multi-generational planning",
      "Global custody & reporting",
    ],
    cta: "Schedule consultation",
    highlighted: true,
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "",
    description: "Endowment, foundation, and corporate treasury advisory with retained senior partners.",
    features: [
      "Everything in Wealth management",
      "Board governance support",
      "Risk & compliance frameworks",
      "Global markets desk access",
      "Multi-year partnership terms",
    ],
    cta: "Contact partners",
  },
];

type FinancePremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function FinancePremiumPricing({
  eyebrow = "Engagement models",
  title = "Partnership structures for lasting stewardship",
  subtitle = "Transparent fee frameworks. Multi-year relationships receive preferred terms and dedicated partner coverage.",
  tiers = DEFAULT_TIERS,
}: FinancePremiumPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="finance-premium-pricing"
      aria-labelledby="fn-pricing-title"
      className="fn-section fn-section-glow relative bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 text-center">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="fn-pricing-title" className="fn-headline-sm">
            {title}
          </h2>
          <div className="fn-accent-line mx-auto mt-4" aria-hidden />
          <p className="fn-body text-muted-foreground mx-auto mt-5 max-w-lg">{subtitle}</p>
        </header>

        <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={[
                "fn-card flex flex-col p-7 sm:p-8",
                tier.highlighted ? "fn-card-featured relative lg:-translate-y-2" : "",
              ].join(" ")}
            >
              {tier.highlighted ? (
                <span className="fn-eyebrow absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-[var(--color-ink)] px-4 py-1 text-[0.625rem] text-[var(--color-signal)] shadow-[var(--shadow-card)]">
                  Most comprehensive
                </span>
              ) : null}
              <h3 className="fn-font-display text-lg font-semibold text-[var(--color-foreground)]">{tier.name}</h3>
              <p className="fn-font-body mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              <p className="mt-8 border-b border-[var(--border-subtle)] pb-6">
                <span className="fn-metric text-4xl">{tier.price}</span>
                {tier.period ? (
                  <span className="fn-font-body text-sm text-[var(--color-muted)]">{tier.period}</span>
                ) : null}
              </p>
              <ul className="mt-6 flex-1 space-y-3.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 fn-font-body text-sm text-[var(--color-foreground)]">
                    <span
                      className="fn-signal mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_12%,transparent)] text-xs font-bold"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`${tier.highlighted ? "fn-btn-primary" : "fn-btn-secondary"} fn-focus-ring mt-8 w-full`}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
