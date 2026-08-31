"use client";

const DEFAULT_HIGHLIGHTS = [
  "Built for RevOps, sales leadership, and finance partners",
  "Governed workspaces with audit-ready change history",
  "APIs and webhooks that respect enterprise tenancy",
];

type SaasEnterpriseAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function SaasEnterpriseAbout({
  eyebrow = "Product brief",
  title = "Why teams live in the shell",
  subtitle,
  body = "Nexus is designed as an application first. Marketing copy sits inside the canvas header because the product is the story — a dense, trustworthy workspace for revenue operations at scale.",
  imageUrl = null,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Read architecture",
}: SaasEnterpriseAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="saas-enterprise-about"
      aria-labelledby="se-about-title"
      className="se-brief se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-about-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          {subtitle ? <p className="se-body">{subtitle}</p> : null}
        </header>
        <div className="se-brief-layout">
          <div>
            <p className="se-body">{body}</p>
            <ul className="se-brief-list se-reveal-stagger">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <a href="#faq" className="se-btn-secondary se-focus-ring">
              {primaryCta}
            </a>
          </div>
          <aside className="se-brief-aside" aria-label="System notes">
            <p className="se-brief-aside-label">System</p>
            <dl>
              <div>
                <dt>Latency budget</dt>
                <dd>&lt; 120ms p95</dd>
              </div>
              <div>
                <dt>Regions</dt>
                <dd>Multi-AZ + DR</dd>
              </div>
              <div>
                <dt>Auth</dt>
                <dd>SSO / SCIM</dd>
              </div>
            </dl>
            {imageUrl ? <img src={imageUrl} alt="" className="se-brief-image" /> : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
