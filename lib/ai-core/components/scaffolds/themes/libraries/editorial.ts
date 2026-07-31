/**

 * Editorial theme scaffolds — magazine storytelling identity.

 * Hamburger masthead nav, column-based cover hero, multi-column grid, vertical timeline, photo essay gallery.

 */



export const EDITORIAL_SCAFFOLDS: Record<string, string> = {

  ThemeEditorialNav: `"use client";



import { useEffect, useState } from "react";



const DEFAULT_LINKS = [

  { href: "#magazine", label: "Magazine" },

  { href: "#story", label: "Story" },

  { href: "#timeline", label: "Archive" },

  { href: "#gallery", label: "Gallery" },

  { href: "#contact", label: "Contact" },

];



type ThemeEditorialNavProps = {

  brandName?: string;

  ctaLabel?: string;

  links?: Array<{ href: string; label: string }>;

};



export function ThemeEditorialNav({

  brandName = "The Line",

  ctaLabel = "Subscribe",

  links = DEFAULT_LINKS,

}: ThemeEditorialNavProps) {

  const [open, setOpen] = useState(false);



  useEffect(() => {

    document.body.style.overflow = open ? "hidden" : "";

    return () => {

      document.body.style.overflow = "";

    };

  }, [open]);



  return (

    <>

      <header data-theme-scaffold="nav" className="sticky top-0 z-50 border-b border-[var(--color-foreground)]/8 bg-[var(--color-background)]/88 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_color-mix(in_srgb,var(--color-foreground)_6%,transparent)]">

        <div className="mx-auto grid max-w-[86rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6 sm:px-10 lg:px-14 lg:py-7">

          <button

            type="button"

            className="group flex flex-col gap-[5px] justify-self-start"

            aria-label={open ? "Close menu" : "Open menu"}

            aria-expanded={open}

            onClick={() => setOpen((v) => !v)}

          >

            <span

              className={[

                "h-px w-7 bg-[var(--color-foreground)] transition-transform duration-300",

                open ? "translate-y-[6px] rotate-45" : "",

              ].join(" ")}

            />

            <span

              className={[

                "h-px w-4 bg-[var(--color-foreground)] transition-all duration-300",

                open ? "w-0 opacity-0" : "",

              ].join(" ")}

            />

            <span

              className={[

                "h-px w-7 bg-[var(--color-foreground)] transition-transform duration-300",

                open ? "-translate-y-[6px] -rotate-45" : "",

              ].join(" ")}

            />

          </button>



          <a

            href="/"

            className="text-center font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.125rem,2vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--color-foreground)]"

          >

            {brandName}

          </a>



          <a

            href="#subscribe"

            className="justify-self-end text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-foreground)]/55 transition-colors hover:text-[var(--color-foreground)]"

          >

            {ctaLabel}

          </a>

        </div>

      </header>



      <div

        className={[

          "fixed inset-0 z-40 bg-[var(--color-background)] transition-all duration-500",

          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",

        ].join(" ")}

        aria-hidden={!open}

      >

        <nav

          className="flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24"

          aria-label="Primary"

        >

          {links.map((link, i) => (

            <a

              key={link.href}

              href={link.href}

              className="group border-b border-[var(--color-foreground)]/8 py-6 sm:py-8"

              onClick={() => setOpen(false)}

            >

              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary)]">

                0{i + 1}

              </span>

              <span className="mt-2 block font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-[var(--color-foreground)] transition-transform duration-300 group-hover:translate-x-2">

                {link.label}

              </span>

            </a>

          ))}

        </nav>

      </div>

    </>

  );

}

`,



  ThemeEditorialHero: `"use client";



import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";



type ThemeEditorialHeroProps = {

  title?: string;

  subtitle?: string;

  eyebrow?: string;

  primaryCta?: string;

  secondaryCta?: string;

  imageUrl?: string | null;

  issueLabel?: string;

  deck?: string;

  publishDate?: string;

  layoutMode?: string;

};



export function ThemeEditorialHero({

  title = "Ideas worth printing",

  subtitle = "Long-form journalism, design criticism, and cultural reportage — composed like a cover story, not a landing page.",

  eyebrow = "Issue 04",

  primaryCta = "Read lead",

  secondaryCta = "Subscribe",

  imageUrl,

  issueLabel = "Cover story",

  deck = "The quarterly dispatch on craft, culture, and the people shaping both.",

  publishDate = "Summer 2026",

  layoutMode = "cover",

}: ThemeEditorialHeroProps) {

  const src = resolveSiteImage(

    imageUrl || HERO_IMAGE || GALLERY_IMAGES[0] || SECTION_IMAGES[0],

    0,

  );

  const cinematic = layoutMode === "cinematic";



  if (cinematic) {

    return (

      <section data-theme-scaffold="hero" className="relative min-h-[96svh] overflow-hidden border-b border-[var(--color-foreground)]/8 bg-[var(--color-background)]">

        {src ? (

          <img

            src={src}

            alt={title}

            className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[center_35%]"

          />

        ) : (

          <div className="absolute inset-0 bg-[var(--color-surface)]" />

        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/72 to-[var(--color-background)]/20" />

        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/70 via-[var(--color-background)]/25 to-transparent" />

        <div className="relative mx-auto flex min-h-[96svh] max-w-[86rem] flex-col justify-end px-6 pb-16 pt-32 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24">

          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary)]">

            {eyebrow}

          </p>

          <h1 className="mt-6 max-w-[14ch] font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-balance">

            {title}

          </h1>

          <p className="mt-8 max-w-xl text-[15px] leading-[2.05] text-[var(--color-foreground)]/58">

            {subtitle}

          </p>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-[10px] font-bold uppercase tracking-[0.28em]">

            <a

              href="#magazine"

              className="border-b border-[var(--color-foreground)] pb-1 text-[var(--color-foreground)] transition-opacity hover:opacity-70"

            >

              {primaryCta}

            </a>

            <a

              href="#subscribe"

              className="text-[var(--color-foreground)]/42 transition-colors hover:text-[var(--color-foreground)]/70"

            >

              {secondaryCta}

            </a>

          </div>

          <div className="mt-14 flex flex-wrap items-center gap-8 border-t border-[var(--color-foreground)]/10 pt-6 text-[10px] uppercase tracking-[0.28em] text-[var(--color-foreground)]/38">

            <span>{publishDate}</span>

            <span aria-hidden>·</span>

            <span>{issueLabel}</span>

          </div>

        </div>

      </section>

    );

  }



  return (

    <section data-theme-scaffold="hero" className="min-h-[96svh] border-b border-[var(--color-foreground)]/8 bg-[var(--color-background)]">

      <div className="mx-auto grid min-h-[96svh] max-w-[86rem] gap-12 px-6 py-16 sm:grid-cols-[minmax(0,0.34fr)_1fr] sm:gap-16 sm:px-10 sm:py-24 lg:gap-20 lg:px-14 lg:py-28">

        <aside className="sm:sticky sm:top-28 sm:self-start">

          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary)]">

            {eyebrow}

          </p>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-foreground)]/38">

            {publishDate}

          </p>

          <div className="mt-10 border-l border-[var(--color-foreground)]/12 pl-6">

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)]/45">

              {issueLabel}

            </p>

            <p className="mt-4 text-sm leading-[2.05] text-[var(--color-foreground)]/48">

              {deck}

            </p>

          </div>

          <dl className="mt-12 space-y-4 text-[10px] uppercase tracking-[0.26em] text-[var(--color-foreground)]/32">

            <div>

              <dt className="text-[var(--color-foreground)]/22">Pages</dt>

              <dd className="mt-1 font-semibold text-[var(--color-foreground)]/55">128</dd>

            </div>

            <div>

              <dt className="text-[var(--color-foreground)]/22">Contributors</dt>

              <dd className="mt-1 font-semibold text-[var(--color-foreground)]/55">24</dd>

            </div>

          </dl>

        </aside>



        <div>

          <h1 className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-balance">

            {title}

          </h1>

          <p className="mt-8 max-w-2xl text-[15px] leading-[2.05] text-[var(--color-foreground)]/52">

            {subtitle}

          </p>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-[10px] font-bold uppercase tracking-[0.28em]">

            <a

              href="#magazine"

              className="border-b border-[var(--color-foreground)] pb-1 text-[var(--color-foreground)] transition-opacity hover:opacity-70"

            >

              {primaryCta}

            </a>

            <a

              href="#subscribe"

              className="text-[var(--color-foreground)]/38 transition-colors hover:text-[var(--color-foreground)]/65"

            >

              {secondaryCta}

            </a>

          </div>

          {src ? (

            <figure className="mt-14 lg:mt-16">

              <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface)]">

                <img

                  src={src}

                  alt={title}

                  className="h-full w-full object-cover object-center"

                />

              </div>

              <figcaption className="mt-4 text-[10px] uppercase tracking-[0.28em] text-[var(--color-foreground)]/35">

                Photograph for {eyebrow} — {issueLabel}

              </figcaption>

            </figure>

          ) : null}

        </div>

      </div>

    </section>

  );

}

`,



  ThemeEditorialMagazine: `import { SectionShell } from "@/components/ui/section-shell";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";



const DEFAULT_ARTICLES = [

  {

    title: "Field notes from the atelier",

    dek: "On slow craft, material honesty, and why the workshop still matters in an age of instant output.",

    category: "Craft",

    readTime: "12 min",

  },

  {

    title: "The studio visit",

    dek: "An archive tour through four decades of editorial design — margins, mastheads, and the art of restraint.",

    category: "Design",

    readTime: "8 min",

  },

  {

    title: "Letters from the road",

    dek: "Dispatches on cities, light, and the photographers who chase both across continents.",

    category: "Culture",

    readTime: "15 min",

  },

  {

    title: "In conversation",

    dek: "A long table interview on publishing, patronage, and building readership without algorithms.",

    category: "Interview",

    readTime: "18 min",

  },

  {

    title: "The print room",

    dek: "Inside the last letterpress house still setting type by hand for independent magazines.",

    category: "Reportage",

    readTime: "10 min",

  },

  {

    title: "Afterword",

    dek: "Closing reflections on what it means to publish with intention in a scroll-first world.",

    category: "Essay",

    readTime: "6 min",

  },

];



type ThemeEditorialMagazineProps = {

  eyebrow?: string;

  title?: string;

  subtitle?: string;

  articles?: Array<{ title: string; dek: string; category?: string; readTime?: string }>;

};



export function ThemeEditorialMagazine({

  eyebrow = "Magazine",

  title = "Latest editions",

  subtitle = "Stories arranged in a flowing column grid — scan like a table of contents, read like a spread.",

  articles = DEFAULT_ARTICLES,

}: ThemeEditorialMagazineProps) {

  return (

    <SectionShell id="magazine" eyebrow={eyebrow} title={title} subtitle={subtitle}>

      <div className="columns-1 gap-x-12 sm:columns-2 lg:columns-3">

        {articles.map((article, index) => {

          const src = resolveSiteImage(

            GALLERY_IMAGES[index] || SECTION_IMAGES[index] || HERO_IMAGE,

            index,

          );

          return (

            <article

              key={article.title}

              className="mb-12 break-inside-avoid border-t border-[var(--color-foreground)]/10 pt-8 first:border-t-0 first:pt-0 sm:first:border-t sm:first:pt-8"

            >

              {src ? (

                <div className="mb-6 aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">

                  <img

                    src={src}

                    alt=""

                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"

                  />

                </div>

              ) : null}

              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-foreground)]/38">

                {article.category ? <span>{article.category}</span> : null}

                {article.readTime ? (

                  <>

                    <span aria-hidden className="text-[var(--color-foreground)]/18">

                      ·

                    </span>

                    <span>{article.readTime}</span>

                  </>

                ) : null}

              </div>

              <h3 className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.25rem,2vw,1.65rem)] font-semibold leading-[1.08] tracking-[-0.02em]">

                {article.title}

              </h3>

              <p className="mt-4 text-sm leading-[1.95] text-[var(--color-foreground)]/52">

                {article.dek}

              </p>

              <a

                href="#story"

                className="mt-5 inline-block text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]"

              >

                Read →

              </a>

            </article>

          );

        })}

      </div>

    </SectionShell>

  );

}

`,



  ThemeEditorialStory: `import { SectionShell } from "@/components/ui/section-shell";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";



const DEFAULT_ITEMS = [

  {

    title: "Editor's letter",

    body: "We started this imprint because the internet forgot how to pause. Every story here is edited for depth — not virality — and designed to be read in a single sitting, the way a great magazine piece demands your full attention.",

  },

  {

    title: "On the masthead",

    body: "Typography is our first editorial decision. Display faces carry the headline; body copy earns the paragraph. We treat whitespace as punctuation and let images breathe between clauses of text.",

  },

  {

    title: "What comes next",

    body: "The next issue moves from workshop to city — street photography, urban planning essays, and a portfolio of architects who still draw by hand. Subscribe once; receive everything we publish.",

  },

];



type ThemeEditorialStoryProps = {

  eyebrow?: string;

  title?: string;

  subtitle?: string;

  items?: Array<{ title: string; body: string }>;

};



export function ThemeEditorialStory({

  eyebrow = "Story",

  title = "From the desk",

  subtitle = "Long-form columns with editorial rhythm — drop caps, pull quotes, and measured pacing.",

  items = DEFAULT_ITEMS,

}: ThemeEditorialStoryProps) {

  const portrait = resolveSiteImage(SECTION_IMAGES[1] || GALLERY_IMAGES[2] || HERO_IMAGE, 1);



  return (

    <SectionShell id="story" eyebrow={eyebrow} title={title} subtitle={subtitle}>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,0.32fr)_1fr] lg:gap-20">

        {portrait ? (

          <figure className="lg:sticky lg:top-28 lg:self-start">

            <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface)]">

              <img src={portrait} alt="" className="h-full w-full object-cover" />

            </div>

            <figcaption className="mt-4 text-[10px] uppercase tracking-[0.28em] text-[var(--color-foreground)]/35">

              Portrait — Issue desk

            </figcaption>

          </figure>

        ) : null}



        <div className="space-y-16 lg:space-y-20">

          {items.map((item, index) => (

            <article key={item.title} className="max-w-3xl">

              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-primary)]">

                0{index + 1}

              </p>

              <h3 className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.75rem,3vw,2.35rem)] font-semibold leading-[1.02] tracking-[-0.03em]">

                {item.title}

              </h3>

              <p

                className={[

                  "mt-6 text-[15px] leading-[2.1] text-[var(--color-foreground)]/58",

                  index === 0

                    ? "first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display,var(--font-heading,inherit))] first-letter:text-[3.5rem] first-letter:font-semibold first-letter:leading-[0.85] first-letter:tracking-[-0.04em]"

                    : "",

                ].join(" ")}

              >

                {item.body}

              </p>

              {index === 0 ? (

                <blockquote className="mt-10 border-l-2 border-[var(--color-primary)] pl-6">

                  <p className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-xl font-medium leading-[1.45] tracking-[-0.01em] text-[var(--color-foreground)]/72">

                    &ldquo;Publish slowly. Edit fiercely. Design like every spread is the cover.&rdquo;

                  </p>

                </blockquote>

              ) : null}

            </article>

          ))}

        </div>

      </div>

    </SectionShell>

  );

}

`,



  ThemeEditorialTimeline: `import { SectionShell } from "@/components/ui/section-shell";



const DEFAULT_EVENTS = [

  { year: "2018", label: "Founded the imprint", detail: "First issue printed in an edition of 500." },

  { year: "2020", label: "Digital archive launched", detail: "Every back issue available to subscribers." },

  { year: "2022", label: "Global contributors", detail: "Writers and photographers across 14 cities." },

  { year: "2024", label: "Design award", detail: "Recognized for editorial typography and layout." },

  { year: "2026", label: "Issue 04 published", detail: "The largest edition to date — 128 pages." },

];



type ThemeEditorialTimelineProps = {

  eyebrow?: string;

  title?: string;

  subtitle?: string;

  events?: Array<{ year: string; label: string; detail?: string }>;

};



export function ThemeEditorialTimeline({

  eyebrow = "Timeline",

  title = "Milestones",

  subtitle = "A vertical chronology — each node a chapter in the publication's history.",

  events = DEFAULT_EVENTS,

}: ThemeEditorialTimelineProps) {

  return (

    <SectionShell id="timeline" eyebrow={eyebrow} title={title} subtitle={subtitle}>

      <ol className="relative max-w-2xl border-l border-[var(--color-foreground)]/12 pl-10 sm:pl-12">

        {events.map((event, index) => (

          <li

            key={event.year + event.label}

            className={[

              "relative pb-14 last:pb-0",

              index === 0 ? "pt-1" : "",

            ].join(" ")}

          >

            <span

              aria-hidden

              className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-background)]"

            />

            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-primary)]">

              {event.year}

            </p>

            <h3 className="mt-3 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-xl font-semibold tracking-[-0.02em]">

              {event.label}

            </h3>

            {event.detail ? (

              <p className="mt-3 max-w-md text-sm leading-[1.95] text-[var(--color-foreground)]/50">

                {event.detail}

              </p>

            ) : null}

          </li>

        ))}

      </ol>

    </SectionShell>

  );

}

`,



  ThemeEditorialGallery: `import { SectionShell } from "@/components/ui/section-shell";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";



const DEFAULT_ITEMS = [

  { caption: "Morning light in the print room", span: "col-span-12 lg:col-span-7" },

  { caption: "Type cases, sorted by hand", span: "col-span-12 sm:col-span-6 lg:col-span-5" },

  { caption: "Cover proof on the wall", span: "col-span-12 sm:col-span-6 lg:col-span-5" },

  { caption: "Press check — final run", span: "col-span-12 lg:col-span-7" },

  { caption: "Binding line", span: "col-span-12 lg:col-span-12" },

];



type ThemeEditorialGalleryProps = {

  eyebrow?: string;

  title?: string;

  subtitle?: string;

  items?: Array<{ caption: string; span?: string }>;

};



export function ThemeEditorialGallery({

  eyebrow = "Gallery",

  title = "Visual essay",

  subtitle = "A photo spread in alternating aspect ratios — captions set like plate labels in a monograph.",

  items = DEFAULT_ITEMS,

}: ThemeEditorialGalleryProps) {

  const ASPECTS = ["aspect-[16/10]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[16/10]", "aspect-[21/9]"];



  return (

    <SectionShell id="gallery" eyebrow={eyebrow} title={title} subtitle={subtitle}>

      <div className="grid grid-cols-12 gap-6 sm:gap-8">

        {items.map((item, index) => {

          const src = resolveSiteImage(

            GALLERY_IMAGES[index] || SECTION_IMAGES[index] || HERO_IMAGE,

            index,

          );

          const span = item.span ?? "col-span-12";

          const aspect = ASPECTS[index % ASPECTS.length];



          return (

            <figure key={item.caption} className={span}>

              <div className={["overflow-hidden bg-[var(--color-surface)]", aspect].join(" ")}>

                {src ? (

                  <img

                    src={src}

                    alt={item.caption}

                    className="h-full w-full object-cover object-center"

                  />

                ) : null}

              </div>

              <figcaption className="mt-4 flex items-baseline gap-4 border-t border-[var(--color-foreground)]/8 pt-4">

                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-foreground)]/28">

                  {String(index + 1).padStart(2, "0")}

                </span>

                <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-foreground)]/52">

                  {item.caption}

                </span>

              </figcaption>

            </figure>

          );

        })}

      </div>

    </SectionShell>

  );

}

`,



  ThemeEditorialFooter: `type ThemeEditorialFooterProps = {

  brandName?: string;

  tagline?: string;

  links?: Array<{ href: string; label: string }>;

};



export function ThemeEditorialFooter({

  brandName = "The Line",

  tagline = "Independent magazine publishing — design, culture, and long-form reportage since 2018.",

  links = [

    { href: "#magazine", label: "Magazine" },

    { href: "#story", label: "Story" },

    { href: "#timeline", label: "Archive" },

    { href: "#gallery", label: "Gallery" },

    { href: "#contact", label: "Contact" },

  ],

}: ThemeEditorialFooterProps) {

  return (

    <footer data-theme-scaffold="footer" className="border-t border-[var(--color-foreground)]/8 bg-[var(--color-background)]">

      <div className="border-b border-[var(--color-foreground)]/8 bg-[var(--color-surface)]">

        <div className="mx-auto flex max-w-[86rem] flex-col gap-8 px-6 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-14 lg:py-16">

          <div className="max-w-xl">

            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary)]">

              Newsletter

            </p>

            <p className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">

              One letter per issue. No noise.

            </p>

          </div>

          <a

            href="#subscribe"

            className="shrink-0 border-b border-[var(--color-foreground)]/25 pb-1 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-foreground)]/55 transition-colors hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]"

          >

            Subscribe →

          </a>

        </div>

      </div>



      <div className="mx-auto grid max-w-[86rem] gap-14 px-6 py-16 sm:px-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:gap-16 lg:px-14 lg:py-24">

        <div>

          <p className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold tracking-[-0.04em]">

            {brandName}

          </p>

          <p className="mt-6 max-w-md text-[15px] leading-[2.05] text-[var(--color-foreground)]/48">

            {tagline}

          </p>

        </div>



        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-foreground)]/32">

            Sections

          </p>

          <nav className="mt-6 flex flex-col gap-4">

            {links.map((link) => (

              <a

                key={link.href}

                href={link.href}

                className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-foreground)]/42 transition-colors hover:text-[var(--color-foreground)]"

              >

                {link.label}

              </a>

            ))}

          </nav>

        </div>



        <div className="flex flex-col justify-between gap-10 lg:items-end lg:text-right">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-foreground)]/32">

              Imprint

            </p>

            <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/38">

              Independent publishing

            </p>

            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/38">

              Since 2018

            </p>

          </div>

          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/28">

            © {new Date().getFullYear()} {brandName}. All rights reserved.

          </p>

        </div>

      </div>

    </footer>

  );

}

`,

};


