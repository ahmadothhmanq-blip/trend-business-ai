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
    name: "Private buyer desk",
    price: "Retainer",
    period: "",
    description: "Off-market search, shortlist dossiers, and viewing coordination.",
    features: ["Dedicated advisor", "Weekly dossier drops", "Travel desk"],
    cta: "Request terms",
    highlighted: false,
  },
  {
    name: "Seller mandate",
    price: "Commission",
    period: "",
    description: "Gallery presentation, qualified buyer network, and discreet marketing.",
    features: ["Photography & film", "Buyer qualification", "Negotiation lead"],
    cta: "Discuss mandate",
    highlighted: true,
  },
  {
    name: "Institutional program",
    price: "Custom",
    period: "",
    description: "Multi-asset acquisition and disposition for family offices.",
    features: ["Portfolio analysis", "Cross-border desks", "Board reporting"],
    cta: "Open program",
    highlighted: false,
  },
];

type RealEstatePremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function RealEstatePremiumPricing({
  eyebrow = "Agency programs",
  title = "Engagement schedule",
  subtitle = "Advisory programs as a specification — not product cards.",
  tiers = DEFAULT_TIERS,
}: RealEstatePremiumPricingProps) {
  return (
    <section id="pricing" data-v2-component="real-estate-premium-pricing" className="rep-section-plain rep-reveal">
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="rep-body text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-agency-programs">
          {tiers.map((tier) => (
            <div key={tier.name}>
              <dt>
                <strong>{tier.name}</strong>
                <span>{tier.description}</span>
              </dt>
              <dd>
                {tier.price}
                {tier.period}
              </dd>
            </div>
          ))}
        </dl>
        <a href="#contact" className="rep-btn-primary rep-focus-ring mt-6 inline-flex">
          Request program brief
        </a>
      </div>
    </section>
  );
}
