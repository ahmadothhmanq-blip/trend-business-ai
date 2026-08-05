"use client";

const DEFAULT_FEATURES = [
  {
    title: "Liberal arts foundation",
    description: "A rigorous core curriculum that cultivates critical thinking, ethical reasoning, and intellectual breadth across the humanities and sciences.",
    icon: "I",
    span: "lg:col-span-2",
  },
  {
    title: "Research excellence",
    description: "Faculty-led laboratories and interdisciplinary institutes where undergraduates contribute to published scholarship from their first year.",
    icon: "II",
    span: "",
  },
  {
    title: "Global immersion",
    description: "Study abroad programs, international fellowships, and a diverse campus community spanning 80+ countries.",
    icon: "III",
    span: "",
  },
  {
    title: "Career pathways",
    description: "Dedicated career services, alumni mentorship networks, and industry partnerships that connect graduates to leading organizations worldwide.",
    icon: "IV",
    span: "lg:col-span-2",
  },
];

type EducationPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function EducationPremiumFeatures({
  eyebrow = "Academic programs",
  title = "An education designed for intellectual depth",
  subtitle = "From foundational coursework to advanced research, every program is built on scholarly rigor and real-world relevance.",
  items = DEFAULT_FEATURES,
}: EducationPremiumFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="education-premium-features"
      aria-labelledby="ed-features-title"
      className="ed-section ed-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 max-w-2xl">
          <p className="ed-eyebrow mb-3">{eyebrow}</p>
          <h2 id="ed-features-title" className="ed-headline-sm">
            {title}
          </h2>
          <div className="ed-accent-line mt-4" aria-hidden />
          <p className="ed-body mt-5">{subtitle}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`ed-card group relative overflow-hidden p-7 sm:p-8 ${item.span ?? ""}`}
            >
              <div
                className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] blur-2xl transition group-hover:bg-[color-mix(in_srgb,var(--color-signal)_16%,transparent)]"
                aria-hidden
              />
              <div className="relative mb-5 flex items-center gap-4">
                <span className="ed-font-display flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] to-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-xs font-semibold text-[var(--color-primary)] ring-1 ring-[var(--border-subtle)]">
                  {item.icon ?? String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-gradient-to-r from-[var(--border-default)] to-transparent transition group-hover:from-[var(--color-signal)]"
                  aria-hidden
                />
              </div>
              <h3 className="ed-font-display relative text-lg font-semibold text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="ed-font-body relative mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
