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
    name: "Advisory",
    price: "From $499",
    period: "",
    description: "Focused engagements for defined outcomes.",
    features: ["Scoped deliverables", "Dedicated lead", "Clear timeline"],
    cta: "Start here",
    highlighted: false,
  },
  {
    name: "Partnership",
    price: "From $899",
    period: "",
    description: "Expanded scope for growing organizations.",
    features: ["Everything in Advisory", "Priority support", "Review cycles", "Multi-market coordination"],
    cta: "Talk to us",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Bespoke programs for complex global needs.",
    features: ["Flexible scope", "Senior team", "Ongoing partnership"],
    cta: "Contact sales",
    highlighted: false,
  },
];

type RestaurantPremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function RestaurantPremiumPricing({
  eyebrow = "Engagement",
  title = "Ways to work together",
  subtitle = "Transparent options — or a custom program shaped to your goals.",
  tiers = DEFAULT_TIERS,
}: RestaurantPremiumPricingProps) {
  if (!tiers.length) return null;

  return (
    <section id="pricing" data-v2-component="restaurant-premium-pricing" className="rp-reveal rp-section rp-section-alt">
      <div className="rp-shell">
        <header className="rp-section-head rp-section-head--center">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 className="rp-h2">{title}</h2>
          <div className="rp-accent-rule rp-accent-rule--center" aria-hidden />
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <div className="rp-reveal-stagger rp-tier-grid">
          {tiers.map((tier) => (
            <article key={tier.name} className={tier.highlighted ? "rp-tier is-featured" : "rp-tier"}>
              {tier.highlighted ? <span className="rp-tier-badge">Recommended</span> : null}
              <h3>{tier.name}</h3>
              <p className="rp-tier-desc">{tier.description}</p>
              <p className="rp-tier-price">
                {tier.price}
                {tier.period ? <span>{tier.period}</span> : null}
              </p>
              <ul>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.highlighted ? "rp-btn-primary" : "rp-btn-ghost"} rp-focus-ring`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
