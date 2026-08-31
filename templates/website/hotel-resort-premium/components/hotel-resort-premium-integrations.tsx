"use client";

const DEFAULT_LOGOS = [
  { name: "Advisory", abbr: "01", category: "Strategy", description: "Positioning, planning, and clear direction." },
  { name: "Delivery", abbr: "02", category: "Execution", description: "Hands-on work with accountable milestones." },
  { name: "Care", abbr: "03", category: "Support", description: "Responsive guidance before and after launch." },
  { name: "Partners", abbr: "04", category: "Network", description: "Trusted collaborators when scope expands." },
  { name: "Quality", abbr: "05", category: "Standards", description: "Review, refinement, and attention to detail." },
  { name: "Growth", abbr: "06", category: "Outcomes", description: "Measurable progress tied to your goals." },
];

type HotelResortPremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ name: string; abbr: string; category: string; description?: string }>;
};

export function HotelResortPremiumIntegrations({
  eyebrow = "How we work",
  title = "Capabilities that adapt to you",
  subtitle = "Flexible building blocks for service brands, studios, clinics, and hospitality.",
  logos = DEFAULT_LOGOS,
}: HotelResortPremiumIntegrationsProps) {
  if (!logos.length) return null;

  return (
    <section id="capabilities" data-v2-component="hotel-resort-premium-integrations" className="hr-reveal hr-section">
      <div className="hr-container">
        <header className="hr-section-header hr-section-header--rule mb-12 max-w-2xl">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 className="hr-headline-sm mt-4">{title}</h2>
          <div className="hr-azure-rule" />
          {subtitle ? <p className="hr-body mt-4">{subtitle}</p> : null}
        </header>
        <ul className="hr-reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo) => (
            <li key={logo.abbr} className="hr-feature-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="hr-title-lg">{logo.name}</h3>
                <span className="hr-feature-icon !mb-0 !h-9 !w-9 !text-sm">{logo.abbr}</span>
              </div>
              <p className="hr-label mt-4">{logo.category}</p>
              {logo.description ? <p className="hr-body-sm mt-2">{logo.description}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
