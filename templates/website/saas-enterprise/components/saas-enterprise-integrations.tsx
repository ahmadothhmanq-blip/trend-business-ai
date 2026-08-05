"use client";

const DEFAULT_INTEGRATIONS = [
  { name: "Salesforce", category: "CRM" },
  { name: "HubSpot", category: "Marketing" },
  { name: "Slack", category: "Collab" },
  { name: "Snowflake", category: "Data" },
  { name: "Workday", category: "HR" },
  { name: "Gong", category: "Revenue" },
  { name: "Outreach", category: "Sales" },
  { name: "Segment", category: "CDP" },
  { name: "Databricks", category: "Lakehouse" },
  { name: "Zendesk", category: "Support" },
];

type SaasEnterpriseIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ name: string; category: string }>;
};

export function SaasEnterpriseIntegrations({
  eyebrow = "Integrations",
  title = "Your entire GTM stack, connected",
  subtitle = "Native bi-directional sync with CRM, data warehouse, and collaboration tools — no middleware required.",
  logos = DEFAULT_INTEGRATIONS,
}: SaasEnterpriseIntegrationsProps) {
  const doubled = [...logos, ...logos];

  return (
    <section
      id="platform"
      data-v2-component="saas-enterprise-integrations"
      aria-labelledby="se-integrations-title"
      className="se-section-glow relative overflow-hidden border-y border-[var(--border-default)] bg-[var(--color-background)] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 text-center">
          <p className="se-eyebrow mb-3">{eyebrow}</p>
          <h2 id="se-integrations-title" className="se-headline-sm">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" aria-hidden />
          <p className="se-body text-muted-foreground mx-auto mt-5 max-w-lg text-sm">{subtitle}</p>
        </header>
      </div>

      <div className="relative" aria-label="Integration partners">
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-r from-[var(--color-background)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-l from-[var(--color-background)] to-transparent"
          aria-hidden
        />
        <div className="flex motion-safe:animate-[se-marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="se-card mx-3 flex h-[4.5rem] min-w-[11rem] shrink-0 flex-col items-center justify-center px-6 py-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-surface)]"
            >
              <span className="se-font-display text-sm font-bold tracking-tight text-[var(--color-foreground)]">
                {logo.name}
              </span>
              <span className="se-font-mono mt-1 text-[0.625rem] uppercase tracking-wider text-[var(--color-muted)]">
                {logo.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="se-font-body mx-auto mt-10 max-w-[82rem] px-5 text-center text-xs text-[var(--color-muted)] sm:px-8">
        120+ integrations · OAuth 2.0 · Webhooks · Custom API connectors
      </p>
    </section>
  );
}
