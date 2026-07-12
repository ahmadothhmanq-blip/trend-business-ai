import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";
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
    <MarketingLegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Last updated: July 5, 2026. This MVP policy explains the current data handling model for Trend Business AI."
      sections={sections}
    />
  );
}
