"use client";

type LuminaWellnessContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function LuminaWellnessContact({
  eyebrow = "Visit",
  title = "Begin when you are ready",
  subtitle = "Share a quiet note — we respond gently within one business day.",
  email = "hello@lumina.example",
  phone = "+1 (555) 018-4400",
  address = "By appointment · calm rooms",
  submitLabel = "Send gently",
}: LuminaWellnessContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="lumina-wellness-contact"
      aria-labelledby="lu-contact-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-md px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-contact-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4">{subtitle}</p>

        <dl className="mt-8 space-y-3 text-sm text-[var(--color-muted)]">
          <div>
            <dt className="sr-only">Email</dt>
            <dd>
              <a href={`mailto:${email}`} className="lu-focus-ring text-[var(--color-accent)]">
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Phone</dt>
            <dd>{phone}</dd>
          </div>
          <div>
            <dt className="sr-only">Address</dt>
            <dd>{address}</dd>
          </div>
        </dl>

        <form className="mt-10 space-y-4 text-start" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="lu-font-body text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">Name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="mt-2 w-full rounded-full border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] px-5 py-3 text-sm lu-focus-ring"
            />
          </label>
          <label className="block">
            <span className="lu-font-body text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-2 w-full rounded-full border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] px-5 py-3 text-sm lu-focus-ring"
            />
          </label>
          <label className="block">
            <span className="lu-font-body text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">Note</span>
            <textarea
              name="message"
              rows={4}
              className="mt-2 w-full rounded-[1.75rem] border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] px-5 py-3 text-sm lu-focus-ring"
            />
          </label>
          <div className="pt-2 text-center">
            <button type="submit" className="lu-btn-primary lu-focus-ring">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
