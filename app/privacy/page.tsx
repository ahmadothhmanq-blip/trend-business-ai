import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How Trend Business AI handles account, profile, and generated business planning data.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information We Collect",
    body: "Trend Business AI collects the account information you provide, such as your email address, profile details, preferences, and uploaded avatar. The app also stores the business ideas, market analyses, reports, and website blueprints you generate.",
  },
  {
    title: "How We Use Information",
    body: "We use your information to authenticate your account, operate your private dashboard, save generated assets, provide exports, and improve the reliability of the MVP experience.",
  },
  {
    title: "AI-Generated Content",
    body: "When AI generation is enabled, prompts and relevant inputs may be sent to the configured AI provider to create business planning outputs. Do not submit confidential, regulated, or sensitive personal information in prompts.",
  },
  {
    title: "Data Storage",
    body: "Account data, generated assets, preferences, and avatar metadata are stored using Supabase services configured for this application. Access is scoped to authenticated users through application checks and database policies.",
  },
  {
    title: "Your Choices",
    body: "You can update your profile, change preferences, delete generated records where supported, and sign out at any time from the dashboard.",
  },
  {
    title: "Beta Notice",
    body: "Trend Business AI is currently an MVP beta. Privacy practices may evolve as billing, team features, analytics, or support workflows are introduced.",
  },
] as const;

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#B5B5B5]">
            Last updated: July 5, 2026. This MVP policy explains the current
            data handling model for Trend Business AI.
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
