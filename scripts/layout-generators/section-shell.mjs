/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const SECTION_SHELL_GENERATORS = {
  "contained-standard": containedStandard,
  "creative-border": creativeBorder,
  "finance-accent-line": financeAccentLine,
  "corporate-contained": corporateContained,
  "fullscreen-minimal": fullscreenMinimal,
  "clinical-centered": clinicalCentered,
  "resort-wide": resortWide,
  "culinary-warm": culinaryWarm,
  "academic-crest": academicCrest,
  "commerce-gold-rule": commerceGoldRule,
  "saas-glass": saasGlass,
  "editorial-split-header": editorialSplitHeader,
  "estate-dark-surface": estateDarkSurface,
  "organic-framed": organicFramed,
  "aurora-glow": auroraGlow,
  "noir-terminal-frame": noirTerminalFrame,
  "fintech-terminal-wrap": fintechTerminalWrap,
  "blueprint-dashed": blueprintDashed,
  "law-formal-columns": lawFormalColumns,
  "wellness-soft-centered": wellnessSoftCentered,
};

export function generateSectionShell(entry, layoutKey) {
  const fn = SECTION_SHELL_GENERATORS[layoutKey] ?? containedStandard;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function shellHeader({ p, pkg, Pascal }) {
  return `"use client";

import type { ReactNode } from "react";

type ${Pascal}SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

function SectionHeader({ p, id, eyebrow, title, subtitle, headerClass = "mb-9 max-w-2xl" }: { p: string; id?: string; eyebrow?: string; title?: string; subtitle?: string; headerClass?: string }) {
  if (!eyebrow && !title && !subtitle) return null;
  const titleId = \`\${id ?? "section"}-title\`;
  return (
    <header className={headerClass}>
      {eyebrow ? <p className={\`\${p}-eyebrow mb-3\`}>{eyebrow}</p> : null}
      {title ? <h2 id={titleId} className={\`\${p}-headline-sm\`}>{title}</h2> : null}
      {subtitle ? <p className={\`\${p}-body mt-4 text-[var(--color-muted)]\`}>{subtitle}</p> : null}
    </header>
  );
}

export function ${Pascal}SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: ${Pascal}SectionShellProps) {`;
}

function containedStandard({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section bg-[var(--color-background)] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}
`;
}

function creativeBorder({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section px-5 sm:px-8 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      {(eyebrow || title || subtitle) ? (
        <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-accent)] ps-6">
          {eyebrow ? <p className="${p}-eyebrow">{eyebrow}</p> : null}
          {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm mt-4">{title}</h2> : null}
          {subtitle ? <p className="${p}-body mt-4 text-lg opacity-70">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
`;
}

function financeAccentLine({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section bg-[var(--color-background)] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-12 max-w-2xl">
            {eyebrow ? <p className="${p}-eyebrow mb-3">{eyebrow}</p> : null}
            {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm">{title}</h2> : null}
            {title ? <div className="mt-4 h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent" aria-hidden /> : null}
            {subtitle ? <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function corporateContained({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section relative bg-[var(--color-background)] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="${p}-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} headerClass="mb-12 max-w-2xl" />
        {children}
      </div>
    </section>
  );
}
`;
}

function fullscreenMinimal({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`min-h-[40vh] bg-[var(--color-primary)] px-5 py-20 sm:px-8 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[88rem]">
        {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-display text-3xl">{title}</h2> : null}
        {subtitle ? <p className="mt-4 max-w-xl opacity-80">{subtitle}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
`;
}

function clinicalCentered({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`px-5 py-20 sm:py-28 sm:px-8 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      {(eyebrow || title || subtitle) ? (
        <header className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow ? <p className="${p}-eyebrow mb-4">{eyebrow}</p> : null}
          {title ? <div className="mx-auto mb-5 h-px w-12 bg-[var(--color-accent)]" aria-hidden /> : null}
          {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm">{title}</h2> : null}
          {subtitle ? <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
`;
}

function resortWide({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section-glow \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[90rem] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-12 max-w-2xl">
            {eyebrow ? <p className="${p}-eyebrow mb-5">{eyebrow}</p> : null}
            {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline text-[clamp(2rem,4vw,3rem)]">{title}</h2> : null}
            {title ? <div className="my-6 h-px w-16 bg-[var(--color-accent)]" aria-hidden /> : null}
            {subtitle ? <p className="${p}-body">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function culinaryWarm({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`border-t-2 border-[var(--color-accent)]/25 bg-[var(--color-surface)] py-14 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}
`;
}

function academicCrest({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`border-y-4 border-[var(--color-accent)] py-20 sm:py-28 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 text-center sm:px-8">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-accent)] font-bold">§</div>
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} headerClass="mx-auto mb-10 max-w-2xl" />
        {children}
      </div>
    </section>
  );
}
`;
}

function commerceGoldRule({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section bg-[var(--color-background)] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-12 max-w-2xl">
            {eyebrow ? <p className="${p}-eyebrow mb-4">{eyebrow}</p> : null}
            {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm">{title}</h2> : null}
            {title ? <div className="mt-5 h-px w-20 bg-[var(--color-accent)]" aria-hidden /> : null}
            {subtitle ? <p className="${p}-body mt-6">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function saasGlass({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section-glow py-20 sm:py-28 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="${p}-glass-card rounded-2xl border border-[var(--border-accent)] p-8 backdrop-blur sm:p-10">
          <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {children}
        </div>
      </div>
    </section>
  );
}
`;
}

function editorialSplitHeader({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`py-16 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {(eyebrow || title) ? (
          <header className="mb-12 grid gap-4 border-b border-[var(--border-default)] pb-8 lg:grid-cols-2 lg:items-end">
            <div>
              {eyebrow ? <p className="${p}-eyebrow">{eyebrow}</p> : null}
              {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-display mt-2 text-4xl">{title}</h2> : null}
            </div>
            {subtitle ? <p className="${p}-body text-[var(--color-muted)] lg:text-end">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function estateDarkSurface({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`bg-[var(--color-primary)] py-20 sm:py-28 text-[var(--color-foreground)] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-14 max-w-2xl">
            {eyebrow ? <p className="${p}-eyebrow mb-5 text-[var(--color-accent)]">{eyebrow}</p> : null}
            {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm">{title}</h2> : null}
            {title ? <div className="my-7 h-px w-16 bg-[var(--color-accent)]" aria-hidden /> : null}
            {subtitle ? <p className="${p}-body opacity-70">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function organicFramed({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`p-6 sm:p-10 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-[var(--color-surface)] p-8 sm:p-12">
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}
`;
}

function auroraGlow({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`relative overflow-hidden py-20 sm:py-28 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-accent),transparent_55%)] opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} headerClass="mb-10 max-w-2xl" />
        {children}
      </div>
    </section>
  );
}
`;
}

function noirTerminalFrame({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`py-12 font-mono \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-3xl border border-[var(--border-default)] px-5 sm:px-8">
        <div className="border-b border-[var(--border-default)] px-4 py-2 text-xs text-[var(--color-muted)]">section — {id ?? "content"}</div>
        <div className="p-6 sm:p-8">
          {eyebrow ? <p className="text-[var(--color-accent)]">&gt; {eyebrow}</p> : null}
          {title ? <h2 id={\`\${id ?? "section"}-title\`} className="mt-4 text-xl font-bold">{title}</h2> : null}
          {subtitle ? <p className="mt-4 text-sm text-[var(--color-muted)]">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
`;
}

function fintechTerminalWrap({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`bg-[#0a0f0a] py-10 font-mono text-sm text-[#00ff88] \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] border border-[#00ff88]/25 px-5 py-8 sm:px-8">
        {title ? <h2 id={\`\${id ?? "section"}-title\`} className="text-lg font-bold text-white">{title}</h2> : null}
        {subtitle ? <p className="mt-2 text-[#00ff88]/70">{subtitle}</p> : null}
        <div className="mt-6 border-t border-[#00ff88]/15 pt-6">{children}</div>
      </div>
    </section>
  );
}
`;
}

function blueprintDashed({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`py-14 \${className}\`.trim()} style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] border-2 border-dashed border-[var(--color-accent)] px-5 py-10 sm:px-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">SECTION SHELL</p>
        <SectionHeader p="${p}" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} headerClass="mt-4 mb-8 max-w-2xl" />
        {children}
      </div>
    </section>
  );
}
`;
}

function lawFormalColumns({ p, pkg, Pascal }) {
  return `${shellHeader({ p, pkg, Pascal })}
  return (
    <section id={id} data-v2-component="${pkg}-section-shell" className={\`${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28 \${className}\`.trim()} aria-labelledby={title ? \`\${id ?? "section"}-title\` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-12 grid gap-6 border-b border-[var(--border-default)] pb-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              {eyebrow ? <p className="${p}-eyebrow">{eyebrow}</p> : null}
              {title ? <h2 id={\`\${id ?? "section"}-title\`} className="${p}-headline-sm mt-3">{title}</h2> : null}
            </div>
            {subtitle ? <p className="${p}-body text-[var(--color-muted)] lg:border-s lg:border-[var(--border-subtle)] lg:ps-8">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

function wellnessSoftCentered({ p, pkg, Pascal }) {
  return clinicalCentered({ p, pkg, Pascal });
}
