"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { REF_WORKFLOW } from "@/lib/constants/marketing-content";

export function RefWorkflow() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="workflow"
      className="relative z-10 scroll-mt-28 border-t border-[rgb(212_175_55/0.12)]"
      aria-labelledby="workflow-title"
    >
      <div className="landing-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
              How It Works
            </p>
            <h2
              id="workflow-title"
              className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white"
            >
              From rough idea to organized next steps.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-[#B5B5B5]">
              The workflow is designed for founders, operators, and small teams
              who need fast planning assets without starting from a blank page.
            </p>
          </div>

          <div className="space-y-3">
            {REF_WORKFLOW.map((item, index) => (
              <motion.article
                key={item.step}
                initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="relative rounded-[18px] border border-white/[0.08] bg-[#111111]/72 p-5 backdrop-blur-xl"
              >
                <div className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgb(212_175_55/0.22)] bg-[rgb(212_175_55/0.08)] text-sm font-bold text-[#D4AF37]">
                    {item.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      {index < REF_WORKFLOW.length - 1 ? (
                        <ArrowRight className="mt-1 hidden size-4 shrink-0 text-[#D4AF37]/45 sm:block" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="mt-1 hidden size-4 shrink-0 text-emerald-400/70 sm:block" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#B5B5B5]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
