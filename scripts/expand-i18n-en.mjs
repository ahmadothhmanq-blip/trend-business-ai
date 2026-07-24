#!/usr/bin/env node
/**
 * Expands locales/en.json with product and workspace translation keys.
 * Adds missing keys only; preserves existing English copy.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EN_PATH = path.join(ROOT, "locales", "en.json");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function countLeaves(obj) {
  if (!isPlainObject(obj)) return 0;
  let n = 0;
  for (const value of Object.values(obj)) {
    if (isPlainObject(value)) n += countLeaves(value);
    else n += 1;
  }
  return n;
}

/** Deep-merge `source` into `target`, adding only keys missing in `target`. */
function mergeMissing(target, source) {
  let added = 0;
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) target[key] = {};
      added += mergeMissing(target[key], value);
    } else if (!(key in target)) {
      target[key] = value;
      added += 1;
    }
  }
  return added;
}

function mapLabels(items) {
  const out = {};
  for (const item of items) {
    const key = item
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join("");
    out[key || "item"] = item;
  }
  return out;
}

const PROJECT_TYPES = [
  "Business Website",
  "Web Application",
  "E-commerce",
  "Landing Page",
  "Portfolio",
  "Restaurant",
  "Clinic",
  "Real Estate",
  "Education",
  "AI SaaS",
  "CRM",
  "ERP",
  "Mobile App",
];
const DESIGN_STYLES = ["Luxury", "Minimal", "Corporate", "Startup", "Modern", "Glass", "Dark", "Light"];
const COLOR_THEMES = ["Gold", "Blue", "Purple", "Green", "Custom"];
const LANGUAGES = ["English", "Arabic", "Bilingual", "Spanish", "French", "German", "Portuguese"];
const FEATURES = [
  "Authentication",
  "Dashboard",
  "CMS",
  "Blog",
  "Payments",
  "Booking",
  "Chat",
  "Notifications",
  "Analytics",
  "CRM",
  "Admin Panel",
];
const TEMPLATE_PRESETS = [
  "Luxury real estate marketplace",
  "Premium SaaS landing page",
  "Clinic website with booking",
  "Restaurant ordering platform",
  "Executive portfolio website",
];
const PAGES = ["Home", "About", "Services", "Pricing", "Dashboard", "Admin", "Contact"];

function productUiPack(displayName) {
  return {
    title: displayName,
    subtitle: `Create and refine ${displayName.toLowerCase()} with AI`,
    sections: {
      create: "Create",
      editor: "Editor",
      preview: "Preview",
      history: "History",
      templates: "Templates",
      settings: "Settings",
      export: "Export",
      assets: "Assets",
    },
    actions: {
      generate: "Generate",
      regenerate: "Regenerate",
      save: "Save",
      export: "Export",
      download: "Download",
      preview: "Preview",
      publish: "Publish",
      duplicate: "Duplicate",
      delete: "Delete",
      favorite: "Add to favorites",
      unfavorite: "Remove from favorites",
      improveWithAi: "Improve with AI",
      applyTemplate: "Apply template",
      clearTemplate: "Clear template",
      browseTemplates: "Browse templates",
      viewHistory: "View history",
      copyToClipboard: "Copy to clipboard",
    },
    emptyStates: {
      noProjects: `No ${displayName.toLowerCase()} projects yet`,
      noProjectsDescription: "Create your first project to get started.",
      noHistory: "No generation history yet",
      noHistoryDescription: "Your past generations will appear here.",
      noTemplates: "No templates selected",
      noTemplatesDescription: "Browse the marketplace to seed your project.",
      noResults: "No results match your search",
      noFavorites: "No favorites yet",
      noFavoritesDescription: "Star projects to find them quickly.",
    },
    labels: {
      prompt: "Prompt",
      promptPlaceholder: "Describe what you want to create…",
      name: "Name",
      description: "Description",
      style: "Style",
      tone: "Tone",
      language: "Language",
      status: "Status",
      createdAt: "Created",
      updatedAt: "Updated",
    },
    status: {
      idle: "Ready",
      generating: "Generating…",
      building: "Building…",
      success: "Complete",
      error: "Failed",
      saved: "Saved",
    },
    toasts: {
      saved: "Saved successfully",
      generated: "Generated successfully",
      deleted: "Deleted successfully",
      copied: "Copied to clipboard",
      exportStarted: "Export started",
      errorGeneric: "Something went wrong. Please try again.",
    },
  };
}

const websiteBuilder = {
  meta: {
    title: "Website Builder",
    description: "Generate full website blueprints with AI",
    connectedProvider: "Connected to DeepSeek AI for generated React and Next.js applications.",
  },
  sections: {
    websiteBrief: "Website brief",
    improveWithAi: "Improve with AI",
    projectSettings: "Project Settings",
    recentProjects: "Recent projects",
    generationStatus: "Generation status",
    livePreview: "Live preview",
    deployment: "Deployment",
    seo: "SEO",
    experiments: "Experiments",
    analytics: "Analytics",
    brandKit: "Brand kit",
    templateIntelligence: "Template Intelligence",
    templateMarketplace: "Template Marketplace",
    designIntelligence: "Design Intelligence",
    quality: "Quality",
    examples: "Examples",
    projectType: "Project type",
    designStyle: "Design Style",
    colorTheme: "Color Theme",
    outputLanguage: "Language",
    features: "Features",
    pages: "Pages",
  },
  sectionDescriptions: {
    designStyle: "Set the visual personality.",
    colorTheme: "Pick the primary brand mood.",
    language: "Select output language.",
    improveWithAi:
      "Describe changes in natural language — colors, pages, content, or design. AI creates an improved version linked to the previous one.",
    websiteBrief: "Describe your business, audience, and goals in one brief.",
  },
  hints: {
    aiAutoDesignReady: "AI Auto Design ready",
    marketplaceTemplateReady: "Marketplace template ready",
    templateIntelligenceSelected: "Template Intelligence selected",
    editingProject: "Editing {title}. Previous version stays in history.",
    editExample:
      'Example: "Change colors to navy and gold, add a Pricing page, tighten the hero copy."',
    browseMarketplace: "Browse Template Marketplace →",
    seedsPipeline:
      "seeds Design Intelligence, Brand Identity, Assets, Editor, Quality",
    autoLayoutTheme: "auto layout, theme & components for generation",
  },
  labels: {
    projectType: "Project type",
    designStyle: "Design style",
    colorTheme: "Color theme",
    language: "Language",
    features: "Features",
    pages: "Pages",
    templates: "Templates",
    favorites: "Favorites",
    history: "History",
    rename: "Rename",
    duplicate: "Duplicate",
    delete: "Delete",
    publish: "Publish",
    unpublish: "Unpublish",
    preview: "Preview",
    downloadZip: "Download ZIP",
    copyFile: "Copy file",
    optimizeWebsite: "Optimize website",
    streamStatus: "Status",
    elapsed: "Elapsed",
    seoScore: "SEO",
    perfScore: "Perf",
    mobileScore: "Mobile",
    style: "Style",
    theme: "Theme",
    ready: "Ready",
    designing: "Designing",
    browseAll: "Browse all",
    clear: "Clear",
    examples: "Examples",
    generationMode: "Generation mode",
    buildOutput: "Build output",
  },
  placeholders: {
    improve:
      'Example: "Make the hero more luxury, switch palette to black and gold, add a Testimonials page, and shorten the About copy."',
    brief: "Describe your website, target customers, and key pages…",
    rename: "Project name",
    editInstruction: "Describe the changes you want…",
  },
  dialogs: {
    renameTitle: "Rename Project",
    renameDescription: "Choose a new name for this project.",
    deleteTitle: "Delete project?",
    deleteDescription: "This action cannot be undone.",
    confirm: "Confirm",
    cancel: "Cancel",
  },
  projectTypes: mapLabels(PROJECT_TYPES),
  designStyles: mapLabels(DESIGN_STYLES),
  colorThemes: mapLabels(COLOR_THEMES),
  languages: mapLabels(LANGUAGES),
  features: mapLabels(FEATURES),
  pages: mapLabels(PAGES),
  templatePresets: mapLabels(TEMPLATE_PRESETS),
  statuses: {
    idle: "Ready",
    generating: "Generating…",
    designing: "Designing",
    building: "Building generated project",
    buildSuccess: "Build succeeded",
    buildFailed: "Build failed",
    compileFailed: "Generated project failed to compile",
    published: "Published",
    draft: "Draft",
    disconnected: "Reconnecting…",
  },
  preview: {
    title: "Live preview",
    emptyTitle: "Preview will appear here",
    emptyDescription: "Generate a website to see the live preview.",
    building: "Building generated project",
    openInNewTab: "Open in new tab",
    refresh: "Refresh preview",
    deviceDesktop: "Desktop",
    deviceTablet: "Tablet",
    deviceMobile: "Mobile",
  },
  publish: {
    title: "Publish",
    staging: "Staging",
    production: "Production",
    publishAction: "Publish website",
    unpublishAction: "Unpublish",
    publishedSuccess: "Website published.",
    unpublishedSuccess: "Website unpublished.",
    couldNotPublish: "Could not publish website.",
    couldNotUnpublish: "Could not unpublish website.",
    liveUrl: "Live URL",
    customDomain: "Custom domain",
  },
  templates: {
    title: "Templates",
    favorites: "Favorites",
    marketplace: "Marketplace",
    intelligence: "Template Intelligence",
    applied: "Visual template applied — content & images preserved.",
    usingTemplate: "Using template: {name}",
    intelligenceApplied: "Template Intelligence: {name}",
    clearSelection: "Clear template selection",
  },
  favorites: {
    added: "Added to favorites",
    removed: "Removed from favorites",
  },
  toasts: {
    selectWebsiteFirst: "Select a saved website first.",
    describeChanges: "Describe the changes you want, or run Optimize website.",
    createdAndSaved: "Website created and saved. Review the preview, then improve with AI.",
    edited: "Website edited.",
    duplicated: "Project duplicated",
    deleted: "Project deleted",
    renamed: "Project renamed",
    fileCopied: "File copied to clipboard",
    zipStarted: "ZIP download started",
    brandKit: "Brand kit: {name}",
    createOrSelectFirst: "Create or select a website first.",
    editThenImprove: "Edit the instruction, then click Improve with AI.",
    seoFixApplied: "SEO fix applied.",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    api: "Request failed. Please try again.",
    build: "Build failed",
    compile: "Generated project failed to compile",
    noProject: "Create or select a website first.",
    noBrief: "Enter a project brief before generating.",
    publish: "Could not publish website.",
    unpublish: "Could not unpublish website.",
    duplicate: "Could not duplicate project.",
    delete: "Could not delete project.",
    rename: "Could not rename project.",
    favorite: "Could not update favorites.",
    download: "Could not start download.",
    generationDisconnected: "Generation interrupted. Attempting to recover…",
    couldNotAction: "Could not {action} website.",
  },
  emptyStates: {
    noRecentProjects: "No recent projects yet",
    noRecentProjectsDescription: "Your generated websites will appear here.",
    noFavorites: "No favorite projects",
    noTemplates: "No template selected",
    noHistory: "No versions in history",
  },
  stream: {
    generating: "Generating…",
    saving: "Saving…",
    optimizing: "Optimizing…",
    applyingEdits: "Applying edits…",
    complete: "Complete",
  },
  deployment: {
    title: "Deployment dashboard",
    environment: "Environment",
    lastDeploy: "Last deploy",
    logs: "Deploy logs",
  },
  seoAgent: {
    title: "SEO Agent",
    fixApplied: "SEO fix applied.",
    runAudit: "Run SEO audit",
    score: "SEO score",
  },
};

function workspacePack(name, tabs, metrics, assistantActions) {
  return {
    title: name,
    tabs,
    overview: {
      title: "Overview",
      metrics,
    },
    actions: {
      create: "Create",
      import: "Import",
      export: "Export",
      refresh: "Refresh",
      filter: "Filter",
      search: "Search",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      viewAll: "View all",
      assign: "Assign",
      schedule: "Schedule",
      runReport: "Run report",
    },
    emptyStates: {
      noRecords: "No records yet",
      noRecordsDescription: "Create your first record to populate this workspace.",
      noSearchResults: "No matches for your search",
      noTasks: "No tasks yet",
      noActivities: "No activities logged",
    },
    assistant: {
      title: "AI Assistant",
      placeholder: `Ask ${name} AI about your data…`,
      actions: assistantActions,
      thinking: "Thinking…",
      error: "Assistant request failed",
    },
  };
}

const expansions = {
  common: {
    export: "Export",
    import: "Import",
    duplicate: "Duplicate",
    rename: "Rename",
    refresh: "Refresh",
    filter: "Filter",
    sort: "Sort",
    copy: "Copy",
    share: "Share",
    publish: "Publish",
    unpublish: "Unpublish",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    confirm: "Confirm",
    retry: "Retry",
    viewDetails: "View details",
    showMore: "Show more",
    showLess: "Show less",
    selectAll: "Select all",
    clearSelection: "Clear selection",
    upload: "Upload",
    download: "Download",
  },
  alerts: {
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    copied: "Copied to clipboard",
    generated: "Generated successfully",
    updated: "Updated successfully",
    published: "Published successfully",
    unpublished: "Unpublished successfully",
    exported: "Export started",
    imported: "Import completed",
    duplicated: "Duplicated successfully",
    renamed: "Renamed successfully",
    favorited: "Added to favorites",
    unfavorited: "Removed from favorites",
    error: "Something went wrong",
    networkError: "Network error. Check your connection.",
    validationError: "Please check your input and try again.",
    unauthorized: "You must be signed in",
    forbidden: "You do not have permission",
    insufficientCredits: "Insufficient credits",
    rateLimited: "Too many requests. Please wait.",
  },
  emptyStates: {
    noResults: "No results found",
    noData: "No data yet",
    tryAgain: "Try adjusting your filters or create something new.",
    getStarted: "Get started by creating your first item.",
    noProjects: "No projects yet",
    noProjectsDescription: "Create a project to see it here.",
    noHistory: "No history yet",
    noHistoryDescription: "Past activity will appear here.",
    noTemplates: "No templates yet",
    noTemplatesDescription: "Browse templates to get started.",
    noFiles: "No files yet",
    noFilesDescription: "Exported assets will appear here.",
    noNotifications: "No notifications",
    noTeamMembers: "No team members",
    noSearchMatches: "No matches for your search",
    errorLoading: "Could not load data",
    errorLoadingDescription: "Refresh the page or try again later.",
  },
  products: {
    common: {
      generate: "Generate",
      regenerate: "Regenerate",
      improve: "Improve with AI",
      save: "Save",
      export: "Export",
      preview: "Preview",
      publish: "Publish",
      download: "Download",
      language: "Language",
      tone: "Tone",
      style: "Style",
      template: "Template",
      loading: "Generating…",
      history: "History",
      favorites: "Favorites",
      settings: "Settings",
      assets: "Assets",
      editor: "Editor",
    },
    websiteBuilder,
    contentStudio: productUiPack("Content Studio"),
    imageGenerator: productUiPack("Image Generator"),
    videoStudio: productUiPack("Video Studio"),
    webappBuilder: productUiPack("Web App Builder"),
    logoDesigner: productUiPack("Logo Designer"),
    brandIdentity: productUiPack("Brand Identity"),
    businessSuite: productUiPack("Business Suite"),
    aiAgents: productUiPack("AI Agents"),
    landingPageBuilder: productUiPack("Landing Page Builder"),
    marketAnalysis: productUiPack("Market Analysis"),
  },
  workspaces: {
    crm: workspacePack(
      "CRM",
      {
        overview: "Overview",
        accounts: "Accounts",
        contacts: "Contacts",
        leads: "Leads",
        deals: "Deals",
        tasks: "Tasks",
        activities: "Activities",
        analytics: "Analytics",
        assistant: "AI Assistant",
      },
      {
        pipelineValue: "Pipeline value",
        wonValue: "Won revenue",
        openDeals: "Open deals",
        totalLeads: "Total leads",
        conversionRate: "Conversion rate",
        winRate: "Win rate",
        avgSalesCycle: "Avg. sales cycle",
        forecast: "Forecast",
      },
      {
        summarizePipeline: "Summarize pipeline",
        suggestNextSteps: "Suggest next steps",
        draftEmail: "Draft follow-up email",
        scoreLeads: "Score leads",
        forecastRevenue: "Forecast revenue",
      },
    ),
    erp: workspacePack(
      "ERP",
      {
        overview: "Overview",
        finance: "Finance",
        inventory: "Inventory",
        operations: "Operations",
        hr: "Human Resources",
        procurement: "Procurement",
        analytics: "Analytics",
        assistant: "AI Assistant",
      },
      {
        revenue: "Revenue",
        expenses: "Expenses",
        grossMargin: "Gross margin",
        inventoryValue: "Inventory value",
        openPOs: "Open purchase orders",
        headcount: "Headcount",
        cashOnHand: "Cash on hand",
        utilization: "Utilization",
      },
      {
        explainVariance: "Explain variance",
        optimizeInventory: "Optimize inventory",
        draftPO: "Draft purchase order",
        payrollSummary: "Summarize payroll",
        cashFlowForecast: "Forecast cash flow",
      },
    ),
    bi: workspacePack(
      "Business Intelligence",
      {
        overview: "Overview",
        dashboards: "Dashboards",
        reports: "Reports",
        metrics: "Metrics",
        datasets: "Datasets",
        alerts: "Alerts",
        assistant: "AI Assistant",
      },
      {
        activeDashboards: "Active dashboards",
        kpisTracked: "KPIs tracked",
        dataFreshness: "Data freshness",
        anomalies: "Anomalies detected",
        reportRuns: "Report runs",
        usersViewing: "Active viewers",
      },
      {
        explainMetric: "Explain this metric",
        buildDashboard: "Suggest dashboard layout",
        detectAnomalies: "Detect anomalies",
        summarizeReport: "Summarize report",
        naturalLanguageQuery: "Ask in plain language",
      },
    ),
    cyber: workspacePack(
      "Cybersecurity",
      {
        overview: "Overview",
        threats: "Threats",
        incidents: "Incidents",
        assets: "Assets",
        vulnerabilities: "Vulnerabilities",
        compliance: "Compliance",
        monitoring: "Monitoring",
        assistant: "AI Assistant",
      },
      {
        openIncidents: "Open incidents",
        criticalAlerts: "Critical alerts",
        assetsMonitored: "Assets monitored",
        vulnOpen: "Open vulnerabilities",
        meanTimeToRespond: "Mean time to respond",
        complianceScore: "Compliance score",
      },
      {
        triageAlert: "Triage alert",
        suggestRemediation: "Suggest remediation",
        summarizeIncident: "Summarize incident",
        generateRunbook: "Generate runbook",
        complianceGapAnalysis: "Compliance gap analysis",
      },
    ),
  },
};

function sectionAddedCounts(before, after, expansionsRoot) {
  const counts = {};
  for (const [section, value] of Object.entries(expansionsRoot)) {
    const b = before[section];
    const a = after[section];
    counts[section] = countLeaves(a) - countLeaves(b);
  }
  return counts;
}

const before = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));
const beforeLeaves = countLeaves(before);

const snapshot = JSON.parse(JSON.stringify(before));
const addedTotal = mergeMissing(snapshot, expansions);

fs.writeFileSync(EN_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

const afterLeaves = countLeaves(snapshot);
const perSection = sectionAddedCounts(before, snapshot, expansions);

const wbLeaves = countLeaves(expansions.products.websiteBuilder);

console.log("expand-i18n-en.mjs");
console.log(`  Total keys added to en.json: ${addedTotal}`);
console.log(`  Leaf keys before: ${beforeLeaves} → after: ${afterLeaves}`);
console.log("  Added by top-level section:");
for (const [k, v] of Object.entries(perSection)) {
  console.log(`    ${k}: ${v}`);
}
console.log(`  products.websiteBuilder definition leaves: ${wbLeaves} (target ≥150)`);
if (wbLeaves < 150) {
  console.warn(`  WARNING: websiteBuilder has only ${wbLeaves} leaf keys`);
  process.exitCode = 1;
}
