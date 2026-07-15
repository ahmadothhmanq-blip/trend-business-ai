"use client";

import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteStats } from "@/components/marketing/site/stats";
import {
  SiteBody,
  SiteCard,
  SiteCtaBand,
  SitePageHero,
} from "@/components/marketing/site/ui";
import type { PublicSaasPageConfig } from "@/lib/constants/saas-pages";

function resolveHref(label?: string) {
  if (!label) return "/signup";
  const l = label.toLowerCase();
  if (l.includes("pricing")) return "/pricing";
  if (l.includes("contact") || l.includes("sales")) return "/contact";
  if (l.includes("email")) return "mailto:support@trendbusiness.ai";
  if (l.includes("faq")) return "/faq";
  if (l.includes("help") || l.includes("docs") || l.includes("documentation")) return "/docs";
  if (l.includes("dashboard")) return "/dashboard";
  if (l.includes("product")) return "/#products";
  return "/signup";
}

export function PublicSaasPage({
  page,
  children,
}: {
  page: PublicSaasPageConfig;
  children?: React.ReactNode;
}) {
  return (
    <SiteShell>
      <SitePageHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        primary={
          page.primaryCta
            ? { label: page.primaryCta, href: resolveHref(page.primaryCta) }
            : undefined
        }
        secondary={
          page.secondaryCta
            ? { label: page.secondaryCta, href: resolveHref(page.secondaryCta) }
            : undefined
        }
      />
      <SiteStats />
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-3">
            {page.sections.map((section) => (
              <SiteCard key={section.title}>
                <h2 className="text-xl font-bold tracking-[-0.02em] text-white">
                  {section.title}
                </h2>
                <SiteBody className="mt-3 text-[14px]">{section.description}</SiteBody>
                <ul className="mt-6 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-[#C7C7C7]">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </SiteCard>
            ))}
          </div>
        </div>
      </section>
      {children}
      <SiteCtaBand
        title="Ready to build with Trend Business AI?"
        description="Create your free account and explore Create, Design, Content, and Business from one premium AI workspace."
      />
    </SiteShell>
  );
}
