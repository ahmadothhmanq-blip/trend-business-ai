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
    name: "Essential",
    price: "From $499",
    period: "",
    description: "A focused starting point for new engagements.",
    features: ["Core deliverables", "Email support", "Clear timeline"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "From $899",
    period: "",
    description: "Expanded scope for growing organizations.",
    features: ["Everything in Essential", "Priority support", "Dedicated lead", "Review cycles"],
    cta: "Talk to us",
    highlighted: true,
  },
  {
    name: "Custom",
    price: "Tailored",
    period: "",
    description: "Bespoke scope, teams, and timelines.",
    features: ["Flexible scope", "Multi-phase delivery", "Ongoing partnership"],
    cta: "Contact us",
    highlighted: false,
  },
];

type HotelResortPremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function HotelResortPremiumPricing({
  eyebrow = "Pricing",
  title = "Options for every stage",
  subtitle = "Clear packages — or a custom scope built around your goals.",
  tiers = DEFAULT_TIERS,
}: HotelResortPremiumPricingProps) {
  if (!tiers.length) return null;

  return (
    <section
      id="pricing"
      data-v2-component="hotel-resort-premium-pricing"
      aria-labelledby="hr-pricing-title"
      className="hr-reveal hr-section hr-section-alt"
    >
      <div className="hr-container">
        <header className="hr-section-header hr-section-header--rule hr-section-header--center mx-auto mb-12 text-center">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-pricing-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule mx-auto" />
          {subtitle ? <p className="hr-body mx-auto mt-4 max-w-lg">{subtitle}</p> : null}
        </header>
        <div className="hr-reveal-stagger grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`hr-card relative flex flex-col p-7 ${tier.highlighted ? "hr-card-featured lg:-translate-y-2" : ""}`}
            >
              {tier.highlighted ? (
                <span className="hr-label hr-pricing-badge absolute -top-3 start-6 rounded-full px-3 py-1">
                  Recommended
                </span>
              ) : null}
              <h3 className="hr-title-lg">{tier.name}</h3>
              <p className="hr-body-sm mt-2">{tier.description}</p>
              <p className="mt-6">
                <span className="hr-metric">{tier.price}</span>
                {tier.period ? <span className="hr-caption ms-1">{tier.period}</span> : null}
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="hr-body-sm flex gap-2">
                    <span aria-hidden className="hr-check">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.highlighted ? "hr-btn-primary" : "hr-btn-secondary"} hr-focus-ring mt-8 w-full`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
