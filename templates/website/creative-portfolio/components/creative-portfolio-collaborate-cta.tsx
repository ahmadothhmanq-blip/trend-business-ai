"use client";

type CreativePortfolioCollaborateCtaProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  email?: string;
};

export function CreativePortfolioCollaborateCta({
  eyebrow = "Collaborate",
  title = "Let's build something unforgettable",
  subtitle = "We partner with ambitious studios, brands, and institutions ready to invest in work that lasts.",
  primaryCta = "Start a conversation",
  email = "hello@kineticatelier.studio",
}: CreativePortfolioCollaborateCtaProps) {
  return (
    <section
      id="contact"
      data-v2-component="creative-portfolio-collaborate-cta"
      aria-labelledby="cp-cta-title"
      className="cp-section relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--color-volt)_0%,transparent_40%)] opacity-[0.07]"
        aria-hidden
      />
      <div className="relative px-5 sm:px-8">
        <div className="border border-[var(--border-volt)] bg-[var(--color-surface)] p-10 lg:p-16">
          <p className="cp-eyebrow">{eyebrow}</p>
          <h2 id="cp-cta-title" className="cp-headline mt-4 max-w-2xl">
            {title}
          </h2>
          <p className="cp-body mt-4 max-w-lg">{subtitle}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href={`mailto:${email}`} className="cp-btn-volt">
              {primaryCta}
            </a>
            <a
              href={`mailto:${email}`}
              className="cp-font-mono cp-link-volt text-xs uppercase tracking-widest"
            >
              {email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
