/**
 * Audit nav label → manifest page path coverage per template.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const mapSrc = readFileSync(
  join(root, "lib/website/builder/template-package-ti-mapping.ts"),
  "utf8",
);
const tiEntries = [...mapSrc.matchAll(/^\s+"([a-z0-9-]+)":\s*"(ti-[^"]+)"/gm)];

const dataSrc = readFileSync(
  join(root, "lib/website/builder/industry-preview-profiles-data.ts"),
  "utf8",
);
const profileEntries = [
  ...dataSrc.matchAll(/"(ti-[^"]+)":\s*\{[\s\S]*?navLinkLabels:\s*\[([^\]]+)\]/g),
];
const navByTi = new Map(
  profileEntries.map((m) => [
    m[1],
    [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
  ]),
);

const LABEL_TO_PAGE = {
  about: { id: "about", path: "/about" },
  services: { id: "services", path: "/services" },
  contact: { id: "contact", path: "/contact" },
  work: { id: "work", path: "/work" },
  studio: { id: "studio", path: "/studio" },
  menu: { id: "menu", path: "/menu" },
  gallery: { id: "gallery", path: "/gallery" },
  reserve: { id: "reservations", path: "/reservations" },
  reservations: { id: "reservations", path: "/reservations" },
  story: { id: "story", path: "/story" },
  events: { id: "visit", path: "/visit" },
  visit: { id: "visit", path: "/visit" },
  rooms: { id: "rooms", path: "/rooms" },
  spa: { id: "spa", path: "/spa" },
  dining: { id: "dining", path: "/dining" },
  destinations: { id: "destinations", path: "/destinations" },
  packages: { id: "packages", path: "/packages" },
  book: { id: "book", path: "/book" },
  listings: { id: "listings", path: "/listings" },
  neighborhoods: { id: "neighborhoods", path: "/neighborhoods" },
  agents: { id: "agents", path: "/agents" },
  projects: { id: "projects", path: "/projects" },
  process: { id: "process", path: "/process" },
  capabilities: { id: "capabilities", path: "/capabilities" },
  safety: { id: "safety", path: "/safety" },
  physicians: { id: "doctors", path: "/doctors" },
  patients: { id: "appointments", path: "/appointments" },
  treatments: { id: "treatments", path: "/treatments" },
  team: { id: "team", path: "/team" },
  reviews: { id: "book", path: "/book" },
  wellness: { id: "wellness", path: "/wellness" },
  practice: { id: "practice", path: "/practice" },
  attorneys: { id: "attorneys", path: "/attorneys" },
  results: { id: "results", path: "/results" },
  plans: { id: "plans", path: "/plans" },
  claims: { id: "claims", path: "/claims" },
  programs: { id: "programs", path: "/programs" },
  campus: { id: "faculty", path: "/faculty" },
  admissions: { id: "enroll", path: "/enroll" },
  academics: { id: "schools", path: "/schools" },
  research: { id: "research", path: "/research" },
  apply: { id: "admissions", path: "/admissions" },
  shop: { id: "shop", path: "/shop" },
  collections: { id: "collections", path: "/collections" },
  collection: { id: "collections", path: "/collections" },
  lookbook: { id: "runway", path: "/runway" },
  atelier: { id: "boutiques", path: "/boutiques" },
  products: { id: "products", path: "/products" },
  pricing: { id: "pricing", path: "/pricing" },
  trainers: { id: "trainers", path: "/trainers" },
  join: { id: "join", path: "/join" },
  inventory: { id: "inventory", path: "/inventory" },
  models: { id: "models", path: "/models" },
  service: { id: "test-drive", path: "/test-drive" },
  fleet: { id: "services", path: "/services" },
  coverage: { id: "tracking", path: "/tracking" },
  quality: { id: "quality", path: "/quality" },
  industries: { id: "capabilities", path: "/capabilities" },
  mission: { id: "mission", path: "/mission" },
  stories: { id: "impact", path: "/impact" },
  give: { id: "donate", path: "/donate" },
  features: { id: "features", path: "/features" },
  customers: { id: "pricing", path: "/pricing" },
  docs: { id: "docs", path: "/docs" },
  platform: { id: "platform", path: "/platform" },
  "use cases": { id: "research", path: "/research" },
  security: { id: "careers", path: "/careers" },
  solutions: { id: "solutions", path: "/solutions" },
  insights: { id: "insights", path: "/insights" },
  campaigns: { id: "campaigns", path: "/campaigns" },
  journal: { id: "journal", path: "/journal" },
};

function resolveNavTarget(label) {
  const key = label.trim().toLowerCase();
  if (LABEL_TO_PAGE[key]) return LABEL_TO_PAGE[key];
  const slug = key.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return { id: slug, path: `/${slug}` };
}

function pageMatches(manifestPages, target, label) {
  return manifestPages.some(
    (p) =>
      p.id === target.id ||
      p.path === target.path ||
      p.title.toLowerCase() === label.toLowerCase(),
  );
}

const gaps = [];
for (const match of tiEntries) {
  const templateId = match[1];
  const tiId = match[2];
  const navLabels = navByTi.get(tiId) ?? [];
  const manifest = JSON.parse(
    readFileSync(join(root, "templates/website", templateId, "manifest.json"), "utf8"),
  );
  for (const label of navLabels) {
    const target = resolveNavTarget(label);
    if (!pageMatches(manifest.pages, target, label)) {
      gaps.push({
        templateId,
        label,
        expectedId: target.id,
        expectedPath: target.path,
        actual: manifest.pages.map((p) => `${p.id}:${p.path}`),
      });
    }
  }
}

console.log(JSON.stringify(gaps, null, 2));
console.log("gap count", gaps.length);
