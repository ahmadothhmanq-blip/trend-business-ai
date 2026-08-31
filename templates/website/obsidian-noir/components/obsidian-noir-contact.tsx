"use client";

type ObsidianNoirContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function ObsidianNoirContact({
  eyebrow = "Contact",
  title = "Begin a private conversation",
  subtitle = "Tell us briefly what you seek. We respond with care, not automation theatre.",
  email = "hello@example.com",
  phone = "+1 (555) 000-0000",
  address = "By appointment",
  submitLabel = "Send",
}: ObsidianNoirContactProps) {
  return (
    <section id="contact" data-v2-component="obsidian-noir-contact" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <hr className="ob-rule mb-16" />
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="ob-eyebrow">{eyebrow}</p>
            <h2 className="ob-headline-sm mt-4 max-w-[12ch]">{title}</h2>
            <p className="ob-body mt-6 max-w-md">{subtitle}</p>
            <dl className="mt-12 space-y-6 text-sm">
              <div>
                <dt className="ob-eyebrow">Email</dt>
                <dd className="mt-2">
                  <a href={`mailto:${email}`} className="ob-focus-ring text-[var(--color-foreground)]">
                    {email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="ob-eyebrow">Phone</dt>
                <dd className="mt-2 text-[var(--color-foreground)]">{phone}</dd>
              </div>
              <div>
                <dt className="ob-eyebrow">Studio</dt>
                <dd className="mt-2 text-[var(--color-foreground)]">{address}</dd>
              </div>
            </dl>
          </div>
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Full name" aria-label="Full name" className="ob-input" />
            <input type="email" placeholder="Email" aria-label="Email" className="ob-input" />
            <textarea placeholder="A brief note" aria-label="Message" rows={4} className="ob-textarea" />
            <button type="submit" className="ob-btn-primary ob-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
