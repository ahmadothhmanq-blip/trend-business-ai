import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MouseProvider } from "@/components/marketing/motion/mouse-provider";
import { RefBackground } from "@/components/marketing/ref-background";
import { RefHeader } from "@/components/marketing/ref-header";
import { RefFooter } from "@/components/marketing/ref-footer";
import type { PublicSaasPageConfig } from "@/lib/constants/saas-pages";

type PublicSaasPageProps = {
  page: PublicSaasPageConfig;
};

function resolveHref(label?: string) {
  if (!label) return "/signup";
  if (label.toLowerCase().includes("pricing")) return "/pricing";
  if (label.toLowerCase().includes("contact") || label.toLowerCase().includes("sales")) return "/contact";
  if (label.toLowerCase().includes("faq")) return "/faq";
  if (label.toLowerCase().includes("help")) return "/docs";
  if (label.toLowerCase().includes("dashboard")) return "/dashboard";
  if (label.toLowerCase().includes("email")) return "mailto:support@trendbusiness.ai";
  return "/signup";
}

export function PublicSaasPage({ page }: PublicSaasPageProps) {
  return (
    <MouseProvider>
      <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
        <RefBackground />
        <RefHeader />
        <main className="relative z-10">
          <section className="landing-container pt-32 pb-16 sm:pt-36 lg:pt-40">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-premium-gold-light uppercase">
                {page.eyebrow}
              </p>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                {page.title}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
                {page.description}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {page.primaryCta && (
                  <Link
                    href={resolveHref(page.primaryCta)}
                    className="btn-gold inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 font-bold text-luxury-black"
                  >
                    {page.primaryCta}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {page.secondaryCta && (
                  <Link
                    href={resolveHref(page.secondaryCta)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 font-semibold text-white/75 transition-colors hover:border-premium-gold/25 hover:text-white"
                  >
                    {page.secondaryCta}
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="landing-container pb-20">
            <div className="grid gap-5 lg:grid-cols-3">
              {page.sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 shadow-[0_24px_80px_rgb(0_0_0/0.28)] backdrop-blur-xl transition-all duration-300 hover:border-premium-gold/25 hover:bg-premium-gold/[0.04]"
                >
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-white">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    {section.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-white/65">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-premium-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>
        <RefFooter />
      </div>
    </MouseProvider>
  );
}

