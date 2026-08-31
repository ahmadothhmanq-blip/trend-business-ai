"use client";

const OFFICES = [
  { city: "New York", label: "Americas" },
  { city: "London", label: "EMEA" },
  { city: "Singapore", label: "APAC" },
  { city: "Tokyo", label: "Japan" },
];

type CreativeAgencyPremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryCta?: string;
};

export function CreativeAgencyPremiumAbout({
  eyebrow = "Studio",
  title = "Independent by design",
  body = "Volt is a creative studio for leadership teams who believe design is a competitive advantage. We partner on identity, product, and launch — with the same standard of craft whether you're entering one market or twelve.",
  primaryCta = "Meet the team",
}: CreativeAgencyPremiumAboutProps) {
  return (
    <section id="about" data-v2-component="creative-agency-premium-about" className="df-reveal py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[88rem] gap-16 px-5 lg:grid-cols-2 lg:items-start sm:px-8">
        <div>
          <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">{eyebrow}</p>
          <h2 className="sv-font-display mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--color-ghost)] [text-transform:none]">
            {title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--color-muted)]">{body}</p>
          <a href="#contact" className="sv-btn-ghost sv-focus-ring mt-8 inline-flex">{primaryCta}</a>
        </div>
        <div className="border border-[var(--border-default)] p-8 sm:p-10">
          <p className="sv-font-mono text-[0.6875rem] tracking-[0.2em] text-[var(--color-muted)]">GLOBAL STUDIOS</p>
          <ul className="mt-8 space-y-0 divide-y divide-[var(--border-subtle)]">
            {OFFICES.map((o) => (
              <li key={o.city} className="flex items-baseline justify-between py-4">
                <span className="sv-font-display text-lg font-medium text-[var(--color-ghost)] [text-transform:none]">{o.city}</span>
                <span className="text-sm text-[var(--color-muted)]">{o.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
