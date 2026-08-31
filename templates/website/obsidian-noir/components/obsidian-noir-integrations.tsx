"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Customer platform", category: "Native" },
  { abbr: "DWH", name: "Data warehouse", category: "ETL" },
  { abbr: "COM", name: "Collaboration", category: "Realtime" },
  { abbr: "API", name: "Open API", category: "Custom" },
  { abbr: "SSO", name: "Identity", category: "Security" },
  { abbr: "BI", name: "Analytics", category: "Insights" },
];

type ObsidianNoirIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function ObsidianNoirIntegrations({
  eyebrow = "Connections",
  title = "Tools named once",
  logos = DEFAULT_LOGOS,
}: ObsidianNoirIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="obsidian-noir-integrations" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4">{title}</h2>
        <hr className="ob-rule mt-12" />
        <ul className="ob-reveal-stagger">
          {logos.map((logo) => (
            <li key={logo.abbr} className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border-default)] py-6">
              <span className="ob-font-display text-2xl">{logo.name}</span>
              <span className="ob-attribution">
                {logo.abbr} · {logo.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
