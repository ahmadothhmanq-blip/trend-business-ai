"use client";

type CreativeAgencyPremiumCollaborateCtaProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  email?: string;
};

export function CreativeAgencyPremiumCollaborateCta({
  eyebrow = "Collaborate",
  title = "Let's build something unforgettable",
  subtitle = "We partner with ambitious studios, brands, and institutions ready to invest in work that lasts.",
  primaryCta = "Start a conversation",
  email = "hello@studiovolt.studio",
}: CreativeAgencyPremiumCollaborateCtaProps) {
  return (
    <section
      id="contact"
      data-v2-component="creative-agency-premium-collaborate-cta"
      aria-labelledby="sv-cta-title"
      className="sv-section relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 bg-[var(--color-volt)]/8 blur-[100px]"
        aria-hidden
      />
      <div className="relative px-5 sm:px-8">
        <div className="grid gap-0 border border-[var(--border-volt)] lg:grid-cols-[1fr_auto]">
          <div className="bg-[var(--color-surface)] p-10 lg:p-16">
            <p className="sv-eyebrow">{eyebrow}</p>
            <h2 id="sv-cta-title" className="sv-headline mt-5 max-w-2xl">
              {title}
            </h2>
            <p className="sv-body mt-5 max-w-lg text-lg leading-relaxed opacity-70">{subtitle}</p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <a href={`mailto:${email}`} className="sv-btn-volt">
                {primaryCta}
              </a>
              <a
                href={`mailto:${email}`}
                className="sv-font-mono sv-link-volt text-xs uppercase tracking-widest"
              >
                {email}
              </a>
            </div>
          </div>
          <div
            className="hidden flex-col items-center justify-center border-s border-[var(--border-volt)] bg-[var(--color-volt)] px-12 lg:flex"
            aria-hidden
          >
            <span className="sv-font-display text-[6rem] font-bold leading-none text-[var(--color-primary)]">
              ✦
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
