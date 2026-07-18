"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { CoreProgressStepper } from "@/components/dashboard/one-prompt/core-progress-stepper";
import { CORE_UX_STEPS } from "@/components/dashboard/one-prompt/steps";
import type { OnePromptProductConfig } from "@/lib/constants/one-prompt-products";
import { cn } from "@/lib/utils";

type OnePromptExperienceProps = {
  product: OnePromptProductConfig;
  /** Controlled prompt (optional) */
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (idea: string) => void;
  submitting?: boolean;
  /** Show static pipeline preview under the input */
  showPipelinePreview?: boolean;
  className?: string;
  /** Compact header for embedding inside existing tools */
  compact?: boolean;
};

export function OnePromptExperience({
  product,
  value,
  onChange,
  onSubmit,
  submitting = false,
  showPipelinePreview = true,
  className,
  compact = false,
}: OnePromptExperienceProps) {
  const [internal, setInternal] = useState("");
  const prompt = value ?? internal;
  const setPrompt = onChange ?? setInternal;

  return (
    <DashboardPanel className={cn("p-5 sm:p-6", className)}>
      {!compact && (
        <div className="mb-5 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-premium-gold uppercase">
            One Prompt Experience
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-white">
            {product.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-white/50">
            {product.valueProposition}
          </p>
        </div>
      )}

      <label className="mb-1.5 block text-xs font-medium text-white/60">
        Your business idea
      </label>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={product.placeholder}
        rows={compact ? 3 : 4}
        disabled={submitting}
        className={cn(dashboardInputClass, "min-h-[88px] resize-none")}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {product.examples.map((example) => (
          <button
            key={example.label}
            type="button"
            disabled={submitting}
            onClick={() => setPrompt(example.prompt)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/55 transition-colors hover:border-premium-gold/30 hover:text-premium-gold-light disabled:opacity-50"
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={submitting || !prompt.trim()}
          onClick={() => onSubmit(prompt.trim())}
          className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
        >
          {submitting ? (
            <>
              <Sparkles className="size-4 animate-pulse" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> {product.ctaLabel}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
        <p className="text-[12px] text-white/35">
          AI guides Idea → Strategy → Design → Assets → Generation → Quality → Ready
        </p>
      </div>

      {showPipelinePreview && (
        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="mb-3 text-[12px] font-medium text-white/40">
            Creation pipeline
          </p>
          <CoreProgressStepper currentStep="idea" compact />
          <ul className="mt-3 hidden gap-x-4 gap-y-1 text-[11px] text-white/30 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {CORE_UX_STEPS.map((s) => (
              <li key={s.id}>
                <span className="text-white/45">{s.label}:</span> {s.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardPanel>
  );
}
