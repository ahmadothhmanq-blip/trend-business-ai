"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Customer platform", category: "Native", qty: "1" },
  { abbr: "DWH", name: "Data warehouse", category: "ETL", qty: "1" },
  { abbr: "COM", name: "Collaboration", category: "Realtime", qty: "N" },
  { abbr: "API", name: "Open API", category: "Custom", qty: "∞" },
  { abbr: "SSO", name: "Identity", category: "Security", qty: "1" },
  { abbr: "BI", name: "Analytics", category: "Insights", qty: "1" },
];

type ForgeIndustrialIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string; qty?: string }>;
  figureLabel?: string;
};

export function ForgeIndustrialIntegrations({
  eyebrow = "Bill of materials",
  title = "Integration parts list",
  subtitle = "Referenced connectors shipped with the assembly — not a marketing logo wall.",
  logos = DEFAULT_LOGOS,
  figureLabel = "FIG. 03 — BOM / PARTS",
}: ForgeIndustrialIntegrationsProps) {
  return (
    <section
      id="platform"
      data-v2-component="forge-industrial-integrations"
      aria-labelledby="fg-integrations-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-integrations-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>

          <div className="mt-8 overflow-x-auto">
            <table className="fg-spec-table min-w-[36rem]">
              <thead>
                <tr>
                  <th scope="col">Part ID</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                  <th scope="col">Qty</th>
                </tr>
              </thead>
              <tbody>
                {logos.map((row) => (
                  <tr key={row.abbr}>
                    <td className="font-semibold text-[var(--color-accent)]">{row.abbr}</td>
                    <td className="fg-font-body text-[var(--color-foreground)]">{row.name}</td>
                    <td>{row.category}</td>
                    <td>{row.qty ?? "1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
