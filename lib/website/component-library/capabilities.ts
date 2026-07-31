import type { WbComponentCapability } from "@/lib/website/component-library/types";

export type WbComponentCapabilityDefinition = {
  id: WbComponentCapability;
  label: string;
  description: string;
  composable: boolean;
  primitive: boolean;
};

/**
 * Capability registry — fine-grained behavioral identity for components.
 * Composable components reference capabilities in slot `accepts` rules.
 */
export const WB_COMPONENT_CAPABILITY_DEFINITIONS: WbComponentCapabilityDefinition[] = [
  { id: "nav-bar", label: "Navigation Bar", description: "Primary navigation container.", composable: true, primitive: false },
  { id: "nav-link", label: "Navigation Link", description: "Single navigational link.", composable: false, primitive: true },
  { id: "breadcrumb", label: "Breadcrumb", description: "Hierarchical path navigation.", composable: true, primitive: false },
  { id: "heading", label: "Heading", description: "Title or headline text primitive.", composable: false, primitive: true },
  { id: "paragraph", label: "Paragraph", description: "Body text primitive.", composable: false, primitive: true },
  { id: "rich-text", label: "Rich Text", description: "Formatted rich text primitive.", composable: false, primitive: true },
  { id: "list", label: "List", description: "Ordered or unordered list primitive.", composable: true, primitive: false },
  { id: "quote", label: "Quote", description: "Blockquote or pull-quote primitive.", composable: false, primitive: true },
  { id: "image", label: "Image", description: "Image media primitive.", composable: false, primitive: true },
  { id: "video", label: "Video", description: "Video media primitive.", composable: false, primitive: true },
  { id: "gallery", label: "Gallery", description: "Composable media gallery.", composable: true, primitive: false },
  { id: "background", label: "Background", description: "Background layer primitive.", composable: false, primitive: true },
  { id: "hero-stack", label: "Hero Stack", description: "Composable hero region assembled from primitives.", composable: true, primitive: false },
  { id: "feature-grid", label: "Feature Grid", description: "Composable feature layout.", composable: true, primitive: false },
  { id: "cta-stack", label: "CTA Stack", description: "Composable call-to-action stack.", composable: true, primitive: false },
  { id: "banner", label: "Banner", description: "Composable promotional banner.", composable: true, primitive: false },
  { id: "pricing-table", label: "Pricing Table", description: "Composable pricing layout.", composable: true, primitive: false },
  { id: "product-card", label: "Product Card", description: "Composable product summary card.", composable: true, primitive: false },
  { id: "checkout-form", label: "Checkout Form", description: "Composable checkout form layout.", composable: true, primitive: false },
  { id: "input", label: "Input", description: "Text input primitive.", composable: false, primitive: true },
  { id: "textarea", label: "Textarea", description: "Multiline input primitive.", composable: false, primitive: true },
  { id: "select", label: "Select", description: "Select input primitive.", composable: false, primitive: true },
  { id: "button", label: "Button", description: "Button primitive.", composable: false, primitive: true },
  { id: "button-group", label: "Button Group", description: "Grouped button layout.", composable: true, primitive: false },
  { id: "form-layout", label: "Form Layout", description: "Composable form structure.", composable: true, primitive: false },
  { id: "social-links", label: "Social Links", description: "Composable social link group.", composable: true, primitive: false },
  { id: "share-bar", label: "Share Bar", description: "Composable share actions bar.", composable: true, primitive: false },
  { id: "accordion", label: "Accordion", description: "Composable accordion pattern.", composable: true, primitive: false },
  { id: "tabs", label: "Tabs", description: "Composable tabbed interface.", composable: true, primitive: false },
  { id: "modal", label: "Modal", description: "Composable modal dialog shell.", composable: true, primitive: false },
  { id: "carousel", label: "Carousel", description: "Composable carousel pattern.", composable: true, primitive: false },
  { id: "grid", label: "Grid", description: "Layout grid container.", composable: true, primitive: false },
  { id: "stack", label: "Stack", description: "Vertical or horizontal stack layout.", composable: true, primitive: false },
  { id: "divider", label: "Divider", description: "Visual separator primitive.", composable: false, primitive: true },
  { id: "spacer", label: "Spacer", description: "Spacing utility primitive.", composable: false, primitive: true },
  { id: "container", label: "Container", description: "Width-constraining layout container.", composable: true, primitive: false },
  { id: "custom", label: "Custom", description: "Extension capability.", composable: true, primitive: false },
];

export function getComponentCapabilityDefinition(
  capability: WbComponentCapability,
): WbComponentCapabilityDefinition {
  const found = WB_COMPONENT_CAPABILITY_DEFINITIONS.find((item) => item.id === capability);
  if (!found) {
    throw new Error(`Unknown component capability: ${capability}`);
  }
  return found;
}

export function listComponentCapabilities(): WbComponentCapabilityDefinition[] {
  return [...WB_COMPONENT_CAPABILITY_DEFINITIONS];
}

export function isPrimitiveCapability(capability: WbComponentCapability): boolean {
  return getComponentCapabilityDefinition(capability).primitive;
}

export function isComposableCapability(capability: WbComponentCapability): boolean {
  return getComponentCapabilityDefinition(capability).composable;
}
