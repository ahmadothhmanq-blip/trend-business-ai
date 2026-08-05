"use client";

const DEFAULT_FEATURES = [
  {
    title: "Pipeline intelligence",
    description: "Real-time deal health scoring with AI-powered risk signals across every stage.",
    icon: "01",
    span: "lg:col-span-2",
  },
  {
    title: "Forecast accuracy",
    description: "Unified revenue models aligning sales, finance, and leadership on one source of truth.",
    icon: "02",
    span: "",
  },
  {
    title: "Account expansion",
    description: "Surface upsell opportunities before competitors reach your accounts.",
    icon: "03",
    span: "",
  },
  {
    title: "Executive dashboards",
    description: "Board-ready reporting with drill-down from ARR to rep-level activity in seconds.",
    icon: "04",
    span: "lg:col-span-2",
  },
];

type SaasEnterpriseFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function SaasEnterpriseFeatures({
  eyebrow = "Platform capabilities",
  title = "Built for revenue operations at scale",
  subtitle = "Purpose-built modules from pipeline to post-sale expansion — one command center for your GTM.",
  items = DEFAULT_FEATURES,
}: SaasEnterpriseFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="saas-enterprise-features"
      aria-labelledby="se-features-title"
      className="se-section se-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 max-w-2xl">
          <p className="se-eyebrow mb-3">{eyebrow}</p>
          <h2 id="se-features-title" className="se-headline-sm">
            {title}
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent" aria-hidden />
          <p className="se-body text-muted-foreground mt-5">{subtitle}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`se-card group relative overflow-hidden p-7 sm:p-8 transition-transform duration-500 motion-safe:hover:-translate-y-1 ${item.span ?? ""}`}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div
                className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] blur-2xl transition group-hover:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)]"
                aria-hidden
              />
              <div className="relative mb-5 flex items-center gap-4">
                <span className="se-font-mono flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] to-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-xs font-semibold text-[var(--color-primary)] ring-1 ring-[var(--border-subtle)]">
                  {item.icon ?? String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-gradient-to-r from-[var(--border-default)] to-transparent transition group-hover:from-[var(--color-accent)]"
                  aria-hidden
                />
              </div>
              <h3 className="se-font-display relative text-lg font-bold text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="se-font-body relative mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
