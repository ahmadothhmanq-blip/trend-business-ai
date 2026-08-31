import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { WebsiteFeatureId } from "@/lib/constants/website-builder";

export type CapabilityDefinition = {
  id: WebsiteCapabilityId;
  label: string;
  description: string;
  category:
    | "content"
    | "commerce"
    | "marketing"
    | "operations"
    | "platform"
    | "communication";
  legacyFeatureIds?: WebsiteFeatureId[];
  aliases?: string[];
};

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  { id: "blog", label: "Blog", description: "Articles and editorial content", category: "content", legacyFeatureIds: ["blog", "cms"] },
  { id: "products", label: "Products", description: "Product catalog and commerce", category: "commerce", legacyFeatureIds: ["ecommerce"] },
  { id: "booking", label: "Booking", description: "Reservations and booking flows", category: "operations", legacyFeatureIds: ["booking"] },
  { id: "appointments", label: "Appointments", description: "Scheduled appointments", category: "operations" },
  { id: "team", label: "Team", description: "Team and staff profiles", category: "content" },
  { id: "gallery", label: "Gallery", description: "Photo and media galleries", category: "content", legacyFeatureIds: ["gallery"] },
  { id: "portfolio", label: "Portfolio", description: "Case studies and work samples", category: "content", legacyFeatureIds: ["portfolio"] },
  { id: "testimonials", label: "Testimonials", description: "Client quotes and social proof", category: "marketing", legacyFeatureIds: ["testimonials"] },
  { id: "faq", label: "FAQ", description: "Frequently asked questions", category: "content", legacyFeatureIds: ["faq"] },
  { id: "forms", label: "Forms", description: "Contact and lead capture forms", category: "marketing", legacyFeatureIds: ["contact", "crm"] },
  { id: "analytics", label: "Analytics", description: "Traffic and conversion analytics", category: "platform", legacyFeatureIds: ["analytics"] },
  { id: "seo", label: "SEO", description: "Search optimization metadata", category: "marketing", legacyFeatureIds: ["seo"] },
  { id: "authentication", label: "Authentication", description: "Login and user sessions", category: "platform", legacyFeatureIds: ["login", "membership"] },
  { id: "dashboard", label: "Dashboard", description: "Admin or user dashboard", category: "platform", legacyFeatureIds: ["dashboard"] },
  { id: "multi-language", label: "Multi-language", description: "Localization and i18n", category: "platform", legacyFeatureIds: ["localization"] },
  { id: "search", label: "Search", description: "Site search", category: "platform", legacyFeatureIds: ["search"] },
  { id: "payments", label: "Payments", description: "Checkout and billing", category: "commerce", legacyFeatureIds: ["payment"] },
  { id: "inventory", label: "Inventory", description: "Stock and inventory management", category: "commerce" },
  { id: "orders", label: "Orders", description: "Order management", category: "commerce" },
  { id: "reviews", label: "Reviews", description: "Customer reviews and ratings", category: "marketing" },
  { id: "maps", label: "Maps", description: "Location maps and directions", category: "content", legacyFeatureIds: ["maps"] },
  { id: "chat", label: "Chat", description: "Live chat and messaging", category: "communication", legacyFeatureIds: ["chat"] },
  { id: "newsletter", label: "Newsletter", description: "Email capture and subscriptions", category: "marketing", legacyFeatureIds: ["newsletter"] },
  { id: "pricing", label: "Pricing", description: "Pricing tables and plans", category: "marketing", legacyFeatureIds: ["pricing"] },
];

const DEFINITION_INDEX = new Map(
  CAPABILITY_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getCapabilityDefinition(
  id: WebsiteCapabilityId,
): CapabilityDefinition | undefined {
  return DEFINITION_INDEX.get(id);
}

export function listCapabilityDefinitions(): CapabilityDefinition[] {
  return [...CAPABILITY_DEFINITIONS];
}
