"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "CRM sync", category: "Native" },
  { abbr: "IDP", name: "Identity", category: "SSO" },
  { abbr: "DWH", name: "Warehouse", category: "ETL" },
  { abbr: "CHAT", name: "Collaboration", category: "Alerts" },
  { abbr: "BI", name: "BI export", category: "Insights" },
  { abbr: "API", name: "Open API", category: "Custom" },
];

type SaasEnterpriseIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function SaasEnterpriseIntegrations({
  eyebrow = "Integrations",
  title = "Connected systems",
  subtitle = "Listed like connector docs — dense and scannable.",
  logos = DEFAULT_LOGOS,
}: SaasEnterpriseIntegrationsProps) {
  return (
    <section
      id="integrations"
      data-v2-component="saas-enterprise-integrations"
      aria-labelledby="se-integrations-title"
      className="se-connectors se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-integrations-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <ul className="se-connectors-list se-reveal-stagger">
          {logos.map((logo) => (
            <li key={logo.abbr}>
              <span className="se-font-mono">{logo.abbr}</span>
              <span>{logo.name}</span>
              <span>{logo.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
