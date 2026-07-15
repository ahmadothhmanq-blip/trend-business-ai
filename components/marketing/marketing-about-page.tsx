"use client";

import { SiteShell } from "@/components/marketing/site/shell";
import { SiteStats } from "@/components/marketing/site/stats";
import { SiteTrust } from "@/components/marketing/site/trust";
import {
  SiteBody,
  SiteCard,
  SiteCtaBand,
  SitePageHero,
  SiteSectionHead,
} from "@/components/marketing/site/ui";
import { AI_PRODUCT_CATEGORIES } from "@/lib/constants/marketing-content";

const PILLARS = [
  {
    title: "One platform",
    description:
      "Websites, brand, content, marketing, operations and intelligence — unified under Trend Business AI.",
  },
  {
    title: "Premium by design",
    description:
      "Black-and-gold identity, glass surfaces, and dashboard-grade polish across every public surface.",
  },
  {
    title: "Private workspace",
    description:
      "Authenticated dashboards, account-scoped assets, and export-ready outputs for real business work.",
  },
] as const;

export function MarketingAboutPage({ children }: { children?: React.ReactNode }) {
  return (
    <SiteShell>
      <SitePageHero
        eyebrow="About Trend Business AI"
        title="Next-generation business intelligence for founders who move fast."
        description="Trend Business AI is your all-in-one AI platform to build, automate and scale — websites, apps, videos, marketing, projects, CRM, ERP and growth workflows."
        primary={{ label: "Start Free", href: "/signup" }}
        secondary={{ label: "View Products", href: "/#products" }}
      />
      <SiteStats />
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label="Our mission"
            title="One AI company. Every business solution."
            description="We build a premium operating system for modern businesses — not a scattered pile of disconnected tools."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <SiteCard key={p.title}>
                <h3 className="text-xl font-bold text-white">{p.title}</h3>
                <SiteBody className="mt-3 text-[14px]">{p.description}</SiteBody>
              </SiteCard>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label="AI Products"
            title="Four categories. One visual language."
            description="Create, Design, Content and Business — each suite follows the same black-and-gold system."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AI_PRODUCT_CATEGORIES.map((c) => (
              <SiteCard key={c.id} href={c.href} className="p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#D4AF37] uppercase">
                  {c.productCount} products
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">{c.title}</h3>
                <SiteBody className="mt-2 text-[14px]">{c.description}</SiteBody>
              </SiteCard>
            ))}
          </div>
        </div>
      </section>
      <SiteTrust />
      {children}
      <SiteCtaBand
        title="Build with Trend Business AI"
        description="Start free and explore the full Create, Design, Content and Business product suites."
      />
    </SiteShell>
  );
}
