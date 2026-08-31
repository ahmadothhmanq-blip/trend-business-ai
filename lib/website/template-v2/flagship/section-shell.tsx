"use client";

import type { ReactNode } from "react";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";
import type { SectionRhythmSector } from "@/lib/website/template-v2/flagship/section-rhythm";
import { sectionRhythmDataAttr } from "@/lib/website/template-v2/flagship/section-rhythm";

export type PackageSectionVariant = SectionRhythmSector;

export type HospitalitySurfaceVariant = "default" | "inset" | "full-bleed";
export type EstateSurfaceVariant = "default" | "dark" | "surface";
export type HospitalityAccent = "copper" | "azure";

export type PackageSectionShellProps = {
  variant: PackageSectionVariant;
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  centered?: boolean;
  surfaceVariant?: HospitalitySurfaceVariant;
  estateVariant?: EstateSurfaceVariant;
  hospitalityAccent?: HospitalityAccent;
};

function titleId(id?: string): string {
  return `${id ?? "section"}-title`;
}

function B2bContainedHeader({
  ui,
  id,
  eyebrow,
  title,
  subtitle,
}: {
  ui: FlagshipUi;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;

  return (
    <header className="mb-12 max-w-2xl">
      {eyebrow && <p className={`${ui.eyebrow} mb-3`}>{eyebrow}</p>}
      {title && (
        <h2 id={titleId(id)} className={ui.headlineSm}>
          {title}
        </h2>
      )}
      {subtitle && <p className={`${ui.body} mt-4`}>{subtitle}</p>}
    </header>
  );
}

export function PackageSectionShell({
  variant,
  ui,
  componentId,
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  centered = false,
  surfaceVariant,
  estateVariant,
  hospitalityAccent = "copper",
}: PackageSectionShellProps) {
  const rhythm = sectionRhythmDataAttr(variant);

  if (variant === "corporate" || variant === "saas") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`${ui.section} bg-[var(--color-background)] ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
          <B2bContainedHeader ui={ui} id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {children}
        </div>
      </section>
    );
  }

  if (variant === "education") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`${ui.section} ed-paper-grain bg-[var(--color-background)] ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
          {(eyebrow || title || subtitle) && (
            <header className="mb-12 max-w-2xl">
              {eyebrow && <p className={`${ui.eyebrow} mb-3`}>{eyebrow}</p>}
              {title && (
                <h2 id={titleId(id)} className={ui.headlineSm}>
                  {title}
                </h2>
              )}
              {subtitle && <p className={`${ui.body} mt-4`}>{subtitle}</p>}
              {(eyebrow || title) && <div className="ed-accent-line mt-4" aria-hidden />}
            </header>
          )}
          {children}
        </div>
      </section>
    );
  }

  if (variant === "finance") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`${ui.section} bg-[var(--color-background)] ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
          {(eyebrow || title || subtitle) && (
            <header className="mb-12 max-w-2xl">
              {eyebrow && <p className={`${ui.eyebrow} mb-3`}>{eyebrow}</p>}
              {title && (
                <h2 id={titleId(id)} className={ui.headlineSm}>
                  {title}
                </h2>
              )}
              {title && <div className="fn-accent-line mt-4" aria-hidden />}
              {subtitle && <p className={`${ui.body} mt-4`}>{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </section>
    );
  }

  if (variant === "medical") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`mp-section px-5 sm:px-8 ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        {(eyebrow || title || subtitle) && (
          <header className={`mx-auto mb-12 max-w-2xl ${centered ? "text-center" : ""}`.trim()}>
            {eyebrow && <p className="mp-eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <>
                <div className={`mp-sage-rule mb-5 ${centered ? "mx-auto" : ""}`.trim()} aria-hidden />
                <h2 id={titleId(id)} className="mp-headline-sm">
                  {title}
                </h2>
              </>
            )}
            {subtitle && (
              <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </section>
    );
  }

  if (variant === "creative") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`sv-section px-5 sm:px-8 ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-volt)] ps-6">
            {eyebrow && <p className="sv-eyebrow">{eyebrow}</p>}
            {title && (
              <h2 id={titleId(id)} className="sv-headline-sm mt-4">
                {title}
              </h2>
            )}
            {subtitle && <p className="sv-body mt-4 text-lg leading-relaxed opacity-70">{subtitle}</p>}
          </header>
        )}
        {children}
      </section>
    );
  }

  if (variant === "ecommerce") {
    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`${ui.section} bg-[var(--color-background)] ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
          {(eyebrow || title || subtitle) && (
            <header className="mb-12 max-w-2xl">
              {eyebrow && <p className={`${ui.eyebrow} mb-4`}>{eyebrow}</p>}
              {title && (
                <h2 id={titleId(id)} className={ui.headlineSm}>
                  {title}
                </h2>
              )}
              {title && <div className="ec-gold-rule mt-5" aria-hidden />}
              {subtitle && <p className={`${ui.body} mt-6`}>{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </section>
    );
  }

  if (variant === "hospitality") {
    const variantClass =
      surfaceVariant === "inset"
        ? "bg-[var(--color-surface)]/30"
        : surfaceVariant === "full-bleed"
          ? "px-0"
          : "";
    const ruleClass = hospitalityAccent === "azure" ? "hr-azure-rule" : "rp-copper-rule";
    const headlineClass =
      hospitalityAccent === "azure"
        ? "hr-headline-sm"
        : "rp-headline text-[clamp(2rem,4vw,3rem)]";
    const eyebrowClass = hospitalityAccent === "azure" ? "hr-eyebrow mb-5" : "rp-eyebrow mb-5";
    const bodyClass = hospitalityAccent === "azure" ? "hr-body" : "rp-body";
    const sectionClass = hospitalityAccent === "azure" ? "hr-section" : ui.section;

    return (
      <section
        id={id}
        data-v2-component={componentId}
        data-v2-section-rhythm={rhythm}
        className={`${sectionClass} ${variantClass} ${className ?? ""}`.trim()}
        aria-labelledby={title ? titleId(id) : undefined}
      >
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          {(eyebrow || title || subtitle) && (
            <header className="mb-12 max-w-2xl">
              {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
              {title && (
                <h2 id={titleId(id)} className={headlineClass}>
                  {title}
                </h2>
              )}
              {title && <div className={`${ruleClass} my-6`} />}
              {subtitle && <p className={bodyClass}>{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </section>
    );
  }

  const estateSurfaceClass =
    estateVariant === "dark"
      ? "bg-[var(--color-primary)] text-[var(--color-linen)]"
      : estateVariant === "surface"
        ? "bg-[var(--color-surface)]"
        : "";

  return (
    <section
      id={id}
      data-v2-component={componentId}
      data-v2-section-rhythm={rhythm}
      className={`rep-section ${estateSurfaceClass} ${className ?? ""}`.trim()}
      aria-labelledby={title ? titleId(id) : undefined}
    >
      <div className="df-container">
        {(eyebrow || title || subtitle) && (
          <header className="mb-14 max-w-2xl">
            {eyebrow && (
              <p
                className={`rep-eyebrow mb-5 ${estateVariant === "dark" ? "text-[var(--color-brass)]" : ""}`.trim()}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                id={titleId(id)}
                className={`rep-headline-sm ${estateVariant === "dark" ? "text-[var(--color-linen)]" : ""}`.trim()}
              >
                {title}
              </h2>
            )}
            {title && <div className="rep-brass-rule-lg my-7" />}
            {subtitle && (
              <p
                className={`rep-body ${estateVariant === "dark" ? "text-[var(--color-linen)]/65" : ""}`.trim()}
              >
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
