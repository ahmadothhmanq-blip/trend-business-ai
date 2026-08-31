"use client";

const ALLIANCES = [
  { name: "Cloud platforms", detail: "AWS, Azure, and GCP implementation partners" },
  { name: "ERP & finance", detail: "SAP, Oracle, and Workday ecosystems" },
  { name: "Data & analytics", detail: "Snowflake, Databricks, and BI stacks" },
  { name: "Cyber & risk", detail: "Big Four and specialist security firms" },
  { name: "Industry networks", detail: "Sector benchmarks across 12 industries" },
  { name: "Academic research", detail: "MIT, INSEAD, and LBS thought leadership" },
];

export function CorporateBusinessIntegrations() {
  return (
    <section id="platform" data-v2-component="corporate-business-integrations" aria-labelledby="cb-alliances-title" className="df-reveal py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="cb-eyebrow">Ecosystem</p>
          <h2 id="cb-alliances-title" className="cb-headline-sm mt-2">Alliance network</h2>
          <p className="cb-body mt-4 text-[var(--color-muted)]">We orchestrate best-in-class partners — you get one accountable team.</p>
        </header>
        <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALLIANCES.map((item) => (
            <article key={item.name} className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-surface)] p-6">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
