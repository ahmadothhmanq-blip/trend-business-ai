/** Dashboard route → i18n keys for title and description. */
export type DashboardPageId =
  | "dashboard"
  | "projects"
  | "crm"
  | "erp"
  | "bi"
  | "businessManager"
  | "cybersecurity"
  | "websiteBuilder"
  | "landingPageBuilder"
  | "appBuilder"
  | "logoMaker"
  | "brandStudio"
  | "imageGenerator"
  | "videoStudio"
  | "contentStudio"
  | "socialMedia"
  | "marketing"
  | "businessIntelligence"
  | "feasibilityStudy"
  | "aiAgents"
  | "templates"
  | "history"
  | "files"
  | "analytics"
  | "seo"
  | "aiSearch"
  | "growth"
  | "billing"
  | "aiProviders"
  | "team"
  | "notifications"
  | "apiKeys"
  | "usage"
  | "settings"
  | "profile"
  | "ideas"
  | "reports"
  | "marketAnalysis"
  | "favorites"
  | "admin"
  | "search"
  | "subscription";

export type DashboardPageMeta = {
  titleKey: string;
  descriptionKey: string;
};

export const DASHBOARD_PAGE_META: Record<DashboardPageId, DashboardPageMeta> = {
  dashboard: {
    titleKey: "pages.dashboard.title",
    descriptionKey: "pages.dashboard.description",
  },
  projects: {
    titleKey: "pages.projects.title",
    descriptionKey: "pages.projects.description",
  },
  crm: {
    titleKey: "pages.crm.title",
    descriptionKey: "pages.crm.description",
  },
  erp: {
    titleKey: "pages.erp.title",
    descriptionKey: "pages.erp.description",
  },
  bi: {
    titleKey: "pages.bi.title",
    descriptionKey: "pages.bi.description",
  },
  businessManager: {
    titleKey: "pages.businessManager.title",
    descriptionKey: "pages.businessManager.description",
  },
  cybersecurity: {
    titleKey: "pages.cybersecurity.title",
    descriptionKey: "pages.cybersecurity.description",
  },
  websiteBuilder: {
    titleKey: "pages.websiteBuilder.title",
    descriptionKey: "pages.websiteBuilder.description",
  },
  landingPageBuilder: {
    titleKey: "pages.landingPageBuilder.title",
    descriptionKey: "pages.landingPageBuilder.description",
  },
  appBuilder: {
    titleKey: "pages.appBuilder.title",
    descriptionKey: "pages.appBuilder.description",
  },
  logoMaker: {
    titleKey: "pages.logoMaker.title",
    descriptionKey: "pages.logoMaker.description",
  },
  brandStudio: {
    titleKey: "pages.brandStudio.title",
    descriptionKey: "pages.brandStudio.description",
  },
  imageGenerator: {
    titleKey: "pages.imageGenerator.title",
    descriptionKey: "pages.imageGenerator.description",
  },
  videoStudio: {
    titleKey: "pages.videoStudio.title",
    descriptionKey: "pages.videoStudio.description",
  },
  contentStudio: {
    titleKey: "pages.contentStudio.title",
    descriptionKey: "pages.contentStudio.description",
  },
  socialMedia: {
    titleKey: "pages.socialMedia.title",
    descriptionKey: "pages.socialMedia.description",
  },
  marketing: {
    titleKey: "pages.marketing.title",
    descriptionKey: "pages.marketing.description",
  },
  businessIntelligence: {
    titleKey: "pages.businessIntelligence.title",
    descriptionKey: "pages.businessIntelligence.description",
  },
  feasibilityStudy: {
    titleKey: "pages.feasibilityStudy.title",
    descriptionKey: "pages.feasibilityStudy.description",
  },
  aiAgents: {
    titleKey: "pages.aiAgents.title",
    descriptionKey: "pages.aiAgents.description",
  },
  templates: {
    titleKey: "pages.templates.title",
    descriptionKey: "pages.templates.description",
  },
  history: {
    titleKey: "pages.history.title",
    descriptionKey: "pages.history.description",
  },
  files: {
    titleKey: "pages.files.title",
    descriptionKey: "pages.files.description",
  },
  analytics: {
    titleKey: "pages.analytics.title",
    descriptionKey: "pages.analytics.description",
  },
  seo: {
    titleKey: "pages.seo.title",
    descriptionKey: "pages.seo.description",
  },
  aiSearch: {
    titleKey: "pages.aiSearch.title",
    descriptionKey: "pages.aiSearch.description",
  },
  growth: {
    titleKey: "pages.growth.title",
    descriptionKey: "pages.growth.description",
  },
  billing: {
    titleKey: "pages.billing.title",
    descriptionKey: "pages.billing.description",
  },
  aiProviders: {
    titleKey: "pages.aiProviders.title",
    descriptionKey: "pages.aiProviders.description",
  },
  team: {
    titleKey: "pages.team.title",
    descriptionKey: "pages.team.description",
  },
  notifications: {
    titleKey: "pages.notifications.title",
    descriptionKey: "pages.notifications.description",
  },
  apiKeys: {
    titleKey: "pages.apiKeys.title",
    descriptionKey: "pages.apiKeys.description",
  },
  usage: {
    titleKey: "pages.usage.title",
    descriptionKey: "pages.usage.description",
  },
  settings: {
    titleKey: "pages.settings.title",
    descriptionKey: "pages.settings.description",
  },
  profile: {
    titleKey: "pages.profile.title",
    descriptionKey: "pages.profile.description",
  },
  ideas: {
    titleKey: "pages.ideas.title",
    descriptionKey: "pages.ideas.description",
  },
  reports: {
    titleKey: "pages.reports.title",
    descriptionKey: "pages.reports.description",
  },
  marketAnalysis: {
    titleKey: "pages.marketAnalysis.title",
    descriptionKey: "pages.marketAnalysis.description",
  },
  favorites: {
    titleKey: "pages.favorites.title",
    descriptionKey: "pages.favorites.description",
  },
  admin: {
    titleKey: "pages.admin.title",
    descriptionKey: "pages.admin.description",
  },
  search: {
    titleKey: "pages.search.title",
    descriptionKey: "pages.search.description",
  },
  subscription: {
    titleKey: "pages.subscription.title",
    descriptionKey: "pages.subscription.description",
  },
};
