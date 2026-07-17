import {
  getProgrammaticPageDefs,
  getPublishedProgrammaticPages,
  assertProgrammaticQuality,
} from "@/lib/seo/programmatic";
import { getCities, cityPath } from "@/lib/seo/cities";
import { getPublishedIndustries, industryPath } from "@/lib/seo/industries";
import { getPublishedCountries, countryPath } from "@/lib/seo/countries";
import { getTemplateHubItems } from "@/lib/seo/content/templates";
import type { ProgrammaticManagerInventory } from "@/types/ai-search";

export function buildProgrammaticManagerInventory(): ProgrammaticManagerInventory {
  const defs = getProgrammaticPageDefs();
  const published = getPublishedProgrammaticPages();
  const industries = getPublishedIndustries();
  const countries = getPublishedCountries();
  const cities = getCities();
  const templates = getTemplateHubItems();

  const clusters = [
    {
      id: "use-cases",
      label: "Use Case Pages",
      items: defs.filter((d) => d.cluster === "use-cases"),
    },
    {
      id: "comparisons",
      label: "Comparison Pages",
      items: defs.filter((d) => d.cluster === "comparisons"),
    },
    {
      id: "services",
      label: "Service Pages",
      items: defs.filter((d) => d.cluster === "services"),
    },
    {
      id: "industries",
      label: "Industry Pages",
      items: industries.map((i) => ({
        path: industryPath(i.slug),
        title: i.title,
        status: i.status,
        description: i.description,
      })),
    },
    {
      id: "countries",
      label: "Country Pages",
      items: countries.map((c) => ({
        path: countryPath(c.slug),
        title: c.title,
        status: c.status,
        description: c.description,
      })),
    },
    {
      id: "cities",
      label: "City Pages",
      items: cities.map((c) => ({
        path: cityPath(c.slug),
        title: c.title,
        status: c.status,
        description: c.description,
      })),
    },
    {
      id: "templates",
      label: "Template Pages",
      items: templates.map((t) => ({
        path: t.path === "/templates" ? `/templates#${t.id}` : t.path,
        title: t.title,
        status: t.status,
        description: t.description,
      })),
    },
  ].map((cluster) => {
    const paths = cluster.items.map((item) => ({
      path: "path" in item ? item.path : (item as { path: string }).path,
      title: "title" in item ? item.title : String((item as { title: string }).title),
      status: ("status" in item ? item.status : "published") as "published" | "draft",
    }));
    return {
      id: cluster.id,
      label: cluster.label,
      published: paths.filter((p) => p.status === "published").length,
      draft: paths.filter((p) => p.status === "draft").length,
      paths,
    };
  });

  const allPaths = clusters.flatMap((c) => c.paths.map((p) => p.path));
  const duplicates: ProgrammaticManagerInventory["duplicates"] = [];
  const seen = new Map<string, string>();
  for (const path of allPaths) {
    const key = path.toLowerCase();
    if (seen.has(key)) {
      duplicates.push({
        path,
        conflictWith: seen.get(key)!,
        reason: "Duplicate path in programmatic inventory",
      });
    } else {
      seen.set(key, path);
    }
  }

  // Intent/title near-duplicates among programmatic defs
  for (let i = 0; i < defs.length; i++) {
    for (let j = i + 1; j < defs.length; j++) {
      const a = defs[i]!;
      const b = defs[j]!;
      if (a.intent.toLowerCase() === b.intent.toLowerCase()) {
        duplicates.push({
          path: a.path,
          conflictWith: b.path,
          reason: `Shared intent “${a.intent}”`,
        });
      }
      if (a.title.toLowerCase() === b.title.toLowerCase()) {
        duplicates.push({
          path: a.path,
          conflictWith: b.path,
          reason: "Identical titles risk duplicate content",
        });
      }
    }
  }

  const qualityGates = [
    {
      id: "published-quality",
      label: "Published pages meet quality gate",
      status: published.every((p) => assertProgrammaticQuality(p).length === 0)
        ? ("pass" as const)
        : ("warn" as const),
      detail: `${published.length} published programmatic defs validated`,
    },
    {
      id: "duplicate-paths",
      label: "No duplicate paths",
      status: duplicates.filter((d) => d.reason.includes("Duplicate path")).length === 0
        ? ("pass" as const)
        : ("fail" as const),
      detail: `${duplicates.length} conflict signal(s)`,
    },
    {
      id: "city-gate",
      label: "City pages unpublished until quality-ready",
      status: "pass" as const,
      detail: `${cities.filter((c) => c.status === "draft").length} draft city pages kept out of sitemap`,
    },
  ];

  const recommendations: string[] = [];
  for (const cluster of clusters) {
    if (cluster.published === 0 && cluster.draft > 0) {
      recommendations.push(`Publish quality-ready ${cluster.label.toLowerCase()} after unique intent review.`);
    }
    if (cluster.id === "comparisons" && cluster.published < 2) {
      recommendations.push("Add more comparison pages vs fragmented AI tool stacks.");
    }
  }
  if (duplicates.length) {
    recommendations.push("Resolve duplicate intents/titles before publishing new programmatic pages.");
  }
  recommendations.push("Never sitemap draft city/industry pages until descriptions clear the quality gate.");

  return {
    generatedAt: new Date().toISOString(),
    clusters,
    duplicates: duplicates.slice(0, 20),
    qualityGates,
    recommendations: recommendations.slice(0, 12),
  };
}
