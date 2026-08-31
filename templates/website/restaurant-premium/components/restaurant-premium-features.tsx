"use client";

const DEFAULT_FEATURES = [
  { title: "Strategy & positioning", description: "Clear direction for brands and teams competing on a global stage." },
  { title: "Experience design", description: "Cohesive digital and brand experiences that feel intentional at every touchpoint." },
  { title: "Delivery excellence", description: "Disciplined execution with accountable timelines and measurable milestones." },
  { title: "Ongoing partnership", description: "Support models that scale with scope — from projects to retainers." },
];

type RestaurantPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string }>;
};

export function RestaurantPremiumFeatures({
  eyebrow = "Capabilities",
  title = "What we deliver",
  subtitle = "End-to-end expertise for organizations that expect precision and presence.",
  items = DEFAULT_FEATURES,
}: RestaurantPremiumFeaturesProps) {
  if (!items.length) return null;

  return (
    <section id="features" data-v2-component="restaurant-premium-features" aria-labelledby="rp-features-title" className="rp-reveal rp-section">
      <div className="rp-shell">
        <header className="rp-section-head">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 id="rp-features-title" className="rp-h2">{title}</h2>
          <div className="rp-accent-rule" aria-hidden />
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <ul className="rp-reveal-stagger rp-cap-grid">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <span className="rp-cap-num" aria-hidden>
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
