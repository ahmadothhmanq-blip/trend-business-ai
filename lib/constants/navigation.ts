export const NAV_LINKS = [
  { labelKey: "nav.services", label: "Services", href: "/#solutions", dropdown: true },
  { labelKey: "nav.aiSolutions", label: "AI Solutions", href: "/#solutions", dropdown: true },
  { labelKey: "nav.pricing", label: "Pricing", href: "/pricing", dropdown: false },
  { labelKey: "nav.about", label: "About", href: "/about", dropdown: false },
  { labelKey: "nav.contact", label: "Contact", href: "/contact", dropdown: false },
] as const;

export const NAV_SERVICES_DROPDOWN = [
  { labelKey: "marketing.servicesDropdown.aiWebsiteBuilder", label: "AI Website Builder", href: "/products/create" },
  { labelKey: "marketing.servicesDropdown.aiAppDevelopment", label: "AI App Development", href: "/products/create" },
  { labelKey: "marketing.servicesDropdown.aiVideoStudio", label: "AI Video Studio", href: "/products/content" },
  { labelKey: "marketing.servicesDropdown.aiMarketing", label: "AI Marketing", href: "/products/business" },
  { labelKey: "marketing.servicesDropdown.aiBusinessManagement", label: "AI Business Management", href: "/products/business" },
  { labelKey: "marketing.servicesDropdown.aiAgents", label: "AI Agents", href: "/products/business" },
] as const;

export const NAV_SOLUTIONS_DROPDOWN = [
  { labelKey: "marketing.solutionsDropdown.create", label: "Create", href: "/products/create" },
  { labelKey: "marketing.solutionsDropdown.design", label: "Design", href: "/products/design" },
  { labelKey: "marketing.solutionsDropdown.content", label: "Content", href: "/products/content" },
  { labelKey: "marketing.solutionsDropdown.business", label: "Business", href: "/products/business" },
] as const;

export const TRUST_BADGES = [
  { labelKey: "marketing.trustBadges.fast", label: "Fast", icon: "Zap" },
  { labelKey: "marketing.trustBadges.secure", label: "Secure", icon: "Shield" },
  { labelKey: "marketing.trustBadges.aiPowered", label: "AI Powered", icon: "Sparkles" },
  { labelKey: "marketing.trustBadges.global", label: "Global", icon: "Globe" },
] as const;
