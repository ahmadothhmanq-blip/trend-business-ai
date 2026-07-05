import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms for using the Trend Business AI MVP beta.",
  path: "/terms",
});

const sections = [
  {
    title: "Use of the Service",
    body: "Trend Business AI is provided as an MVP beta for business planning, research, reporting, and website blueprint generation. You are responsible for how you use generated outputs and for validating information before making business decisions.",
  },
  {
    title: "Accounts",
    body: "You must provide accurate account information and keep your login credentials secure. Activity performed through your account is your responsibility.",
  },
  {
    title: "AI Outputs",
    body: "AI-generated content may be incomplete, inaccurate, or unsuitable for your specific situation. Outputs are provided for planning assistance and should not be treated as legal, financial, tax, or professional advice.",
  },
  {
    title: "Acceptable Use",
    body: "Do not use the service to submit unlawful, harmful, confidential, regulated, or sensitive personal information. Do not attempt to bypass authentication, rate limits, or security controls.",
  },
  {
    title: "Beta Availability",
    body: "Features, limits, pricing, and availability may change as the product evolves from MVP beta toward production.",
  },
  {
    title: "Limitation of Liability",
    body: "The MVP is provided as-is. To the maximum extent permitted by law, Trend Business AI is not liable for losses resulting from reliance on generated content or service interruptions.",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="landing-container py-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Trend Business AI home">
            <BrandLogo size="sm" variant="nav" />
          </Link>
          <Link href="/" className="text-sm font-medium text-[#B5B5B5] hover:text-white">
            Back to home
          </Link>
        </header>

        <article className="mx-auto mt-14 max-w-3xl rounded-[24px] border border-[rgb(212_175_55/0.18)] bg-[#111111]/80 p-6 shadow-[0_24px_80px_rgb(0_0_0/0.28)] sm:p-8 lg:p-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
            Legal
          </p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em]">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#B5B5B5]">
            Last updated: July 5, 2026. These terms describe the current MVP
            beta usage expectations for Trend Business AI.
          </p>

          <div className="mt-9 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#B5B5B5]">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
