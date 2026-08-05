"use client";

const DEFAULT_SPECIALTIES = [
  {
    title: "Cardiology",
    description: "Advanced heart care with minimally invasive diagnostics and personalized treatment plans.",
    icon: "♥",
    featured: true,
  },
  {
    title: "Oncology",
    description: "Comprehensive cancer care integrating leading research with compassionate support.",
    icon: "◈",
  },
  {
    title: "Orthopedics",
    description: "Sports medicine, joint replacement, and rehabilitation under one roof.",
    icon: "◇",
  },
  {
    title: "Neurology",
    description: "Brain and spine specialists using the latest imaging and intervention techniques.",
    icon: "◎",
  },
  {
    title: "Women's Health",
    description: "Integrated obstetrics, gynecology, and wellness programs for every life stage.",
    icon: "✿",
  },
  {
    title: "Executive Health",
    description: "Comprehensive annual assessments designed for discerning professionals.",
    icon: "✦",
  },
];

type MedicalPremiumSpecialtiesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; featured?: boolean }>;
};

export function MedicalPremiumSpecialties({
  eyebrow = "Clinical specialties",
  title = "Centers of excellence",
  subtitle = "Multidisciplinary teams collaborating across specialties to deliver coordinated, evidence-based care.",
  items = DEFAULT_SPECIALTIES,
}: MedicalPremiumSpecialtiesProps) {
  return (
    <section
      id="specialties"
      data-v2-component="medical-premium-specialties"
      aria-labelledby="mp-specialties-title"
      className="mp-section bg-[var(--color-surface)]/40 px-5 sm:px-8"
    >
      <header className="mx-auto mb-14 max-w-2xl">
        <p className="mp-eyebrow mb-4">{eyebrow}</p>
        <div className="mp-sage-rule mb-5" aria-hidden />
        <h2 id="mp-specialties-title" className="mp-headline-sm">
          {title}
        </h2>
        <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
      </header>

      <div className="mx-auto grid max-w-[76rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.title}
            className={[
              "mp-card group p-7 motion-safe:animate-[mp-scale-in_0.55s_ease_both]",
              item.featured ? "sm:col-span-2 lg:col-span-2 lg:flex lg:items-center lg:gap-8 lg:p-9" : "",
            ].join(" ")}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span
              className={[
                "flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-healing)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-pearl)]",
                item.featured ? "h-14 w-14 shrink-0 text-2xl" : "h-11 w-11 text-lg",
              ].join(" ")}
              aria-hidden
            >
              {item.icon ?? "◆"}
            </span>
            <div className={item.featured ? "mt-0 lg:mt-0" : "mt-5"}>
              <p className="mp-font-body text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mp-font-display mt-2 text-xl text-[var(--color-foreground)]">{item.title}</h3>
              <p className="mp-font-body mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
