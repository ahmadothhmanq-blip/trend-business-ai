"use client";

const STEPS = [
  { phase: "01", title: "Immersion", desc: "Deep discovery — culture, constraints, and the story only insiders know." },
  { phase: "02", title: "Provocation", desc: "Bold concepts that challenge assumptions before a single pixel is placed." },
  { phase: "03", title: "Craft", desc: "Relentless refinement across every medium until the work feels inevitable." },
  { phase: "04", title: "Launch", desc: "Orchestrated rollout with motion, documentation, and cultural momentum." },
];

type CreativeAgencyPremiumProcessProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativeAgencyPremiumProcess({
  eyebrow = "Process",
  title = "How we move",
}: CreativeAgencyPremiumProcessProps) {
  return (
    <section
      id="process"
      data-v2-component="creative-agency-premium-process"
      aria-labelledby="sv-process-title"
      className="sv-section border-t border-[var(--border-subtle)]"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-14 lg:mb-20">
          <p className="sv-eyebrow">{eyebrow}</p>
          <h2 id="sv-process-title" className="sv-headline-sm mt-4">
            {title}
          </h2>
        </header>

        <ol className="relative grid gap-0 lg:grid-cols-4">
          <div
            className="pointer-events-none absolute top-12 hidden h-px w-full bg-[var(--border-volt)] lg:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <li
              key={step.phase}
              className="relative border-b border-[var(--border-default)] p-8 lg:border-b-0 lg:border-e lg:p-10 lg:last:border-e-0"
            >
              <span className="sv-font-mono sv-index-num relative z-10 inline-flex h-10 w-10 items-center justify-center border border-[var(--color-volt)] bg-[var(--color-background)] text-xs font-bold text-[var(--color-volt)]">
                {step.phase}
              </span>
              <h3 className="sv-font-display mt-6 text-lg font-bold uppercase tracking-tight">
                {step.title}
              </h3>
              <p className="sv-body mt-3 text-base leading-relaxed opacity-70">{step.desc}</p>
              {i < STEPS.length - 1 ? (
                <span className="sv-font-mono mt-8 hidden text-[var(--color-volt)] lg:inline" aria-hidden>
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
