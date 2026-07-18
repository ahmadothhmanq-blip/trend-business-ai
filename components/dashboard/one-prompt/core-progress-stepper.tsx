"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CORE_UX_STEPS,
  stepIndex,
  type CoreUxStepId,
} from "@/components/dashboard/one-prompt/steps";

export function CoreProgressStepper({
  currentStep,
  className,
  compact = false,
}: {
  currentStep: CoreUxStepId;
  className?: string;
  compact?: boolean;
}) {
  const activeIndex = stepIndex(currentStep);

  return (
    <ol
      className={cn(
        "grid gap-2",
        compact
          ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7",
        className,
      )}
      aria-label="Generation progress"
    >
      {CORE_UX_STEPS.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition-colors",
              done && "border-emerald-400/25 bg-emerald-400/[0.06]",
              active && "border-premium-gold/40 bg-premium-gold/[0.08]",
              !done && !active && "border-white/[0.08] bg-white/[0.02]",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  done && "bg-emerald-400/20 text-emerald-300",
                  active && "bg-premium-gold/20 text-premium-gold-light",
                  !done && !active && "bg-white/10 text-white/40",
                )}
              >
                {done ? <Check className="size-3" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-[12px] font-semibold",
                  done && "text-emerald-200/90",
                  active && "text-premium-gold-light",
                  !done && !active && "text-white/45",
                )}
              >
                {step.label}
              </span>
            </div>
            {!compact && (
              <p className="mt-1 pl-7 text-[11px] leading-snug text-white/35">
                {step.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
