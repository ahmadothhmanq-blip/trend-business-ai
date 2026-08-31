"use client";

export function CorporateBusinessUtilityBand() {
  return (
    <section id="cta-band" data-v2-component="corporate-business-utility-band" aria-labelledby="cb-utility-title" className="df-reveal bg-[var(--color-primary)] py-20 sm:py-28">
      <div className="mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="cb-eyebrow text-[var(--color-accent)]">Next step</p>
          <h2 id="cb-utility-title" className="cb-headline-sm mt-3 text-white text-balance">Ready to transform how you compete?</h2>
          <p className="mt-4 text-sm text-white/75">A confidential discussion with an Atlas partner — no obligation.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#contact" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-primary)] cb-focus-ring">Schedule consultation</a>
          <a href="#portfolio" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] border border-white/30 px-6 text-sm font-semibold text-white cb-focus-ring">View case studies</a>
        </div>
      </div>
    </section>
  );
}
