import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import {
  SiteBody,
  SiteEyebrow,
  SiteH1,
  SiteH2,
  SitePageHero,
} from "@/components/marketing/site/ui";
import { SiteButton } from "@/components/marketing/site/button";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { KNOWLEDGE_HUBS, getPublishedKnowledgeByKind } from "@/lib/seo/knowledge";
import { getRelatedBusinessResources, getRelatedTools } from "@/lib/seo/internal-links";

export const metadata: Metadata = createPageMetadata({
  title: "Knowledge Center — Academy, Guides & Docs",
  description:
    "Learn Trend Business AI with academy tracks, tutorials, guides, documentation, glossary and case studies.",
  path: "/learn",
  type: "collection",
});

const SECTIONS = [
  {
    id: "academy",
    title: "Academy",
    description: "Structured learning paths for founders and operators.",
  },
  {
    id: "tutorial",
    title: "Tutorials",
    description: "Step-by-step walkthroughs for each AI product workflow.",
  },
  {
    id: "guide",
    title: "Guides",
    description: "Strategic playbooks for launching and growing with AI.",
  },
  {
    id: "documentation",
    title: "Documentation",
    description: "Reference docs for the dashboard, exports and platform features.",
  },
  {
    id: "glossary",
    title: "Glossary",
    description: "Clear definitions for AI business and growth terminology.",
  },
  {
    id: "case-study",
    title: "Case Studies",
    description: "Real-world outcomes from teams using Trend Business AI.",
  },
] as const;

export default function LearnPage() {
  const published = getPublishedKnowledgeByKind();
  const hubs = KNOWLEDGE_HUBS.filter((hub) => hub.path !== "/learn");

  return (
    <>
      <JsonLdScript
        id="learn-jsonld"
        data={[
          webPageJsonLd({
            name: "Knowledge Center",
            description:
              "Academy, tutorials, guides, documentation, glossary and case studies for Trend Business AI.",
            path: "/learn",
            type: "CollectionPage",
          }),
          collectionPageJsonLd({
            name: "Knowledge Center",
            description: "Learning hubs across Trend Business AI.",
            path: "/learn",
            items: [
              ...hubs.map((hub) => ({
                name: hub.title,
                path: hub.path,
                description: hub.description,
              })),
              ...published.documentation.map((entry) => ({
                name: entry.title,
                path: entry.path,
                description: entry.description,
              })),
            ],
          }),
        ]}
      />
      <SiteShell>
        <SitePageHero
          eyebrow="Knowledge Center"
          title="Learn. Build. Scale with AI."
          description="Architecture for Academy, Tutorials, Guides, Documentation, Glossary and Case Studies — published only when content meets quality standards."
          primary={{ label: "Open Docs", href: "/docs" }}
          secondary={{ label: "Browse Products", href: "/features" }}
        />

        <section className="landing-container pb-16 lg:pb-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => {
              const count =
                section.id === "academy"
                  ? published.academy.length
                  : section.id === "tutorial"
                    ? published.tutorials.length
                    : section.id === "guide"
                      ? published.guides.length
                      : section.id === "documentation"
                        ? published.documentation.length
                        : section.id === "glossary"
                          ? published.glossary.length
                          : published.caseStudies.length;

              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6"
                >
                  <SiteEyebrow>{section.title}</SiteEyebrow>
                  <SiteH2 className="mt-3 text-[22px]">{section.title}</SiteH2>
                  <SiteBody className="mt-3">{section.description}</SiteBody>
                  <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                    {count > 0 ? `${count} published` : "Foundation ready"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {hubs.map((hub) => (
              <Link
                key={hub.id}
                href={hub.path}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#0d0d0d] px-5 py-4 transition-colors hover:border-[rgba(212,175,55,0.4)]"
              >
                <p className="text-sm font-semibold text-white">{hub.title}</p>
                <p className="mt-1 text-[13px] text-[#A8A8A8]">{hub.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <RelatedLinksSection
              title="Start with these tools"
              links={getRelatedTools("website-builder", 3)}
            />
          </div>
          <div className="mt-12">
            <RelatedLinksSection title="Business resources" links={getRelatedBusinessResources()} />
          </div>

          <div className="mt-14 flex justify-center">
            <SiteButton href="/signup" size="lg">
              Start building free
            </SiteButton>
          </div>
        </section>
      </SiteShell>
    </>
  );
}
