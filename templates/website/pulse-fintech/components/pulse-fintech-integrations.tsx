"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Customer platform", category: "Native" },
  { abbr: "DWH", name: "Data warehouse", category: "ETL" },
  { abbr: "COM", name: "Collaboration", category: "Realtime" },
  { abbr: "API", name: "Open API", category: "Custom" },
  { abbr: "SSO", name: "Identity", category: "Security" },
  { abbr: "BI", name: "Analytics", category: "Insights" },
];

type PulseFintechIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function PulseFintechIntegrations({
  eyebrow = "Connectors",
  title = "API adjacency map",
  logos = DEFAULT_LOGOS,
}: PulseFintechIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="pulse-fintech-integrations" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 className="pu-headline-sm mt-1">{title}</h2>
        <div className="pu-panel mt-6 overflow-x-auto">
          <div className="pu-panel-head">
            <span>INTEGRATIONS</span>
            <span>{logos.length} ENDPOINTS</span>
          </div>
          <table className="pu-table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">System</th>
                <th scope="col">Mode</th>
              </tr>
            </thead>
            <tbody>
              {logos.map((logo) => (
                <tr key={logo.abbr}>
                  <td className="text-[var(--color-accent)]">{logo.abbr}</td>
                  <td className="text-[var(--color-foreground)]">{logo.name}</td>
                  <td>{logo.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
