export type TemplateV2ComponentRole =
  | "navigation"
  | "hero"
  | "footer"
  | "features"
  | "services"
  | "gallery"
  | "story"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "contact"
  | "process"
  | "team"
  | "trust"
  | "cases"
  | "integrations"
  | "blog"
  | "timeline"
  | "portfolio"
  | "section-shell"
  | "custom";

export type TemplateV2ComponentDefinition = {
  id: string;
  role: TemplateV2ComponentRole;
  scaffold: string;
  propsSchema?: string;
  slots?: string[];
  defaultProps?: Record<string, unknown>;
};

export type TemplateV2ComponentRegistry = {
  components: TemplateV2ComponentDefinition[];
};
