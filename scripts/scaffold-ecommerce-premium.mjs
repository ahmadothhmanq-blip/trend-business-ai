/**
 * Scaffold ecommerce-premium flagship V2 package from saas-enterprise.
 * Run: node scripts/scaffold-ecommerce-premium.mjs
 */
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "templates", "website", "saas-enterprise");
const destDir = path.join(root, "templates", "website", "ecommerce-premium");

const RENAMES = [
  ["saas-enterprise-features.tsx", "ecommerce-premium-collections.tsx"],
  ["saas-enterprise-about.tsx", "ecommerce-premium-brand-story.tsx"],
  ["saas-enterprise-pricing.tsx", "ecommerce-premium-shipping.tsx"],
  ["saas-enterprise-integrations.tsx", "ecommerce-premium-product-grid.tsx"],
];

const COMPONENT_ID_MAP = {
  "saas-enterprise-features": "ecommerce-premium-collections",
  "saas-enterprise-about": "ecommerce-premium-brand-story",
  "saas-enterprise-pricing": "ecommerce-premium-shipping",
  "saas-enterprise-integrations": "ecommerce-premium-product-grid",
};

function transform(content) {
  let out = content
    .replaceAll("saas-enterprise", "ecommerce-premium")
    .replaceAll("SaasEnterprise", "EcommercePremium")
    .replaceAll("se-", "ec-")
    .replaceAll("SAAS_ENTERPRISE_IMAGES", "ECOMMERCE_PREMIUM_IMAGES")
    .replaceAll("nexus-command", "atelier-commerce")
    .replaceAll("nexus-grid-reveal", "atelier-reveal")
    .replaceAll('"sectorDnaId": "saas"', '"sectorDnaId": "ecommerce"')
    .replaceAll(
      '"experienceProfiles": ["technical", "corporate", "executive"]',
      '"experienceProfiles": ["commerce", "editorial", "luxury"]',
    )
    .replaceAll("ti-saas-growth", "ti-ecommerce-atelier")
    .replaceAll("SaaS Enterprise", "E-commerce Premium")
    .replaceAll("Northline product systems", "Atelier commerce — editorial product curation")
    .replaceAll("saas-enterprise-gtm", "ecommerce-premium-atelier");

  for (const [from, to] of Object.entries(COMPONENT_ID_MAP)) {
    out = out.replaceAll(from, to);
  }
  return out;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function main() {
  await rm(destDir, { recursive: true, force: true });
  await cp(srcDir, destDir, { recursive: true });

  const files = await walk(destDir);
  for (const file of files) {
    if (file.endsWith("saas-enterprise-portfolio.tsx")) {
      await rm(file);
      continue;
    }
    let content = await readFile(file, "utf8");
    content = transform(content);
    await writeFile(file, content);
  }

  const compDir = path.join(destDir, "components");
  for (const [from, to] of RENAMES) {
    const fromPath = path.join(compDir, from.replace("saas-enterprise", "ecommerce-premium"));
    const toPath = path.join(compDir, to);
    try {
      await rename(fromPath, toPath);
    } catch {
      // already renamed via global replace in filename? filenames still saas-* until rename
    }
  }

  // Fix renames — files were copied with saas names then content replaced
  for (const [from, to] of RENAMES) {
    const fromPath = path.join(compDir, from);
    const toPath = path.join(compDir, to);
    try {
      await rename(fromPath, toPath);
    } catch {
      /* ok */
    }
  }

  const registry = JSON.parse(
    await readFile(path.join(compDir, "registry.json"), "utf8"),
  );
  registry.components = registry.components
    .filter((c) => !c.id.includes("portfolio"))
    .map((c) => ({
      ...c,
      scaffold: c.scaffold
        ?.replace("saas-enterprise-features", "ecommerce-premium-collections")
        .replace("saas-enterprise-about", "ecommerce-premium-brand-story")
        .replace("saas-enterprise-pricing", "ecommerce-premium-shipping")
        .replace("saas-enterprise-integrations", "ecommerce-premium-product-grid"),
    }));
  await writeFile(path.join(compDir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

  const presentation = {
    packageId: "ecommerce-premium",
    templateIntelligenceHint: "ti-ecommerce-atelier",
    layout: {
      defaultLayoutId: "default",
      regions: {
        header: { role: "header", sticky: true },
        main: { role: "main" },
        utility: { role: "utility" },
        footer: { role: "footer" },
        overlay: { role: "overlay" },
      },
    },
    navigation: {
      componentId: "ecommerce-premium-nav",
      variant: "atelier-glass",
    },
    hero: { componentId: "ecommerce-premium-hero", region: "main" },
    footer: { componentId: "ecommerce-premium-footer", region: "footer" },
    homeFlow: {
      regions: {
        main: [
          "ecommerce-premium-hero",
          "ecommerce-premium-collections",
          "ecommerce-premium-product-grid",
          "ecommerce-premium-brand-story",
          "ecommerce-premium-stats",
          "ecommerce-premium-testimonials",
          "ecommerce-premium-shipping",
          "ecommerce-premium-faq",
          "ecommerce-premium-contact",
        ],
        utility: ["ecommerce-premium-utility-band"],
        overlay: ["ecommerce-premium-floating-cta"],
      },
    },
    sectionShell: {
      strategy: "package",
      componentId: "ecommerce-premium-section-shell",
    },
    aiGeneration: {
      contentProfile: "ecommerce-premium-atelier",
      suggestedPages: ["shop", "collections", "about"],
    },
  };
  await mkdir(path.join(destDir, "presentation"), { recursive: true });
  await writeFile(
    path.join(destDir, "presentation", "presentation.json"),
    `${JSON.stringify(presentation, null, 2)}\n`,
  );

  const homeFlow = {
    pageId: "home",
    layoutId: "default",
    regions: {
      header: ["ecommerce-premium-nav"],
      main: presentation.homeFlow.regions.main,
      utility: presentation.homeFlow.regions.utility,
      overlay: presentation.homeFlow.regions.overlay,
      footer: ["ecommerce-premium-footer"],
    },
  };
  await writeFile(
    path.join(destDir, "flows", "home.json"),
    `${JSON.stringify(homeFlow, null, 2)}\n`,
  );

  const manifest = JSON.parse(await readFile(path.join(destDir, "manifest.json"), "utf8"));
  manifest.metadata.category = "ecommerce";
  manifest.metadata.industry = "E-commerce";
  manifest.metadata.tags = ["ecommerce", "retail", "luxury", "editorial"];
  manifest.metadata.keywords = ["ecommerce", "shop", "store", "catalog"];
  manifest.metadata.templateIntelligenceId = "ti-ecommerce-atelier";
  manifest.pages = [
    { id: "home", title: "Home", path: "/", layoutId: "default", file: "pages/home.json", description: "Home — premium e-commerce page blueprint." },
    { id: "shop", title: "Shop", path: "/shop", layoutId: "default", file: "pages/shop.json", description: "Shop — premium e-commerce page blueprint." },
    { id: "collections", title: "Collections", path: "/collections", layoutId: "default", file: "pages/collections.json", description: "Collections — premium e-commerce page blueprint." },
    { id: "about", title: "About", path: "/about", layoutId: "default", file: "pages/about.json", description: "About — premium e-commerce page blueprint." },
  ];
  manifest.pageFlows = {
    home: "flows/home.json",
    shop: "flows/shop.json",
    collections: "flows/collections.json",
    about: "flows/about.json",
  };
  await writeFile(path.join(destDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  for (const pageId of ["shop", "collections", "about"]) {
    await writeFile(
      path.join(destDir, "pages", `${pageId}.json`),
      `${JSON.stringify({ id: pageId, title: pageId.charAt(0).toUpperCase() + pageId.slice(1), path: `/${pageId}`, layoutId: "default", regions: manifest.regions.map((r) => r.id) }, null, 2)}\n`,
    );
    await writeFile(
      path.join(destDir, "flows", `${pageId}.json`),
      `${JSON.stringify({ pageId, layoutId: "default", regions: homeFlow.regions }, null, 2)}\n`,
    );
  }

  console.log("✓ scaffolded ecommerce-premium at", destDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
