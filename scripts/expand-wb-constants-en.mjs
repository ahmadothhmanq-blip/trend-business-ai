#!/usr/bin/env node
/** Add Website Builder panel + constants keys to en.json */
import fs from "node:fs";

const en = JSON.parse(fs.readFileSync("locales/en.json", "utf8"));
const wb = en.products.websiteBuilder;

Object.assign(wb, {
  outputTabs: {
    livePreview: "Live preview",
    visualEditor: "Visual editor",
    sourceFiles: "Source files",
    analytics: "Analytics",
    experiments: "Experiments",
    intelligence: "Intelligence",
    seoAgent: "SEO Agent",
    publish: "Publish",
    openEditorHint: "Generate a website first to open the visual editor.",
    createPreviewHint: "Create a website to open live preview inside the platform.",
  },
  workspace: {
    title: "AI Project Workspace",
    projectDetails: "Project Details",
    selectedFile: "Selected file",
    none: "None",
    packageManager: "Package manager",
    deploy: "Deploy",
    export: "Export",
    copyFile: "Copy file",
    rename: "Rename",
    favorite: "Favorite",
    delete: "Delete",
    allProjects: "All projects",
    searchProjects: "Search projects…",
  },
  management: {
    backToBuilder: "Back to Website Builder",
    tabs: {
      overview: "Overview",
      catalog: "Catalog",
      cms: "Content",
      brand: "Brand",
      leads: "Leads",
      assistant: "AI Assistant",
      quality: "Quality",
    },
    errors: {
      loadFailed: "Failed to load",
      actionFailed: "Action failed",
    },
    catalog: {
      newItem: "New item",
      newItemDescription: "Added from management dashboard",
      pricePrompt: "New price",
    },
    cms: {
      titlePlaceholder: "Content title",
    },
    brand: {
      businessName: "Business name",
      primary: "Primary color",
      secondary: "Secondary color",
      accent: "Accent color",
      displayFont: "Display font",
      bodyFont: "Body font",
    },
    assistant: {
      placeholder: "Tell the assistant what to change…",
    },
    quality: {
      readyToPublish: "Ready to publish",
      blocked: "Blocked",
    },
  },
  panels: {
    designTokensPending: "Design tokens will appear after generation.",
    assetsPending: "Assets will appear after generation.",
    buildingProject: "Building generated project",
    compileFailed: "Generated project failed to compile",
    buildingNextApp: "Building generated Next.js app",
    previewPending: "Preview will appear here",
    buildFailed: "Build failed",
    noRecentProjects: "No recent projects yet",
    templateDetails: "Template details",
    templateReviewHint: "Review this template, then generate a new website project.",
    templatePreview: "Template preview",
    failedLoadTemplates: "Failed to load templates",
    failedApplyTemplate: "Could not apply template",
    failedLoadBrandKits: "Failed to load brand kits",
    failedAnalyze: "Analysis failed",
    failedLoadDeployment: "Failed to load deployment",
    failedLoad: "Failed to load",
    domainAdded: "Domain added — configure DNS, then verify.",
    failedAddDomain: "Failed to add domain",
    verificationComplete: "Verification complete",
    verificationFailed: "Verification failed",
    domainRemoved: "Domain removed",
    removeFailed: "Remove failed",
    publishForUrl: "Publish to get a public URL",
    certificateReady: "Certificate ready",
    certificatePending: "Activates after publish / domain verify",
    connectedSystems: "Connected intelligence systems",
    publicPath: "Public path",
    notPublished: "Not published",
    subdomainHint: "Assigns from your username",
    customDomain: "Custom domain",
    noneConnected: "None connected",
    failedLoadSeo: "Failed to load SEO",
    applyFailed: "Apply failed",
    failedLoadExperiments: "Failed to load experiments",
    statusUpdateFailed: "Status update failed",
    noHypothesis: "No hypothesis set",
    createFailed: "Create failed",
    experimentNamePlaceholder: "Experiment name",
    targetSectionPlaceholder: "Target section (e.g. hero, pricing)",
    failedLoadAnalytics: "Failed to load analytics",
    uniqueVisitors: "Unique visitors",
    pageViews: "Page views",
    buttonClicks: "Button clicks",
    trafficSources: "Traffic sources",
    devices: "Devices",
  },
});

if (!en.constants) en.constants = {};
en.constants.contentStudio = en.constants.contentStudio ?? {
  tones: {},
  audiences: {},
  languages: {},
  writingStyles: {},
  creativityLevels: {},
  options: {},
  templateCategories: {},
  platforms: {},
  calendarCategories: {},
  calendarStatuses: {},
};

const cs = en.constants.contentStudio;
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const TONES = [
  "Professional", "Casual", "Friendly", "Formal", "Authoritative",
  "Inspirational", "Humorous", "Empathetic", "Persuasive", "Educational",
  "Conversational", "Bold", "Luxurious", "Minimalist", "Storytelling",
];
for (const t of TONES) cs.tones[slug(t)] = t;

const AUDIENCES = [
  "General", "Business Owners", "Entrepreneurs", "Startups", "Enterprise",
  "Marketers", "Developers", "Designers", "Students", "Executives",
  "Millennials", "Gen Z", "Parents", "Professionals", "Investors",
];
for (const a of AUDIENCES) cs.audiences[slug(a)] = a;

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Arabic", "Chinese", "Japanese", "Korean", "Hindi", "Russian",
  "Dutch", "Swedish", "Turkish",
];
for (const l of LANGUAGES) cs.languages[slug(l)] = l;

const STYLES = [
  "Standard", "Academic", "Journalistic", "Technical", "Creative",
  "Copywriting", "SEO-Optimized", "Narrative", "Descriptive",
  "Listicle", "How-to Guide", "Case Study",
];
for (const s of STYLES) cs.writingStyles[slug(s)] = s;

Object.assign(cs.creativityLevels, {
  conservative: "Conservative",
  balanced: "Balanced",
  creative: "Creative",
  experimental: "Experimental",
});

Object.assign(cs.calendarStatuses, {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
});

fs.writeFileSync("locales/en.json", JSON.stringify(en, null, 2) + "\n");
console.log("Expanded en.json websiteBuilder panels + constants.contentStudio");
