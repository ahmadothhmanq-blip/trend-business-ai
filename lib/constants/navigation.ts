export const NAV_LINKS = [
  { label: "Services", href: "/#solutions", dropdown: true },
  { label: "AI Solutions", href: "/#solutions", dropdown: true },
  { label: "Pricing", href: "/pricing", dropdown: false },
  { label: "About", href: "/about", dropdown: false },
  { label: "Contact", href: "/contact", dropdown: false },
] as const;

export const NAV_SERVICES_DROPDOWN = [
  { label: "AI Website Builder", href: "/products/create" },
  { label: "AI App Development", href: "/products/create" },
  { label: "AI Video Studio", href: "/products/content" },
  { label: "AI Marketing", href: "/products/business" },
  { label: "AI Business Management", href: "/products/business" },
  { label: "AI Agents", href: "/products/business" },
] as const;

export const NAV_SOLUTIONS_DROPDOWN = [
  { label: "Create", href: "/products/create" },
  { label: "Design", href: "/products/design" },
  { label: "Content", href: "/products/content" },
  { label: "Business", href: "/products/business" },
] as const;

export const TRUST_BADGES = [
  { label: "Fast", icon: "Zap" },
  { label: "Secure", icon: "Shield" },
  { label: "AI Powered", icon: "Sparkles" },
  { label: "Global", icon: "Globe" },
] as const;
