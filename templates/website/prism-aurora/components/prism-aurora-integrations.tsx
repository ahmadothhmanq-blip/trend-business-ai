"use client";

const DEFAULT_LOGOS = [
  { abbr: "CRM", name: "Customer platform", category: "Native" },
  { abbr: "DWH", name: "Data warehouse", category: "ETL" },
  { abbr: "COM", name: "Collaboration", category: "Realtime" },
  { abbr: "API", name: "Open API", category: "Custom" },
  { abbr: "SSO", name: "Identity", category: "Security" },
  { abbr: "BI", name: "Analytics", category: "Insights" },
];

type PrismAuroraIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function PrismAuroraIntegrations({
  eyebrow = "Integrations",
  title = "Connected to your stack",
  subtitle = "Native sync with the tools your team already uses.",
  logos = DEFAULT_LOGOS,
}: PrismAuroraIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="prism-aurora-integrations" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <p className="pr-eyebrow">{eyebrow}</p>
        <h2 className="pr-headline-sm mt-2">{title}</h2>
        <p className="pr-body mt-2 max-w-md">{subtitle}</p>
        <div className="pr-mosaic pr-reveal-stagger mt-8">
          {logos.map((logo, i) => (
            <div
              key={logo.abbr}
              className={`pr-tile ${
                i % 5 === 0
                  ? "pr-span-5 pr-tile-field-a"
                  : i % 5 === 1
                    ? "pr-span-3 pr-tile-field-b"
                    : i % 5 === 2
                      ? "pr-span-4 pr-tile-field-c"
                      : i % 5 === 3
                        ? "pr-span-7 pr-tile-field-a"
                        : "pr-span-5 pr-tile-field-b"
              }`}
            >
              <p className="pr-font-display text-xs font-bold tracking-[0.16em] text-[var(--color-accent)]">{logo.abbr}</p>
              <p className="mt-2 font-semibold">{logo.name}</p>
              <p className="pr-body mt-1 text-xs">{logo.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
