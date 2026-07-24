#!/usr/bin/env node
/** Wire website-builder panel components to useProductT */
import fs from "node:fs";
import path from "node:path";

const PANELS_DIR = path.join(process.cwd(), "components/dashboard/website-builder");
const files = fs.readdirSync(PANELS_DIR).filter((f) => f.endsWith(".tsx"));

const IMPORT = `import { useProductT } from "@/lib/i18n/use-scoped-t";`;

const REPLACEMENTS = [
  ['toast.error("Failed to load"', 'toast.error(wb("management.errors.loadFailed")'],
  ['"Load failed"', 'wb("management.errors.loadFailed")'],
  ['"Action failed"', 'wb("management.errors.actionFailed")'],
  ['title="Template preview"', 'title={wb("panels.templatePreview")}'],
  ['"Template details"', 'wb("panels.templateDetails")'],
  ['"Review this template, then generate a new website project."', 'wb("panels.templateReviewHint")'],
  ['"Failed to load templates"', 'wb("panels.failedLoadTemplates")'],
  ['"Could not apply template"', 'wb("panels.failedApplyTemplate")'],
  ['"Failed to load brand kits"', 'wb("panels.failedLoadBrandKits")'],
  ['"Analysis failed"', 'wb("panels.failedAnalyze")'],
  ['"Failed to load deployment"', 'wb("panels.failedLoadDeployment")'],
  ['"Failed to load"', 'wb("panels.failedLoad")'],
  ['toast.success("Domain added — configure DNS, then verify.")', 'toast.success(wb("panels.domainAdded"))'],
  ['"Failed to add domain"', 'wb("panels.failedAddDomain")'],
  ['"Verification complete"', 'wb("panels.verificationComplete")'],
  ['"Verification failed"', 'wb("panels.verificationFailed")'],
  ['toast.success("Domain removed")', 'toast.success(wb("panels.domainRemoved"))'],
  ['"Remove failed"', 'wb("panels.removeFailed")'],
  ['"Publish to get a public URL"', 'wb("panels.publishForUrl")'],
  ['"Certificate ready"', 'wb("panels.certificateReady")'],
  ['"Activates after publish / domain verify"', 'wb("panels.certificatePending")'],
  ['"Connected intelligence systems"', 'wb("panels.connectedSystems")'],
  ['label="Public path"', 'label={wb("panels.publicPath")}'],
  ['"Not published"', 'wb("panels.notPublished")'],
  ['"Assigns from your username"', 'wb("panels.subdomainHint")'],
  ['label="Custom domain"', 'label={wb("panels.customDomain")}'],
  ['"None connected"', 'wb("panels.noneConnected")'],
  ['"Failed to load SEO"', 'wb("panels.failedLoadSeo")'],
  ['"Apply failed"', 'wb("panels.applyFailed")'],
  ['"Failed to load experiments"', 'wb("panels.failedLoadExperiments")'],
  ['"Status update failed"', 'wb("panels.statusUpdateFailed")'],
  ['"No hypothesis set"', 'wb("panels.noHypothesis")'],
  ['"Create failed"', 'wb("panels.createFailed")'],
  ['placeholder="Experiment name"', 'placeholder={wb("panels.experimentNamePlaceholder")}'],
  ['placeholder="Target section (e.g. hero, pricing)"', 'placeholder={wb("panels.targetSectionPlaceholder")}'],
  ['"Failed to load analytics"', 'wb("panels.failedLoadAnalytics")'],
  ['label="Unique visitors"', 'label={wb("panels.uniqueVisitors")}'],
  ['label="Page views"', 'label={wb("panels.pageViews")}'],
  ['label="Button clicks"', 'label={wb("panels.buttonClicks")}'],
  ['title="Traffic sources"', 'title={wb("panels.trafficSources")}'],
  ['title="Devices"', 'title={wb("panels.devices")}'],
  ['placeholder="Content title"', 'placeholder={wb("management.cms.titlePlaceholder")}'],
  ['placeholder="Tell the assistant what to change…"', 'placeholder={wb("management.assistant.placeholder")}'],
  ['"Ready to publish"', 'wb("management.quality.readyToPublish")'],
  ['"Blocked"', 'wb("management.quality.blocked")'],
  ['title: "New item"', 'title: wb("management.catalog.newItem")'],
  ['description: "Added from management dashboard"', 'description: wb("management.catalog.newItemDescription")'],
  ['window.prompt("New price"', 'window.prompt(wb("management.catalog.pricePrompt")'],
];

for (const file of files) {
  if (file === "website-management-dashboard.tsx") continue;
  const filePath = path.join(PANELS_DIR, file);
  let c = fs.readFileSync(filePath, "utf8");
  if (!c.includes("useProductT")) {
    const anchor = c.includes('from "@/lib/utils"')
      ? 'import { cn } from "@/lib/utils";'
      : '"use client";';
    if (anchor === '"use client";') {
      c = c.replace('"use client";\n', `"use client";\n\n${IMPORT}\n`);
    } else {
      c = c.replace(anchor, `${anchor}\n${IMPORT}`);
    }
    const fn = c.match(/export function \w+[^{]*\{/);
    if (fn) c = c.replace(fn[0], `${fn[0]}\n  const wb = useProductT("websiteBuilder");`);
  }
  let n = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      n++;
    }
  }
  if (n > 0) fs.writeFileSync(filePath, c);
  console.log(file, n);
}
