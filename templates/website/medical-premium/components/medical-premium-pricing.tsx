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
    name: "Growth",
    price: "$499",
    period: "/mo",
    description: "For teams building their foundation.",
    features: ["Core platform", "Standard support", "Team dashboards"],
    cta: "Start trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$899",
    period: "/mo",
    description: "Full platform for scaling organizations.",
    features: ["Everything in Growth", "Advanced analytics", "Dedicated CSM", "SSO"],
    cta: "Book a demo",
    highlighted: true,
  },
  {
    name: "Global",
    price: "Custom",
    period: "",
    description: "Multi-region with enterprise SLAs.",
    features: ["Everything in Enterprise", "Custom integrations", "24/7 support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

type MedicalPremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function MedicalPremiumPricing({
  eyebrow = "Pricing",
  title = "Plans that scale with you",
  subtitle = "Transparent pricing. No surprises.",
  tiers = DEFAULT_TIERS,
}: MedicalPremiumPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="medical-premium-pricing"
      aria-labelledby="mp-pricing-title"
      className="mp-reveal mp-section mp-section-glow bg-[var(--color-background)] py-20 sm:py-28"
    >
      <div className="mp-container">
        <header className="mp-section-header mp-section-header--rule mx-auto mb-12 text-center">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 id="mp-pricing-title" className="mp-headline-sm mt-4">
            {title}
          </h2>
          {subtitle ? <p className="mp-body mx-auto mt-4 max-w-lg">{subtitle}</p> : null}
        </header>
        <div className="mp-reveal-stagger grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`mp-card relative flex flex-col p-7 ${tier.highlighted ? "ring-2 ring-[var(--color-accent)] lg:-translate-y-2" : ""}`}
            >
              {tier.highlighted ? (
                <span className="mp-label absolute -top-3 start-6 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[var(--color-background)]">
                  Recommended
                </span>
              ) : null}
              <h3 className="mp-title-lg">{tier.name}</h3>
              <p className="mp-body-sm mt-2">{tier.description}</p>
              <p className="mt-6">
                <span className="mp-metric">{tier.price}</span>
                {tier.period ? <span className="mp-caption">{tier.period}</span> : null}
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden className="text-[var(--color-healing)]">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.highlighted ? "mp-btn-primary" : "mp-btn-secondary"} mp-focus-ring mt-8 w-full`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
