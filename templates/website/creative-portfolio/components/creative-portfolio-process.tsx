"use client";

const STEPS = [
  { phase: "01", title: "Immersion", desc: "Deep discovery — culture, constraints, and the story only insiders know." },
  { phase: "02", title: "Provocation", desc: "Bold concepts that challenge assumptions before a single pixel is placed." },
  { phase: "03", title: "Craft", desc: "Relentless refinement across every medium until the work feels inevitable." },
  { phase: "04", title: "Launch", desc: "Orchestrated rollout with motion, documentation, and cultural momentum." },
];

type CreativePortfolioProcessProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativePortfolioProcess({
  eyebrow = "Process",
  title = "How we move",
}: CreativePortfolioProcessProps) {
  return (
    <section
      id="process"
      data-v2-component="creative-portfolio-process"
      aria-labelledby="cp-process-title"
      className="cp-section border-t border-[var(--border-subtle)]"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-12 lg:mb-16">
          <p className="cp-eyebrow">{eyebrow}</p>
          <h2 id="cp-process-title" className="cp-headline-sm mt-3">
            {title}
          </h2>
        </header>

        <ol className="grid gap-0 border-t border-[var(--border-default)] lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.phase}
              className="border-b border-[var(--border-default)] p-8 lg:border-b-0 lg:border-e lg:last:border-e-0"
            >
              <span className="cp-font-mono text-4xl font-bold text-[var(--color-surface)] lg:text-5xl">
                {step.phase}
              </span>
              <h3 className="cp-font-display mt-4 text-lg font-bold uppercase tracking-tight">
                {step.title}
              </h3>
              <p className="cp-body mt-3 text-sm">{step.desc}</p>
              {i < STEPS.length - 1 ? (
                <span className="cp-font-mono mt-6 hidden text-[var(--color-volt)] lg:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
