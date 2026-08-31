/**
 * Next.js 16 RSC component modules (Phase 5).
 * Tailwind CSS v4 utilities only. ThemeToggle is the sole client module.
 */

import type { ReactProjectFile } from "@/lib/ai-core/website-builder/react-renderer/contracts";

const IMAGE_IMPORT = `import Image from "next/image";
import type { ReactSiteImage } from "@/lib/site/content";`;

function imageJsx(priorityExpr: string): string {
  return `<Image
      src={image.src}
      alt={image.alt}
      width={1600}
      height={900}
      sizes="(min-width: 1024px) 720px, 100vw"
      className="h-auto w-full rounded-[var(--radius-lg)] object-cover"
      ${priorityExpr}
    />`;
}

export function reactComponentFiles(): ReactProjectFile[] {
  return [
    {
      path: "components/theme-toggle.tsx",
      language: "tsx",
      contents: `"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className="rounded-full border border-muted/40 px-3 py-1.5 text-sm text-foreground transition hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      onClick={() => {
        const root = document.documentElement;
        const next = root.classList.contains("dark") ? "light" : "dark";
        root.classList.remove("dark", "light");
        root.classList.add(next);
      }}
    >
      Theme
    </button>
  );
}
`,
    },
    {
      path: "components/navigation.tsx",
      language: "tsx",
      contents: `import Link from "next/link";
import { siteContent } from "@/lib/site/content";

export function Navigation() {
  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm">
      {siteContent.navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-muted transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
`,
    },
    {
      path: "components/header.tsx",
      language: "tsx",
      contents: `import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteContent } from "@/lib/site/content";

export function Header() {
  return (
    <header className="border-b border-muted/20 bg-background/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          {siteContent.name}
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Navigation />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
`,
    },
    {
      path: "components/hero.tsx",
      language: "tsx",
      contents: `${IMAGE_IMPORT}
import type { ReactSiteSection } from "@/lib/site/content";

export function Hero({ section }: { section: ReactSiteSection }) {
  const image = section.images[0];
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="border-b border-muted/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div className="space-y-6">
          <h1 id={\`\${section.id}-title\`} className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {section.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">{section.body}</p>
          {section.cta ? (
            <a
              href="#contact"
              className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {section.cta}
            </a>
          ) : null}
        </div>
        {image ? (
          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-muted/10">
            ${imageJsx("priority")}
            {section.videoSrc ? (
              <video aria-label={image.alt} className="mt-4 w-full" controls preload="none">
                <source src={section.videoSrc} type="video/webm" />
              </video>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/features.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Features({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground sm:text-4xl">
        {section.title}
      </h2>
      <p className="mt-4 max-w-2xl text-muted">{section.body}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <article key={item.title} className="rounded-[var(--radius-lg)] border border-muted/20 p-6">
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/services.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Services({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <p className="mt-4 max-w-2xl text-muted">{section.body}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {section.items.map((item) => (
          <article key={item.title} className="border-t border-accent/40 pt-5">
            <h3 className="text-xl text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/about.tsx",
      language: "tsx",
      contents: `${IMAGE_IMPORT}
import type { ReactSiteSection } from "@/lib/site/content";

export function About({ section }: { section: ReactSiteSection }) {
  const image = section.images[0];
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
          {section.title}
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">{section.body}</p>
      </div>
      {image ? <div>${imageJsx('loading="lazy"')}</div> : null}
    </section>
  );
}
`,
    },
    {
      path: "components/gallery.tsx",
      language: "tsx",
      contents: `${IMAGE_IMPORT}
import type { ReactSiteSection } from "@/lib/site/content";

export function Gallery({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {section.images.map((image) => (
          <figure key={image.src} className="overflow-hidden rounded-[var(--radius-lg)]">
            ${imageJsx('loading="lazy"')}
          </figure>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/team.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Team({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <article key={item.title} className="rounded-[var(--radius-lg)] bg-muted/10 p-6">
            <h3 className="text-lg text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/testimonials.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Testimonials({ section }: { section: ReactSiteSection }) {
  return (
    <aside id={section.id} aria-labelledby={\`\${section.id}-title\`} className="bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
          {section.title}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {section.quotes.map((quote) => (
            <blockquote key={quote} className="border-l-2 border-accent pl-5 text-muted">
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </aside>
  );
}
`,
    },
    {
      path: "components/pricing.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Pricing({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {section.items.map((item) => (
          <article key={item.title} className="rounded-[var(--radius-lg)] border border-muted/20 p-6">
            <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/faq.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function FAQ({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <ul className="mt-8 space-y-4">
        {section.items.map((item) => (
          <li key={item.title} className="border-b border-muted/20 pb-4">
            <h3 className="text-base font-medium text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
`,
    },
    {
      path: "components/cta.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function CTA({ section }: { section: ReactSiteSection }) {
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="bg-accent/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
            {section.title}
          </h2>
          <p className="mt-3 max-w-xl text-muted">{section.body}</p>
        </div>
        {section.cta ? (
          <a
            href="#contact"
            className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {section.cta}
          </a>
        ) : null}
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/contact.tsx",
      language: "tsx",
      contents: `import type { ReactSiteSection } from "@/lib/site/content";

export function Contact({ section }: { section: ReactSiteSection }) {
  const fields = section.form?.fields ?? ["name", "email", "message"];
  return (
    <section id={section.id} aria-labelledby={\`\${section.id}-title\`} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id={\`\${section.id}-title\`} className="font-display text-3xl text-foreground">
        {section.title}
      </h2>
      <p className="mt-4 max-w-2xl text-muted">{section.body}</p>
      <form aria-label={section.form?.label ?? "contact"} className="mt-8 grid max-w-xl gap-4" noValidate>
        {fields.map((field) => {
          const fieldId = \`\${section.id}-\${field.replace(/\\s+/g, "-")}\`;
          return (
            <label key={fieldId} htmlFor={fieldId} className="grid gap-2 text-sm text-foreground">
              {field}
              <input
                id={fieldId}
                name={field}
                type={field.includes("email") ? "email" : "text"}
                className="rounded-md border border-muted/30 bg-background px-3 py-2 text-foreground"
              />
            </label>
          );
        })}
        <button
          type="submit"
          className="justify-self-start rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
`,
    },
    {
      path: "components/footer.tsx",
      language: "tsx",
      contents: `import Link from "next/link";
import { siteContent } from "@/lib/site/content";

export function Footer() {
  return (
    <footer className="border-t border-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-muted">{siteContent.name}</p>
        <Link href="/" className="text-sm text-foreground underline-offset-4 hover:underline">
          Home
        </Link>
      </div>
    </footer>
  );
}
`,
    },
    {
      path: "components/site-page.tsx",
      language: "tsx",
      contents: `import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { CTA } from "@/components/cta";
import { FAQ } from "@/components/faq";
import { Features } from "@/components/features";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Services } from "@/components/services";
import { Team } from "@/components/team";
import { Testimonials } from "@/components/testimonials";
import { getPage } from "@/lib/site/content";
import { notFound } from "next/navigation";

export function SitePage({ slug }: { slug: string }) {
  const page = getPage(slug);
  if (!page) notFound();
  const hasHero = page.sections.some((section) => section.component === "Hero");
  return (
    <main id="main-content" className="flex-1">
      {hasHero ? null : (
        <h1 className="mx-auto max-w-6xl px-4 pt-12 font-display text-4xl text-foreground sm:px-6 lg:px-8">
          {page.title}
        </h1>
      )}
      {page.sections.map((section) => {
        switch (section.component) {
          case "Hero":
            return <Hero key={section.id} section={section} />;
          case "Features":
            return <Features key={section.id} section={section} />;
          case "Services":
            return <Services key={section.id} section={section} />;
          case "About":
            return <About key={section.id} section={section} />;
          case "Gallery":
            return <Gallery key={section.id} section={section} />;
          case "Team":
            return <Team key={section.id} section={section} />;
          case "Testimonials":
            return <Testimonials key={section.id} section={section} />;
          case "Pricing":
            return <Pricing key={section.id} section={section} />;
          case "FAQ":
            return <FAQ key={section.id} section={section} />;
          case "CTA":
            return <CTA key={section.id} section={section} />;
          case "Contact":
            return <Contact key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
`,
    },
  ];
}
