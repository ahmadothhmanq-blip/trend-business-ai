"use client";

const DEFAULT_LOGOS = [
  { abbr: "Figma", name: "Design systems", category: "Craft" },
  { abbr: "WebGL", name: "Motion stages", category: "Experience" },
  { abbr: "CMS", name: "Content ops", category: "Publish" },
  { abbr: "Analytics", name: "Launch metrics", category: "Insight" },
  { abbr: "CDN", name: "Global delivery", category: "Perf" },
  { abbr: "API", name: "Integrations", category: "Build" },
];

type CreativePortfolioIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function CreativePortfolioIntegrations({
  eyebrow = "Studio stack",
  title = "Tools on the slate",
  subtitle = "Listed as colophon credits — not a logo grid.",
  logos = DEFAULT_LOGOS,
}: CreativePortfolioIntegrationsProps) {
  return (
    <section id="platform" data-v2-component="creative-portfolio-integrations" className="cp-colophon cp-reveal">
      <div className="cp-colophon-inner">
        <p className="cp-colophon-eyebrow">{eyebrow}</p>
        <h2 className="cp-colophon-title" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
          {title}
        </h2>
        <p className="cp-colophon-body">{subtitle}</p>
        <ul className="mt-8 space-y-3 border-t border-[var(--border-subtle)] pt-6">
          {logos.map((logo) => (
            <li key={logo.abbr} className="flex justify-between gap-4 cp-font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
              <span>{logo.name}</span>
              <span>
                {logo.abbr} · {logo.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
