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
    name: "Essence",
    price: "$180",
    period: "/mo",
    description: "A quiet entry into seasonal rituals and restorative sessions.",
    features: ["Two rituals monthly", "Practitioner matching", "Member lounge access"],
    cta: "Join Essence",
    highlighted: false,
  },
  {
    name: "Harmony",
    price: "$320",
    period: "/mo",
    description: "A fuller rhythm of care with movement, nutrition, and recovery.",
    features: ["Four rituals monthly", "Nutrition consult", "Priority booking", "Thermal suite"],
    cta: "Join Harmony",
    highlighted: true,
  },
  {
    name: "Sanctuary",
    price: "Private",
    period: "",
    description: "A private membership for those who prefer complete discretion.",
    features: ["Unlimited rituals", "House practitioner", "At-home visits"],
    cta: "Request Sanctuary",
    highlighted: false,
  },
];

type LuminaWellnessPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function LuminaWellnessPricing({
  eyebrow = "Memberships",
  title = "Choose a quieter rhythm",
  subtitle = "Memberships arranged as a soft vertical sequence — never a loud pricing grid.",
  tiers = DEFAULT_TIERS,
}: LuminaWellnessPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="lumina-wellness-pricing"
      aria-labelledby="lu-pricing-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-pricing-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>

      <div className="lu-reveal-stagger mx-auto mt-8 max-w-md px-5 sm:px-8">
        {tiers.map((tier) => (
          <article key={tier.name} className="lu-membership">
            <h3 className="lu-ritual-title">{tier.name}</h3>
            <p className="lu-metric mt-4">
              {tier.price}
              {tier.period ? <span className="lu-font-body ms-1 text-base text-[var(--color-muted)]">{tier.period}</span> : null}
            </p>
            <p className="lu-body mt-3 text-sm">{tier.description}</p>
            <ul className="mt-5 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="lu-font-body text-sm text-[var(--color-muted)]">
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className={`${tier.highlighted ? "lu-btn-primary" : "lu-btn-secondary"} lu-focus-ring mt-6 inline-flex`}
            >
              {tier.cta}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
