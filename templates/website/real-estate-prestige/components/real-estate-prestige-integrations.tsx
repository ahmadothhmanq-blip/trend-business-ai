"use client";

const DEFAULT_CAPABILITIES = [
  {
    abbr: "01",
    name: "Strategy & discovery",
    category: "Foundation",
    description: "Align goals, audience, and scope before design or build begins.",
  },
  {
    abbr: "02",
    name: "Design & messaging",
    category: "Expression",
    description: "Clear narrative, visual system, and content structure that converts.",
  },
  {
    abbr: "03",
    name: "Build & launch",
    category: "Delivery",
    description: "Polished implementation with QA, performance, and handoff documentation.",
  },
  {
    abbr: "04",
    name: "Growth & support",
    category: "Partnership",
    description: "Iteration, optimization, and ongoing partnership as you scale.",
  },
];

type CapabilityItem = { abbr?: string; name: string; category?: string; description?: string };

type RealEstatePrestigeIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: CapabilityItem[];
  footnote?: string;
};

export function RealEstatePrestigeIntegrations({
  eyebrow = "Capabilities",
  title = "What we bring to the table",
  subtitle = "Core strengths and supporting services for your project.",
  logos = DEFAULT_CAPABILITIES,
  footnote,
}: RealEstatePrestigeIntegrationsProps) {
  const items = logos.filter((logo) => logo.name?.trim());
  if (!items.length) return null;

  return (
    <section
      id="platform"
      data-v2-component="real-estate-prestige-integrations"
      aria-labelledby="rep-platform-title"
      className="rep-reveal rep-section py-20 sm:py-28"
    >
      <div className="rep-container">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-platform-title" className="rep-headline-sm text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
          {footnote ? <p className="rep-body-sm mt-3">{footnote}</p> : null}
        </header>
        <div className="rep-capability-grid sm:grid-cols-2">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="rep-capability-card">
              <span className="rep-index">{item.abbr || String(index + 1).padStart(2, "0")}</span>
              {item.category ? <p className="rep-label mt-4">{item.category}</p> : null}
              <h3 className="rep-title-lg mt-2">{item.name}</h3>
              {item.description ? <p className="rep-body-sm mt-3 max-w-md">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
