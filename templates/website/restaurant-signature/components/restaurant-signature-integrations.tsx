"use client";

const DEFAULT_LOGOS = [
  { abbr: "GROW", name: "Regional growers", category: "Produce" },
  { abbr: "FISH", name: "Day-boat catch", category: "Seafood" },
  { abbr: "CELL", name: "Importer partners", category: "Wine" },
  { abbr: "FORG", name: "Foraging guild", category: "Wild" },
  { abbr: "DAIR", name: "Cultured dairy", category: "Dairy" },
  { abbr: "MILL", name: "Stone mill flour", category: "Grain" },
];

type RestaurantSignatureIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function RestaurantSignatureIntegrations({
  eyebrow = "Provenance",
  title = "Suppliers on the menu",
  subtitle = "Named partners — written like cellar credits.",
  logos = DEFAULT_LOGOS,
}: RestaurantSignatureIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="restaurant-signature-integrations" className="rs-menu-doc rs-reveal">
      <div className="rs-cellar">
        <p className="rs-menu-section-label">
          {eyebrow} · {title}
        </p>
        <p className="sr-only">{subtitle}</p>
        {logos.map((logo) => (
          <article key={logo.abbr} className="rs-cellar-item">
            <h3>{logo.name}</h3>
            <p className="rs-cellar-meta">
              {logo.abbr} · {logo.category}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
