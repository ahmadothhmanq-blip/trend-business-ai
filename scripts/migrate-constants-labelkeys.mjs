#!/usr/bin/env node
/**
 * Add labelKey / descriptionKey to lib/constants/*.ts definitions.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function toCamel(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function addKeysToContentStudio(filePath) {
  let c = fs.readFileSync(filePath, "utf8");
  let n = 0;

  c = c.replace(
    /export type ContentToolDefinition = \{([^}]+)\}/,
    `export type ContentToolDefinition = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultType: string;
  defaultOptions: string[];
}`,
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", description: "([^"]+)", icon:/g,
    (_, id, label, desc) => {
      const camel = toCamel(id);
      n++;
      return `{ id: "${id}", labelKey: "contentStudio.tools.${camel}.label", descriptionKey: "contentStudio.tools.${camel}.description", label: "${label}", description: "${desc}", icon:`;
    },
  );

  c = c.replace(
    /export type ContentTypeDefinition = \{([^}]+)\}/,
    `export type ContentTypeDefinition = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  label: string;
  description: string;
  category: string;
  categoryKey?: string;
  icon: LucideIcon;
  tools: string[];
}`,
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", description: "([^"]+)", category: "([^"]+)", icon:/g,
    (_, id, label, desc, cat) => {
      n++;
      const catKey = `constants.contentStudio.templateCategories.${slug(cat)}`;
      return `{ id: "${id}", labelKey: "constants.contentStudio.types.${id.replace(/-/g, "_")}.label", descriptionKey: "constants.contentStudio.types.${id.replace(/-/g, "_")}.description", label: "${label}", description: "${desc}", category: "${cat}", categoryKey: "${catKey}", icon:`;
    },
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", temp:/g,
    (_, id, label) => {
      n++;
      return `{ id: "${id}", labelKey: "constants.contentStudio.creativityLevels.${id}", label: "${label}", temp:`;
    },
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", category: "([^"]+)" \}/g,
    (_, id, label, cat) => {
      n++;
      return `{ id: "${id}", labelKey: "constants.contentStudio.options.${id.replace(/-/g, "_")}", label: "${label}", category: "${cat}" }`;
    },
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", color:/g,
    (_, id, label) => {
      n++;
      return `{ id: "${id}", labelKey: "constants.contentStudio.calendarStatuses.${id}", label: "${label}", color:`;
    },
  );

  if (!c.includes("resolveLabel")) {
    c = c.replace(
      'export function getContentToolLabel(id: string) {\n  return getContentTool(id)?.label ?? id;\n}',
      `export function getContentToolLabel(id: string, t?: (key: string) => string) {
  const tool = getContentTool(id);
  if (!tool) return id;
  if (t && tool.labelKey) {
    const translated = t(tool.labelKey);
    if (translated !== tool.labelKey) return translated;
  }
  return tool.label;
}`,
    );
    c = c.replace(
      'export function getContentTypeLabel(id: string) {\n  return getContentType(id)?.label ?? id;\n}',
      `export function getContentTypeLabel(id: string, t?: (key: string) => string) {
  const type = getContentType(id);
  if (!type) return id;
  if (t && type.labelKey) {
    const translated = t(type.labelKey);
    if (translated !== type.labelKey) return translated;
  }
  return type.label;
}`,
    );
  }

  fs.writeFileSync(filePath, c);
  return n;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function addKeysToWebsiteBuilder(filePath) {
  let c = fs.readFileSync(filePath, "utf8");
  if (c.includes("labelKey")) return 0;

  c = c.replace(
    /export const WEBSITE_TYPES = \[/,
    `export const WEBSITE_TYPE_KEYS: Record<string, string> = {
  Business: "business",
  Portfolio: "portfolio",
  "E-commerce": "e_commerce",
  SaaS: "saas",
  Blog: "blog",
  "Landing Page": "landing_page",
};

export const WEBSITE_TYPES = [`,
  );

  c = c.replace(
    /export const WEBSITE_COLOR_STYLES = \[/,
    `export const WEBSITE_COLOR_STYLE_KEYS: Record<string, string> = {
  "Black & Gold (Premium)": "black_gold_premium",
  "Dark Minimal": "dark_minimal",
  "Light Professional": "light_professional",
  "Bold Contrast": "bold_contrast",
  "Soft Neutral": "soft_neutral",
};

export const WEBSITE_COLOR_STYLES = [`,
  );

  c = c.replace(
    /export const WEBSITE_DESIGN_STYLES = \[/,
    `export const WEBSITE_DESIGN_STYLE_KEYS: Record<string, string> = {
  "Modern SaaS": "modern_saas",
  Corporate: "corporate",
  Minimal: "minimal",
  Creative: "creative",
  Luxury: "luxury",
};

export const WEBSITE_DESIGN_STYLES = [`,
  );

  c = c.replace(
    /export const WEBSITE_FEATURE_IDS = \[/,
    `export const WEBSITE_FEATURE_LABEL_KEYS: Record<string, string> = {
  login: "websiteFeatures.login",
  dashboard: "websiteFeatures.dashboard",
  blog: "websiteFeatures.blog",
  contact: "websiteFeatures.contact",
  booking: "websiteFeatures.booking",
  payment: "websiteFeatures.payment",
  chat: "websiteFeatures.chat",
};

export const WEBSITE_FEATURE_IDS = [`,
  );

  fs.writeFileSync(filePath, c);
  return 1;
}

function addKeysToAiAgents(filePath) {
  let c = fs.readFileSync(filePath, "utf8");
  if (c.includes("labelKey:")) return 0;
  let n = 0;

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", description: "([^"]+)",/g,
    (match, id, label, desc) => {
      if (!match.includes("icon:") && !match.includes("category:")) return match;
      n++;
      const key = id.replace(/-/g, "_");
      return `{ id: "${id}", labelKey: "constants.aiAgents.types.${key}.label", descriptionKey: "constants.aiAgents.types.${key}.description", label: "${label}", description: "${desc}",`;
    },
  );

  fs.writeFileSync(filePath, c);
  return n;
}

const results = [];
results.push(["content-studio", addKeysToContentStudio(path.join(ROOT, "lib/constants/content-studio.ts"))]);
results.push(["website-builder", addKeysToWebsiteBuilder(path.join(ROOT, "lib/constants/website-builder.ts"))]);
results.push(["ai-agents", addKeysToAiAgents(path.join(ROOT, "lib/constants/ai-agents.ts"))]);

for (const [name, count] of results) console.log(`${name}: ${count} updates`);
