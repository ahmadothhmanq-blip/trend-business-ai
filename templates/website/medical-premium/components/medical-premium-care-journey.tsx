"use client";

const STEPS = [
  { num: "01", title: "Connect", body: "Speak with a care coordinator who listens to your needs and medical history." },
  { num: "02", title: "Assess", body: "Comprehensive evaluation with the right specialist — often within the same week." },
  { num: "03", title: "Treat", body: "Personalized treatment plan delivered with transparency at every step." },
  { num: "04", title: "Follow", body: "Ongoing monitoring and proactive follow-up to support long-term wellness." },
];

type MedicalPremiumCareJourneyProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function MedicalPremiumCareJourney({
  eyebrow = "Your care journey",
  title = "From first call to follow-up",
  subtitle = "A clear, compassionate pathway designed around you — not around paperwork.",
}: MedicalPremiumCareJourneyProps) {
  return (
    <section
      id="care"
      data-v2-component="medical-premium-care-journey"
      aria-labelledby="mp-care-title"
      className="mp-section bg-[var(--color-primary)] px-5 text-[var(--color-pearl)] sm:px-8"
    >
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mp-eyebrow mb-4 text-[var(--color-healing)]">{eyebrow}</p>
        <div className="mp-sage-rule mx-auto mb-5 bg-gradient-to-r from-[var(--color-healing)] to-[var(--color-accent)]" aria-hidden />
        <h2 id="mp-care-title" className="mp-headline-sm text-[var(--color-pearl)]">
          {title}
        </h2>
        <p className="mp-font-body mt-4 text-base leading-relaxed text-white/70">{subtitle}</p>
      </header>

      <ol className="relative mx-auto max-w-[76rem]">
        <span
          className="absolute start-6 top-8 bottom-8 hidden w-px bg-[var(--color-healing)]/30 lg:block"
          aria-hidden
        />
        <div className="grid gap-6 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.num}
              className="relative motion-safe:animate-[mp-gentle-rise_0.6s_ease_both]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <article className="relative rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-colors hover:border-[var(--color-healing)]/40 hover:bg-white/8">
                <span
                  className="mp-font-body absolute -start-0 top-7 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-healing)]/40 bg-[var(--color-primary)] text-xs font-bold tracking-widest text-[var(--color-accent)] lg:-start-6"
                  aria-hidden
                >
                  {step.num}
                </span>
                <div className="lg:ps-8">
                  <h3 className="mp-font-display text-xl text-[var(--color-pearl)]">{step.title}</h3>
                  <p className="mp-font-body mt-3 text-sm leading-relaxed text-white/65">{step.body}</p>
                </div>
              </article>
            </li>
          ))}
        </div>
      </ol>
    </section>
  );
}
