"use client";

const DEFAULT_FEATURES = [
  {
    title: "Pipeline mesh",
    description: "Stage policies, ownership rules, and live deal telemetry in one module.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Forecast engine",
    description: "Weighted projections with scenario forks for board-ready reporting.",
    icon: "02",
    span: "tall",
  },
  {
    title: "Account graph",
    description: "Hierarchy, buying centers, and expansion signals across regions.",
    icon: "03",
    span: "compact",
  },
  {
    title: "Playbook runner",
    description: "Guided motions for renewals, upsell, and competitive save plays.",
    icon: "04",
    span: "wide",
  },
];

type SaasEnterpriseFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function SaasEnterpriseFeatures({
  eyebrow = "Modules",
  title = "Canvas modules",
  subtitle = "Product surfaces you open inside the shell — documented like a control plane.",
  items = DEFAULT_FEATURES,
}: SaasEnterpriseFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="saas-enterprise-features"
      aria-labelledby="se-features-title"
      className="se-modules se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-features-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>

        <div className="se-module-grid se-reveal-stagger">
          {items.map((item, i) => (
            <article key={item.title} className="se-module-card">
              <div className="se-module-chrome">
                <span className="se-font-mono">{item.icon ?? String(i + 1).padStart(2, "0")}</span>
                <span>Module</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href="#pricing" className="se-module-link">
                Open docs
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
