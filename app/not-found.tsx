import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist in Trend Business AI.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-[32px] border border-white/[0.08] bg-white/[0.035] p-8 text-center shadow-[0_24px_90px_rgb(0_0_0/0.45)] backdrop-blur-xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-premium-gold/20 bg-premium-gold/10 text-premium-gold">
          <SearchX className="size-7" />
        </div>
        <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-premium-gold-light uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
          This page is not available.
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/50">
          The route may have moved, or the workspace area may require a different
          link. Return home or open your dashboard to continue.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="btn-gold inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 font-bold text-luxury-black"
          >
            Go Home
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 font-semibold text-white/70 hover:text-white"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

