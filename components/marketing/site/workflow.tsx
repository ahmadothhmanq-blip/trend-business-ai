"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { REF_WORKFLOW, REF_WORKFLOW_ART } from "@/lib/constants/marketing-content";
import { SiteSectionHead } from "@/components/marketing/site/ui";

/** How It Works — four illustrated steps. */
export function SiteWorkflow() {
  const reduce = useReducedMotion();

  return (
    <section
      id="workflow"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="workflow-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="workflow-title"
          label="How It Works"
          title="From brief to export in four steps."
          description="A clean workflow for founders and operators who need premium AI output without a complicated setup."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {REF_WORKFLOW.map((item, index) => (
            <motion.article
              key={item.step}
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-[rgba(212,175,55,0.42)] hover:shadow-[0_28px_90px_rgba(212,175,55,0.1)] sm:p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent" />
              <div className="relative mb-5 overflow-hidden rounded-xl border border-[rgba(212,175,55,0.14)] bg-[#050505]">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(212,175,55,0.16),transparent_50%)]" />
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={REF_WORKFLOW_ART[index]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.1)] text-[12px] font-bold text-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.15)]">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
