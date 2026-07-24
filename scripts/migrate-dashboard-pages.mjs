import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dashboardDir = path.join(root, "app", "(dashboard)", "dashboard");

const pageMap = {
  "page.tsx": "dashboard",
  "projects/page.tsx": "projects",
  "crm/page.tsx": "crm",
  "erp/page.tsx": "erp",
  "bi/page.tsx": "bi",
  "business-manager/page.tsx": "businessManager",
  "cybersecurity/page.tsx": "cybersecurity",
  "website-builder/page.tsx": "websiteBuilder",
  "landing-page-builder/page.tsx": "landingPageBuilder",
  "app-builder/page.tsx": "appBuilder",
  "logo-maker/page.tsx": "logoMaker",
  "brand-studio/page.tsx": "brandStudio",
  "image-generator/page.tsx": "imageGenerator",
  "video-studio/page.tsx": "videoStudio",
  "content-studio/page.tsx": "contentStudio",
  "social-media/page.tsx": "socialMedia",
  "marketing/page.tsx": "marketing",
  "business-intelligence/page.tsx": "businessIntelligence",
  "feasibility-study/page.tsx": "feasibilityStudy",
  "ai-agents/page.tsx": "aiAgents",
  "templates/page.tsx": "templates",
  "history/page.tsx": "history",
  "files/page.tsx": "files",
  "analytics/page.tsx": "analytics",
  "seo/page.tsx": "seo",
  "ai-search/page.tsx": "aiSearch",
  "growth/page.tsx": "growth",
  "billing/page.tsx": "billing",
  "ai-providers/page.tsx": "aiProviders",
  "team/page.tsx": "team",
  "notifications/page.tsx": "notifications",
  "api-keys/page.tsx": "apiKeys",
  "usage/page.tsx": "usage",
  "settings/page.tsx": "settings",
  "profile/page.tsx": "profile",
  "ideas/page.tsx": "ideas",
  "reports/page.tsx": "reports",
  "market-analysis/page.tsx": "marketAnalysis",
  "favorites/page.tsx": "favorites",
  "admin/page.tsx": "admin",
  "search/page.tsx": "search",
};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name === "page.tsx") files.push(full);
  }
  return files;
}

let count = 0;
for (const file of walk(dashboardDir)) {
  const rel = path.relative(dashboardDir, file).replace(/\\/g, "/");
  const pageId = pageMap[rel];
  if (!pageId) continue;

  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("DashboardHeader")) continue;
  if (content.includes("LocalizedDashboardHeader")) continue;

  content = content.replace(
    /import \{ DashboardHeader \} from ["']@\/components\/dashboard\/header["'];/,
    "import { LocalizedDashboardHeader } from \"@/components/dashboard/localized-header\";",
  );
  content = content.replace(/<DashboardHeader/g, "<LocalizedDashboardHeader");
  content = content.replace(/<\/DashboardHeader>/g, "</LocalizedDashboardHeader>");

  if (!content.includes("pageId=")) {
    content = content.replace(
      /<LocalizedDashboardHeader(\s)/,
      `<LocalizedDashboardHeader pageId="${pageId}"$1`,
    );
    const simple = !rel.includes("[");
    if (simple) {
      content = content.replace(/\s+title="[^"]*"/, "");
      content = content.replace(/\s+description="[^"]*"/, "");
    }
  }

  fs.writeFileSync(file, content);
  count++;
}

console.log(`Updated ${count} dashboard pages`);
