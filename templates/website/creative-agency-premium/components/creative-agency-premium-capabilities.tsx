"use client";

const CAPABILITIES = [
  {
    title: "Brand Systems",
    desc: "Identity architectures that scale across every touchpoint — from signage to motion.",
    tag: "Identity",
    num: "01",
  },
  {
    title: "Spatial Design",
    desc: "Exhibition, retail, and architectural experiences with narrative depth.",
    tag: "Space",
    num: "02",
  },
  {
    title: "Motion & Film",
    desc: "Kinetic storytelling for campaigns, festivals, and product launches.",
    tag: "Motion",
    num: "03",
  },
  {
    title: "Digital Products",
    desc: "Interfaces and platforms built with the same rigor as physical craft.",
    tag: "Digital",
    num: "04",
  },
];

type CreativeAgencyPremiumCapabilitiesProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativeAgencyPremiumCapabilities({
  eyebrow = "Capabilities",
  title = "What we build",
}: CreativeAgencyPremiumCapabilitiesProps) {
  return (
    <section
      data-v2-component="creative-agency-premium-capabilities"
      aria-labelledby="sv-cap-title"
      className="sv-section bg-[var(--color-surface)]"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-14 lg:mb-16">
          <p className="sv-eyebrow">{eyebrow}</p>
          <h2 id="sv-cap-title" className="sv-headline-sm mt-4">
            {title}
          </h2>
        </header>

        <div className="grid gap-px border border-[var(--border-default)] bg-[var(--border-default)] sm:grid-cols-2">
          {CAPABILITIES.map((cap, i) => (
            <article
              key={cap.title}
              className="group relative bg-[var(--color-background)] p-8 transition hover:bg-[var(--color-primary)] lg:p-12"
              style={{ transform: i % 2 === 1 ? "translateY(1rem)" : undefined }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="sv-font-mono sv-index-num text-4xl font-bold text-[var(--color-surface)] transition group-hover:text-[var(--color-volt)]">
                  {cap.num}
                </span>
                <span className="sv-font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-[var(--color-volt)]">
                  {cap.tag}
                </span>
              </div>
              <h3 className="sv-font-display mt-8 text-xl font-bold uppercase tracking-tight lg:text-2xl">
                {cap.title}
              </h3>
              <p className="sv-body mt-4 text-base leading-relaxed opacity-70">{cap.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
