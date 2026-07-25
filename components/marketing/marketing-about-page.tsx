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
import { useScopedT } from "@/lib/i18n/use-scoped-t";

export function MarketingAboutPage({ children }: { children?: React.ReactNode }) {
  const t = useScopedT("marketing.about");
  const tCat = useScopedT("marketing.categories");
  const tCta = useScopedT("marketing.cta");
  const tCommon = useScopedT("marketing.common");

  return (
    <SiteShell>
      <SitePageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        primary={{ label: tCommon("startFree"), href: "/signup" }}
        secondary={{ label: t("viewProducts"), href: "/#products" }}
      />
      <SiteStats />
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label={t("mission.label")}
            title={t("mission.title")}
            description={t("mission.description")}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <SiteCard key={index}>
                <h3 className="text-xl font-bold text-white">{t(`pillars.${index}.title`)}</h3>
                <SiteBody className="mt-3 text-[14px]">{t(`pillars.${index}.description`)}</SiteBody>
              </SiteCard>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label={t("aiProducts.label")}
            title={t("aiProducts.title")}
            description={t("aiProducts.description")}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AI_PRODUCT_CATEGORIES.map((c) => (
              <SiteCard key={c.id} href={c.href} className="p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#D4AF37] uppercase">
                  {tCommon("productsCount", { count: c.productCount })}
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">{tCat(`${c.id}.title`)}</h3>
                <SiteBody className="mt-2 text-[14px]">{tCat(`${c.id}.description`)}</SiteBody>
              </SiteCard>
            ))}
          </div>
        </div>
      </section>
      <SiteTrust />
      {children}
      <SiteCtaBand
        title={tCta("buildWithPlatform")}
        description={tCta("buildWithPlatformDescription")}
      />
    </SiteShell>
  );
}
