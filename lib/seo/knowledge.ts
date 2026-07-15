/**
 * Knowledge Center foundation — Academy, Tutorials, Guides, Docs, Glossary, Case Studies.
 * Registry-first: only published entries are sitemapped. No thin placeholder URLs.
 */

export type KnowledgeKind =
  | "academy"
  | "tutorial"
  | "guide"
  | "documentation"
  | "glossary"
  | "case-study";

export type KnowledgeEntry = {
  id: string;
  kind: KnowledgeKind;
  title: string;
  description: string;
  path: string;
  status: "draft" | "published";
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
};

/** Hub routes for the knowledge center (always indexable). */
export const KNOWLEDGE_HUBS = [
  {
    id: "learn",
    title: "Knowledge Center",
    description: "Academy, tutorials, guides, documentation, glossary and case studies.",
    path: "/learn",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "Product documentation for building, saving and exporting AI business assets.",
    path: "/docs",
  },
  {
    id: "resources",
    title: "Business Resources",
    description: "Curated resources for founders and operators using Trend Business AI.",
    path: "/resources",
  },
] as const;

/**
 * Content entries. Keep draft until real editorial content exists —
 * prevents low-quality / empty URLs from entering the index.
 */
const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "getting-started",
    kind: "documentation",
    title: "Getting started with Trend Business AI",
    description: "Create an account, open your dashboard, and run your first AI generation.",
    path: "/docs",
    status: "published",
    tags: ["onboarding", "docs"],
    publishedAt: "2026-01-15",
  },
];

export function getKnowledgeEntries(kind?: KnowledgeKind) {
  return kind ? KNOWLEDGE_ENTRIES.filter((entry) => entry.kind === kind) : KNOWLEDGE_ENTRIES;
}

export function getPublishedKnowledgeByKind() {
  const published = KNOWLEDGE_ENTRIES.filter((entry) => entry.status === "published");
  return {
    academy: published.filter((e) => e.kind === "academy"),
    tutorials: published.filter((e) => e.kind === "tutorial"),
    guides: published.filter((e) => e.kind === "guide"),
    documentation: published.filter((e) => e.kind === "documentation"),
    glossary: published.filter((e) => e.kind === "glossary"),
    caseStudies: published.filter((e) => e.kind === "case-study"),
  };
}
