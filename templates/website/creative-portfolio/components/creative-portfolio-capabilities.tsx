"use client";

const CAPABILITIES = [
  {
    title: "Brand Systems",
    desc: "Identity architectures that scale across every touchpoint — from signage to motion.",
    tag: "Identity",
  },
  {
    title: "Spatial Design",
    desc: "Exhibition, retail, and architectural experiences with narrative depth.",
    tag: "Space",
  },
  {
    title: "Motion & Film",
    desc: "Kinetic storytelling for campaigns, festivals, and product launches.",
    tag: "Motion",
  },
  {
    title: "Digital Products",
    desc: "Interfaces and platforms built with the same rigor as physical craft.",
    tag: "Digital",
  },
];

type CreativePortfolioCapabilitiesProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativePortfolioCapabilities({
  eyebrow = "Capabilities",
  title = "What we build",
}: CreativePortfolioCapabilitiesProps) {
  return (
    <section
      data-v2-component="creative-portfolio-capabilities"
      aria-labelledby="cp-cap-title"
      className="cp-section"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-12">
          <p className="cp-eyebrow">{eyebrow}</p>
          <h2 id="cp-cap-title" className="cp-headline-sm mt-3">
            {title}
          </h2>
        </header>

        <div className="grid gap-px border border-[var(--border-default)] bg-[var(--border-default)] sm:grid-cols-2">
          {CAPABILITIES.map((cap, i) => (
            <article
              key={cap.title}
              className="group bg-[var(--color-background)] p-8 transition hover:bg-[var(--color-surface)] lg:p-10"
              style={{ transform: i % 2 === 1 ? "translateY(0.5rem)" : undefined }}
            >
              <span className="cp-font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-volt)]">
                {cap.tag}
              </span>
              <h3 className="cp-font-display mt-4 text-xl font-bold uppercase tracking-tight lg:text-2xl">
                {cap.title}
              </h3>
              <p className="cp-body mt-3 text-sm">{cap.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
