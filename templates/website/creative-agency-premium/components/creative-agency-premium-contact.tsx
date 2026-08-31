"use client";

export function CreativeAgencyPremiumContact() {
  return (
    <section id="contact" data-v2-component="creative-agency-premium-contact" className="df-reveal border-t border-[var(--border-default)] py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[88rem] gap-14 px-5 lg:grid-cols-2 sm:px-8">
        <div>
          <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">INQUIRE</p>
          <h2 className="sv-font-display mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--color-ghost)] [text-transform:none]">
            Tell us about your project
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            We respond within two business days.{" "}
            <a href="mailto:hello@volt.studio" className="text-[var(--color-ghost)] underline underline-offset-4">hello@volt.studio</a>
          </p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
            <input aria-label="Name" placeholder="Name" className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 text-sm sv-focus-ring" />
            <input aria-label="Email" type="email" placeholder="Email" className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 text-sm sv-focus-ring" />
          </div>
          <input aria-label="Company" placeholder="Company" className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 text-sm sv-focus-ring" />
          <textarea aria-label="Message" rows={5} placeholder="Project overview, timeline, markets…" className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 text-sm sv-focus-ring" />
          <button type="submit" className="sv-btn-volt sv-focus-ring">Send inquiry</button>
        </form>
      </div>
    </section>
  );
}
