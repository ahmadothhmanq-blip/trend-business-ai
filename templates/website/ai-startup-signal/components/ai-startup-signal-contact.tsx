"use client";

type AiStartupSignalContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
};

export function AiStartupSignalContact({
  eyebrow = "Get access",
  title = "Request a platform walkthrough",
  subtitle = "Tell us about your inference stack — our solutions team responds within one business day.",
  submitLabel = "Request access",
}: AiStartupSignalContactProps) {
  return (
    <section id="contact" data-v2-component="ai-startup-signal-contact" aria-labelledby="as-contact-title" className="df-reveal as-section-glow py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-[1fr_1.2fr] sm:px-8">
        <div>
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-contact-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
          <ul className="mt-8 space-y-3 text-sm text-[var(--color-muted)]">
            {["Architecture review", "Live routing demo", "Security & compliance pack"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)]" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm">
            <a href="mailto:hello@signal.ai" className="text-[var(--color-accent)] hover:underline">
              hello@signal.ai
            </a>
          </p>
        </div>

        <form className="as-glass-card space-y-4 rounded-xl border border-[var(--border-signal)] p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
          <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Full name" aria-label="Full name" className="rounded-lg border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm as-focus-ring" />
            <input type="email" placeholder="Work email" aria-label="Email" className="rounded-lg border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm as-focus-ring" />
          </div>
          <input type="text" placeholder="Company" aria-label="Company" className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm as-focus-ring" />
          <textarea placeholder="Models, regions, compliance requirements…" aria-label="Message" rows={4} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm as-focus-ring" />
          <button type="submit" className="as-btn-primary as-focus-ring">{submitLabel}</button>
        </form>
      </div>
    </section>
  );
}
