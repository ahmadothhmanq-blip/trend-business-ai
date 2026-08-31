"use client";

const DEFAULT_LOGOS = [
  { abbr: "ATL", name: "Atelier network", category: "Makers" },
  { abbr: "MIL", name: "Milan leather", category: "Material" },
  { abbr: "TOK", name: "Tokyo dye house", category: "Finish" },
  { abbr: "PAR", name: "Paris fittings", category: "Service" },
];

type EcommercePremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function EcommercePremiumIntegrations({
  eyebrow = "Partners",
  title = "Maker network",
  subtitle = "Studios that finish the runway.",
  logos = DEFAULT_LOGOS,
}: EcommercePremiumIntegrationsProps) {
  return (
    <section
      id="platform"
      data-v2-component="ecommerce-premium-integrations"
      aria-labelledby="ec-integrations-title"
      className="ec-makers ec-reveal"
    >
      <div className="ec-makers-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-integrations-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>
        <ul className="ec-makers-list">
          {logos.map((logo) => (
            <li key={logo.abbr}>
              <span className="ec-font-mono">{logo.abbr}</span>
              <span>{logo.name}</span>
              <span>{logo.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
