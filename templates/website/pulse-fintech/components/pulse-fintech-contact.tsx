"use client";

type PulseFintechContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function PulseFintechContact({
  eyebrow = "Secure inquiry",
  title = "Request desk access",
  subtitle = "Payments engineering responds within one business day with sandbox credentials.",
  email = "hello@example.com",
  phone = "+1 (555) 000-0000",
  address = "Global desks — follow-the-sun",
  submitLabel = "Submit request",
}: PulseFintechContactProps) {
  return (
    <section id="contact" data-v2-component="pulse-fintech-contact" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="pu-desk mx-auto max-w-[96rem]">
        <div className="pu-panel">
          <div className="pu-panel-head">
            <span>CONTACT // CHANNELS</span>
            <span className="inline-flex items-center gap-2">
              <span className="pu-live-dot" aria-hidden />
              OPEN
            </span>
          </div>
          <div className="pu-panel-body space-y-5">
            <div>
              <p className="pu-eyebrow">{eyebrow}</p>
              <h2 className="pu-headline-sm mt-2">{title}</h2>
              <p className="pu-body mt-3">{subtitle}</p>
            </div>
            <dl className="space-y-3 font-mono text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--color-muted)]">email</dt>
                <dd>
                  <a href={`mailto:${email}`} className="pu-focus-ring text-[var(--color-accent)]">
                    {email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--color-muted)]">phone</dt>
                <dd className="text-[var(--color-foreground)]">{phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted)]">desks</dt>
                <dd className="text-end text-[var(--color-foreground)]">{address}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="pu-panel">
          <div className="pu-panel-head">
            <span>FORM // ACCESS</span>
            <span>TLS</span>
          </div>
          <form className="pu-panel-body space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Full name" aria-label="Full name" className="pu-input" />
            <input type="email" placeholder="Work email" aria-label="Email" className="pu-input" />
            <textarea placeholder="Volume, corridors, compliance needs" aria-label="Message" rows={4} className="pu-textarea" />
            <button type="submit" className="pu-btn-primary pu-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
