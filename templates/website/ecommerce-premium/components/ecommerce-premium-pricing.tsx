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
    name: "Studio",
    price: "$420+",
    period: "",
    description: "Entry objects and soft goods from the open floor.",
    features: ["Seasonal drops", "Standard delivery", "Care guide"],
    cta: "Shop Studio",
    highlighted: false,
  },
  {
    name: "Maison",
    price: "$980+",
    period: "",
    description: "Tailoring and leather with white-glove delivery.",
    features: ["Priority access", "White-glove", "Alterations desk", "Archive alerts"],
    cta: "Shop Maison",
    highlighted: true,
  },
  {
    name: "Private",
    price: "On request",
    period: "",
    description: "Commissioned pieces and private fittings.",
    features: ["Atelier appointment", "Custom materials", "Concierge"],
    cta: "Request Private",
    highlighted: false,
  },
];

type EcommercePremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function EcommercePremiumPricing({
  eyebrow = "Collections",
  title = "Collection tiers",
  subtitle = "Choose how you enter the runway — not a SaaS plan grid.",
  tiers = DEFAULT_TIERS,
}: EcommercePremiumPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="ecommerce-premium-pricing"
      aria-labelledby="ec-pricing-title"
      className="ec-tiers ec-reveal"
    >
      <div className="ec-tiers-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-pricing-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>

        <ol className="ec-tiers-list ec-reveal-stagger">
          {tiers.map((tier, i) => (
            <li key={tier.name} className={`ec-tier-row${tier.highlighted ? " is-featured" : ""}`}>
              <span className="ec-font-mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="ec-font-display">{tier.name}</h3>
                <p className="ec-tier-price">{tier.price}{tier.period}</p>
                <p className="ec-tier-desc">{tier.description}</p>
                <ul>
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <a href="#contact" className="ec-btn-primary ec-focus-ring">
                {tier.cta}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
