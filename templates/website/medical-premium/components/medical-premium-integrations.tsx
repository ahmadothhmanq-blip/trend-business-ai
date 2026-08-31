"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Customer platform", category: "Native", description: "Sync contacts, deals, and activity in real time." },
  { abbr: "DWH", name: "Data warehouse", category: "ETL", description: "Pipeline-ready exports for analytics teams." },
  { abbr: "COM", name: "Collaboration", category: "Realtime", description: "Notifications and shared workspaces." },
  { abbr: "API", name: "Open API", category: "Custom", description: "Webhooks and REST for bespoke workflows." },
  { abbr: "SSO", name: "Identity", category: "Security", description: "SAML and OIDC for enterprise access." },
  { abbr: "BI", name: "Analytics", category: "Insights", description: "Dashboards and scheduled reporting." },
];

type IntegrationItem = { abbr: string; name: string; category: string; description?: string };

type MedicalPremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: IntegrationItem[];
};

export function MedicalPremiumIntegrations({
  eyebrow = "Integrations",
  title = "Connected to your stack",
  subtitle = "Native sync with the tools your team already uses.",
  logos = DEFAULT_LOGOS,
}: MedicalPremiumIntegrationsProps) {
  if (!logos.length) return null;

  return (
    <section id="platform" data-v2-component="medical-premium-integrations" className="mp-reveal mp-section-alt py-20 sm:py-28">
      <div className="mp-container">
        <header className="mp-section-header mp-section-header--rule mb-12">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 className="mp-headline-sm mt-4">{title}</h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
        </header>
        <ul className="mp-reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo) => (
            <li key={logo.abbr} className="mp-card flex flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="mp-title-lg text-base">{logo.name}</h3>
                <span className="mp-label">{logo.abbr}</span>
              </div>
              <p className="mp-caption">{logo.category}</p>
              {logo.description ? <p className="mp-body-sm mt-auto">{logo.description}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
