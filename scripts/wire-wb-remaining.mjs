#!/usr/bin/env node
/** Second-pass website builder i18n + option label keys */
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "components/dashboard/website-builder-tool.tsx");
let c = fs.readFileSync(file, "utf8");

const replacements = [
  ['toast.error("Describe the changes you want, or run Optimize website.")', 'toast.error(wb("toasts.describeChanges"))'],
  ['toast.success(wb("toasts.websiteCreated")', 'toast.success(wb("toasts.createdAndSaved")'],
  ['toast.success(`Template Intelligence: ${choice.name}`)', 'toast.success(wb("templates.intelligenceApplied", { name: choice.name }))'],
  ['toast.success(`Using template: ${payload.name}`)', 'toast.success(wb("templates.usingTemplate", { name: payload.name }))'],
  ['toast.success(data.editResult?.summary || data.message || "Website edited.")', 'toast.success(data.editResult?.summary || data.message || wb("toasts.edited"))'],
  ['if (kit) toast.success(`Brand kit: ${kit.name}`)', 'if (kit) toast.success(wb("toasts.brandKit", { name: kit.name }))'],
  ['error instanceof Error ? error.message : "Unable to edit website."', 'error instanceof Error ? error.message : wb("errors.generic")'],
  ['error instanceof Error ? error.message : "Unable to update favorite."', 'error instanceof Error ? error.message : wb("errors.favorite")'],
  ['error instanceof Error ? error.message : "Unable to duplicate project."', 'error instanceof Error ? error.message : wb("errors.duplicate")'],
  ['error instanceof Error ? error.message : "Unable to delete project."', 'error instanceof Error ? error.message : wb("errors.delete")'],
  ['error instanceof Error ? error.message : "Unable to rename project."', 'error instanceof Error ? error.message : wb("errors.rename")'],
  ['"Project source files are not available yet. Open the project or regenerate, then download again."', 'wb("errors.download")'],
  ['error instanceof Error ? error.message : "Unable to download project ZIP."', 'error instanceof Error ? error.message : wb("errors.download")'],
  ['"Generated project failed to build."', 'wb("errors.build")'],
  ['"Unable to generate website."', 'wb("errors.generic")'],
  ['"Unable to generate website application."', 'wb("errors.generic")'],
  ['data.error ?? "Unable to edit website."', 'data.error ?? wb("errors.generic")'],
  ['data.error ?? "Unable to update favorite."', 'data.error ?? wb("errors.favorite")'],
  ['data.error ?? "Unable to duplicate project."', 'data.error ?? wb("errors.duplicate")'],
  ['data.error ?? "Unable to delete project."', 'data.error ?? wb("errors.delete")'],
  ['data.error ?? "Unable to rename project."', 'data.error ?? wb("errors.rename")'],
  ['data?.error ?? "Unable to export project ZIP."', 'data?.error ?? wb("errors.download")'],
  ['"Stream ended before generation completed."', 'wb("errors.generationDisconnected")'],
  ['"Stream ended before generation completed. Progress was saved — click Resume generation."', 'wb("errors.generationDisconnected")'],
  [': "Connected to DeepSeek AI for generated React and Next.js applications."}', ': wb("meta.connectedProvider")}'],
  ['? "Describe changes in natural language — colors, pages, content, or design. AI creates an improved version linked to the previous one."', '? wb("sectionDescriptions.improveWithAi")'],
  ['? \'Example: "Make the hero more luxury, switch palette to black and gold, add a Testimonials page, and shorten the About copy."\'', '? wb("placeholders.improve")'],
  ['title="Website live preview"', 'title={wb("preview.title")}'],
  ['title="Fullscreen live preview"', 'title={wb("preview.openInNewTab")}'],
  ['title="Website live preview workspace"', 'title={wb("preview.title")}'],
  ['value={publicUrl ?? "Publish to create a live /w/{slug} link"}', 'value={publicUrl ?? wb("publish.notPublished")}'],
  ['{publishStatus === "published" ? "Update & republish" : "Publish public URL"}', '{publishStatus === "published" ? wb("publish.updateRepublish") : wb("publish.publishPublicUrl")}'],
  ['{activeProject?.title ?? "Live preview"}', '{activeProject?.title ?? wb("preview.title")}'],
  ['{activeProject?.title ?? "No project selected"}', '{activeProject?.title ?? wb("emptyStates.noProjectSelected")}'],
  ['{activeProject?.title ?? "No project"}', '{activeProject?.title ?? wb("emptyStates.noProject")}'],
  ['{activeProject?.type ?? "Generate a project"}', '{activeProject?.type ?? wb("emptyStates.generateProject")}'],
  ['"Select a generated file to review source code."', 'wb("emptyStates.selectFile")'],
  ['{activeProject?.description ?? "Generate or reopen a project to see details."}', '{activeProject?.description ?? wb("emptyStates.noProjectDescription")}'],
  ['{project?.prompt ?? "Prompt metadata will appear here after generation."}', '{project?.prompt ?? wb("emptyStates.promptMetadata")}'],
  ['description={profile ? `${profile.industry} · ${profile.targetAudience}` : "Business strategy layer"}', 'description={profile ? `${profile.industry} · ${profile.targetAudience}` : wb("sections.strategy")}'],
  ['{strategy?.positioning || "Strategy will appear after generation."}', '{strategy?.positioning || wb("emptyStates.strategyPending")}'],
  ['description={design?.style || "Design engine tokens"}', 'description={design?.style || wb("sections.designSystem")}'],
  [': "Hero and section visuals"', ': wb("labels.heroVisuals")'],
  ['"Publishing blocked. Resolve SEO, performance, or conversion issues first."', 'wb("errors.publishBlocked")'],
  ['data.error ?? `Could not ${action} website.`', 'data.error ?? wb("errors.couldNotAction", { action })'],
  ['toast.success(data.message ?? `Website ${action}ed.`)', 'toast.success(data.message ?? wb("publish.publishedSuccess"))'],
  ['toast.error(`Could not ${action} website.`)', 'toast.error(wb("errors.couldNotAction", { action }))'],
  ['{type}', '{wb(`projectTypes.${PROJECT_TYPE_KEYS[type] ?? "businessWebsite"}`)}'],
];

let count = 0;
for (const [from, to] of replacements) {
  if (c.includes(from)) {
    c = c.replaceAll(from, to);
    count++;
  }
}

// Add PROJECT_TYPE_KEYS after PROJECT_TYPES if missing
if (!c.includes("PROJECT_TYPE_KEYS")) {
  c = c.replace(
    `] as const;

const DESIGN_STYLES`,
    `] as const;

const PROJECT_TYPE_KEYS: Record<(typeof PROJECT_TYPES)[number], string> = {
  "Business Website": "businessWebsite",
  "Web Application": "webApplication",
  "E-commerce": "eCommerce",
  "Landing Page": "landingPage",
  "Portfolio": "portfolio",
  "Restaurant": "restaurant",
  "Clinic": "clinic",
  "Real Estate": "realEstate",
  "Education": "education",
  "AI SaaS": "aiSaas",
  CRM: "crm",
  ERP: "erp",
  "Mobile App": "mobileApp",
};

const DESIGN_STYLE_KEYS: Record<(typeof DESIGN_STYLES)[number], string> = {
  Luxury: "luxury",
  Minimal: "minimal",
  Corporate: "corporate",
  Startup: "startup",
  Modern: "modern",
  Glass: "glass",
  Dark: "dark",
  Light: "light",
};

const COLOR_THEME_KEYS: Record<(typeof COLOR_THEMES)[number], string> = {
  Gold: "gold",
  Blue: "blue",
  Purple: "purple",
  Green: "green",
  Custom: "custom",
};

const LANGUAGE_KEYS: Record<(typeof LANGUAGES)[number], string> = {
  English: "english",
  Arabic: "arabic",
  Bilingual: "bilingual",
  Spanish: "spanish",
  French: "french",
  German: "german",
  Portuguese: "portuguese",
};

const FEATURE_KEYS: Record<(typeof FEATURES)[number], string> = {
  Authentication: "authentication",
  Dashboard: "dashboard",
  CMS: "cms",
  Blog: "blog",
  Payments: "payments",
  Booking: "booking",
  Chat: "chat",
  Notifications: "notifications",
  Analytics: "analytics",
  CRM: "crm",
  "Admin Panel": "adminPanel",
};

const TEMPLATE_KEYS: Record<(typeof TEMPLATES)[number], string> = {
  "Luxury real estate marketplace": "luxuryRealEstateMarketplace",
  "Premium SaaS landing page": "premiumSaasLandingPage",
  "Clinic website with booking": "clinicWebsiteWithBooking",
  "Restaurant ordering platform": "restaurantOrderingPlatform",
  "Executive portfolio website": "executivePortfolioWebsite",
};

const PAGE_KEYS: Record<string, string> = {
  Home: "home",
  About: "about",
  Services: "services",
  Pricing: "pricing",
  Dashboard: "dashboard",
  Admin: "admin",
  Contact: "contact",
};

const DESIGN_STYLES`,
  );

  c = c.replace(
    "{PROJECT_TYPES.map((type) => (",
    "{PROJECT_TYPES.map((type) => (",
  );

  c = c.replace(
    />\{type\}</g,
    ">{wb(`projectTypes.${PROJECT_TYPE_KEYS[type]}`)}</",
  );
  c = c.replace(
    />\{style\}</g,
    ">{wb(`designStyles.${DESIGN_STYLE_KEYS[style]}`)}</",
  );
  c = c.replace(
    />\{theme\}</g,
    ">{wb(`colorThemes.${COLOR_THEME_KEYS[theme]}`)}</",
  );
  c = c.replace(
    />\{item\}</g,
    ">{wb(`languages.${LANGUAGE_KEYS[item]}`)}</",
  );
  c = c.replace(
    />\{feature\}</g,
    ">{wb(`features.${FEATURE_KEYS[feature]}`)}</",
  );

  count += 10;
}

fs.writeFileSync(file, c);
console.log(`Applied ${count} website-builder replacements`);
