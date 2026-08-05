"use client";

const DEFAULT_INTEGRATIONS = [
  "SAP",
  "Oracle",
  "Microsoft",
  "Workday",
  "ServiceNow",
  "Salesforce",
  "Deloitte",
  "PwC",
  "EY",
  "KPMG",
];

type CorporateBusinessIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: string[];
};

export function CorporateBusinessIntegrations({
  eyebrow = "Partner ecosystem",
  title = "Trusted advisory network",
  subtitle = "Certified partnerships with enterprise platforms and global advisory firms for seamless execution.",
  logos = DEFAULT_INTEGRATIONS,
}: CorporateBusinessIntegrationsProps) {
  const doubled = [...logos, ...logos];

  return (
    <section
      id="platform"
      data-v2-component="corporate-business-integrations"
      aria-labelledby="cb-integrations-title"
      className="border-y border-[var(--border-default)] bg-[var(--color-background)] py-12 sm:py-14"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="cb-eyebrow mb-3">{eyebrow}</p>
          <h2 id="cb-integrations-title" className="cb-headline-sm">
            {title}
          </h2>
          <p className="cb-body text-muted-foreground mx-auto mt-3 max-w-lg text-sm">{subtitle}</p>
        </header>
      </div>

      <div className="relative overflow-hidden" aria-label="Integration partners">
        <div className="flex motion-safe:animate-[cb-marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="mx-3 flex h-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-8 shadow-[var(--shadow-card)]"
            >
              <span className="cb-font-display text-sm font-semibold text-[var(--color-muted)]">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="cb-font-body mx-auto mt-8 max-w-[82rem] px-5 text-center text-xs text-[var(--color-muted)] sm:px-8">
        Certified partner network · Custom advisory engagements
      </p>
    </section>
  );
}
