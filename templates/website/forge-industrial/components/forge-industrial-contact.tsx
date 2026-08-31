"use client";

type ForgeIndustrialContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
  figureLabel?: string;
};

export function ForgeIndustrialContact({
  eyebrow = "Request for quotation",
  title = "Submit RFQ packet",
  subtitle = "Provide scope, sites, and constraints — engineering responds within one business day.",
  email = "ops@forge.example",
  phone = "+1 (555) 014-2200",
  address = "Global operations — remote-first",
  submitLabel = "Transmit RFQ",
  figureLabel = "FIG. 11 — RFQ FORM",
}: ForgeIndustrialContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="forge-industrial-contact"
      aria-labelledby="fg-contact-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame max-w-3xl">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-contact-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4">{subtitle}</p>

          <dl className="mt-6 grid gap-2 border border-dashed border-[var(--border-default)] p-4 sm:grid-cols-3">
            <div>
              <dt className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Email</dt>
              <dd className="fg-font-mono mt-1 text-sm">
                <a href={`mailto:${email}`} className="fg-focus-ring text-[var(--color-accent)]">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Phone</dt>
              <dd className="fg-font-mono mt-1 text-sm">{phone}</dd>
            </div>
            <div>
              <dt className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Locale</dt>
              <dd className="fg-font-mono mt-1 text-sm">{address}</dd>
            </div>
          </dl>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-surface)] px-3 py-2.5 fg-font-body text-sm fg-focus-ring"
                />
              </label>
              <label className="block">
                <span className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Work email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-surface)] px-3 py-2.5 fg-font-body text-sm fg-focus-ring"
                />
              </label>
            </div>
            <label className="block">
              <span className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Scope notes</span>
              <textarea
                name="message"
                rows={4}
                className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-surface)] px-3 py-2.5 fg-font-body text-sm fg-focus-ring"
              />
            </label>
            <button type="submit" className="fg-btn-primary fg-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
