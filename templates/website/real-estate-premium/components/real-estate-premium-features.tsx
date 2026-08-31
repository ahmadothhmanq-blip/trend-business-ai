"use client";

const DEFAULT_FEATURES = [
  {
    title: "Private advisory",
    description: "Off-market access and discreet representation for ultra-high-net-worth buyers.",
    icon: "01",
  },
  {
    title: "Global portfolio",
    description: "Curated listings across premier markets with local market intelligence.",
    icon: "02",
  },
  {
    title: "Investment strategy",
    description: "Portfolio analysis and acquisition guidance for institutional investors.",
    icon: "03",
  },
  {
    title: "White-glove service",
    description: "Concierge coordination from viewing through closing and beyond.",
    icon: "04",
  },
];

type RealEstatePremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function RealEstatePremiumFeatures({
  eyebrow = "Amenities specification",
  title = "Service amenities",
  subtitle = "Presented as a specification sheet — not feature cards.",
  items = DEFAULT_FEATURES,
}: RealEstatePremiumFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="real-estate-premium-features"
      aria-labelledby="rep-features-title"
      className="rep-amenities rep-reveal"
    >
      <div className="rep-amenities-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 id="rep-features-title" className="rep-amenities-title">
          {title}
        </h2>
        <p className="rep-body mb-2 text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-spec-list">
          {items.map((item) => (
            <div key={item.title}>
              <dt>{item.icon ? `${item.icon} · ${item.title}` : item.title}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
