"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OfficialLogo } from "@/components/marketing/official-logo";
import {
  REF_FOOTER_COMPANY,
  REF_FOOTER_NEWSLETTER,
  REF_FOOTER_RESOURCES,
  REF_FOOTER_SERVICES_LINKS,
  REF_FOOTER_TAGLINE,
  REF_LEGAL,
} from "@/lib/constants/marketing-content";

function Col({
  title,
  items,
}: {
  title: string;
  items: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-white sm:text-[14px]">{title}</p>
      <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
        {items.map((item) => (
          <li key={`${title}-${item.label}`}>
            <Link
              href={item.href}
              className="text-[13px] text-[#7A7A7A] transition-colors hover:text-white sm:text-[14px]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/growth/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter", honeypot }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Subscribe failed");
      toast.success("You are subscribed.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscribe failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="mt-4 flex items-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.2)] bg-[#111111] sm:mt-5"
      onSubmit={onSubmit}
    >
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />
      <label htmlFor="site-newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="site-newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-[#5A5A5A] sm:py-3"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Subscribe"
        className="m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#FFD700,#D4AF37)] text-[#111111] hover:brightness-110 disabled:opacity-60 sm:m-1.5 sm:size-9"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ArrowRight className="size-3.5 sm:size-4" />
        )}
      </button>
    </form>
  );
}

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z",
  },
] as const;

/** Reference footer — crest watermark, columns, newsletter, legal bar. */
export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-[rgba(212,175,55,0.1)] bg-[#050505]">
      <div
        className="pointer-events-none absolute -right-6 bottom-[-120px] size-[380px] opacity-[0.09] sm:size-[520px] lg:-right-2 lg:size-[600px] lg:opacity-[0.11]"
        aria-hidden="true"
      >
        <Image
          src="/images/brand/trend-business-icon.png"
          alt=""
          fill
          className="object-contain object-bottom"
        />
      </div>

      <div className="landing-container relative py-14 lg:py-[72px]">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_repeat(3,0.85fr)_1.15fr] lg:gap-8 xl:gap-10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <OfficialLogo compact size="md" />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                <span className="text-white">Trend Business </span>
                <span className="text-[#D4AF37]">AI</span>
              </span>
            </div>
            <p className="mt-5 text-[13px] leading-[1.7] text-[#7A7A7A] sm:mt-6 sm:text-[14px] sm:leading-[1.75]">
              {REF_FOOTER_TAGLINE}
            </p>
            <div className="mt-6 flex items-center gap-2.5 sm:mt-7 sm:gap-3">
              {SOCIAL.map(({ label, href, d }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[#111111] text-[#9A9A9A] transition-colors hover:border-[rgba(212,175,55,0.35)] hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5 fill-none stroke-current"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <Col title="Services" items={REF_FOOTER_SERVICES_LINKS} />
          <Col title="Company" items={REF_FOOTER_COMPANY} />
          <Col title="Resources" items={REF_FOOTER_RESOURCES} />

          <div>
            <p className="text-[13px] font-semibold text-white sm:text-[14px]">Newsletter</p>
            <p className="mt-4 text-[13px] leading-[1.7] text-[#7A7A7A] sm:mt-5 sm:text-[14px]">
              {REF_FOOTER_NEWSLETTER}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.08)] pt-6 sm:mt-14 sm:pt-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] text-[#5A5A5A] sm:text-[13px]">
              © {new Date().getFullYear()} Trend Business AI. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-6">
              {REF_LEGAL.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[12px] text-[#5A5A5A] transition-colors hover:text-white sm:text-[13px]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
