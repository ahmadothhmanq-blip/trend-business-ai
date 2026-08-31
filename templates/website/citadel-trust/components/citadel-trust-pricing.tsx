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
    name: "Matter-based",
    price: "Engagement letter",
    period: "",
    description: "Fixed scope for discrete litigation, investigations, or transactions.",
    features: ["Defined deliverables", "Partner-led team", "Transparent fee schedule"],
    cta: "Discuss a matter",
    highlighted: false,
  },
  {
    name: "Institutional retainer",
    price: "Annual counsel",
    period: "",
    description: "Embedded advisory for boards, GC offices, and regulatory affairs teams.",
    features: ["Priority access", "Quarterly strategy reviews", "Cross-practice coordination", "Crisis response"],
    cta: "Request proposal",
    highlighted: true,
  },
  {
    name: "Sovereign & public",
    price: "Custom mandate",
    period: "",
    description: "Long-term counsel for governments, regulators, and multilateral institutions.",
    features: ["Dedicated partner panel", "Policy & litigation", "Global coordination"],
    cta: "Confidential inquiry",
    highlighted: false,
  },
];

type CitadelTrustPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function CitadelTrustPricing({
  eyebrow = "Engagement letters",
  title = "How we formalize counsel",
  subtitle = "Each engagement opens with a letter — scoped, sealed, and partner-accountable.",
  tiers = DEFAULT_TIERS,
}: CitadelTrustPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="citadel-trust-pricing"
      aria-labelledby="ct-pricing-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8">
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-pricing-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
        </header>

        <div className="ct-reveal-stagger space-y-4">
          {tiers.map((tier, index) => (
            <article key={tier.name} className="ct-letter">
              <header className="ct-letter-head">
                <span>Letter {String(index + 1).padStart(2, "0")}</span>
                <span>{tier.highlighted ? "Preferred" : "Standard"}</span>
              </header>
              <h3 className="ct-article-title mt-4">{tier.name}</h3>
              <p className="ct-font-display mt-2 text-xl text-[var(--color-accent)]">
                {tier.price}
                {tier.period ? <span className="ct-font-body text-sm text-[var(--color-muted)]">{tier.period}</span> : null}
              </p>
              <p className="ct-body mt-3 text-base">{tier.description}</p>
              <ul className="mt-5 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="ct-font-body text-sm text-[var(--color-muted)]">
                    — {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.highlighted ? "ct-btn-primary" : "ct-btn-secondary"} ct-focus-ring mt-6 inline-flex`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
