import {
  getKnowledgeEntries,
  getPublishedKnowledgeByKind,
  KNOWLEDGE_HUBS,
  type KnowledgeKind,
} from "@/lib/seo/knowledge";
import type { KnowledgeManagerInventory } from "@/types/ai-search";

const KIND_LABELS: Record<KnowledgeKind, string> = {
  academy: "Academy",
  tutorial: "Tutorials",
  guide: "Guides",
  documentation: "Documentation",
  glossary: "Glossary",
  "case-study": "Case Studies",
};

const REQUIRED_KINDS: KnowledgeKind[] = [
  "academy",
  "tutorial",
  "guide",
  "documentation",
  "glossary",
  "case-study",
];

export function buildKnowledgeManagerInventory(): KnowledgeManagerInventory {
  const all = getKnowledgeEntries();
  const publishedByKind = getPublishedKnowledgeByKind();

  const byKind: KnowledgeManagerInventory["byKind"] = {};
  for (const kind of REQUIRED_KINDS) {
    const entries = all.filter((e) => e.kind === kind);
    byKind[KIND_LABELS[kind]] = {
      published: entries.filter((e) => e.status === "published").length,
      draft: entries.filter((e) => e.status === "draft").length,
      entries: entries.map((e) => ({
        id: e.id,
        title: e.title,
        path: e.path,
        status: e.status,
      })),
    };
  }

  const gaps: KnowledgeManagerInventory["gaps"] = [];
  for (const kind of REQUIRED_KINDS) {
    const label = KIND_LABELS[kind];
    const bucket = byKind[label]!;
    if (bucket.published === 0) {
      gaps.push({
        kind: label,
        message: `No published ${label.toLowerCase()} entries yet.`,
        priority: kind === "documentation" || kind === "guide" ? "high" : "medium",
      });
    }
  }

  // FAQ / best practices mapped onto guides + docs gaps for AI Search Knowledge Center
  if ((publishedByKind.guides?.length ?? 0) === 0) {
    gaps.push({
      kind: "Best Practices",
      message: "Publish best-practice guides for AEO/GEO and product workflows.",
      priority: "high",
    });
  }

  const recommendations = [
    ...gaps.slice(0, 6).map((g) => `Fill gap: ${g.message}`),
    "Keep draft knowledge entries out of sitemaps until editorial quality passes.",
    "Link knowledge hubs from product pages to strengthen AI citation paths.",
  ];

  return {
    generatedAt: new Date().toISOString(),
    hubs: KNOWLEDGE_HUBS.map((h) => ({ id: h.id, title: h.title, path: h.path })),
    byKind,
    gaps,
    recommendations: recommendations.slice(0, 12),
  };
}
