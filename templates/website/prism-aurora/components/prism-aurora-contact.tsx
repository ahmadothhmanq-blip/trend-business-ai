"use client";

type PrismAuroraContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function PrismAuroraContact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email = "hello@example.com",
  phone = "+1 (555) 000-0000",
  address = "Global offices — remote-first",
  submitLabel = "Send message",
}: PrismAuroraContactProps) {
  return (
    <section id="contact" data-v2-component="prism-aurora-contact" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="pr-mosaic mx-auto max-w-[88rem]">
        <article className="pr-tile pr-tile-brand pr-span-5 pr-row-2 flex flex-col justify-between gap-8">
          <div>
            <p className="pr-eyebrow">{eyebrow}</p>
            <h2 className="pr-headline-sm mt-3">{title}</h2>
            <p className="pr-body mt-4">{subtitle}</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="pr-eyebrow">Email</dt>
              <dd className="mt-1 font-medium">
                <a href={`mailto:${email}`} className="pr-focus-ring">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="pr-eyebrow">Phone</dt>
              <dd className="mt-1 font-medium">{phone}</dd>
            </div>
            <div>
              <dt className="pr-eyebrow">Studio</dt>
              <dd className="mt-1 font-medium">{address}</dd>
            </div>
          </dl>
        </article>
        <article className="pr-tile pr-span-7 pr-row-2">
          <form className="flex h-full flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Full name" aria-label="Full name" className="pr-input" />
              <input type="email" placeholder="Work email" aria-label="Email" className="pr-input" />
            </div>
            <textarea placeholder="How can we help?" aria-label="Message" rows={5} className="pr-textarea flex-1" />
            <button type="submit" className="pr-btn-primary pr-focus-ring self-start">
              {submitLabel}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
