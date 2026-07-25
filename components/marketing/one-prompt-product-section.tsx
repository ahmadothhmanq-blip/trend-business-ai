"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { SiteButton } from "@/components/marketing/site/button";
import {
  SiteBody,
  SiteH2,
  SiteLabel,
  SiteSectionHead,
} from "@/components/marketing/site/ui";
import { buildCoreUxSteps } from "@/components/dashboard/one-prompt/steps";
import type { OnePromptProductConfig } from "@/lib/constants/one-prompt-products";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";

/**
 * Public service-page One Prompt block — idea input + examples + pipeline.
 * Submits by navigating to the dashboard tool with ?idea=…
 */
export function OnePromptProductSection({
  product,
}: {
  product: OnePromptProductConfig;
}) {
  const tCommon = useScopedT("marketing.common");
  const { t } = useTranslation();
  const steps = buildCoreUxSteps(t);
  const [idea, setIdea] = useState("");
  const href = idea.trim()
    ? `${product.dashboardHref}?idea=${encodeURIComponent(idea.trim())}`
    : product.dashboardHref;

  return (
    <>
      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label={tCommon("onePromptExperience")}
            title={tCommon("onePromptTitle")}
            description={product.valueProposition}
          />

          <div className="mt-10 rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#111111] p-6 sm:p-8">
            <label className="text-[12px] font-semibold tracking-[0.14em] text-[#D4AF37] uppercase">
              {tCommon("businessIdea")}
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={product.placeholder}
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-[rgba(212,175,55,0.18)] bg-black/40 px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[rgba(212,175,55,0.45)]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {product.examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setIdea(example.prompt)}
                  className="rounded-full border border-[rgba(212,175,55,0.22)] px-3 py-1 text-[12px] text-[#C7C7C7] transition-colors hover:border-[rgba(212,175,55,0.5)] hover:text-[#D4AF37]"
                >
                  {example.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SiteButton href={href} size="lg">
                <Sparkles className="size-4" />
                {product.ctaLabel}
                <ArrowRight className="size-4" />
              </SiteButton>
              <SiteBody className="max-w-md text-[13px]">
                {tCommon("continuesInDashboard")}
              </SiteBody>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteLabel>{tCommon("generationFlow")}</SiteLabel>
          <SiteH2 className="mt-4">{tCommon("fromIdeaToProduct")}</SiteH2>
          <SiteBody className="mt-4 max-w-2xl">{tCommon("everyRunFollows")}</SiteBody>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-4"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] text-[12px] font-bold text-[#D4AF37]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[15px] font-bold text-white">{step.label}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#B5B5B5]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteLabel>{tCommon("examplesTemplates")}</SiteLabel>
          <SiteH2 className="mt-4">{tCommon("startFromProvenBrief")}</SiteH2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {product.examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setIdea(example.prompt)}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-5 text-left transition-colors hover:border-[rgba(212,175,55,0.42)]"
              >
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Check className="size-4" />
                  <span className="text-[13px] font-semibold">{example.label}</span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[#C7C7C7]">
                  {example.prompt}
                </p>
              </button>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-[#888]">
            {tCommon("preferFullTool")}{" "}
            <Link
              href={product.dashboardHref}
              className="font-semibold text-[#D4AF37] hover:underline"
            >
              {tCommon("openInDashboard", { title: product.title })}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
