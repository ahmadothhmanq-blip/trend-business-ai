/**
 * Website Builder — professional feature catalog (Phase 5).
 */

export type ProfessionalFeature = {
  id: string;
  label: string;
  description: string;
  managementTab?: string;
  copilotCommand?: string;
};

export const PROFESSIONAL_FEATURES: ProfessionalFeature[] = [
  {
    id: "templates",
    label: "Templates",
    description: "Apply industry templates and layouts",
  },
  {
    id: "blog",
    label: "Blog & CMS",
    description: "Manage posts, categories, and content",
    managementTab: "cms",
  },
  {
    id: "forms",
    label: "Forms & leads",
    description: "Capture leads and contact submissions",
    managementTab: "leads",
  },
  {
    id: "booking",
    label: "Booking",
    description: "Add appointment booking flows",
    copilotCommand: "Add a booking section to the website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Showcase projects and case studies",
    copilotCommand: "Add a portfolio gallery section",
  },
  {
    id: "pricing",
    label: "Pricing tables",
    description: "Display plans and packages",
    copilotCommand: "Add a pricing table section",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Social proof and reviews",
    copilotCommand: "Add a testimonials section",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Answer common customer questions",
    copilotCommand: "Add an FAQ section to the homepage",
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Edit header and footer links",
    managementTab: "navigation",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact forms and business details",
    managementTab: "brand",
  },
];
