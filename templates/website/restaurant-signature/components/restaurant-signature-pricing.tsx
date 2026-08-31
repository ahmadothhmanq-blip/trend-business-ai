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
    name: "Tasting menu",
    price: "185",
    period: "",
    description: "Twelve courses following the season.",
    features: ["Seasonal progression", "Dietary adaptation", "Kitchen pacing"],
    cta: "Reserve",
    highlighted: true,
  },
  {
    name: "Wine pairing",
    price: "95",
    period: "",
    description: "Cellar pairing beside the tasting spine.",
    features: ["Grower bottles", "Sommelier notes", "Juice alternative"],
    cta: "Add pairing",
    highlighted: false,
  },
  {
    name: "Chef’s table",
    price: "245",
    period: "",
    description: "Extended service at the hearth counter.",
    features: ["Counter seating", "Extended courses", "Private pacing"],
    cta: "Request",
    highlighted: false,
  },
];

type RestaurantSignaturePricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

/** Optional lower menu section — priced courses, not SaaS plan cards. */
export function RestaurantSignaturePricing({
  eyebrow = "Menu prices",
  title = "Service schedule",
  subtitle = "Tariffs listed like a tasting menu.",
  tiers = DEFAULT_TIERS,
}: RestaurantSignaturePricingProps) {
  return (
    <section id="pricing" data-v2-component="restaurant-signature-pricing" className="rs-menu-doc rs-reveal">
      <p className="rs-menu-section-label">
        {eyebrow} · {title}
      </p>
      <p className="sr-only">{subtitle}</p>
      <div>
        {tiers.map((tier, i) => (
          <article key={tier.name} className="rs-course">
            <span className="rs-course-num" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="rs-course-title">{tier.name}</h3>
              <p className="rs-course-note">{tier.description}</p>
            </div>
            <span className="rs-course-price">
              {tier.price}
              {tier.period}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
