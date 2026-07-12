"use client";

import { SiteShell } from "@/components/marketing/site/shell";
import {
  SiteBody,
  SiteEyebrow,
  SiteH1,
} from "@/components/marketing/site/ui";

export function MarketingLegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly { title: string; body: string }[];
}) {
  return (
    <SiteShell>
      <section className="landing-container pt-[108px] pb-20 lg:pt-[124px] lg:pb-28">
        <article className="mx-auto max-w-3xl rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
          <SiteEyebrow>{eyebrow}</SiteEyebrow>
          <SiteH1 className="mt-5">{title}</SiteH1>
          <SiteBody className="mt-4">{intro}</SiteBody>
          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                <SiteBody className="mt-3 text-[14px]">{section.body}</SiteBody>
              </section>
            ))}
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
