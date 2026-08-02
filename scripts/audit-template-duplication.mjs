/**
 * Visual duplication analysis for installed Website Builder templates.
 * Usage: node scripts/audit-template-duplication.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_TEMPLATE_LIBRARY } from "./premium-template-definitions.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "__WB_TEMPLATE_DUP__";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function colorDistance(a, b) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const dr = ra[0] - rb[0];
  const dg = ra[1] - rb[1];
  const db = ra[2] - rb[2];
  return Math.sqrt(dr * dr + dg * dg + db * db) / 441.67;
}

function paletteSimilarity(colorsA, colorsB) {
  const keys = ["primary", "secondary", "accent", "background", "foreground", "surface"];
  let total = 0;
  let count = 0;
  for (const key of keys) {
    if (colorsA[key] && colorsB[key]) {
      total += 1 - colorDistance(colorsA[key], colorsB[key]);
      count++;
    }
  }
  return count ? total / count : 0;
}

function typographySimilarity(a, b) {
  const displayMatch = (a.display?.split(",")[0] ?? "") === (b.display?.split(",")[0] ?? "");
  const bodyMatch = (a.body?.split(",")[0] ?? "") === (b.body?.split(",")[0] ?? "");
  const scaleMatch = JSON.stringify(a.scale) === JSON.stringify(b.scale);
  return (displayMatch ? 0.45 : 0) + (bodyMatch ? 0.35 : 0) + (scaleMatch ? 0.2 : 0);
}

function layoutFingerprint(t) {
  const regions = [...t.regionIds].sort().join("+");
  const grid = t.grid?.templateAreas ?? t.layoutKind;
  return `${t.layoutKind}|${regions}|${grid}`;
}

function layoutSimilarity(a, b) {
  const fpA = layoutFingerprint(a);
  const fpB = layoutFingerprint(b);
  if (fpA === fpB) return 1;
  if (a.layoutKind === b.layoutKind) {
    const setA = new Set(a.regionIds);
    const setB = new Set(b.regionIds);
    const union = new Set([...setA, ...setB]);
    let inter = 0;
    for (const r of setA) if (setB.has(r)) inter++;
    const jaccard = inter / union.size;
    return 0.35 + jaccard * 0.45;
  }
  const setA = new Set(a.regionIds);
  const setB = new Set(b.regionIds);
  const union = new Set([...setA, ...setB]);
  let inter = 0;
  for (const r of setA) if (setB.has(r)) inter++;
  return (inter / union.size) * 0.5;
}

function pageSimilarity(a, b) {
  const pathsA = a.pageDefs.map((p) => p.path).sort();
  const pathsB = b.pageDefs.map((p) => p.path).sort();
  if (JSON.stringify(pathsA) === JSON.stringify(pathsB)) return 1;
  const setA = new Set(pathsA);
  const setB = new Set(pathsB);
  const union = new Set([...setA, ...setB]);
  let inter = 0;
  for (const p of setA) if (setB.has(p)) inter++;
  return inter / union.size;
}

function tokenSimilarity(a, b) {
  const ca = a.canvas;
  const cb = b.canvas;
  const spacing = JSON.stringify(ca.spacingScale) === JSON.stringify(cb.spacingScale) ? 1 : 0.3;
  const radius = JSON.stringify(ca.radius) === JSON.stringify(cb.radius) ? 1 : 0.4;
  const gutter = ca.gutter === cb.gutter ? 1 : 0.5;
  const maxW = ca.maxWidth === cb.maxWidth ? 1 : 0.6;
  const anim = ca.animation === cb.animation ? 1 : 0.2;
  return (spacing + radius + gutter + maxW + anim) / 5;
}

function heroSimilarity(a, b) {
  const heroA = {
    fullBleed: a.layoutKind === "full-bleed",
    overlay: a.regionIds.includes("overlay"),
    utility: a.regionIds.includes("utility"),
    sidebar: a.regionIds.includes("sidebar"),
    order: a.grid?.templateAreas ?? a.regionIds.join(" "),
  };
  const heroB = {
    fullBleed: b.layoutKind === "full-bleed",
    overlay: b.regionIds.includes("overlay"),
    utility: b.regionIds.includes("utility"),
    sidebar: b.regionIds.includes("sidebar"),
    order: b.grid?.templateAreas ?? b.regionIds.join(" "),
  };
  let score = 0;
  if (heroA.fullBleed === heroB.fullBleed) score += 0.3;
  if (heroA.overlay === heroB.overlay) score += 0.25;
  if (heroA.utility === heroB.utility) score += 0.15;
  if (heroA.sidebar === heroB.sidebar) score += 0.1;
  if (heroA.order === heroB.order) score += 0.2;
  return score;
}

function overallSimilarity(a, b) {
  const weights = {
    layout: 0.22,
    hero: 0.15,
    palette: 0.2,
    typography: 0.15,
    tokens: 0.1,
    pages: 0.08,
    category: a.category === b.category ? 0.1 : 0,
  };
  const layout = layoutSimilarity(a, b);
  const hero = heroSimilarity(a, b);
  const palette = paletteSimilarity(a.canvas.colors, b.canvas.colors);
  const typography = typographySimilarity(a.canvas.typography, b.canvas.typography);
  const tokens = tokenSimilarity(a, b);
  const pages = pageSimilarity(a, b);
  const category = a.category === b.category ? 1 : 0;

  const score =
    layout * weights.layout +
    hero * weights.hero +
    palette * weights.palette +
    typography * weights.typography +
    tokens * weights.tokens +
    pages * weights.pages +
    category * weights.category;

  return {
    overall: Math.round(score * 100),
    breakdown: {
      layout: Math.round(layout * 100),
      hero: Math.round(hero * 100),
      palette: Math.round(palette * 100),
      typography: Math.round(hero * 100),
      tokens: Math.round(tokens * 100),
      pages: Math.round(pages * 100),
      category: Math.round(category * 100),
    },
  };
}

function clusterPairs(templates, threshold) {
  const pairs = [];
  for (let i = 0; i < templates.length; i++) {
    for (let j = i + 1; j < templates.length; j++) {
      const sim = overallSimilarity(templates[i], templates[j]);
      if (sim.overall >= threshold) {
        pairs.push({
          a: templates[i].id,
          b: templates[j].id,
          nameA: templates[i].name,
          nameB: templates[j].name,
          ...sim,
        });
      }
    }
  }
  pairs.sort((x, y) => y.overall - x.overall);
  return pairs;
}

function buildClusters(pairs, threshold) {
  const parent = new Map();
  function find(x) {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
    return parent.get(x);
  }
  function union(a, b) {
    parent.set(find(a), find(b));
  }
  for (const p of pairs) {
    if (p.overall >= threshold) union(p.a, p.b);
  }
  const clusters = new Map();
  for (const p of pairs) {
    if (p.overall >= threshold) {
      const root = find(p.a);
      if (!clusters.has(root)) clusters.set(root, new Set());
      clusters.get(root).add(p.a);
      clusters.get(root).add(p.b);
    }
  }
  return [...clusters.values()].map((s) => [...s].sort());
}

const templates = PREMIUM_TEMPLATE_LIBRARY;
const highPairs = clusterPairs(templates, 60);
const clusters = buildClusters(highPairs, 68);

const layoutGroups = new Map();
for (const t of templates) {
  const key = layoutFingerprint(t);
  if (!layoutGroups.has(key)) layoutGroups.set(key, []);
  layoutGroups.get(key).push(t.id);
}

const typographyDupes = new Map();
for (const t of templates) {
  const key = `${t.canvas.typography.display?.split(",")[0]}|${t.canvas.typography.body?.split(",")[0]}`;
  if (!typographyDupes.has(key)) typographyDupes.set(key, []);
  typographyDupes.get(key).push(t.id);
}

const report = {
  templateCount: templates.length,
  highSimilarityPairs: highPairs,
  clusters68: clusters,
  pairsAt60Plus: highPairs.filter((p) => p.overall >= 60),
  identicalLayoutFingerprints: [...layoutGroups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([fp, ids]) => ({ fingerprint: fp, templates: ids })),
  sharedTypographyPairs: [...typographyDupes.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([fonts, ids]) => ({ fonts, templates: ids })),
  fullBleedTemplates: templates.filter((t) => t.layoutKind === "full-bleed").map((t) => t.id),
  sidebarLeftTemplates: templates.filter((t) => t.layoutKind === "sidebar-left").map((t) => t.id),
  sidebarRightTemplates: templates.filter((t) => t.layoutKind === "sidebar-right").map((t) => t.id),
  singleColumnTemplates: templates.filter((t) => t.layoutKind === "single-column").map((t) => t.id),
};

console.log(MARKER + JSON.stringify(report, null, 2));
