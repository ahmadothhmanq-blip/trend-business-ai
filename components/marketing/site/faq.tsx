"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_FAQ } from "@/lib/constants/marketing-content";
import { SiteSectionHead } from "@/components/marketing/site/ui";
import { cn } from "@/lib/utils";

/** FAQ — accordion in the same black/gold language. */
export function SiteFaq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="faq-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="faq-title"
          label="FAQ"
          title="Answers before you start."
          description="Everything you need to know about products, privacy, beta access and exports."
        />
        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {REF_FAQ.map((item, index) => {
            const isOpen = open === index;
            return (
              <motion.div
                key={item.question}
                initial={reduce ? undefined : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-[#111111] transition-colors",
                  isOpen
                    ? "border-[rgba(212,175,55,0.36)] shadow-[0_16px_50px_rgba(212,175,55,0.08)]"
                    : "border-[rgba(212,175,55,0.16)]",
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span className="text-[15px] font-semibold text-white sm:text-[16px]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[#D4AF37] transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[rgba(212,175,55,0.1)] px-5 pb-5 pt-4 text-[14px] leading-[1.75] text-[#B5B5B5] sm:px-6 sm:pb-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
