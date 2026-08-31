"use client";

const SIDEBAR_ITEMS = [
  { label: "Overview", active: true },
  { label: "Pipeline", active: false },
  { label: "Accounts", active: false },
  { label: "Forecast", active: false },
  { label: "Playbooks", active: false },
  { label: "Settings", active: false },
];

const TABLE_ROWS = [
  { account: "Northwind Labs", stage: "Expand", value: "$182k", health: "Strong" },
  { account: "Helix Group", stage: "Negotiate", value: "$96k", health: "Watch" },
  { account: "Axiom Systems", stage: "Discover", value: "$64k", health: "Strong" },
  { account: "Vertex Retail", stage: "Commit", value: "$210k", health: "Critical" },
];

type SaasEnterpriseHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  brandName?: string;
};

export function SaasEnterpriseHero({
  title = "Revenue workspace for enterprise GTM teams",
  subtitle = "Pipeline, forecast, and expansion signals in one product surface — not a brochure hero.",
  eyebrow = "Nexus Command",
  primaryCta = "Open workspace",
  secondaryCta = "Browse modules",
  imageUrl = null,
  brandName = "Nexus",
}: SaasEnterpriseHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="saas-enterprise-hero"
      aria-labelledby="se-hero-title"
      className="se-appshell"
    >
      <div className="se-appshell-frame">
        <aside className="se-appshell-sidebar" aria-label="Product navigation">
          <p className="se-appshell-side-brand se-font-display">{brandName}</p>
          <nav className="se-appshell-side-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.active ? "#features" : "#pricing"}
                className={item.active ? "is-active" : undefined}
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="se-appshell-side-meta">
            <p>Org · Acme Global</p>
            <p>Role · RevOps admin</p>
          </div>
        </aside>

        <div className="se-appshell-canvas">
          <header className="se-appshell-canvas-head">
            <div>
              <p className="se-eyebrow">{eyebrow}</p>
              <h1 id="se-hero-title" className="se-appshell-title se-font-display">
                {title}
              </h1>
              <p className="se-appshell-deck">{subtitle}</p>
            </div>
            <div className="se-appshell-actions">
              <a href="#contact" className="se-btn-primary se-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="se-btn-secondary se-focus-ring">
                {secondaryCta}
              </a>
            </div>
          </header>

          <div className="se-appshell-panels">
            <div className="se-panel se-panel-chart" aria-hidden>
              <div className="se-panel-chrome">
                <span>Forecast</span>
                <span>Q3</span>
              </div>
              <div className="se-chart-bars">
                <span style={{ height: "42%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "71%" }} />
                <span style={{ height: "63%" }} />
                <span style={{ height: "88%" }} />
                <span style={{ height: "76%" }} />
              </div>
            </div>

            <div className="se-panel se-panel-kpi" aria-hidden>
              <div className="se-panel-chrome">
                <span>Health</span>
                <span>Live</span>
              </div>
              <p className="se-kpi-value">94.2%</p>
              <p className="se-kpi-label">Pipeline coverage</p>
            </div>
          </div>

          <div className="se-panel se-panel-table" role="region" aria-label="Sample accounts table">
            <div className="se-panel-chrome">
              <span>Accounts</span>
              <span>Sorted by value</span>
            </div>
            <table className="se-table">
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Value</th>
                  <th scope="col">Health</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.account}>
                    <td>{row.account}</td>
                    <td>{row.stage}</td>
                    <td>{row.value}</td>
                    <td>
                      <span className={`se-pill se-pill-${row.health.toLowerCase()}`}>{row.health}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {imageUrl ? <img src={imageUrl} alt="" className="sr-only" /> : null}
        </div>
      </div>
    </section>
  );
}
