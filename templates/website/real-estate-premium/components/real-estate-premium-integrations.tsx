"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Client CRM", category: "Desk" },
  { abbr: "MLS", name: "Listing feeds", category: "Data" },
  { abbr: "ESC", name: "Escrow partners", category: "Close" },
  { abbr: "KYC", name: "Identity checks", category: "Compliance" },
  { abbr: "MAP", name: "Market intel", category: "Research" },
  { abbr: "DOC", name: "Dossier PDF", category: "Deliverable" },
];

type RealEstatePremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function RealEstatePremiumIntegrations({
  eyebrow = "Operating stack",
  title = "Desk integrations",
  subtitle = "Systems behind every dossier.",
  logos = DEFAULT_LOGOS,
}: RealEstatePremiumIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="real-estate-premium-integrations" className="rep-section-plain rep-reveal">
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="rep-body text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-spec-list">
          {logos.map((logo) => (
            <div key={logo.abbr}>
              <dt>{logo.abbr}</dt>
              <dd>
                {logo.name} · {logo.category}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
