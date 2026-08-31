"use client";

type CitadelTrustContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function CitadelTrustContact({
  eyebrow = "Confidential intake",
  title = "Engage our firm",
  subtitle = "Describe your matter in confidence. A partner will respond within one business day.",
  email = "intake@citadel-law.com",
  phone = "+1 (212) 555-0140",
  address = "New York · London · Singapore · Washington",
  submitLabel = "Submit inquiry",
}: CitadelTrustContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="citadel-trust-contact"
      aria-labelledby="ct-contact-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            Engagement request
          </p>
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-contact-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Email</dt>
              <dd className="mt-1 text-sm">
                <a href={`mailto:${email}`} className="ct-focus-ring text-[var(--color-accent)]">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Phone</dt>
              <dd className="mt-1 text-sm">{phone}</dd>
            </div>
            <div>
              <dt className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Offices</dt>
              <dd className="mt-1 text-sm">{address}</dd>
            </div>
          </dl>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm ct-focus-ring"
                />
              </label>
              <label className="block">
                <span className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Work email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm ct-focus-ring"
                />
              </label>
            </div>
            <label className="block">
              <span className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Organization</span>
              <input
                type="text"
                name="organization"
                className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm ct-focus-ring"
              />
            </label>
            <label className="block">
              <span className="ct-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Matter summary</span>
              <textarea
                name="message"
                rows={5}
                className="mt-1 w-full border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm ct-focus-ring"
              />
            </label>
            <button type="submit" className="ct-btn-primary ct-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
