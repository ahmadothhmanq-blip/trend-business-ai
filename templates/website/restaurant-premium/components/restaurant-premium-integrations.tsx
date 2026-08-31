"use client";

const DEFAULT_LOGOS = [
  { name: "Discover", abbr: "01", category: "Phase", description: "Align on goals, audience, and success criteria." },
  { name: "Define", abbr: "02", category: "Phase", description: "Shape the plan, scope, and delivery roadmap." },
  { name: "Build", abbr: "03", category: "Phase", description: "Execute with craft, review cycles, and clarity." },
  { name: "Grow", abbr: "04", category: "Phase", description: "Measure outcomes and refine for the next stage." },
];

type RestaurantPremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ name: string; abbr: string; category: string; description?: string }>;
};

export function RestaurantPremiumIntegrations({
  eyebrow = "Approach",
  title = "How engagement works",
  subtitle = "A transparent process designed for global teams and complex scopes.",
  logos = DEFAULT_LOGOS,
}: RestaurantPremiumIntegrationsProps) {
  if (!logos.length) return null;

  return (
    <section id="capabilities" data-v2-component="restaurant-premium-integrations" className="rp-reveal rp-section rp-section-alt">
      <div className="rp-shell">
        <header className="rp-section-head">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 className="rp-h2">{title}</h2>
          <div className="rp-accent-rule" aria-hidden />
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <ol className="rp-reveal-stagger rp-process">
          {logos.map((logo) => (
            <li key={logo.abbr}>
              <span className="rp-process-num">{logo.abbr}</span>
              <h3>{logo.name}</h3>
              {logo.description ? <p>{logo.description}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
