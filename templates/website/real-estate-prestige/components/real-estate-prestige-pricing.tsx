"use client";

const DEFAULT_TIERS = [
  { name: "Starter", price: "Custom", period: "", description: "For teams getting started with the essentials.", features: ["Core scope", "Email support", "Standard onboarding"], cta: "Get started", highlighted: false },
  { name: "Professional", price: "Custom", period: "", description: "Expanded scope for growing organizations.", features: ["Everything in Starter", "Priority support", "Dedicated contact"], cta: "Contact us", highlighted: true },
  { name: "Enterprise", price: "Custom", period: "", description: "Tailored programs with custom terms and SLAs.", features: ["Custom scope", "Account team", "Strategic reviews"], cta: "Talk to sales", highlighted: false },
];

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

type RealEstatePrestigePricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function RealEstatePrestigePricing({
  eyebrow = "Plans",
  title = "Options that fit your scope",
  subtitle = "Transparent engagement models — tailored during discovery.",
  tiers = DEFAULT_TIERS,
}: RealEstatePrestigePricingProps) {
  if (!tiers.length) return null;

  return (
    <section
      id="pricing"
      data-v2-component="real-estate-prestige-pricing"
      aria-labelledby="rep-pricing-title"
      className="rep-reveal rep-section py-20 sm:py-28"
    >
      <div className="rep-container">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-pricing-title" className="rep-headline-sm">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <div className="rep-reveal-stagger grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`rep-card flex flex-col p-8 ${tier.highlighted ? "rep-pricing-featured relative" : ""}`}
            >
              {tier.highlighted ? (
                <span className="rep-label absolute -top-3 start-6 rounded-full border border-[var(--border-accent)] bg-[var(--color-surface)] px-3 py-1">
                  Recommended
                </span>
              ) : null}
              <h3 className="rep-title-lg">{tier.name}</h3>
              <p className="rep-price mt-2">
                {tier.price}
                {tier.period}
              </p>
              <p className="rep-body-sm mt-4">{tier.description}</p>
              {tier.features.length ? (
                <ul className="mt-6 flex-1 space-y-2 rep-body-sm">
                  {tier.features.map((feature) => (
                    <li key={feature}>— {feature}</li>
                  ))}
                </ul>
              ) : null}
              <a href="#contact" className={`${tier.highlighted ? "rep-btn-primary" : "rep-btn-secondary"} rep-focus-ring mt-8 w-fit`}>
                {tier.cta || "Get started"}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
